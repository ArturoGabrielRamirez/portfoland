/**
 * Quest System Types
 *
 * All TypeScript types for the quest system.
 * No logic, no DB, just types.
 */

// =============================================================================
// Union Types
// =============================================================================

export type QuestCategory =
  | "portfolio_completion"
  | "skill_validation"
  | "content_improvement"
  | "consistency"
  | "exploration"

export type QuestDifficulty = "easy" | "medium" | "hard"

export type QuestType = "daily" | "weekly" | "one_time"

export type QuestStatus = "ACTIVE" | "COMPLETED" | "EXPIRED"

// =============================================================================
// Interfaces
// =============================================================================

/**
 * A static quest template from the quest pool.
 * The pool is a hardcoded constant — not stored in the DB.
 */
export interface QuestTemplate {
  id: string
  category: QuestCategory
  title: { en: string; es: string }
  description: { en: string; es: string }
  xpReward: number
  difficulty: QuestDifficulty
  type: QuestType
  condition: string
}

/**
 * An enriched active quest returned to the UI.
 * Merges a DB UserQuestRecord with its QuestTemplate data.
 * Title and description are already locale-resolved strings.
 */
export interface ActiveQuest {
  userQuestId: string
  templateId: string
  category: QuestCategory
  title: string
  description: string
  xpReward: number
  difficulty: QuestDifficulty
  type: QuestType
  status: QuestStatus
  assignedAt: Date
  expiresAt: Date | null
  completedAt: Date | null
  conditionMet: boolean
}

/**
 * Snapshot of the user's portfolio state used for condition checking.
 * Built from a single efficient Prisma query.
 */
export interface UserPortfolioSnapshot {
  hasBio: boolean
  skillCount: number
  projectCount: number
  experienceCount: number
  hasGitHub: boolean
  hasPassedAssessment: boolean
  cvCount: number
  currentStreak: number
  githubSyncedAt: Date | null
}

/**
 * DB shape for the UserQuest model.
 * Mirrors the Prisma model fields exactly.
 */
export interface UserQuestRecord {
  id: string
  userId: string
  questId: string
  status: QuestStatus
  xpAwarded: number
  assignedAt: Date
  completedAt: Date | null
  expiresAt: Date | null
}
