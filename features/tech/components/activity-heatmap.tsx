"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import type { ActivityHeatmapProps } from "@/features/tech/types/dashboard"

// =============================================================================
// ActivityHeatmap
// =============================================================================

/**
 * Renders a 30-day activity heatmap using real streak data from the server.
 * Days within the streak window are rendered at full intensity (4);
 * all other days are rendered at intensity 0.
 *
 * Props:
 *   currentStreak   — number of consecutive active days
 *   lastStreakDate  — the most recent streak day (null if no streak)
 */
export function ActivityHeatmap({
  currentStreak,
  lastStreakDate,
  className,
}: ActivityHeatmapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ---------------------------------------------------------------------------
  // Build a 30-day intensity array from the streak window
  // ---------------------------------------------------------------------------

  const today = new Date()
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(today)
    day.setDate(today.getDate() - (29 - i))
    return day
  })

  const streakEnd = lastStreakDate ? new Date(lastStreakDate) : null
  const streakStart = streakEnd
    ? new Date(new Date(streakEnd).setDate(streakEnd.getDate() - currentStreak + 1))
    : null

  const data = days.map((day) => {
    if (!streakStart || !streakEnd) return { date: day, intensity: 0 }
    // Compare date-only (strip time component for fair comparison)
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const start = new Date(streakStart.getFullYear(), streakStart.getMonth(), streakStart.getDate())
    const end = new Date(streakEnd.getFullYear(), streakEnd.getMonth(), streakEnd.getDate())
    const inStreak = dayStart >= start && dayStart <= end
    return { date: day, intensity: inStreak ? 4 : 0 }
  })

  // ---------------------------------------------------------------------------
  // Color helper
  // ---------------------------------------------------------------------------

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-[#1E293B] opacity-20" // None
      case 1: return "bg-[hsl(150,100%,45%)] opacity-20" // Low
      case 2: return "bg-[hsl(150,100%,45%)] opacity-40" // Medium-Low
      case 3: return "bg-[hsl(150,100%,45%)] opacity-70" // Medium-High
      case 4: return "bg-[hsl(150,100%,45%)] opacity-100 shadow-[0_0_8px_hsl(150,100%,45%,0.5)]" // High
      default: return "bg-[#1E293B]"
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          ACTIVITY_HEATMAP
        </span>
        <span className="text-[7px] font-mono text-muted-foreground/50 border border-muted-foreground/20 px-1 py-0.5 rounded-sm">
          LAST 30 DAYS
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 max-w-[240px]">
        {data.map((item, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-3.5 transition-all duration-700",
              mounted ? "scale-100" : "scale-0",
              getLevelColor(item.intensity)
            )}
            style={{
              transitionDelay: `${i * 20}ms`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-muted-foreground/60">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(l => (
            <div
              key={l}
              className={cn("w-1.5 h-1.5", getLevelColor(l))}
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
