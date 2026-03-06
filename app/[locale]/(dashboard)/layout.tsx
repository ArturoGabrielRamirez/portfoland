// =============================================================================
// Dashboard Layout — Auth Guard + Persistent Nav
// =============================================================================
// Shared layout for all authenticated dashboard routes.
// Performs server-side session validation and redirects unauthenticated users.
// Renders DashboardNav once here so it persists across sub-page navigations.
// Applies mode-aware background (Tech: dark, Classic: light).
// =============================================================================

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { DashboardNav, AIAssistantFloat } from '@/features/tech'
import type { ProtectedLayoutProps } from '@/features/dashboard/types/dashboard'
import type { PortfolioMode } from '@/features/portfolio/types/portfolio'

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

  // Minimal user fetch — just what DashboardNav and background theming need
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, portfolioMode: true },
  })

  const user = {
    id: session.user.id,
    name: dbUser?.name ?? session.user.name ?? 'User',
    email: dbUser?.email ?? session.user.email,
    image: dbUser?.image ?? session.user.image ?? null,
    portfolioMode: (dbUser?.portfolioMode ?? 'classic') as PortfolioMode,
  }

  const isTech = user.portfolioMode === 'tech'

  return (
    <div
      className={cn(
        'min-h-dvh flex flex-col',
        isTech
          ? 'bg-[#0A0E1A] text-white font-mono'
          : 'bg-gray-50 text-gray-900',
      )}
    >
      <DashboardNav locale={locale} user={user} />
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
      <AIAssistantFloat portfolioMode={user.portfolioMode} locale={locale} />
    </div>
  )
}
