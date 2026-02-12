"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { WelcomeCardProps } from "../types/dashboard"
import { Briefcase, Clock, GitBranch, Target } from "lucide-react"

const defaultQuickActions = [
  { icon: Briefcase, label: "Add Experience", color: "hsl(174,100%,50%)" },
  { icon: Clock, label: "Timeline", color: "hsl(60,100%,50%)" },
  { icon: GitBranch, label: "Level Up", color: "hsl(330,100%,65%)" },
  { icon: Target, label: "New Goal", color: "hsl(150,100%,45%)" },
]

export function WelcomeCard({
  userName,
  userInitial,
  level,
  currentXP,
  maxXP,
  streakDays,
  quickActions = defaultQuickActions,
  className,
}: WelcomeCardProps) {
  const [mounted, setMounted] = useState(false)
  const percentage = Math.round((currentXP / maxXP) * 100)
  const xpToNextLevel = maxXP - currentXP

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={cn("relative border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,8%)] overflow-hidden", className)}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(174,100%,50%,0.5)] to-transparent" />

      <div className="flex flex-col lg:flex-row">
        {/* Left: Welcome info */}
        <div className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar hex */}
            <div className="relative">
              <svg width="56" height="56" viewBox="0 0 100 100">
                <path
                  d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
                  fill="hsl(174,100%,50%)"
                  fillOpacity="0.2"
                  stroke="hsl(174,100%,50%)"
                  strokeWidth="2"
                />
                <text x="50" y="58" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="36" fontWeight="bold" fontFamily="monospace">
                  {userInitial}
                </text>
              </svg>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[hsl(330,100%,65%)] text-[hsl(200,25%,8%)] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm">
                Lv.{level}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold text-foreground">
                Welcome back, <span className="text-[hsl(174,100%,50%)]">{userName}!</span>
              </h2>
              <p className="text-xs text-muted-foreground font-mono">Continue building your professional adventure</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-muted-foreground">Level {level}</span>
              <span className="text-[hsl(174,100%,50%)]">{currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP</span>
            </div>
            <div className="h-2 bg-[hsl(200,20%,13%)] overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }}>
              <div
                className="h-full bg-[hsl(174,100%,50%)] transition-all duration-1000 ease-out shadow-[0_0_8px_hsl(174_100%_50%_/_0.5)]"
                style={{ width: mounted ? `${percentage}%` : "0%" }}
              />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">{xpToNextLevel} XP to Level {level + 1}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[hsl(150,100%,45%,0.1)] border border-[hsl(150,100%,45%,0.3)] px-2.5 py-1 text-[10px] font-mono text-[hsl(150,100%,45%)]">
            <span className="w-1.5 h-1.5 bg-[hsl(150,100%,45%)] rounded-full animate-pulse" />
            {streakDays} day streak
          </div>
        </div>

        {/* Right: Quick Actions as honeycomb */}
        <div className="lg:w-[280px] border-t lg:border-t-0 lg:border-l border-[hsl(174,100%,50%,0.1)] p-4 flex flex-col items-center justify-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-x-1" style={{ gap: "2px" }}>
            {quickActions.map((action, i) => {
              const Icon = action.icon
              const isOddRow = Math.floor(i / 2) % 2 === 1
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="group relative flex flex-col items-center justify-center transition-transform duration-200 hover:scale-110"
                  style={{ marginLeft: isOddRow ? "28px" : "0", marginTop: i >= 2 ? "-8px" : "0" }}
                >
                  <svg width="56" height="56" viewBox="0 0 100 100" className="transition-all duration-300">
                    <path
                      d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
                      fill={`${action.color}`}
                      fillOpacity="0.08"
                      stroke={action.color}
                      strokeWidth="1.5"
                      strokeOpacity="0.5"
                      className="group-hover:fill-opacity-20 group-hover:stroke-opacity-100 transition-all"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className="w-4 h-4 transition-colors" style={{ color: action.color }} />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
