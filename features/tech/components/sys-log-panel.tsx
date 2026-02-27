// No "use client" — this is a React Server Component
import { cn } from "@/lib/utils"
import { getRecentUserActivity } from "@/features/dashboard/data/getRecentUserActivity.data"
import { formatTimeAgo } from "@/lib/utils/format"
import type { ActivityEventType } from "@/features/dashboard/types/dashboard"
import type { SysLogPanelProps } from "@/features/tech/types/dashboard"

// =============================================================================
// Color map by event type
// =============================================================================

/**
 * Returns the dot color for a given activity event type.
 * Colors match the spec:
 *   experience / experience_updated → green
 *   project_completed               → cyan
 *   skill_ai                        → magenta
 *   skill_manual                    → yellow
 */
function getDotColor(type: ActivityEventType): string {
  switch (type) {
    case "experience":
    case "experience_updated":
      return "hsl(150,100%,45%)"
    case "project_completed":
      return "hsl(174,100%,50%)"
    case "skill_ai":
      return "hsl(330,100%,65%)"
    case "skill_manual":
      return "hsl(52,100%,50%)"
    default:
      return "hsl(174,100%,50%)"
  }
}

// =============================================================================
// SysLogPanel — server component
// =============================================================================

/**
 * Server component that fetches and renders the 5 most recent user activity
 * events. Replaces the inline hardcoded SYS_LOG block in dashboard/page.tsx.
 *
 * No client-side JS is needed — data is fetched at render time on the server.
 */
export async function SysLogPanel({ userId, className }: SysLogPanelProps) {
  const events = await getRecentUserActivity(userId)

  return (
    <div
      className={cn(
        "border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,6%)] p-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
          SYS_LOG
        </span>
        <span className="text-[8px] font-mono text-muted-foreground/30">last 48h</span>
      </div>

      {/* Event list */}
      <div className="space-y-2.5">
        {events.length === 0 ? (
          <p className="text-[10px] font-mono text-muted-foreground/40">
            No recent activity.
          </p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-2">
              {/* Colored dot */}
              <span
                className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: getDotColor(event.type) }}
              />
              {/* Two-line event text */}
              <div>
                <p className="text-[10px] font-mono text-foreground/80">
                  {event.title} +{event.xp} XP
                </p>
                <p className="text-[8px] font-mono text-muted-foreground/40">
                  {formatTimeAgo(event.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
