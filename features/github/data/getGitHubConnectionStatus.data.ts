/**
 * Get GitHub Connection Status
 *
 * Server-side data function that returns a user's GitHub connection state
 * in a single parallel query: whether a GitHub Account record exists and
 * the persisted sync stats from the User model.
 *
 * Used by `app/[locale]/(dashboard)/dashboard/skills/page.tsx` to pass
 * connection status down to `DashboardSkillsView` and `GitHubSyncPanel`.
 */

import { prisma } from '@/lib/prisma'
import type { GitHubStats } from '../types/github'

// =============================================================================
// Shape
// =============================================================================

/**
 * Snapshot of a user's GitHub connection state.
 * Fetched once per dashboard skills page render.
 */
export interface GitHubConnectionStatus {
  /** True when an Account record with providerId='github' exists for the user */
  isConnected: boolean
  /** Timestamp of the most recent successful sync; null if never synced */
  syncedAt: Date | null
  /** Persisted summary stats from the last sync; null if no sync has run */
  stats: GitHubStats | null
}

// =============================================================================
// Data Function
// =============================================================================

/**
 * Fetches the user's GitHub connection status and persisted sync stats.
 *
 * Runs the Account and User queries in parallel to minimise latency.
 * Returns a typed `GitHubConnectionStatus` object — never throws.
 *
 * @param userId - The Portfoland user ID to look up
 * @returns Connection status snapshot
 */
export async function getGitHubConnectionStatus(
  userId: string,
): Promise<GitHubConnectionStatus> {
  const [account, user] = await Promise.all([
    prisma.account.findFirst({
      where: { userId, providerId: 'github' },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { githubSyncedAt: true, githubStats: true },
    }),
  ])

  return {
    isConnected: !!account,
    syncedAt: user?.githubSyncedAt ?? null,
    stats: (user?.githubStats as GitHubStats | null) ?? null,
  }
}
