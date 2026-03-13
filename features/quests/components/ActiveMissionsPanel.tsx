"use client"

/**
 * Active Missions Panel (Quest System)
 *
 * Replaces features/tech/components/active-missions-panel.tsx.
 * Renders real quests from the database, with CLAIM buttons and refresh support.
 * Outer styling matches the original panel exactly.
 */

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { QuestCard } from "./QuestCard"
import { WeeklyQuestCard } from "./WeeklyQuestCard"
import { completeQuestAction } from "../actions/completeQuestAction"
import { getQuestsAction } from "../actions/getQuestsAction"
import type { ActiveQuest } from "../types/quest"

// =============================================================================
// Props
// =============================================================================

interface ActiveMissionsPanelProps {
  quests: ActiveQuest[]
  className?: string
  locale?: string
}

// =============================================================================
// Component
// =============================================================================

export function ActiveMissionsPanel({
  quests: initialQuests,
  className,
  locale,
}: ActiveMissionsPanelProps) {
  const [localQuests, setLocalQuests] = useState<ActiveQuest[]>(initialQuests)
  const [isPending, startTransition] = useTransition()

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleComplete(userQuestId: string) {
    const quest = localQuests.find((q) => q.userQuestId === userQuestId)
    if (!quest) return

    startTransition(async () => {
      try {
        const result = await completeQuestAction(quest.templateId)

        if (!result.hasError && result.payload) {
          toast.success(`+${result.payload.xpAwarded} XP earned!`)
          // Optimistically mark quest as COMPLETED in local state
          setLocalQuests((prev) =>
            prev.map((q) =>
              q.userQuestId === userQuestId
                ? { ...q, status: "COMPLETED" as const, completedAt: new Date() }
                : q
            )
          )
        } else if (!result.hasError && result.payload === null) {
          toast.info("Quest already completed")
        } else {
          toast.error("Failed to claim quest")
        }
      } catch {
        toast.error("Failed to claim quest")
      }
    })
  }

  function handleRefresh() {
    startTransition(async () => {
      try {
        const result = await getQuestsAction(locale)
        if (!result.hasError && result.payload) {
          setLocalQuests(result.payload)
        }
      } catch {
        // Silently ignore refresh errors
      }
    })
  }

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const dailyQuests = localQuests.filter((q) => q.type !== "weekly")
  const weeklyQuest = localQuests.find((q) => q.type === "weekly")
  const pendingCount = localQuests.filter(
    (q) => q.status === "ACTIVE"
  ).length

  const allDailyComplete =
    dailyQuests.length > 0 &&
    dailyQuests.every((q) => q.status !== "ACTIVE")

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,6%)] flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,8%)]">
        <div className="flex items-center gap-2">
          {/* Hex icon */}
          <svg width="14" height="14" viewBox="0 0 100 100">
            <path
              d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
              fill="hsl(174,100%,50%)"
              fillOpacity="0.2"
              stroke="hsl(174,100%,50%)"
              strokeWidth="4"
            />
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fill="hsl(174,100%,50%)"
              fontSize="50"
              fontFamily="monospace"
              fontWeight="bold"
            >
              !
            </text>
          </svg>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(174,100%,50%,0.8)]">
            ACTIVE_MISSIONS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground">
            {pendingCount} pending
          </span>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className={cn(
              "text-[9px] font-mono text-[hsl(174,100%,50%,0.6)]",
              "hover:text-[hsl(174,100%,50%)] transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            aria-label="Refresh quests"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Daily quests */}
        {allDailyComplete ? (
          <p className="text-[9px] font-mono text-muted-foreground/50 text-center py-2">
            All missions complete for today
          </p>
        ) : (
          dailyQuests.map((quest) => (
            <QuestCard
              key={quest.userQuestId}
              quest={quest}
              onComplete={handleComplete}
              completing={isPending}
            />
          ))
        )}

        {/* Weekly quest divider */}
        {weeklyQuest && (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-px bg-[#EAB308]/20" />
            <span className="text-[8px] font-mono uppercase text-[#EAB308]/50">
              weekly
            </span>
            <div className="flex-1 h-px bg-[#EAB308]/20" />
          </div>
        )}

        {/* Weekly quest */}
        {weeklyQuest && (
          <WeeklyQuestCard
            quest={weeklyQuest}
            onComplete={handleComplete}
            completing={isPending}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[hsl(174,100%,50%,0.08)]">
        <span className="text-[8px] font-mono text-muted-foreground/40">
          &gt; MISSION_TRACKER --live
        </span>
      </div>
    </div>
  )
}
