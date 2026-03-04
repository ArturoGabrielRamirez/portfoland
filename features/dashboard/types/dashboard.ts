// =============================================================================
// Dashboard Types
// =============================================================================
// Type definitions for dashboard layout and components.
// =============================================================================

/**
 * User information for display in the dashboard header.
 */
export interface DashboardUser {
  id: string
  name: string | null
  email: string
  image: string | null
  portfolioMode: string
}

/**
 * Props for the DashboardHeader component.
 */
export interface DashboardHeaderProps {
  user: DashboardUser
  locale: string
}

/**
 * Props for the UserMenu component (client-side dropdown).
 */
export interface UserMenuProps {
  user: DashboardUser
  locale: string
}

/**
 * Props for the protected layout.
 */
export interface ProtectedLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Props for the dashboard page.
 */
export interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

/**
 * User stats data for the dashboard.
 */
export interface UserStats {
  xp: number
  level: number
  achievements: {
    unlocked: number
    total: number
  }
  skills: number
  views: number
}

/**
 * Achievement data for display.
 */
export interface Achievement {
  id: string
  title: string
  description: string
  xp: number
  unlocked: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * Activity item data for display.
 */
export interface ActivityItem {
  id: string
  action: string
  detail: string
  time: string
  color: 'primary' | 'secondary' | 'success' | 'warning'
}

/**
 * Computed real stats for the Tech Mode dashboard.
 * Returned by getUserDashboardStats and passed to DashboardRow1 and HexStatGrid.
 */
export interface DashboardStats {
  totalXP: number
  level: number
  xpToNextLevel: number
  currentLevelXP: number
  nextLevelXP: number
  experiencesCount: number
  achievements: { current: number; total: number }
  currentStreak: number
  /** Total number of skills the user has added (AI-validated + manual) */
  activeSkillsCount: number
  /** Date of the last streak activity, used to compute the heatmap window */
  lastStreakDate: Date | null
}

// =============================================================================
// Activity Event Types (SYS_LOG — TG2-A)
// =============================================================================

/**
 * Discriminated type for the different kinds of user activity events
 * that can appear in the SYS_LOG panel.
 */
export type ActivityEventType =
  | "experience"
  | "project_completed"
  | "skill_ai"
  | "skill_manual"
  | "experience_updated"
  | "skill_github"

/**
 * A single user activity event as returned by getRecentUserActivity.
 * The timestamp is a raw Date; formatting is done at render time.
 */
export interface ActivityEvent {
  id: string
  title: string
  xp: number
  type: ActivityEventType
  timestamp: Date
}
