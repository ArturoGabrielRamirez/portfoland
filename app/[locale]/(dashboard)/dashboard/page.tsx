// =============================================================================
// Dashboard Page — Redesign V3 — Hex-Center Tech Panel
// =============================================================================
// Layout: Hex diamond stats in the CENTER, all other panels SURROUNDING it.
//   TOP: WelcomeCard (left) + CRTWithAI (right) — via DashboardPageLayout
//   CENTER: Missions+SysLog (left) | HexDiamond+Actions+Heatmap (center) | Skills+Runners (right)
// Mobile: single column scroll, floating bottom toolbar.
// =============================================================================

import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding'
import {
  DashboardPageLayout,
  HexStatGrid,
  ActiveMissionsPanel,
  ActivityHeatmap,
  SkillRadarPanel,
  TopRunnersPanel,
  QuickActionsBar,
} from '@/features/tech'
import { SysLogPanel } from '@/features/tech/components/sys-log-panel'
import type { DashboardPageProps } from '@/features/dashboard/types/dashboard'
import { getDashboardPageData } from '@/features/dashboard/data/getDashboardPageData.data'
import { getTopRunners } from '@/features/dashboard/data/getTopRunners.data'
import { getDisplayName, getInitials } from '@/features/dashboard/utils/userHelpers'
import { getQuestsAction } from '@/features/quests/actions/getQuestsAction'
import { prisma } from '@/lib/prisma'

// =============================================================================
// Page
// =============================================================================

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' })
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' })

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) redirect(`/${locale}/login`)
  const user = session.user

  await checkOnboarding(user.id)

  // Fetch page data, top runners, quests, and new metrics in parallel
  const [pageData, runners, questsResponse, portfolioViews, cvCount] = await Promise.all([
    getDashboardPageData(user.id),
    getTopRunners(user.id),
    getQuestsAction(locale),
    prisma.portfolioView.count({ where: { userId: user.id } }),
    prisma.cVDocument.count({ where: { userId: user.id } }),
  ])

  const stats = pageData.stats
  const displayName = getDisplayName(pageData.user.name, pageData.user.email)
  const initials = getInitials(pageData.user.name, pageData.user.email)

  // Map TopRunner[] to the Runner[] shape expected by TopRunnersPanel
  const rankedRunners = runners.map((runner: { id: string; name: string; username: string | null; image: string | null; totalXP: number; isCurrentUser: boolean }, i: number) => ({
    id: runner.id,
    rank: i + 1,
    name: runner.name,
    username: runner.username,
    image: runner.image,
    xp: runner.totalXP,
    isCurrentUser: runner.isCurrentUser,
  }))

  // Derive leaderboard rank from top-5 data; show 1 if current user is top (or not in list → show ">5")
  const currentUserRanked = rankedRunners.find(r => r.isCurrentUser)
  const leaderboardRank = currentUserRanked?.rank ?? null

  return (
    <DashboardPageLayout
      pageContext="dashboard"
      locale={locale}
      portfolioMode={pageData.user.portfolioMode}
      userName={displayName}
      userInitial={initials}
      userImage={pageData.user.image}
      level={stats.level}
      currentXP={stats.totalXP}
      maxXP={stats.nextLevelXP}
      streakDays={stats.currentStreak}
      activeSkillsCount={stats.activeSkillsCount}
      translations={{
        welcomeTitle: tDashboard('welcome', { name: displayName }),
        welcomeSubtitle: tDashboard('welcomeSubtitle'),
        streak: tWelcome('streak', { count: stats.currentStreak }),
        quickActionsTitle: tWelcome('quickActions'),
        xpToLevel: tWelcome('xpToLevel', {
          xp: stats.xpToNextLevel,
          level: stats.level + 1,
        }),
      }}
      bootStats={{
        totalXP: stats.totalXP,
        level: stats.level,
        activeSkillsCount: stats.activeSkillsCount,
        currentStreak: stats.currentStreak,
        achievements: stats.achievements,
      }}
    >
      {/* ROW 2: Missions+SysLog | HEX DIAMOND + Actions + Heatmap | Skills+Runners */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-2 pb-20 md:pb-0">

        {/* Left column: Active Missions + SYS_LOG (real activity events) */}
        <div className="flex flex-col gap-2 min-h-0">
          <ActiveMissionsPanel
            quests={questsResponse.hasError ? [] : (questsResponse.payload ?? [])}
            locale={locale}
            className="flex-1 min-h-[140px]"
          />
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
              portfolioViews,
              rank: leaderboardRank ?? 0,
              cvCount,
              activeQuestsCount: questsResponse.hasError ? 0 : (questsResponse.payload?.length ?? 0),
            }}
          />

          {/* Quick Actions hex row */}
          <QuickActionsBar username={pageData.user.username} />

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
    </DashboardPageLayout>
  )
}
