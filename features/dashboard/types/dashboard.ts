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
}
