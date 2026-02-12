"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import type { CRTLine, CRTMonitorProps } from "../types/crt-monitor"

const bootSequence: CRTLine[] = [
  { text: "session_stats --display", color: "white", prefix: "$ " },
  { text: "Loading profile... OK", color: "green", prefix: "> " },
  { text: "XP: 2,450 | Level: 18 | Rank: Explorer", color: "cyan", prefix: "> " },
  { text: "Achievements: 18/42 unlocked", color: "yellow", prefix: "> " },
  { text: "Skills: 24 active | 3 mastered", color: "magenta", prefix: "> " },
  { text: "Streak: 12 days | Next goal: 50 XP", color: "green", prefix: "> " },
]

const colorClasses = {
  cyan: "text-[hsl(174,100%,50%)]",
  green: "text-[hsl(150,100%,45%)]",
  yellow: "text-[hsl(60,100%,50%)]",
  magenta: "text-[hsl(330,100%,65%)]",
  white: "text-foreground",
}

export function CRTMonitor({
  className,
  lines,
  title = "SYS_MONITOR v3.2",
  statusText = "ONLINE",
  children,
}: CRTMonitorProps) {
  const contentLines = lines || bootSequence
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (children) return // Skip animation if using children

    const lineTimers: NodeJS.Timeout[] = []
    contentLines.forEach((_, i) => {
      lineTimers.push(
        setTimeout(() => setVisibleLines(i + 1), 400 + i * 600)
      )
    })
    return () => lineTimers.forEach(clearTimeout)
  }, [children, contentLines])

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("crt-monitor relative rounded-sm border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,6%)] overflow-hidden", className)}>
      {/* Scanner line */}
      <div className="crt-scanner" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(150,100%,45%)] shadow-[0_0_4px_hsl(150_100%_45%)]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[hsl(174,100%,50%,0.7)]">
            {title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[hsl(330,100%,65%)]">
          {statusText}
        </span>
      </div>

      {/* Content */}
      <div ref={containerRef} className="p-3 font-mono text-xs leading-relaxed h-[180px] flex flex-col justify-between">
        {children ? (
          children
        ) : (
          <>
            {contentLines.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={cn("mb-1", colorClasses[line.color])} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-muted-foreground">{line.prefix}</span>
                {line.text}
              </div>
            ))}
            {visibleLines >= contentLines.length && (
              <div className="mt-3 flex items-center gap-3">
                {/* Hex stat badges in CRT */}
                {[
                  { value: "2,450", label: "XP", color: "hsl(174,100%,50%)" },
                  { value: "Lv.18", label: "LEVEL", color: "hsl(60,100%,50%)" },
                  { value: "18/42", label: "ACHIEV", color: "hsl(330,100%,65%)" },
                  { value: "24", label: "SKILLS", color: "hsl(150,100%,45%)" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <svg width="36" height="36" viewBox="0 0 100 100">
                      <path
                        d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
                        fill={`${stat.color}`}
                        fillOpacity="0.15"
                        stroke={stat.color}
                        strokeWidth="2"
                      />
                      <text
                        x="50"
                        y="55"
                        textAnchor="middle"
                        fill={stat.color}
                        fontSize="22"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {stat.value}
                      </text>
                    </svg>
                    <span className="text-[8px] mt-0.5 text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <span
          className={cn(
            "inline-block w-2 h-3.5 bg-[hsl(174,100%,50%)] ml-0.5 align-middle",
            cursorVisible ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  )
}
