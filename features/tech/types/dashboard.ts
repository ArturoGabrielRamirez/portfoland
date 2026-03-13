import { ReactNode } from "react"
import type { PageContext } from "./page-context"

export interface WelcomeCardProps {
  userName: string
  userInitial: string
  userImage?: string | null
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  /** Number of active skills from getUserDashboardStats */
  activeSkillsCount?: number
  quickActions?: QuickAction[]
  /** When true, the avatar swaps to a mini AI eye indicator */
  aiActive?: boolean
  translations?: {
    welcomeTitle: string
    welcomeSubtitle: string
    streak: string
    quickActionsTitle: string
    xpToLevel: string
  }
  className?: string
}

export interface QuickAction {
  icon: string  // Icon name instead of component
  label: string
  color: string
  onClick?: () => void
  href?: string
}

export interface DashboardStat {
  value: string | number
  label: string
  color: "cyan" | "magenta" | "yellow" | "green"
  icon: ReactNode
  subtitle: string
}

// =============================================================================
// DashboardRow1
// =============================================================================

export interface DashboardRow1Props {
  // WelcomeCard data
  userName: string
  userInitial: string
  userImage?: string | null
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  /** Number of active skills to display in SYS_MONITOR */
  activeSkillsCount?: number
  translations: {
    welcomeTitle: string
    welcomeSubtitle: string
    streak: string
    quickActionsTitle: string
    xpToLevel: string
  }
  /** Increment to trigger XP gain animation on the AIEye */
  onXPGain?: () => void
  /** Increment to trigger life loss animation on the AIEye */
  onLifeLoss?: () => void
  /**
   * TG6: Callback to trigger the searching (amber/orange scanning) animation on the AIEye.
   * Call this when a GitHub sync begins. Exit is driven by xpGainTrigger or lifeLossTrigger
   * when the sync completes.
   */
  onSearching?: () => void
  /** Real DB stats for the CRT boot sequence. Falls back to placeholder lines when absent. */
  bootStats?: {
    totalXP: number
    level: number
    activeSkillsCount: number
    currentStreak: number
    achievements: { current: number; total: number }
  }
  /** Identifies which dashboard page is active (used by CRTWithAI for context-aware AI) */
  pageContext?: PageContext
  /** Locale for AI chat API requests */
  locale?: string
}

// =============================================================================
// SysLogPanel (TG2-A)
// =============================================================================

/**
 * Props for the SysLogPanel server component that displays recent activity events.
 */
export interface SysLogPanelProps {
  userId: string
  className?: string
}

// =============================================================================
// ActivityHeatmap (TG2-B)
// =============================================================================

/**
 * Props for the ActivityHeatmap component.
 * Real streak data replaces the previous previous data generation.
 */
export interface ActivityHeatmapProps {
  currentStreak: number
  lastStreakDate: Date | null
  className?: string
}

// =============================================================================
// TopRunners (TG2-C)
// =============================================================================

/**
 * A single runner entry for the TopRunnersPanel leaderboard.
 */
export interface Runner {
  id: string
  rank: number
  name: string
  username: string | null
  image: string | null
  xp: number
  isCurrentUser: boolean
}

/**
 * Props for the TopRunnersPanel component.
 */
export interface TopRunnersPanelProps {
  runners: Runner[]
  className?: string
}
