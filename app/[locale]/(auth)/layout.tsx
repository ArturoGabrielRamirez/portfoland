// =============================================================================
// Auth Layout - Gaming Style
// =============================================================================
// Layout component for authentication routes (login, register). Provides the
// gaming-themed dark background for auth pages with cyberpunk aesthetic.
// =============================================================================

import { setRequestLocale } from 'next-intl/server'

// =============================================================================
// Types
// =============================================================================

interface AuthLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// =============================================================================
// Layout Component
// =============================================================================

/**
 * Auth layout for login and registration pages.
 *
 * Provides the gaming-themed dark background (#0A0E1A) for a consistent
 * cyberpunk aesthetic across all auth pages.
 */
export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params

  // Enable static rendering by setting the request locale
  setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {children}
    </div>
  )
}
