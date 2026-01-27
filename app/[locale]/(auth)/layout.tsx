// =============================================================================
// Auth Layout
// =============================================================================
// Layout component for authentication routes (login, register). Provides a
// minimal wrapper since auth pages have their own two-panel layout built-in.
// Uses next-intl for any shared translations and sets appropriate metadata.
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
 * Provides a minimal wrapper since auth pages implement their own
 * two-panel layout. This layout ensures consistent styling and
 * can be extended with shared auth context if needed in the future.
 */
export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params

  // Enable static rendering by setting the request locale
  setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
