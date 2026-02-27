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

// =============================================================================
// System Status HUD Panel — real browser metrics + live readouts
// =============================================================================

function StatusBar({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400 + delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div className="flex items-center gap-2 text-[9px] font-mono">
      <span className="text-muted-foreground w-8 uppercase">{label}</span>
      <div className="flex-1 h-[3px] bg-[hsl(200,20%,13%)] overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: mounted ? `${value}%` : '0%',
            background: color,
            boxShadow: `0 0 4px ${color}`,
          }}
        />
      </div>
      <span style={{ color }} className="w-7 text-right tabular-nums">{value}%</span>
    </div>
  )
}

// TG1-C: SystemStatusPanel now accepts activeSkillsCount and streakDays as real-data props
function SystemStatusPanel({ activeSkillsCount, streakDays }: { activeSkillsCount: number; streakDays: number }) {
  const [time, setTime] = useState('')

  // TG1-C: Browser performance metrics state — fallback values match the design reference
  const [metrics, setMetrics] = useState({ net: 88, cpu: 24, ram: 61, gpu: 18 })

  // TG1-C: Read browser metrics on mount; gracefully fall back to decorative values on any error
  useEffect(() => {
    let cpuInterval: ReturnType<typeof setInterval> | null = null

    try {
      // NET: navigator.connection.downlink is in Mbps; map to 0–100% (10 Mbps = 100%)
      const downlink = (navigator as any).connection?.downlink
      const net = downlink != null
        ? Math.min(100, Math.round(downlink * 10))
        : 88

      // RAM: performance.memory available in Chrome; ratio of used/total heap
      let ram = 61
      const mem = (performance as any).memory
      if (mem?.usedJSHeapSize && mem?.totalJSHeapSize) {
        ram = Math.round((mem.usedJSHeapSize / mem.totalJSHeapSize) * 100)
      }

      // Apply net + ram immediately; CPU is computed over 10 samples at 100ms intervals
      setMetrics(m => ({ ...m, net, ram }))

      // CPU estimator: 10 performance.now() delta measurements at 100ms intervals.
      // avgDelta should be ~100ms when idle; higher values indicate CPU load.
      const deltas: number[] = []
      let last = performance.now()
      cpuInterval = setInterval(() => {
        const now = performance.now()
        deltas.push(now - last)
        last = now
        if (deltas.length >= 10) {
          if (cpuInterval) clearInterval(cpuInterval)
          const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length
          const cpu = Math.max(0, Math.min(99, Math.round((avg - 100) / 2)))
          setMetrics(m => ({ ...m, cpu: cpu > 0 ? cpu : 24 }))
        }
      }, 100)
    } catch {
      // Any API unavailability falls back silently to the default decorative values
    }

    return () => {
      if (cpuInterval) clearInterval(cpuInterval)
    }
  }, [])

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border-t border-[hsl(174,100%,50%,0.1)] mx-6 pt-3 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">SYS_MONITOR.210</span>
        <span className="text-[9px] font-mono text-[hsl(174,100%,50%,0.5)] tabular-nums">{time}</span>
      </div>

      {/* Status badges row */}
      <div className="flex gap-1.5 mb-3">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono uppercase bg-[hsl(150,100%,45%,0.1)] border border-[hsl(150,100%,45%,0.2)] text-[hsl(150,100%,45%)]">
          <span className="w-1 h-1 bg-[hsl(150,100%,45%)] rounded-full" />
          online
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono uppercase bg-[hsl(174,100%,50%,0.1)] border border-[hsl(174,100%,50%,0.2)] text-[hsl(174,100%,50%)]">
          <span className="w-1 h-1 bg-[hsl(174,100%,50%)] rounded-full" />
          synced
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono uppercase bg-[hsl(52,100%,50%,0.1)] border border-[hsl(52,100%,50%,0.2)] text-[hsl(52,100%,50%)]">
          rank: explorer
        </span>
      </div>

      {/* Resource bars — NET/CPU/RAM from browser APIs, GPU always decorative */}
      <div className="space-y-1.5">
        <StatusBar label="NET" value={metrics.net} color="hsl(174,100%,50%)" delay={0} />
        <StatusBar label="CPU" value={metrics.cpu} color="hsl(150,100%,45%)" delay={100} />
        <StatusBar label="RAM" value={metrics.ram} color="hsl(330,100%,65%)" delay={200} />
        {/* decorative — WebGL heap is unavailable without canvas; static value */}
        <StatusBar label="GPU" value={metrics.gpu} color="hsl(52,100%,50%)" delay={300} />
      </div>

      {/* TG1-C: Data readout line — real activeSkillsCount and streakDays, pid stays decorative */}
      <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-muted-foreground/40">
        <span>skills: {activeSkillsCount} active</span>
        <span>streak: {streakDays}d</span>
        <span>pid: 0x4F2A</span>
      </div>
    </div>
  )
}

const defaultQuickActions = [
  { icon: "Briefcase", label: "Add Experience", color: "hsl(174,100%,50%)" },
  { icon: "Clock", label: "Timeline", color: "hsl(60,100%,50%)" },
  { icon: "GitBranch", label: "Level Up", color: "hsl(330,100%,65%)" },
  { icon: "Target", label: "New Goal", color: "hsl(150,100%,45%)" },
]

// Mini AI Eye for avatar swap
function MiniAIEye() {
  return (
    <svg width="56" height="56" viewBox="0 0 100 100">
      <polygon
        points="50,0 100,25 100,75 50,100 0,75 0,25"
        fill="hsl(200,30%,8%)"
      />
      <polygon
        points="50,0 100,25 100,75 50,100 0,75 0,25"
        fill="none"
        stroke="hsl(174,100%,50%)"
        strokeWidth="2"
        strokeOpacity="0.6"
        className="animate-pulse"
      />
      {/* Iris */}
      <ellipse cx="50" cy="50" rx="20" ry="13" fill="hsl(174,100%,50%)" fillOpacity="0.1" stroke="hsl(174,100%,50%)" strokeWidth="1" />
      {/* Pupil */}
      <circle cx="50" cy="50" r="8" fill="hsl(174,100%,50%)" style={{ filter: "drop-shadow(0 0 8px hsl(174,100%,50%))" }} />
      <circle cx="50" cy="50" r="4" fill="hsl(200,30%,5%)" />
      <circle cx="47.5" cy="47.5" r="1.8" fill="white" opacity="0.75" />
    </svg>
  )
}

export function WelcomeCard({
  userName,
  userInitial,
  userImage,
  level,
  currentXP,
  maxXP,
  streakDays,
  activeSkillsCount,
  quickActions,
  aiActive,
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
            {/* Avatar hex — swaps to AI eye when AI is active */}
            <div className="relative flex-shrink-0 transition-all duration-500">
              {aiActive ? (
                <MiniAIEye />
              ) : (
                <>
                  <svg width="56" height="56" viewBox="0 0 100 100">
                    {/* Dark background fill */}
                    <polygon
                      points="50,0 100,25 100,75 50,100 0,75 0,25"
                      fill="hsl(200,30%,8%)"
                    />
                    {/* Initials fallback — only shown when no image */}
                    {!isValidImage && (
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
                  {/* User photo overlaid as regular <img> — SVG <image> blocks cross-origin loads */}
                  {isValidImage && (
                    <img
                      src={userImage!}
                      alt="User avatar"
                      onError={() => setImageError(true)}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ clipPath: 'circle(48% at 50% 50%)' }}
                    />
                  )}
                </>
              )}
              <div className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm transition-colors duration-500",
                aiActive
                  ? "bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)]"
                  : "bg-[hsl(330,100%,65%)] text-[hsl(200,25%,8%)]"
              )}>
                {aiActive ? "AI" : `Lv.${level}`}
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

        {/* TG1-C: System Status HUD Panel — receives real activeSkillsCount and streakDays */}
        <SystemStatusPanel activeSkillsCount={activeSkillsCount ?? 0} streakDays={streakDays} />

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
