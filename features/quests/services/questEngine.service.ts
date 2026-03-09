/**
 * Quest Engine Service
 *
 * Core deterministic logic for quest assignment and condition evaluation.
 * No AI calls, no external services — pure computation.
 */

import {
  getActiveUserQuests,
  getRecentCompletedQuests,
  bulkExpireQuests,
  createUserQuest,
} from '../data/getUserQuests.data'
import {
  DAILY_TEMPLATES,
  WEEKLY_TEMPLATES,
  ONE_TIME_TEMPLATES,
  getTemplateById,
} from '../constants/questPool'
import type {
  ActiveQuest,
  UserPortfolioSnapshot,
  UserQuestRecord,
  QuestTemplate,
} from '../types/quest'

// =============================================================================
// Date Helpers
// =============================================================================

/**
 * Returns the next UTC midnight (start of tomorrow UTC).
 */
export function getNextDailyMidnightUTC(): Date {
  const now = new Date()
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  )
  return next
}

/**
 * Returns the next Monday at UTC midnight.
 * If today is Monday, returns next Monday (not today).
 */
export function getNextMondayMidnightUTC(): Date {
  const now = new Date()
  // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const dayOfWeek = now.getUTCDay()
  // Days until next Monday: Monday=1 → 7 days, Tuesday=2 → 6 days, etc.
  const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7 || 7
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilMonday
    )
  )
  return next
}

// =============================================================================
// Condition Checker
// =============================================================================

/**
 * Evaluates a condition string against a portfolio snapshot and recent quest history.
 * Pure function — no DB calls.
 *
 * @param condition - The condition identifier string (from QuestTemplate.condition)
 * @param snapshot - The user's portfolio state snapshot
 * @param recentCompleted - COMPLETED quest records from the last 7 days
 * @returns true if the condition is met
 */
export function checkCondition(
  condition: string,
  snapshot: UserPortfolioSnapshot,
  recentCompleted: UserQuestRecord[]
): boolean {
  const now = Date.now()
  const ms24h = 86400000
  const ms7d = 7 * ms24h

  switch (condition) {
    case 'has_bio':
      return snapshot.hasBio

    case 'has_5_skills':
      return snapshot.skillCount >= 5

    case 'has_project':
      return snapshot.projectCount >= 1

    case 'has_3_projects':
      return snapshot.projectCount >= 3

    case 'has_experience':
      return snapshot.experienceCount >= 1

    case 'has_github':
      return snapshot.hasGitHub

    case 'has_passed_assessment':
      return snapshot.hasPassedAssessment

    case 'bio_improved_today':
      return recentCompleted.some(
        (r) =>
          r.questId === 'improve_bio' &&
          r.completedAt != null &&
          now - r.completedAt.getTime() < ms24h
      )

    case 'project_desc_improved_today':
      return recentCompleted.some(
        (r) =>
          r.questId === 'improve_project_desc' &&
          r.completedAt != null &&
          now - r.completedAt.getTime() < ms24h
      )

    case 'visited_cv_today':
      return recentCompleted.some(
        (r) =>
          r.questId === 'visit_cv_page' &&
          r.completedAt != null &&
          now - r.completedAt.getTime() < ms24h
      )

    case 'generated_cv_this_week':
      if (snapshot.cvCount >= 1) return true
      return recentCompleted.some(
        (r) =>
          r.questId === 'generate_cv' &&
          r.completedAt != null &&
          now - r.completedAt.getTime() < ms7d
      )

    case 'synced_github_this_week':
      if (
        snapshot.githubSyncedAt != null &&
        now - snapshot.githubSyncedAt.getTime() < ms7d
      ) {
        return true
      }
      return recentCompleted.some(
        (r) =>
          r.questId === 'github_sync' &&
          r.completedAt != null &&
          now - r.completedAt.getTime() < ms7d
      )

    case 'streak_3':
      return snapshot.currentStreak >= 3

    case 'streak_7':
      return snapshot.currentStreak >= 7

    case 'portfolio_80_percent': {
      let score = 0
      if (snapshot.hasBio) score += 20
      if (snapshot.skillCount >= 5) score += 20
      if (snapshot.projectCount >= 1) score += 20
      if (snapshot.experienceCount >= 1) score += 20
      if (snapshot.hasGitHub) score += 10
      if (snapshot.hasPassedAssessment) score += 10
      return score >= 80
    }

    default:
      return false
  }
}

// =============================================================================
// ActiveQuest Builder
// =============================================================================

/**
 * Merges a DB record with its template to produce an ActiveQuest.
 * Resolves locale-specific strings for title and description.
 */
export function toActiveQuest(
  record: UserQuestRecord,
  template: QuestTemplate,
  conditionMet: boolean,
  locale: string
): ActiveQuest {
  const isEs = locale === 'es'
  return {
    userQuestId: record.id,
    templateId: record.questId,
    category: template.category,
    title: isEs ? template.title.es : template.title.en,
    description: isEs ? template.description.es : template.description.en,
    xpReward: template.xpReward,
    difficulty: template.difficulty,
    type: template.type,
    status: record.status,
    assignedAt: record.assignedAt,
    expiresAt: record.expiresAt,
    completedAt: record.completedAt,
    conditionMet,
  }
}

// =============================================================================
// Main Orchestration Function
// =============================================================================

/**
 * Load or generate quests for a user.
 *
 * Algorithm:
 * 1. Fetch active quests
 * 2. Expire stale ones
 * 3. Reload active quests post-expiry
 * 4. Fetch recent completed (7 days)
 * 5. Compute conditionMet for each active quest
 * 6. Fill daily slots (target: 3) and weekly slot (target: 1)
 * 7. Create new UserQuest records for each assigned template
 * 8. Return all active quests as ActiveQuest[]
 *
 * @param userId - The authenticated user's ID
 * @param snapshot - Pre-fetched portfolio snapshot
 * @param locale - Locale string for title/description resolution ('en' | 'es')
 */
export async function getOrGenerateQuests(
  userId: string,
  snapshot: UserPortfolioSnapshot,
  locale: string
): Promise<ActiveQuest[]> {
  // Step 1: Fetch all ACTIVE quests
  let activeRecords = await getActiveUserQuests(userId)

  // Step 2: Identify and expire stale quests
  const now = new Date()
  const staleIds = activeRecords
    .filter((r) => r.expiresAt != null && r.expiresAt < now)
    .map((r) => r.id)

  if (staleIds.length > 0) {
    await bulkExpireQuests(staleIds)
  }

  // Step 3: Reload active quests after expiry
  if (staleIds.length > 0) {
    activeRecords = await getActiveUserQuests(userId)
  }

  // Step 4: Fetch recent completed quests (last 7 days)
  const recentCompleted = await getRecentCompletedQuests(userId, 7)

  // Step 5: Count remaining slots
  const activeWeeklyIds = new Set(
    activeRecords
      .filter((r) => {
        const t = getTemplateById(r.questId)
        return t?.type === 'weekly'
      })
      .map((r) => r.questId)
  )
  const activeDailyOrOneTimeIds = new Set(
    activeRecords
      .filter((r) => {
        const t = getTemplateById(r.questId)
        return t?.type === 'daily' || t?.type === 'one_time'
      })
      .map((r) => r.questId)
  )

  const dailySlotsNeeded = Math.max(0, 3 - activeDailyOrOneTimeIds.size)
  const weeklySlotsNeeded = activeWeeklyIds.size === 0 ? 1 : 0

  // Step 6: Build deterministic sort key for this user + today
  const todayKey = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  // IDs of one-time quests ever completed (check last 365 days)
  const allCompletedOneTimeQuestIds = new Set(
    (await getRecentCompletedQuests(userId, 365)).map((r) => r.questId)
  )

  // IDs completed in the last 24h (for daily exclusion)
  const last24hMs = 86400000
  const completedLast24hIds = new Set(
    recentCompleted
      .filter(
        (r) =>
          r.completedAt != null &&
          now.getTime() - r.completedAt.getTime() < last24hMs
      )
      .map((r) => r.questId)
  )

  // Step 7: Fill daily slots from daily + one_time templates
  const newDailyTemplates: QuestTemplate[] = []

  if (dailySlotsNeeded > 0) {
    // Candidates: not currently active, not completed (one_time) or not done today (daily)
    const candidates = [...DAILY_TEMPLATES, ...ONE_TIME_TEMPLATES].filter((t) => {
      if (activeDailyOrOneTimeIds.has(t.id)) return false
      if (t.type === 'one_time' && allCompletedOneTimeQuestIds.has(t.id)) return false
      if (t.type === 'daily' && completedLast24hIds.has(t.id)) return false
      return true
    })

    // Sort deterministically: conditionMet===false first (user needs to do work),
    // then by composite key for determinism across days
    const sorted = candidates.sort((a, b) => {
      const aCondMet = checkCondition(a.condition, snapshot, recentCompleted)
      const bCondMet = checkCondition(b.condition, snapshot, recentCompleted)
      // Prefer unmet conditions first (more interesting quests)
      if (!aCondMet && bCondMet) return -1
      if (aCondMet && !bCondMet) return 1
      // Deterministic tie-break by composite string sort
      const aKey = `${userId}${todayKey}${a.id}`
      const bKey = `${userId}${todayKey}${b.id}`
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0
    })

    newDailyTemplates.push(...sorted.slice(0, dailySlotsNeeded))
  }

  // Step 8: Fill weekly slot
  const newWeeklyTemplates: QuestTemplate[] = []

  if (weeklySlotsNeeded > 0) {
    const weeklyCompleted7dIds = new Set(
      recentCompleted.filter((r) => r.completedAt != null).map((r) => r.questId)
    )

    const weeklyCandidates = WEEKLY_TEMPLATES.filter((t) => {
      if (activeWeeklyIds.has(t.id)) return false
      if (weeklyCompleted7dIds.has(t.id)) return false
      return true
    })

    const sortedWeekly = weeklyCandidates.sort((a, b) => {
      const aKey = `${userId}${todayKey}${a.id}`
      const bKey = `${userId}${todayKey}${b.id}`
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0
    })

    newWeeklyTemplates.push(...sortedWeekly.slice(0, 1))
  }

  // Step 9: Create UserQuest records for new templates
  const dailyExpiry = getNextDailyMidnightUTC()
  const weeklyExpiry = getNextMondayMidnightUTC()

  await Promise.all([
    ...newDailyTemplates.map((t) =>
      createUserQuest(
        userId,
        t.id,
        t.type,
        t.type === 'one_time' ? null : dailyExpiry
      )
    ),
    ...newWeeklyTemplates.map((t) =>
      createUserQuest(userId, t.id, t.type, weeklyExpiry)
    ),
  ])

  // Step 10: Reload all active quests and return as ActiveQuest[]
  const finalActiveRecords = await getActiveUserQuests(userId)

  return finalActiveRecords.flatMap((record) => {
    const template = getTemplateById(record.questId)
    if (!template) return []
    const conditionMet = checkCondition(template.condition, snapshot, recentCompleted)
    return [toActiveQuest(record, template, conditionMet, locale)]
  })
}
