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
