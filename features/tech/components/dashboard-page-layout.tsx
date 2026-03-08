"use client"

import { useState, useMemo, type ReactNode } from "react"
import { CRTTriggerContext, type CRTTriggers } from "../context/crt-triggers"
import { DashboardRow1 } from "./dashboard-row1"
import type { PageContext } from "../types/page-context"
import type { PortfolioMode } from "@/features/portfolio/types/portfolio"

// =============================================================================
// Types
// =============================================================================

interface DashboardPageLayoutProps {
  children: ReactNode
  pageContext: PageContext
  portfolioMode: PortfolioMode
  userName: string
  userInitial: string
  userImage?: string | null
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  activeSkillsCount?: number
  translations: {
    welcomeTitle: string
    welcomeSubtitle: string
    streak: string
    quickActionsTitle: string
    xpToLevel: string
  }
  bootStats?: {
    totalXP: number
    level: number
    activeSkillsCount: number
    currentStreak: number
    achievements: { current: number; total: number }
  }
  /** Locale for AI chat API requests */
  locale?: string
}

// =============================================================================
// ClassicDashboardHeader
// =============================================================================

function ClassicDashboardHeader({
  userName,
  pageContext,
}: {
  userName: string
  pageContext: PageContext
}) {
  const pageTitle = pageContext.charAt(0).toUpperCase() + pageContext.slice(1)

  return (
    <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500">Welcome, {userName}</p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// DashboardPageLayout
// =============================================================================

export function DashboardPageLayout({
  children,
  pageContext,
  portfolioMode,
  userName,
  userInitial,
  userImage,
  level,
  currentXP,
  maxXP,
  streakDays,
  activeSkillsCount,
  translations,
  bootStats,
  locale,
}: DashboardPageLayoutProps) {
  const [xpGainTrigger, setXpGainTrigger] = useState(0)
  const [lifeLossTrigger, setLifeLossTrigger] = useState(0)
  const [searchingTrigger, setSearchingTrigger] = useState(0)

  const triggers: CRTTriggers = useMemo(() => ({
    triggerXPGain: () => setXpGainTrigger(n => n + 1),
    triggerLifeLoss: () => setLifeLossTrigger(n => n + 1),
    triggerSearching: () => setSearchingTrigger(n => n + 1),
  }), [])

  const isTech = portfolioMode === "tech"

  return (
    <CRTTriggerContext.Provider value={triggers}>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 p-2">
        {isTech ? (
          <DashboardRow1
            userName={userName}
            userInitial={userInitial}
            userImage={userImage}
            level={level}
            currentXP={currentXP}
            maxXP={maxXP}
            streakDays={streakDays}
            activeSkillsCount={activeSkillsCount}
            translations={translations}
            bootStats={bootStats}
            pageContext={pageContext}
            locale={locale}
            onXPGain={triggers.triggerXPGain}
            onLifeLoss={triggers.triggerLifeLoss}
            onSearching={triggers.triggerSearching}
          />
        ) : (
          <ClassicDashboardHeader
            userName={userName}
            pageContext={pageContext}
          />
        )}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </CRTTriggerContext.Provider>
  )
}
