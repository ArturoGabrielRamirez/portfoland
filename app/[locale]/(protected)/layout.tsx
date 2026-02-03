// =============================================================================
// Protected Routes Layout
// =============================================================================
// Layout for authenticated routes. Performs server-side session validation
// and redirects unauthenticated users to the login page. Provides consistent
// header/navigation structure for all protected pages.
// =============================================================================

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { auth } from '@/lib/auth'
import { DashboardHeader } from '@/features/dashboard/components'
import type { ProtectedLayoutProps } from '@/features/dashboard/types/dashboard'

// =============================================================================
// Layout Component
// =============================================================================

/**
 * Protected layout that wraps all authenticated routes.
 *
 * Performs server-side session validation:
 * - Redirects to login if user is not authenticated
 * - Provides consistent header with user controls
 * - Renders children in a main content area
 *
 * Uses the dark gamer aesthetic with:
 * - Deep blue backgrounds (#0A0F1A, #0D1421)
 * - Cyan (#00D4FF), Magenta (#D946EF), Purple (#8B5CF6) accents
 * - Slate gray text (#94A3B8, #64748B) for secondary content
 */
export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  // Extract user data for the header
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  }

  return (
    <div className="dark min-h-screen bg-[#0A0F1A] text-white">
      {/* Dashboard Header */}
      <DashboardHeader user={user} locale={locale} />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
