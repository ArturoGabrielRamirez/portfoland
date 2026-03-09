/**
 * Complete Quest Service
 *
 * Marks a quest as COMPLETED and awards XP (stored on the UserQuest record).
 * Cache invalidation is handled by the calling server action.
 */

import { prisma } from '@/lib/prisma'
import { completeUserQuestById } from '../data/getUserQuests.data'
import { getTemplateById } from '../constants/questPool'

// =============================================================================
// Service
// =============================================================================

/**
 * Complete an active quest for a user and record the XP award.
 *
 * Steps:
 * 1. Find the ACTIVE UserQuest record for this user + questId
 * 2. If not found: return null (silent no-op — quest not assigned or already done)
 * 3. Look up the QuestTemplate to get xpReward
 * 4. Mark the record COMPLETED with xpAwarded
 * 5. Return { xpAwarded }
 *
 * Note: Cache invalidation (revalidateTag) is handled by the calling server
 * action to keep this service layer free from Next.js-specific dependencies.
 *
 * @param userId - The authenticated user's ID
 * @param questId - The QuestTemplate.id string (e.g. 'improve_bio')
 * @returns { xpAwarded } on success, null if quest not found/already done
 */
export async function completeQuestService(
  userId: string,
  questId: string
): Promise<{ xpAwarded: number } | null> {
  // Step 1: Find the active record
  const record = await prisma.userQuest.findFirst({
    where: { userId, questId, status: 'ACTIVE' },
  })

  // Step 2: Silent no-op if not found
  if (!record) {
    return null
  }

  // Step 3: Look up the template
  const template = getTemplateById(questId)
  if (!template) {
    throw new Error(`Unknown quest template: ${questId}`)
  }

  // Step 4: Mark COMPLETED and store XP
  await completeUserQuestById(record.id, template.xpReward)

  // Step 5: Return XP awarded
  return { xpAwarded: template.xpReward }
}
