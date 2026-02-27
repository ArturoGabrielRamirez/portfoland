import { ReactNode } from "react"

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
 * Real streak data replaces the previous random data generation.
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
