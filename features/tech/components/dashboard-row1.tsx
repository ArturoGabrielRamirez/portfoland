"use client"

import { useState, useCallback } from "react"
import { WelcomeCard } from "./welcome-card"
import { CRTWithAI } from "./crt-with-ai"
import type { AIState } from "./crt-with-ai"

interface DashboardRow1Props {
  // WelcomeCard data
  userName: string
  userInitial: string
  userImage?: string | null
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  translations: {
    welcomeTitle: string
    welcomeSubtitle: string
    streak: string
    quickActionsTitle: string
    xpToLevel: string
  }
}

// AI states that trigger the avatar swap
const AI_ACTIVE_STATES: AIState[] = ["listening", "thinking", "ready", "success"]

export function DashboardRow1({
  userName,
  userInitial,
  userImage,
  level,
  currentXP,
  maxXP,
  streakDays,
  translations,
}: DashboardRow1Props) {
  const [aiActive, setAiActive] = useState(false)

  const handleAIStateChange = useCallback((state: AIState) => {
    setAiActive(AI_ACTIVE_STATES.includes(state))
  }, [])

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
        aiActive={aiActive}
        translations={translations}
      />
      <CRTWithAI
        userName={userName}
        className="min-h-[180px] md:min-h-0"
        onAIStateChange={handleAIStateChange}
      />
    </div>
  )
}
