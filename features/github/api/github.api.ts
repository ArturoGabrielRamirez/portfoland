/**
 * GitHub API Functions
 *
 * All raw GitHub REST and GraphQL API calls live here.
 * No business logic — only HTTP communication and response parsing.
 *
 * All functions:
 * - Accept `token: string` as the first parameter
 * - Include `Authorization: Bearer {token}` and `Accept: application/vnd.github+json` headers
 * - Throw `GitHubAuthError` on 401/403 (auth), 429 (rate limit), or network failure
 */

import type {
  GitHubRepo,
  GitHubLanguageMap,
  GitHubContributions,
  GitHubSyncData,
} from '../types'
import { GitHubAuthError } from '../types'

// =============================================================================
// Constants
// =============================================================================

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

// =============================================================================
// Shared Utilities
// =============================================================================

/**
 * Builds the standard headers required for all GitHub API requests.
 */
function buildHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }
}

/**
 * Checks a GitHub REST API response for known error statuses and throws
 * the appropriate typed error if found.
 */
function assertOk(response: Response): void {
  if (response.status === 401 || response.status === 403) {
    throw new GitHubAuthError('auth', 'GitHub token invalid or expired')
  }

  if (response.status === 429) {
    throw new GitHubAuthError('rate_limit', 'GitHub API rate limit exceeded')
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
}

// =============================================================================
// REST API Functions
// =============================================================================

/**
 * Fetch all non-fork repos for the authenticated user (handles pagination).
 *
 * Uses `GET /user/repos?per_page=100&page=N`.
 * Filters out forked repos (`repo.fork === true`) after fetching.
 * Stops paginating when a page returns fewer than 100 repos.
 *
 * @param token - GitHub OAuth access token
 * @returns Array of non-fork repos belonging to the authenticated user
 * @throws {GitHubAuthError} On 401/403 (auth) or 429 (rate limit)
 */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = []
  let page = 1

  try {
    while (true) {
      const url = `${GITHUB_API_BASE}/user/repos?per_page=100&page=${page}&type=owner`
      const response = await fetch(url, { headers: buildHeaders(token) })

      assertOk(response)

      const pageRepos: GitHubRepo[] = await response.json()

      // Accumulate all repos from this page before filtering
      allRepos.push(...pageRepos)

      // Stop when we receive a partial page (end of results)
      if (pageRepos.length < 100) {
        break
      }

      page++
    }
  } catch (error) {
    if (error instanceof GitHubAuthError) {
      throw error
    }
    // Wrap unexpected errors as network errors
    throw new GitHubAuthError(
      'network',
      error instanceof Error ? error.message : 'Unknown network error'
    )
  }

  // Filter out forked repos — only analyze original work
  return allRepos.filter((repo) => repo.fork === false)
}

/**
 * Fetch the language byte breakdown for a single repository.
 *
 * Uses `GET /repos/{owner}/{repo}/languages`.
 * Returns a map of language name → byte count for that repository.
 *
 * @param token - GitHub OAuth access token
 * @param fullName - Repository full name in `{owner}/{repo}` format
 * @returns Language byte map (e.g., `{ "TypeScript": 45000, "CSS": 5000 }`)
 * @throws {GitHubAuthError} On 401/403 (auth) or 429 (rate limit)
 */
export async function fetchRepoLanguages(
  token: string,
  fullName: string
): Promise<GitHubLanguageMap> {
  const url = `${GITHUB_API_BASE}/repos/${fullName}/languages`

  let response: Response
  try {
    response = await fetch(url, { headers: buildHeaders(token) })
  } catch (error) {
    throw new GitHubAuthError(
      'network',
      error instanceof Error ? error.message : 'Unknown network error'
    )
  }

  assertOk(response)

  return response.json() as Promise<GitHubLanguageMap>
}

/**
 * Aggregate language bytes across all repos by calling `fetchRepoLanguages` for each.
 *
 * Returns total bytes per language summed across all provided non-fork repos.
 * Processes repos sequentially (not `Promise.all`) to avoid hitting rate limits.
 *
 * @param token - GitHub OAuth access token
 * @param repos - Array of non-fork repos to analyze
 * @returns Aggregated byte count per language across all repos
 */
export async function aggregateLanguages(
  token: string,
  repos: GitHubRepo[]
): Promise<{ totals: Record<string, number>; firstSeen: Record<string, string> }> {
  const totals: Record<string, number> = {}
  const firstSeen: Record<string, string> = {}

  // Sequential processing to avoid GitHub rate limiting
  for (const repo of repos) {
    const languages = await fetchRepoLanguages(token, repo.full_name)

    for (const [language, bytes] of Object.entries(languages)) {
      totals[language] = (totals[language] ?? 0) + bytes

      // Track the earliest repo date as "first used" approximation
      if (!firstSeen[language] || repo.created_at < firstSeen[language]) {
        firstSeen[language] = repo.created_at
      }
    }
  }

  return { totals, firstSeen }
}

// =============================================================================
// GraphQL API Functions
// =============================================================================

/**
 * Fetch the authenticated user's total contribution count via GitHub GraphQL.
 *
 * Uses `POST https://api.github.com/graphql` with a `contributionsCollection` query.
 * Returns `null` if the GraphQL call fails — contributions data is non-critical;
 * the caller should not propagate this failure.
 *
 * @param token - GitHub OAuth access token
 * @returns Contribution summary or `null` if the call fails
 */
export async function fetchContributions(
  token: string
): Promise<GitHubContributions | null> {
  const query = `
    query {
      viewer {
        contributionsCollection {
          totalCommitContributions
          totalRepositoriesWithContributedCommits
        }
      }
    }
  `

  let response: Response
  try {
    response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        ...buildHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
  } catch {
    // Non-critical — return null on network failure
    return null
  }

  if (!response.ok) {
    // Non-critical — return null on HTTP error
    return null
  }

  const json = (await response.json()) as {
    data?: {
      viewer?: {
        contributionsCollection?: {
          totalCommitContributions: number
          totalRepositoriesWithContributedCommits: number
        }
      }
    }
    errors?: unknown[]
  }

  // GraphQL-level errors (e.g., auth issues surface as errors array)
  if (json.errors || !json.data?.viewer?.contributionsCollection) {
    return null
  }

  return json.data.viewer.contributionsCollection
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Orchestrates all GitHub API calls and returns aggregated sync data.
 *
 * Flow:
 *   1. Fetch all user repos → filter forks → compute total stars
 *   2. Aggregate language bytes across non-fork repos (sequential)
 *   3. Fetch contribution count (non-critical — failure returns null, not thrown)
 *
 * @param token - GitHub OAuth access token
 * @returns Full sync data ready for the service layer to process
 * @throws {GitHubAuthError} On authentication or rate limit failures from repos/languages calls
 */
export async function fetchGitHubSyncData(token: string): Promise<GitHubSyncData> {
  // Step 1: Fetch all non-fork repos and compute total stars
  const repos = await fetchUserRepos(token)
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)

  // Step 2: Aggregate language bytes and first-seen dates across all non-fork repos
  const { totals: languageTotals, firstSeen: languageFirstSeen } = await aggregateLanguages(token, repos)

  // Step 3: Fetch contributions — non-critical, failure returns null
  let contributions: GitHubContributions | null = null
  try {
    contributions = await fetchContributions(token)
  } catch {
    // Intentionally swallow — contributions data is supplementary
    contributions = null
  }

  return {
    repos,
    languageTotals,
    languageFirstSeen,
    totalStars,
    contributions,
  }
}
