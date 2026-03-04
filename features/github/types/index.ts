/**
 * GitHub Feature Types
 *
 * All TypeScript interfaces and error classes for the GitHub integration layer.
 * Used by the API functions, sync service, and UI components.
 */

// =============================================================================
// GitHub REST API Response Types
// =============================================================================

/**
 * Represents a single repository returned by the GitHub REST API.
 * Shape matches the `/user/repos` and `/repos/{owner}/{repo}` endpoints.
 */
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  fork: boolean
  stargazers_count: number
  language: string | null
  /** ISO 8601 date string — when the repo was created on GitHub */
  created_at: string
}

/**
 * Language breakdown for a single repository.
 * Keys are language names (as returned by GitHub), values are byte counts.
 * Returned by `GET /repos/{owner}/{repo}/languages`.
 */
export interface GitHubLanguageMap {
  [language: string]: number // bytes
}

// =============================================================================
// GitHub GraphQL Response Types
// =============================================================================

/**
 * Contribution data returned by the GitHub GraphQL API
 * via the `contributionsCollection` field.
 */
export interface GitHubContributions {
  totalCommitContributions: number
  totalRepositoriesWithContributedCommits: number
}

// =============================================================================
// Sync Aggregate Types
// =============================================================================

/**
 * Aggregated data returned after a full GitHub sync.
 * Combines REST repo data with GraphQL contributions.
 */
export interface GitHubSyncData {
  repos: GitHubRepo[]
  /** Total bytes per language summed across all non-fork repos */
  languageTotals: Record<string, number>
  /** Earliest repo created_at date per language (ISO 8601) — approximation of "since when" */
  languageFirstSeen: Record<string, string>
  totalStars: number
  /** Null if the GraphQL contributions call fails — non-critical */
  contributions: GitHubContributions | null
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Discriminated error type for GitHub API failures.
 * Allows the service and action layers to distinguish auth errors
 * from transient network/rate-limit errors.
 */
export type GitHubErrorType = 'auth' | 'rate_limit' | 'network' | 'unknown'

/**
 * Typed error thrown by the GitHub API layer.
 * The `type` field allows callers to render the correct error UI
 * (e.g., re-auth modal vs. generic retry toast).
 */
export class GitHubAuthError extends Error {
  readonly type: GitHubErrorType

  constructor(type: GitHubErrorType, message: string) {
    super(message)
    this.name = 'GitHubAuthError'
    this.type = type
  }
}

// =============================================================================
// Sync Result Types
// =============================================================================

export type { GitHubSyncResult, SyncGitHubResponse } from './sync'

// =============================================================================
// Stats and Component Types
// =============================================================================

export type { GitHubStats, GitHubSyncPanelProps } from './github'
