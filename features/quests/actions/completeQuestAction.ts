/**
 * Complete Quest Server Action
 *
 * Authenticates the user and marks the given quest as completed,
 * awarding its XP reward and invalidating the stats cache.
 *
 * This action is intentionally permissive — it does NOT re-verify the
 * condition before completing. Verification is at the UI level (CLAIM button
 * is only shown when conditionMet === true). For triggered completions
 * (e.g., from syncGitHub), the service-level ACTIVE record lookup is the guard.
 */

'use server'

import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { actionWrapper } from '@/features/core'
import { completeQuestService } from '../services/completeQuest.service'

// =============================================================================
// Action
// =============================================================================

/**
 * Complete an active quest by its template ID and award XP.
 *
 * @param questId - The QuestTemplate.id string (e.g. 'add_bio')
 * @returns ActionResponse with xpAwarded, or null payload if already done
 */
export async function completeQuestAction(
  questId: string
): Promise<Awaited<ReturnType<typeof actionWrapper<{ xpAwarded: number } | null>>>> {
  return actionWrapper<{ xpAwarded: number } | null>(async () => {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id
    const result = await completeQuestService(userId, questId)

    // Invalidate the stats cache so XP total updates on next dashboard load
    if (result) {
      revalidateTag(`user-stats-${userId}`)
    }

    return {
      payload: result,
      message: result
        ? `+${result.xpAwarded} XP earned`
        : 'Quest already completed',
    }
  })
}
