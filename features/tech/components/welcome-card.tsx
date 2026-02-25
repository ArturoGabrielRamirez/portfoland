"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { WelcomeCardProps } from "../types/dashboard"
import { Briefcase, Clock, GitBranch, Target, User } from "lucide-react"

// Icon mapping
const iconMap: Record<string, any> = {
  Briefcase,
  Clock,
  GitBranch,
  Target,
  User,
}

const defaultQuickActions = [
  { icon: "Briefcase", label: "Add Experience", color: "hsl(174,100%,50%)" },
  { icon: "Clock", label: "Timeline", color: "hsl(60,100%,50%)" },
  { icon: "GitBranch", label: "Level Up", color: "hsl(330,100%,65%)" },
  { icon: "Target", label: "New Goal", color: "hsl(150,100%,45%)" },
]

export function WelcomeCard({
  userName,
  userInitial,
  userImage,
  level,
  currentXP,
  maxXP,
  streakDays,
  quickActions,
  translations,
  className,
}: WelcomeCardProps) {
  const [mounted, setMounted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const percentage = Math.round((currentXP / maxXP) * 100)
  const xpToNextLevel = maxXP - currentXP

  // Validate image URL
  const isValidImage = userImage && userImage.trim() !== '' && !imageError

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
            {/* Avatar hex — SVG clipPath eliminates white corner artifacts */}
            <div className="relative flex-shrink-0">
              <svg width="56" height="56" viewBox="0 0 100 100">
                <defs>
                  <clipPath id="hex-avatar-clip">
                    <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" />
                  </clipPath>
                </defs>
                {/* Dark background fill */}
                <polygon
                  points="50,0 100,25 100,75 50,100 0,75 0,25"
                  fill="hsl(200,30%,8%)"
                />
                {isValidImage ? (
                  <image
                    href={userImage!}
                    width="100"
                    height="100"
                    clipPath="url(#hex-avatar-clip)"
                    preserveAspectRatio="xMidYMid slice"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <text
                    x="50" y="63"
                    textAnchor="middle"
                    fontSize="42"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="hsl(174,100%,50%)"
                  >
                    {userInitial}
                  </text>
                )}
                {/* Hex border */}
                <polygon
                  points="50,0 100,25 100,75 50,100 0,75 0,25"
                  fill="none"
                  stroke="hsl(174,100%,50%)"
                  strokeWidth="2"
                  strokeOpacity="0.4"
                />
              </svg>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[hsl(330,100%,65%)] text-[hsl(200,25%,8%)] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm">
                Lv.{level}
              </div>
            </div>
            <div>
<h2 className="text-xl font-mono font-bold text-foreground">
                {translations?.welcomeTitle || `Welcome back, ${userName}!`}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">{translations?.welcomeSubtitle || "Continue building your professional adventure"}</p>
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
            <p className="text-[10px] font-mono text-muted-foreground mt-1">{translations?.xpToLevel ? translations.xpToLevel.replace('{xp}', xpToNextLevel.toString()).replace('{level}', (level + 1).toString()) : `${xpToNextLevel} XP to Level ${level + 1}`}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[hsl(150,100%,45%,0.1)] border border-[hsl(150,100%,45%,0.3)] px-2.5 py-1 text-[10px] font-mono text-[hsl(150,100%,45%)]">
<span className="w-1.5 h-1.5 bg-[hsl(150,100%,45%)] rounded-full animate-pulse" />
            {translations?.streak ? translations.streak.replace('{count}', streakDays.toString()) : `${streakDays} day streak`}
          </div>
        </div>

        {/* Right: Quick Actions as honeycomb */}
        {quickActions && quickActions.length > 0 && (
        <div className="lg:w-[280px] border-t lg:border-t-0 lg:border-l border-[hsl(174,100%,50%,0.1)] p-4 flex flex-col items-center justify-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">{translations?.quickActionsTitle || "Quick Actions"}</p>
          <div className="grid grid-cols-2 gap-y-0 gap-x-2">
            {quickActions.map((action, i) => {
              const Icon = iconMap[action.icon] || Target
              const isOddRow = Math.floor(i / 2) % 2 === 1
              const sharedClass = "group relative flex flex-col items-center justify-center transition-all duration-300 hover:scale-105"
              const sharedStyle = { marginLeft: isOddRow ? "32px" : "0", marginTop: i >= 2 ? "-10px" : "0" }

              const inner = (
                <>
                  <div className="relative">
                    <svg width="64" height="64" viewBox="0 0 100 100" className="transition-all duration-300 drop-shadow-none group-hover:drop-shadow-[0_0_8px_var(--action-color)]" style={{ "--action-color": action.color } as React.CSSProperties}>
                      <path
                        d="M50 2 L97 26 L97 74 L50 98 L3 74 L3 26 Z"
                        fill="none"
                        stroke={action.color}
                        strokeWidth="0.5"
                        strokeOpacity="0.2"
                        className="group-hover:stroke-opacity-60 transition-all"
                      />
                      <path
                        d="M50 5 L95 27 L95 73 L50 95 L5 73 L5 27 Z"
                        fill={action.color}
                        fillOpacity="0.06"
                        stroke={action.color}
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="group-hover:fill-opacity-20 group-hover:stroke-opacity-100 transition-all duration-300"
                      />
                      <path
                        d="M50 15 L85 32 L85 68 L50 85 L15 68 L15 32 Z"
                        fill="none"
                        stroke={action.color}
                        strokeWidth="0.5"
                        strokeOpacity="0"
                        className="group-hover:stroke-opacity-30 transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <Icon className="w-5 h-5 transition-all duration-300 opacity-70 group-hover:opacity-100 group-hover:scale-110" style={{ color: action.color }} />
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground -mt-1 group-hover:text-foreground transition-colors duration-300 tracking-wider">
                    {action.label}
                  </span>
                </>
              )

              return action.href ? (
                <Link key={action.label} href={action.href} className={sharedClass} style={sharedStyle}>
                  {inner}
                </Link>
              ) : (
                <button key={action.label} type="button" onClick={action.onClick} className={sharedClass} style={sharedStyle}>
                  {inner}
                </button>
              )
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
