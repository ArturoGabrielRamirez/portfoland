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
  DashboardNav,
  DashboardRow1,
  HexStatGrid,
  ActiveMissionsPanel,
  ActivityHeatmap,
  SkillRadarPanel,
  TopRunnersPanel,
  QuickActionsBar,
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

        {/* ── ROW 1: WelcomeCard + CRTWithAI (client wrapper coordinates aiActive state) ── */}
        <DashboardRow1
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

        {/* ── ROW 2: Missions+SysLog | HEX DIAMOND + Actions + Heatmap | Skills+Runners ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-2">

          {/* Left column: Active Missions + SYS_LOG */}
          <div className="flex flex-col gap-2 min-h-0">
            <ActiveMissionsPanel className="flex-1 min-h-[140px]" />
            {/* SYS_LOG — recent activity feed */}
            <div className="border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,6%)] p-3 flex-1 min-h-[120px]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">SYS_LOG</span>
                <span className="text-[8px] font-mono text-muted-foreground/30">last 48h</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(150,100%,45%)] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-mono text-foreground/80">Deployed v2.0 to Production</p>
                    <p className="text-[8px] font-mono text-muted-foreground/40">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(174,100%,50%)] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-mono text-foreground/80">Completed &quot;React Hooks&quot; module</p>
                    <p className="text-[8px] font-mono text-muted-foreground/40">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(52,100%,50%)] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-mono text-foreground/80">Earned &quot;Fast Learner&quot; badge</p>
                    <p className="text-[8px] font-mono text-muted-foreground/40">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
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
                xp: { current: userStats.currentXP, max: userStats.maxXP },
                level: userStats.level,
                experiences: userStats.experiences,
                achievements: userStats.achievements,
              }}
              streakDays={userStats.streakDays}
            />

            {/* Quick Actions hex row */}
            <QuickActionsBar />

            <ActivityHeatmap />

            {/* Bottom data readout */}
            <div className="w-full flex items-center justify-between px-3 text-[7px] font-mono text-muted-foreground/25 uppercase">
              <span>data_integrity: 99.7%</span>
              <span>last_sync: 2m ago</span>
              <span>conn: stable</span>
            </div>
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
