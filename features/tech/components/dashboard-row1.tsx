"use client"

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react"
import { WelcomeCard } from "./welcome-card"
import { CRTWithAI } from "./crt-with-ai"
import type { AIState, CRTWithAIHandle } from "./crt-with-ai"
import type { DashboardRow1Props } from "../types/dashboard"

export interface DashboardRow1Handle {
  insertPrompt: (text: string) => void
}

// AI states that trigger the avatar swap
const AI_ACTIVE_STATES: AIState[] = ["listening", "thinking", "ready", "success"]

export const DashboardRow1 = forwardRef<DashboardRow1Handle, DashboardRow1Props>(function DashboardRow1({
  userName,
  userInitial,
  userImage,
  level,
  currentXP,
  maxXP,
  streakDays,
  activeSkillsCount,
  translations,
  onXPGain,
  onLifeLoss,
  onSearching,
  bootStats,
  pageContext,
  locale,
}: DashboardRow1Props, ref) {
  const crtRef = useRef<CRTWithAIHandle>(null)
  const [aiActive, setAiActive] = useState(false)

  useImperativeHandle(ref, () => ({
    insertPrompt(text: string) {
      crtRef.current?.insertPrompt(text)
    },
  }))

  // TG1-A: Counter-based triggers for the AIEye transient states.
  // Incrementing each counter fires the corresponding eye animation once.
  const [xpGainTrigger, setXPGainTrigger] = useState(0)
  const [lifeLossTrigger, setLifeLossTrigger] = useState(0)
  // TG6: Counter-based trigger for the searching (GitHub sync) state.
  const [searchingTrigger, setSearchingTrigger] = useState(0)

  const handleAIStateChange = useCallback((state: AIState) => {
    setAiActive(AI_ACTIVE_STATES.includes(state))
  }, [])

  // TG1-A: Exposed handlers that parent (dashboard/page.tsx) can call via the optional props.
  // They increment the local trigger counter and also forward to the passed-through prop callback.
  const handleXPGain = useCallback(() => {
    setXPGainTrigger(n => n + 1)
    onXPGain?.()
  }, [onXPGain])

  const handleLifeLoss = useCallback(() => {
    setLifeLossTrigger(n => n + 1)
    onLifeLoss?.()
  }, [onLifeLoss])

  // TG6: Exposed handler for triggering the searching animation.
  // GitHubSyncPanel calls this when a sync begins; exit is driven by xpGainTrigger or lifeLossTrigger.
  const handleSearching = useCallback(() => {
    setSearchingTrigger(n => n + 1)
    onSearching?.()
  }, [onSearching])

  return (
    <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-2">
      <WelcomeCard
        userName={userName}
        userInitial={userInitial}
        userImage={userImage}
        level={level}
        currentXP={currentXP}
        maxXP={maxXP}
        streakDays={streakDays}
        activeSkillsCount={activeSkillsCount}
        aiActive={aiActive}
        translations={translations}
      />
      <CRTWithAI
        ref={crtRef}
        userName={userName}
        className="min-h-[180px] md:min-h-0"
        onAIStateChange={handleAIStateChange}
        xpGainTrigger={xpGainTrigger}
        lifeLossTrigger={lifeLossTrigger}
        searchingTrigger={searchingTrigger}
        bootStats={bootStats}
        pageContext={pageContext}
        locale={locale}
      />
    </div>
  )
})
