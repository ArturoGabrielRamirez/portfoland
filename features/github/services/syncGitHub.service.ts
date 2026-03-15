/**
 * GitHub Sync Service
 *
 * Orchestrates the full GitHub sync flow:
 *   1. Read the user's GitHub OAuth token
 *   2. Fetch repos, language bytes, and contributions via the GitHub API
 *   3. Compute per-language percentages and derive validated skill slugs (≥ 10%)
 *   4. Update `githubValidated` on matching UserSkill records
 *   5. Persist summary stats to `User.githubStats` and `User.githubSyncedAt`
 *   6. (Non-blocking) Probe top repos for package.json to enrich skill detection
 *
 * Business logic lives entirely here — no HTTP calls, no UI concerns.
 */

import { prisma } from '@/lib/prisma'
import { getGitHubToken } from '../data/getGitHubToken.data'
import { fetchGitHubSyncData } from '../api/github.api'
import { GITHUB_LANGUAGE_MAP, GITHUB_SKILL_DISPLAY_NAMES } from '../constants/github-mappings'
import { fetchPackageJsonSkillsService } from './fetchPackageJsonSkills.service'
import type { GitHubSyncResult, GitHubSuggestedSkill } from '../types/sync'

// =============================================================================
// Constants
// =============================================================================

/**
 * Minimum language percentage required for a skill to be considered "validated".
 * A language must represent at least 60% of total code bytes across all repos.
 */
// 10% threshold: a language that represents ≥10% of your total code bytes is
// strong enough evidence that you genuinely use it. The 60% original threshold
// was too strict for mixed-language repos (TS + CSS + HTML + JS, etc.).
const VALIDATION_THRESHOLD_PERCENT = 10

// =============================================================================
// Service Function
// =============================================================================

/**
 * Runs a full GitHub sync for a given user and returns the sync result.
 *
 * Throws if:
 * - The user has no GitHub account linked (token is null)
 * - The GitHub API returns an auth error (lets `GitHubAuthError` propagate)
 *
 * @param userId - The Portfoland user ID to sync
 * @returns Summary of the sync: validated slugs, repo count, stars, contributions
 * @throws Error if no GitHub account is linked
 * @throws {GitHubAuthError} On GitHub API auth or rate-limit failure (propagates up to the action)
 */
export async function syncGitHubService(userId: string): Promise<GitHubSyncResult> {
  // -------------------------------------------------------------------------
  // Step 1: Get GitHub OAuth token — throw if not linked
  // -------------------------------------------------------------------------
  const token = await getGitHubToken(userId)

  if (!token) {
    throw new Error('No GitHub account linked. Connect GitHub to enable validation.')
  }

  // -------------------------------------------------------------------------
  // Step 2: Fetch repos, language totals, and contributions from GitHub API
  // GitHubAuthError propagates up to the action layer for proper error handling
  // -------------------------------------------------------------------------
  const syncData = await fetchGitHubSyncData(token)

  // -------------------------------------------------------------------------
  // Step 3: Compute language percentages and derive validated slugs
  // A language qualifies if it accounts for ≥ 10% of total bytes
  // -------------------------------------------------------------------------
  const totalBytes = Object.values(syncData.languageTotals).reduce(
    (sum, bytes) => sum + bytes,
    0
  )

  const validatedSlugs: string[] = []

  if (totalBytes > 0) {
    for (const [language, bytes] of Object.entries(syncData.languageTotals)) {
      const percentage = (bytes / totalBytes) * 100

      if (percentage >= VALIDATION_THRESHOLD_PERCENT) {
        const slug = GITHUB_LANGUAGE_MAP[language]
        // Only add if the language has a known mapping and not already collected
        if (slug && !validatedSlugs.includes(slug)) {
          validatedSlugs.push(slug)
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Step 4: Fetch existing UserSkills and flag matching ones as githubValidated
  // UserSkill has no direct `source` field — the GITHUB source type lives on
  // the SkillSource relation. Only `githubValidated` is updated here.
  // -------------------------------------------------------------------------
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    select: {
      id: true,
      skill: { select: { slug: true } },
    },
  })

  // Normalize slugs for fuzzy matching: remove hyphens and lowercase.
  // This handles cases where the same skill has different slug formats
  // e.g. "java-script" (created with a space) vs "javascript" (from GitHub map).
  const normalize = (slug: string) => slug.replace(/-/g, '').toLowerCase()
  const normalizedValidated = new Set(validatedSlugs.map(normalize))

  // Find which of the user's skill IDs correspond to validated slugs.
  // NOTE: MongoDB Prisma does NOT support relation filters in updateMany,
  // so we resolve the IDs here and filter by scalar `id` instead.
  const matchingUserSkillIds = userSkills
    .filter((us) => us.skill.slug !== null && normalizedValidated.has(normalize(us.skill.slug)))
    .map((us) => us.id)

  // Derive slug list for the stats counter (slugs that matched user's own skills)
  const matchingSlugs = userSkills
    .filter((us) => us.skill.slug !== null && normalizedValidated.has(normalize(us.skill.slug)))
    .map((us) => us.skill.slug as string)


  if (matchingUserSkillIds.length > 0) {
    await prisma.userSkill.updateMany({
      where: { id: { in: matchingUserSkillIds } },
      data: { githubValidated: true },
    })
  }

  // -------------------------------------------------------------------------
  // Step 4b: Compute suggestedSkills — validated slugs NOT yet in user profile
  // -------------------------------------------------------------------------
  const userSkillSlugsNormalized = new Set(
    userSkills
      .filter((us) => us.skill.slug !== null)
      .map((us) => normalize(us.skill.slug!))
  )

  const suggestedSkills: GitHubSuggestedSkill[] = validatedSlugs
    .filter((slug) => !userSkillSlugsNormalized.has(normalize(slug)))
    .map((slug) => ({
      slug,
      name: GITHUB_SKILL_DISPLAY_NAMES[slug] ?? slug,
      firstSeen: syncData.languageFirstSeen[
        // reverse-map slug back to GitHub language name to find the date
        Object.entries(GITHUB_LANGUAGE_MAP).find(([, s]) => s === slug)?.[0] ?? ''
      ],
    }))
    .filter((s) => s.firstSeen !== undefined || true) // keep all, firstSeen is optional

  // -------------------------------------------------------------------------
  // Step 5: Persist sync stats to the User record
  // -------------------------------------------------------------------------
  await prisma.user.update({
    where: { id: userId },
    data: {
      githubSyncedAt: new Date(),
      githubStats: {
        stars: syncData.totalStars,
        totalCommits: syncData.contributions?.totalCommitContributions ?? 0,
        validatedSkillsCount: matchingSlugs.length,
      },
    },
  })

  // -------------------------------------------------------------------------
  // Step 6: Enrich skill tree via package.json detection — non-blocking
  // Failure here must NEVER propagate; the main sync has already succeeded.
  // -------------------------------------------------------------------------
  fetchPackageJsonSkillsService(userId, token, syncData.repos).catch((err) => {
    console.warn('[GitHub Sync] package.json skill detection failed (non-critical):', err)
  })

  // -------------------------------------------------------------------------
  // Step 7: Return sync summary
  // -------------------------------------------------------------------------
  return {
    validatedSlugs,
    suggestedSkills,
    totalRepos: syncData.repos.length,
    totalStars: syncData.totalStars,
    contributions: syncData.contributions?.totalCommitContributions ?? null,
  }
}
