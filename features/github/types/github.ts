/**
 * GitHub Feature Component and Stats Types
 *
 * Types shared between the service layer and UI components (GitHubSyncPanel, etc.).
 * These complement the API and sync types defined in `types/index.ts` and `types/sync.ts`.
 */

// =============================================================================
// Stats Shape (persisted to User.githubStats JSON field)
// =============================================================================

/**
 * Summary statistics stored in `User.githubStats` after a GitHub sync.
 * Persisted as JSON so the dashboard can display stats without re-fetching GitHub API.
 */
export interface GitHubStats {
  stars: number
  totalCommits: number
  validatedSkillsCount: number
}

// =============================================================================
// Component Props (used by GitHubSyncPanel — TG8)
// =============================================================================

/**
 * Props for the GitHubSyncPanel component.
 * Defined here so TG8 can import from `@/features/github` without circular deps.
 */
export interface GitHubSyncPanelProps {
  /** The authenticated user's ID — used for re-validation after sync */
  userId: string
  /** When the user last synced GitHub. Null means never synced / not yet connected */
  githubSyncedAt?: Date | null
  /** Persisted summary stats from the last sync. Null means no sync has run */
  githubStats?: GitHubStats | null
  /** True when an Account record with providerId='github' exists for the user */
  isGitHubConnected: boolean
  /** Called when sync succeeds — parent increments xpGainTrigger to drive AIEye xp_gain */
  onXPGainTrigger?: () => void
  /** Called when sync fails — parent increments lifeLossTrigger to drive AIEye life_loss */
  onLifeLossTrigger?: () => void
  /** Called when sync starts — parent sets AIEye to searching state */
  onSearchingTrigger?: () => void
  className?: string
}
