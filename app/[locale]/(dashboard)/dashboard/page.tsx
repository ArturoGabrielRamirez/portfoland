// =============================================================================
// Dashboard Page — Redesign V3 — Hex-Center Tech Panel
// =============================================================================
// Layout: Hex diamond stats in the CENTER, all other panels SURROUNDING it.
//   TOP: WelcomeCard (left) + CRTWithAI (right)
//   CENTER: Missions+SysLog (left) | HexDiamond+Actions+Heatmap (center) | Skills+Runners (right)
// Mobile: single column scroll, floating bottom toolbar.
// =============================================================================

import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding'
import {
  DashboardRow1,
  HexStatGrid,
  ActiveMissionsPanel,
  ActivityHeatmap,
  SkillRadarPanel,
  TopRunnersPanel,
  QuickActionsBar,
} from '@/features/tech'
import { SysLogPanel } from '@/features/tech/components/sys-log-panel'
import type { DashboardPageProps } from '@/features/dashboard/types/dashboard'
import { getUserDashboardStats } from '@/features/dashboard/data/getUserDashboardStats.data'
import { getTopRunners } from '@/features/dashboard/data/getTopRunners.data'

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
  if (!session?.user?.id) redirect(`/${locale}/login`)
  const user = session.user

  await checkOnboarding(user.id)

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

  // Fetch stats and top runners in parallel for optimal performance
  const [stats, runners] = await Promise.all([
    getUserDashboardStats(user.id),
    getTopRunners(user.id),
  ])

  // Map TopRunner[] to the Runner[] shape expected by TopRunnersPanel
  const rankedRunners = runners.map((runner, i) => ({
    id: runner.id,
    rank: i + 1,
    name: runner.name,
    username: runner.username,
    image: runner.image,
    xp: runner.totalXP,
    isCurrentUser: runner.isCurrentUser,
  }))

  return (
    // flex-1 fills remaining height after the nav rendered in (dashboard)/layout.tsx
    <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col gap-2 p-2 pb-20 md:pb-2">

        {/* ── ROW 1: WelcomeCard + CRTWithAI (client wrapper coordinates aiActive state) ── */}
        <DashboardRow1
          userName={displayName}
          userInitial={initials}
          userImage={userData.image}
          level={stats.level}
          currentXP={stats.totalXP}
          maxXP={stats.nextLevelXP}
          streakDays={stats.currentStreak}
          activeSkillsCount={stats.activeSkillsCount}
          translations={{
            welcomeTitle: tWelcomeMsg('welcome', { name: displayName }),
            welcomeSubtitle: tWelcomeMsg('welcomeSubtitle'),
            streak: tWelcome('streak', { count: stats.currentStreak }),
            quickActionsTitle: tWelcome('quickActions'),
            xpToLevel: tWelcome('xpToLevel', {
              xp: stats.xpToNextLevel,
              level: stats.level + 1,
            }),
          }}
        />

        {/* ── ROW 2: Missions+SysLog | HEX DIAMOND + Actions + Heatmap | Skills+Runners ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-2">

          {/* Left column: Active Missions + SYS_LOG (real activity events) */}
          <div className="flex flex-col gap-2 min-h-0">
            <ActiveMissionsPanel className="flex-1 min-h-[140px]" />
            <SysLogPanel userId={user.id} className="flex-1 min-h-[120px]" />
          </div>

          {/* CENTER: Section header + Hex Diamond + Quick Actions + Heatmap */}
          <div className="flex flex-col items-center justify-center gap-2 min-h-0">
            {/* Section header */}
            <div className="w-full flex items-center gap-2 px-2">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[hsl(174,100%,50%,0.2)]" />
              <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-muted-foreground/30">CORE_METRICS</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[hsl(174,100%,50%,0.2)]" />
            </div>

            <HexStatGrid
              stats={{
                xp: { current: stats.totalXP, max: stats.nextLevelXP },
                level: stats.level,
                experiences: stats.experiencesCount,
                achievements: stats.achievements,
              }}
              streakDays={stats.currentStreak}
            />

            {/* Quick Actions hex row */}
            <QuickActionsBar />

            {/* Activity heatmap with real streak data */}
            <ActivityHeatmap
              currentStreak={stats.currentStreak}
              lastStreakDate={stats.lastStreakDate}
            />

            {/* Bottom data readout */}
            <div className="w-full flex items-center justify-between px-3 text-[7px] font-mono text-muted-foreground/25 uppercase">
              <span>data_integrity: 99.7%</span>
              <span>last_sync: 2m ago</span>
              <span>conn: stable</span>
            </div>
          </div>

          {/* Right column: Skills + Top Runners stacked (real leaderboard data) */}
          <div className="flex flex-col gap-2 min-h-0">
            <SkillRadarPanel className="flex-1 min-h-[160px]" />
            <TopRunnersPanel runners={rankedRunners} className="flex-1 min-h-[160px]" />
          </div>
        </div>
      </div>
  )
}
