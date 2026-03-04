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
  githubSyncedAt: Date | null
  githubStats: GitHubStats | null
  onSearchingStateChange?: (active: boolean) => void
  onXPGainTrigger?: () => void
  onLifeLossTrigger?: () => void
}
