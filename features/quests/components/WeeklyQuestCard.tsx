"use client"

/**
 * Weekly Quest Card
 *
 * Same structure as QuestCard but with gold accent color (#EAB308) and
 * an expiry label showing when the weekly quest resets.
 */

import { cn } from "@/lib/utils"
import type { ActiveQuest } from "../types/quest"

// =============================================================================
// Constants
// =============================================================================

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "hsl(150,100%,45%)",
  medium: "hsl(52,100%,50%)",
  hard: "hsl(314,85%,64%)",
}

// Gold accent for weekly quests
const GOLD = "#EAB308"
const GOLD_COMPLETED = "hsl(150,100%,45%)"
const GOLD_EXPIRED = "hsl(220,13%,50%)"

// =============================================================================
// Props
// =============================================================================

interface WeeklyQuestCardProps {
  quest: ActiveQuest
  onComplete: (userQuestId: string) => void
  completing: boolean
}

// =============================================================================
// Component
// =============================================================================

export function WeeklyQuestCard({
  quest,
  onComplete,
  completing,
}: WeeklyQuestCardProps) {
  const isCompleted = quest.status === "COMPLETED"
  const isExpired = quest.status === "EXPIRED"
  const showClaimButton = quest.status === "ACTIVE" && quest.conditionMet

  const accentColor = isCompleted
    ? GOLD_COMPLETED
    : isExpired
      ? GOLD_EXPIRED
      : GOLD

  const difficultyColor = DIFFICULTY_COLOR[quest.difficulty] ?? DIFFICULTY_COLOR.medium

  const statusLabel = isCompleted
    ? "COMPLETADO"
    : isExpired
      ? "EXPIRADO"
      : "EN PROGRESO"

  const expiryLabel = quest.expiresAt
    ? `EXPIRES ${quest.expiresAt.toLocaleDateString("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })}`
    : null

  return (
    <div className="group p-3 border border-[#EAB308]/20 bg-[#EAB308]/5 rounded-sm">
      {/* Quest header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Diamond SVG indicator */}
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 10"
            className="flex-shrink-0"
          >
            <path
              d="M5 0 L10 5 L5 10 L0 5 Z"
              fill={isCompleted ? accentColor : "none"}
              stroke={accentColor}
              strokeWidth="1.5"
            />
          </svg>

          {/* Quest title */}
          <span
            className={cn(
              "text-[10px] font-mono truncate",
              isCompleted ? "line-through opacity-60" : "text-foreground",
              isExpired && "opacity-40"
            )}
          >
            {quest.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {/* Difficulty dot */}
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: difficultyColor }}
          />

          {/* XP badge */}
          <span
            className="text-[10px] font-bold font-mono"
            style={{ color: accentColor }}
          >
            +{quest.xpReward} XP
          </span>
        </div>
      </div>

      {/* Status + expiry row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] font-mono text-muted-foreground/50">
            {statusLabel}
          </span>
          {expiryLabel && (
            <span
              className="text-[8px] font-mono"
              style={{ color: `${GOLD}80` }}
            >
              {expiryLabel}
            </span>
          )}
        </div>

        {/* CLAIM button — only shown when active and condition met */}
        {showClaimButton && (
          <button
            onClick={() => onComplete(quest.userQuestId)}
            disabled={completing}
            className={cn(
              "text-[9px] font-mono uppercase px-2 py-0.5 border rounded-sm transition-colors",
              "border-[#EAB308] text-[#EAB308]",
              "hover:bg-[#EAB308]/10",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            CLAIM
          </button>
        )}
      </div>
    </div>
  )
}
