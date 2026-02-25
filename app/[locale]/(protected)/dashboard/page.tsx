// =============================================================================
// Dashboard Page — Redesign V3 — Hex-Center Tech Panel
// =============================================================================
// Layout: Hex diamond stats in the CENTER, all other panels SURROUNDING it.
//   TOP: WelcomeCard (left) + CRTWithAI (right)
//   CENTER: Missions (left) | HexStatGrid diamond (center) | Skills+Runners (right)
// Mobile: single column scroll, floating bottom toolbar.
// =============================================================================

import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  WelcomeCard,
  DashboardNav,
  CRTWithAI,
  HexStatGrid,
  ActiveMissionsPanel,
  ActivityHeatmap,
  SkillRadarPanel,
  TopRunnersPanel,
} from '@/features/tech'
import type { DashboardPageProps } from '@/features/dashboard/types/dashboard'

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email[0].toUpperCase()
}

function getDisplayName(name: string | null, email: string): string {
  if (name) return name.split(' ')[0]
  return email.split('@')[0]
}

// =============================================================================
// Page
// =============================================================================

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' })
  const tWelcomeMsg = await getTranslations({ locale, namespace: 'dashboard' })

  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, image: true, portfolioMode: true },
  })

  const userData = {
    id: user.id,
    name: dbUser?.name ?? user.name ?? 'User',
    email: dbUser?.email ?? user.email,
    image: dbUser?.image ?? user.image ?? null,
    portfolioMode: (dbUser?.portfolioMode ?? 'classic') as 'classic' | 'tech',
  }

  const displayName = getDisplayName(userData.name, userData.email)
  const initials = getInitials(userData.name, userData.email)

  // --- Mock stats (replace with real DB queries) ---
  const userStats = {
    currentXP: 1900,
    maxXP: 2450,
    level: 18,
    streakDays: 12,
    experiences: 7,
    achievements: { current: 18, total: 42 },
  }

  return (
    <div
      className="h-[100dvh] overflow-hidden flex flex-col bg-[#0A0E1A] font-mono"
    >
      {/* ===== NAVIGATION ===== */}
      <DashboardNav locale={locale} user={userData} />

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col gap-2 p-2 pb-20 md:pb-2">

        {/* ── ROW 1: WelcomeCard + CRTWithAI ── */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-2">
          <WelcomeCard
            userName={displayName}
            userInitial={initials}
            userImage={userData.image}
            level={userStats.level}
            currentXP={userStats.currentXP}
            maxXP={userStats.maxXP}
            streakDays={userStats.streakDays}
            translations={{
              welcomeTitle: tWelcomeMsg('welcome', { name: displayName }),
              welcomeSubtitle: tWelcomeMsg('welcomeSubtitle'),
              streak: tWelcome('streak', { count: userStats.streakDays }),
              quickActionsTitle: tWelcome('quickActions'),
              xpToLevel: tWelcome('xpToLevel', {
                xp: userStats.maxXP - userStats.currentXP,
                level: userStats.level + 1,
              }),
            }}
          />

          {/* CRT with integrated AI */}
          <CRTWithAI
            userName={displayName}
            className="min-h-[180px] md:min-h-0"
          />
        </div>

        {/* ── ROW 2: Missions | HEX DIAMOND CENTER | Skills+Runners ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-2">

          {/* Left column: Active Missions */}
          <ActiveMissionsPanel className="min-h-[200px] md:min-h-0" />

          {/* CENTER: Hex Diamond — the centerpiece */}
          <div className="flex flex-col items-center justify-center gap-4 min-h-0">
            <HexStatGrid
              stats={{
                xp: { current: userStats.currentXP, max: userStats.maxXP },
                level: userStats.level,
                experiences: userStats.experiences,
                achievements: userStats.achievements,
              }}
              streakDays={userStats.streakDays}
            />
            <ActivityHeatmap />
          </div>

          {/* Right column: Skills + Top Runners stacked */}
          <div className="flex flex-col gap-2 min-h-0">
            <SkillRadarPanel className="flex-1 min-h-[160px]" />
            <TopRunnersPanel className="flex-1 min-h-[160px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
