/**
 * Fetch Package JSON Skills Service
 *
 * For each of the user's top repos (up to MAX_REPOS), fetches `package.json`
 * via the GitHub Contents API, extracts recognised npm packages, and creates
 * new skills in the user's skill tree that don't already exist.
 *
 * Design constraints:
 * - Max 5 repos fetched (GitHub API rate-limit budget)
 * - 404 on package.json → silently skip that repo (not all repos are JS/TS)
 * - Called as a non-blocking step after the main GitHub sync; any failure is
 *   caught by the caller and must NOT propagate to break the sync.
 */

import { prisma } from '@/lib/prisma'
import { createSkillService } from '@/features/skills/services/skill.service'
import { getCategoryBySlugData } from '@/features/skills/data'
import { extractSkillsFromPackageJson } from '../utils/packageJsonSkills'
import type { GitHubRepo } from '../types'

// =============================================================================
// Constants
// =============================================================================

const GITHUB_API_BASE = 'https://api.github.com'

/** Maximum number of repos we probe for a package.json per sync */
const MAX_REPOS = 5

// =============================================================================
// Result Type
// =============================================================================

export interface PackageJsonSkillsResult {
  added: string[]
  skipped: string[]
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Fetch and decode the package.json for a single repo.
 *
 * Uses the GitHub Contents API (`GET /repos/{owner}/{repo}/contents/package.json`).
 * Returns the parsed JSON object, or `null` when:
 * - The file does not exist (404)
 * - The response cannot be decoded/parsed
 * - Any network error occurs
 *
 * @param token - GitHub OAuth access token
 * @param fullName - Repo full name in `{owner}/{repo}` format
 * @returns Parsed package.json or null
 */
async function fetchPackageJson(
  token: string,
  fullName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any> | null> {
  const url = `${GITHUB_API_BASE}/repos/${fullName}/contents/package.json`

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })
  } catch {
    // Network error — skip this repo silently
    return null
  }

  // 404 = no package.json in this repo; any other error = skip silently
  if (!response.ok) {
    return null
  }

  let data: { content?: string; encoding?: string }
  try {
    data = await response.json()
  } catch {
    return null
  }

  // GitHub Contents API returns base64-encoded file content
  if (!data.content || data.encoding !== 'base64') {
    return null
  }

  try {
    // Node.js Buffer handles base64; strip newlines GitHub adds for line-length
    const raw = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
    return JSON.parse(raw)
  } catch {
    // Malformed package.json — skip silently
    return null
  }
}

/**
 * Select up to `MAX_REPOS` repos from the user's non-fork repo list.
 *
 * Priority: repos sorted by star count descending, then by most recent push.
 * This mirrors what a developer would consider their "main" projects.
 *
 * @param repos - Full list of non-fork repos from the sync
 * @returns Sliced list of repos to probe
 */
function selectTopRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS)
}

// =============================================================================
// Service Function
// =============================================================================

/**
 * Probes the top repos for package.json files and adds any newly detected
 * skills to the user's skill tree.
 *
 * Flow:
 *   1. Select top repos (by stars, max 5)
 *   2. For each repo: fetch package.json → extract skill candidates
 *   3. Deduplicate candidates across all repos
 *   4. Compare against user's existing skill names (case-insensitive)
 *   5. For each genuinely new skill: resolve category → call createSkillService
 *   6. Return { added, skipped } summary
 *
 * @param userId - Portfoland user ID
 * @param token - GitHub OAuth access token
 * @param repos - Non-fork repos fetched during the main sync
 * @returns Summary of added and skipped skill names
 */
export async function fetchPackageJsonSkillsService(
  userId: string,
  token: string,
  repos: GitHubRepo[]
): Promise<PackageJsonSkillsResult> {
  const topRepos = selectTopRepos(repos)

  // -------------------------------------------------------------------------
  // Step 1: Collect skill candidates from all probed repos
  // -------------------------------------------------------------------------
  const candidateMap = new Map<string, string>() // name → category

  for (const repo of topRepos) {
    const pkg = await fetchPackageJson(token, repo.full_name)
    if (!pkg) continue

    const skills = extractSkillsFromPackageJson(pkg)
    for (const skill of skills) {
      // First-seen wins for category assignment (deterministic)
      if (!candidateMap.has(skill.name)) {
        candidateMap.set(skill.name, skill.category)
      }
    }
  }

  if (candidateMap.size === 0) {
    return { added: [], skipped: [] }
  }

  // -------------------------------------------------------------------------
  // Step 2: Fetch user's existing skill names (case-insensitive comparison)
  // -------------------------------------------------------------------------
  const existingUserSkills = await prisma.userSkill.findMany({
    where: { userId },
    select: {
      skill: { select: { name: true } },
    },
  })

  const existingNamesLower = new Set(
    existingUserSkills.map((us) => us.skill.name.toLowerCase().trim())
  )

  // -------------------------------------------------------------------------
  // Step 3: Create new skills, skipping already-existing ones
  // -------------------------------------------------------------------------
  const added: string[] = []
  const skipped: string[] = []

  for (const [skillName, categorySlug] of candidateMap.entries()) {
    if (existingNamesLower.has(skillName.toLowerCase().trim())) {
      skipped.push(skillName)
      continue
    }

    // Resolve the category ID; fall back to 'core' if slug isn't found
    // Pass userId so user-specific categories (isDefault:false) are found
    let category = await getCategoryBySlugData(categorySlug, userId)
    if (!category) {
      category = await getCategoryBySlugData('core', userId)
    }

    // If still no category found (edge case on fresh DBs), skip the skill
    if (!category) {
      skipped.push(skillName)
      continue
    }

    try {
      await createSkillService({
        userId,
        name: skillName,
        categoryId: category.id,
        selfAssessmentLevel: 'INTERMEDIATE',
      })

      // Mark the new skill as github-validated immediately
      // We find the just-created UserSkill by joining the normalized slug
      const slug = skillName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      await prisma.userSkill.updateMany({
        where: {
          userId,
          skill: { slug },
        },
        data: { githubValidated: true },
      })

      added.push(skillName)
    } catch {
      // Skill might have been created concurrently (race) or already exists
      // under a different casing — treat as skipped, not a hard failure.
      skipped.push(skillName)
    }
  }

  return { added, skipped }
}
