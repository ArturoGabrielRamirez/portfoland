"use client"

/**
 * Quest Card
 *
 * Renders a single daily or one-time quest in the Active Missions Panel.
 * Matches the visual style of the existing active-missions-panel.tsx.
 */

import { cn } from "@/lib/utils"
import type { ActiveQuest } from "../types/quest"

// =============================================================================
// Color Maps
// =============================================================================

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "hsl(150,100%,45%)",
  medium: "hsl(52,100%,50%)",
  hard: "hsl(314,85%,64%)",
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "hsl(174,100%,50%)",
  COMPLETED: "hsl(150,100%,45%)",
  EXPIRED: "hsl(220,13%,50%)",
}

// =============================================================================
// Props
// =============================================================================

interface QuestCardProps {
  quest: ActiveQuest
  onComplete: (userQuestId: string) => void
  completing: boolean
}

// =============================================================================
// Component
// =============================================================================

export function QuestCard({ quest, onComplete, completing }: QuestCardProps) {
  const statusColor = STATUS_COLOR[quest.status] ?? STATUS_COLOR.ACTIVE
  const difficultyColor = DIFFICULTY_COLOR[quest.difficulty] ?? DIFFICULTY_COLOR.easy
  const isCompleted = quest.status === "COMPLETED"
  const isExpired = quest.status === "EXPIRED"
  const showClaimButton = quest.status === "ACTIVE" && quest.conditionMet

  const statusLabel = isCompleted
    ? "COMPLETADO"
    : isExpired
      ? "EXPIRADO"
      : "EN PROGRESO"

  return (
    <div className="group">
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
              fill={isCompleted ? statusColor : "none"}
              stroke={statusColor}
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
            style={{ color: statusColor }}
          >
            +{quest.xpReward} XP
          </span>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono text-muted-foreground/50">
          {statusLabel}
        </span>

        {/* CLAIM button — only shown when active and condition met */}
        {showClaimButton && (
          <button
            onClick={() => onComplete(quest.userQuestId)}
            disabled={completing}
            className={cn(
              "text-[9px] font-mono uppercase px-2 py-0.5 border rounded-sm transition-colors",
              "border-[hsl(174,100%,50%)] text-[hsl(174,100%,50%)]",
              "hover:bg-[hsl(174,100%,50%,0.1)]",
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
