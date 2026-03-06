// =============================================================================
// Dashboard Layout — Auth Guard
// =============================================================================
// Shared layout for all authenticated dashboard routes.
// Performs server-side session validation and redirects unauthenticated users.
// Individual pages handle their own data fetching.
// =============================================================================

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { auth } from '@/lib/auth'
import type { ProtectedLayoutProps } from '@/features/dashboard/types/dashboard'

export default async function DashboardLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  const { locale } = await params

  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="dark min-h-screen bg-[#0A0E1A] text-white">
      {children}
    </div>
  )
}
