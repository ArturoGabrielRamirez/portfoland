/**
 * GitHub Sync Result Types
 *
 * Response types for the GitHub sync service and action layers.
 */

// =============================================================================
// Sync Result Type
// =============================================================================

/**
 * A GitHub-detected skill that isn't yet in the user's profile.
 * Returned after sync so the UI can offer to add it for the user.
 */
export interface GitHubSuggestedSkill {
  /** Portfoland skill slug (e.g. "typescript") */
  slug: string
  /** Human-readable name for display (e.g. "TypeScript") */
  name: string
  /** ISO 8601 date of the oldest repo using this language — "first seen" approximation */
  firstSeen?: string
}

/**
 * Result returned by `syncGitHubService` after a completed GitHub sync.
 * Contains validated skill slugs and aggregate stats for the sync panel.
 */
export interface GitHubSyncResult {
  /** Skill slugs from the user's UserSkill table that were validated against GitHub language data */
  validatedSlugs: string[]
  /** Validated slugs that don't exist in the user's profile yet — offered as suggestions */
  suggestedSkills: GitHubSuggestedSkill[]
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
  /** Skills detected in GitHub but not yet in the user's profile */
  suggestedSkills: GitHubSuggestedSkill[]
  /** Error discriminator — present only when the action catches a `GitHubAuthError` */
  errorType?: 'auth' | 'rate_limit' | 'network' | 'unknown'
}
