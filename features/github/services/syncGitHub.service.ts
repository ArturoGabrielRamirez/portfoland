/**
 * GitHub Sync Service
 *
 * Orchestrates the full GitHub sync flow:
 *   1. Read the user's GitHub OAuth token
 *   2. Fetch repos, language bytes, and contributions via the GitHub API
 *   3. Compute per-language percentages and derive validated skill slugs (≥ 60%)
 *   4. Update `githubValidated` on matching UserSkill records
 *   5. Persist summary stats to `User.githubStats` and `User.githubSyncedAt`
 *
 * Business logic lives entirely here — no HTTP calls, no UI concerns.
 */

import { prisma } from '@/lib/prisma'
import { getGitHubToken } from '../data/getGitHubToken.data'
import { fetchGitHubSyncData } from '../api/github.api'
import { GITHUB_LANGUAGE_MAP } from '../constants/github-mappings'
import type { GitHubSyncResult } from '../types/sync'

// =============================================================================
// Constants
// =============================================================================

/**
 * Minimum language percentage required for a skill to be considered "validated".
 * A language must represent at least 60% of total code bytes across all repos.
 */
const VALIDATION_THRESHOLD_PERCENT = 60

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
  // A language qualifies if it accounts for ≥ 60% of total bytes
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

  // Derive which userSkill slugs overlap with the validated set
  const userSkillSlugs = userSkills
    .map((us) => us.skill.slug)
    .filter((slug): slug is string => slug !== null)

  const matchingSlugs = validatedSlugs.filter((slug) => userSkillSlugs.includes(slug))

  if (matchingSlugs.length > 0) {
    await prisma.userSkill.updateMany({
      where: {
        userId,
        skill: { slug: { in: matchingSlugs } },
      },
      data: {
        githubValidated: true,
      },
    })
  }

  // -------------------------------------------------------------------------
  // Step 5: Persist sync stats to the User record
  // -------------------------------------------------------------------------
  const contributions = syncData.contributions?.totalCommitContributions ?? null

  await prisma.user.update({
    where: { id: userId },
    data: {
      githubSyncedAt: new Date(),
      githubStats: {
        repos: syncData.repos.length,
        stars: syncData.totalStars,
        contributions,
        validatedSkillSlugs: validatedSlugs,
      },
    },
  })

  // -------------------------------------------------------------------------
  // Step 6: Return sync summary
  // -------------------------------------------------------------------------
  return {
    validatedSlugs,
    totalRepos: syncData.repos.length,
    totalStars: syncData.totalStars,
    contributions,
  }
}
