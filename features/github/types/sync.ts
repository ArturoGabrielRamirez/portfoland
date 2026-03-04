/**
 * GitHub Sync Result Types
 *
 * Response types for the GitHub sync service and action layers.
 */

// =============================================================================
// Sync Result Type
// =============================================================================

/**
 * Result returned by `syncGitHubService` after a completed GitHub sync.
 * Contains validated skill slugs and aggregate stats for the sync panel.
 */
export interface GitHubSyncResult {
  /** Skill slugs from the user's UserSkill table that were validated against GitHub language data */
  validatedSlugs: string[]
  /** Total number of non-fork repos analyzed */
  totalRepos: number
  /** Total stars across all non-fork repos */
  totalStars: number
  /** Total commit contributions, or null if the GraphQL call failed */
  contributions: number | null
  /** Set when the sync fails — allows the action to surface the correct error UI */
  errorType?: 'auth' | 'rate_limit' | 'network' | 'unknown'
}

// =============================================================================
// Action Response Type
// =============================================================================

/**
 * Payload returned by `syncGitHubAction` on success.
 * Matches the shape expected by `GitHubSyncPanel` for updating the UI.
 */
export interface SyncGitHubResponse {
  validatedSkillsCount: number
  stars: number
  totalCommits: number
  /** Error discriminator — present only when the action catches a `GitHubAuthError` */
  errorType?: 'auth' | 'rate_limit' | 'network' | 'unknown'
}
