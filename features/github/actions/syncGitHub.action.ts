/**
 * GitHub Sync Server Action
 *
 * Validates session, calls the sync service, invalidates relevant caches,
 * and returns a typed response payload for the GitHubSyncPanel to consume.
 *
 * Error handling:
 * - `GitHubAuthError` with type `'auth'` → returns `errorType: 'auth'` so the
 *   client can open the re-authorization modal.
 * - All other errors → returns generic error response via `actionWrapper`.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { GitHubAuthError } from '../types';
import { GITHUB_MESSAGES } from '../constants/messages';
import { syncGitHubService } from '../services/syncGitHub.service';
import type { SyncGitHubResponse } from '../types/sync';

// =============================================================================
// Action
// =============================================================================

/**
 * Syncs the authenticated user's GitHub data and validates their skills.
 *
 * Flow:
 *   1. Authenticate via Better Auth session
 *   2. Call `syncGitHubService` (fetches GitHub API + writes DB)
 *   3. Invalidate dashboard and skill caches
 *   4. Return summary stats for the sync panel
 *
 * @returns ActionResponse with `SyncGitHubResponse` payload on success,
 *          or an error response with an optional `errorType` discriminator
 */
export const syncGitHubAction = async (): Promise<
  Awaited<ReturnType<typeof actionWrapper<SyncGitHubResponse>>>
> => {
  return actionWrapper<SyncGitHubResponse>(async () => {
    // -------------------------------------------------------------------------
    // Step 1: Authenticate
    // -------------------------------------------------------------------------
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to sync GitHub data');
    }

    const userId = session.user.id;

    // -------------------------------------------------------------------------
    // Step 2: Run GitHub sync (may throw GitHubAuthError — handled below)
    // -------------------------------------------------------------------------
    let syncResult;
    try {
      syncResult = await syncGitHubService(userId);
    } catch (error) {
      if (error instanceof GitHubAuthError) {
        // Surface auth errors as a structured payload so the client can
        // open the re-authorization modal instead of showing a generic toast
        return {
          payload: {
            validatedSkillsCount: 0,
            stars: 0,
            totalCommits: 0,
            suggestedSkills: [],
            errorType: error.type,
          },
          message: error.type === 'auth'
            ? GITHUB_MESSAGES.AUTH_ERROR
            : GITHUB_MESSAGES.SYNC_ERROR,
        };
      }
      // Re-throw all other errors — actionWrapper handles them generically
      throw error;
    }

    // -------------------------------------------------------------------------
    // Step 3: Invalidate caches so dashboards reflect the new validation state
    // The second argument `{}` is required by this Next.js version's type signature
    // -------------------------------------------------------------------------
    revalidatePath('/dashboard/skills');
    revalidateTag('dashboard-stats', {});
    revalidateTag('user-skills', {});
    revalidateTag('top-runners', {});
    revalidateTag(`user-stats-${userId}`, {});

    // -------------------------------------------------------------------------
    // Step 4: Return summary stats
    // -------------------------------------------------------------------------
    return {
      payload: {
        validatedSkillsCount: syncResult.validatedSlugs.length,
        stars: syncResult.totalStars,
        totalCommits: syncResult.contributions ?? 0,
        suggestedSkills: syncResult.suggestedSkills,
      },
      message: GITHUB_MESSAGES.SYNC_SUCCESS,
    };
  });
};
