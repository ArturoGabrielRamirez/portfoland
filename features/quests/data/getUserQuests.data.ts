/**
 * Get User Quests Data Functions
 *
 * Direct Prisma queries for UserQuest records.
 * No caching — quest data must be fresh on every load.
 */

import { prisma } from '@/lib/prisma'
import type { UserQuestRecord, QuestType } from '../types/quest'

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Fetch all ACTIVE quest records for a user, ordered by assignedAt asc.
 */
export async function getActiveUserQuests(
  userId: string
): Promise<UserQuestRecord[]> {
  const records = await prisma.userQuest.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: { assignedAt: 'asc' },
  })

  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    questId: r.questId,
    status: r.status as UserQuestRecord['status'],
    xpAwarded: r.xpAwarded,
    assignedAt: r.assignedAt,
    completedAt: r.completedAt ?? null,
    expiresAt: r.expiresAt ?? null,
  }))
}

/**
 * Fetch COMPLETED quest records within the last N days.
 * Used by the engine to avoid re-assigning recently completed quests.
 *
 * @param userId - The user ID
 * @param days - How many days back to look
 */
export async function getRecentCompletedQuests(
  userId: string,
  days: number
): Promise<UserQuestRecord[]> {
  const since = new Date(Date.now() - days * 86400000)

  const records = await prisma.userQuest.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: { gte: since },
    },
    orderBy: { completedAt: 'desc' },
  })

  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    questId: r.questId,
    status: r.status as UserQuestRecord['status'],
    xpAwarded: r.xpAwarded,
    assignedAt: r.assignedAt,
    completedAt: r.completedAt ?? null,
    expiresAt: r.expiresAt ?? null,
  }))
}

/**
 * Bulk-expire a list of UserQuest IDs by setting their status to EXPIRED.
 */
export async function bulkExpireQuests(questIds: string[]): Promise<void> {
  if (questIds.length === 0) return
  await prisma.userQuest.updateMany({
    where: { id: { in: questIds } },
    data: { status: 'EXPIRED' },
  })
}

/**
 * Create a new UserQuest record.
 *
 * @param userId - The user ID
 * @param questId - The QuestTemplate.id string (e.g. 'add_bio')
 * @param type - The quest type (used to determine expiresAt)
 * @param expiresAt - Expiry date (null for one_time quests)
 */
export async function createUserQuest(
  userId: string,
  questId: string,
  _type: QuestType,
  expiresAt: Date | null
): Promise<UserQuestRecord> {
  const record = await prisma.userQuest.create({
    data: {
      userId,
      questId,
      status: 'ACTIVE',
      xpAwarded: 0,
      expiresAt: expiresAt ?? undefined,
    },
  })

  return {
    id: record.id,
    userId: record.userId,
    questId: record.questId,
    status: record.status as UserQuestRecord['status'],
    xpAwarded: record.xpAwarded,
    assignedAt: record.assignedAt,
    completedAt: record.completedAt ?? null,
    expiresAt: record.expiresAt ?? null,
  }
}

/**
 * Mark a UserQuest as COMPLETED and set its xpAwarded.
 */
export async function completeUserQuestById(
  userQuestId: string,
  xpAwarded: number
): Promise<UserQuestRecord> {
  const record = await prisma.userQuest.update({
    where: { id: userQuestId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      xpAwarded,
    },
  })

  return {
    id: record.id,
    userId: record.userId,
    questId: record.questId,
    status: record.status as UserQuestRecord['status'],
    xpAwarded: record.xpAwarded,
    assignedAt: record.assignedAt,
    completedAt: record.completedAt ?? null,
    expiresAt: record.expiresAt ?? null,
  }
}
