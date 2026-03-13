/**
 * Get Quests Server Action
 *
 * Authenticates the user, fetches the portfolio snapshot,
 * and returns the current active quest list (generating if needed).
 */

'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { actionWrapper } from '@/features/core'
import { getPortfolioSnapshot } from '../data/getPortfolioSnapshot.data'
import { getOrGenerateQuests } from '../services/questEngine.service'
import type { ActiveQuest } from '../types/quest'

// =============================================================================
// Action
// =============================================================================

/**
 * Load or generate quests for the authenticated user.
 *
 * @param locale - Optional locale for title/description resolution ('en' | 'es')
 * @returns ActionResponse<ActiveQuest[]>
 */
export async function getQuestsAction(
  locale?: string
): Promise<Awaited<ReturnType<typeof actionWrapper<ActiveQuest[]>>>> {
  return actionWrapper<ActiveQuest[]>(async () => {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id
    const snapshot = await getPortfolioSnapshot(userId)
    const quests = await getOrGenerateQuests(userId, snapshot, locale ?? 'en')

    return {
      payload: quests,
      message: 'Quests loaded',
    }
  })
}
