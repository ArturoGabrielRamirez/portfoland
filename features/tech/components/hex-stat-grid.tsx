"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface StatItem {
    value: string
    label: string
    color: string
    delay?: number
    size?: number
}

interface HexStatGridProps {
    stats: {
        xp: { current: number; max: number }
        level: number
        experiences: number
        achievements: { current: number; total: number }
    }
    streakDays: number
    className?: string
}

// Hex SVG — pointy-top, fits a square viewBox 0 0 90 90
const HEX_PATH = "M45 6.03 L83.97 28.53 L83.97 61.47 L45 83.97 L6.03 61.47 L6.03 28.53 Z"

function HexStat({ value, label, color, delay = 0, size = 90 }: StatItem) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay)
        return () => clearTimeout(t)
    }, [delay])

    const isBig = size >= 100
    const fontSize = isBig ? "1.5rem" : size >= 90 ? "1.35rem" : "1.1rem"
    const labelSize = isBig ? "0.5rem" : "0.42rem"

    return (
        <div
            className={cn(
                "flex flex-col items-center transition-all duration-700",
                visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-90"
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="relative group cursor-default">
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 90 90"
                    className="transition-all duration-300"
                    style={{ filter: `drop-shadow(0 0 4px ${color}30)` }}
                >
                    {/* Outer glow ring */}
                    <path
                        d={HEX_PATH}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.5"
                        strokeOpacity="0.2"
                        className="group-hover:stroke-opacity-50 transition-all duration-300"
                    />
                    {/* Main hex border */}
                    <path
                        d={HEX_PATH}
                        fill={color}
                        fillOpacity="0.06"
                        stroke={color}
                        strokeWidth="2"
                        strokeOpacity="0.55"
                        className="group-hover:fill-opacity-15 group-hover:stroke-opacity-100 transition-all duration-300"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                        className="font-mono font-bold leading-none tracking-tight"
                        style={{
                            color,
                            fontSize,
                            textShadow: `0 0 12px ${color}50`,
                        }}
                    >
                        {value}
                    </span>
                    <span
                        className="font-mono uppercase tracking-[0.18em] mt-0.5"
                        style={{
                            color,
                            fontSize: labelSize,
                            opacity: 0.75,
                        }}
                    >
                        {label}
                    </span>
                </div>
            </div>
        </div>
    )
}

// =============================================================================
// Diamond / Cross layout
//
//         [ TOP: Level  80px ]
// [L:Exp]  [ CENTER: XP 100px ] [R:Ach]
//         [ BOT: Streak 80px ]
//
// Container: 310 × 270px
// CENTER (100px) : left=105, top=85  → rendered center (155, 135)
// TOP    (80px)  : left=115, top=5   → rendered center (155, 45)
// BOT    (80px)  : left=115, top=185 → rendered center (155, 225)
// LEFT   (80px)  : left=15,  top=95  → rendered center (55,  135)
// RIGHT  (80px)  : left=215, top=95  → rendered center (255, 135)
//
// Vertical: TOP-CENTER and BOT-CENTER share edges (y=85 / y=185).
// Horizontal: 10px gap each side → bridged with dashed connector lines.
// =============================================================================

export function HexStatGrid({ stats, streakDays, className }: HexStatGridProps) {
    const C = {
        cyan:    "hsl(174,100%,50%)",
        yellow:  "hsl(52,100%,50%)",
        green:   "hsl(150,100%,45%)",
        magenta: "hsl(330,100%,65%)",
        purple:  "hsl(260,80%,65%)",
    }

    return (
        <div className={cn("flex items-center justify-center w-full", className)}>

            {/* ── DESKTOP: Diamond / Cross ── */}
            <div className="hidden md:block relative w-[310px] h-[270px]">

                {/* SVG overlay: connecting lines + junction dots */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    viewBox="0 0 310 270"
                    style={{ zIndex: 0 }}
                >
                    {/* LEFT bridge (x 95→105, y 135) */}
                    <line x1="95" y1="135" x2="105" y2="135"
                        stroke={C.cyan} strokeWidth="1.5" strokeOpacity="0.45"
                        strokeDasharray="3 2" />
                    {/* RIGHT bridge (x 205→215, y 135) */}
                    <line x1="205" y1="135" x2="215" y2="135"
                        stroke={C.cyan} strokeWidth="1.5" strokeOpacity="0.45"
                        strokeDasharray="3 2" />

                    {/* Junction dots at bridge endpoints */}
                    <circle cx="95"  cy="135" r="2" fill={C.cyan} fillOpacity="0.5" />
                    <circle cx="105" cy="135" r="2" fill={C.cyan} fillOpacity="0.5" />
                    <circle cx="205" cy="135" r="2" fill={C.cyan} fillOpacity="0.5" />
                    <circle cx="215" cy="135" r="2" fill={C.cyan} fillOpacity="0.5" />

                    {/* Junction marks where TOP/BOT touch CENTER (shared edge) */}
                    <line x1="130" y1="85" x2="180" y2="85"
                        stroke={C.cyan} strokeWidth="0.5" strokeOpacity="0.2" />
                    <line x1="130" y1="185" x2="180" y2="185"
                        stroke={C.cyan} strokeWidth="0.5" strokeOpacity="0.2" />
                </svg>

                {/* CENTER: XP Total — main stat, largest hex */}
                <div className="absolute" style={{ left: 105, top: 85, zIndex: 1 }}>
                    <HexStat
                        value={stats.xp.current.toLocaleString()}
                        label="XP TOTAL"
                        color={C.cyan}
                        delay={0}
                        size={100}
                    />
                </div>

                {/* TOP: Level */}
                <div className="absolute" style={{ left: 115, top: 5, zIndex: 1 }}>
                    <HexStat
                        value={stats.level.toString()}
                        label="NIVEL"
                        color={C.yellow}
                        delay={120}
                        size={80}
                    />
                </div>

                {/* BOTTOM: Streak */}
                <div className="absolute" style={{ left: 115, top: 185, zIndex: 1 }}>
                    <HexStat
                        value={`${streakDays}d`}
                        label="RACHA"
                        color={C.purple}
                        delay={120}
                        size={80}
                    />
                </div>

                {/* LEFT: Experiences */}
                <div className="absolute" style={{ left: 15, top: 95, zIndex: 1 }}>
                    <HexStat
                        value={stats.experiences.toString()}
                        label="EXP."
                        color={C.green}
                        delay={80}
                        size={80}
                    />
                </div>

                {/* RIGHT: Achievements */}
                <div className="absolute" style={{ left: 215, top: 95, zIndex: 1 }}>
                    <HexStat
                        value={`${stats.achievements.current}/${stats.achievements.total}`}
                        label="LOGROS"
                        color={C.magenta}
                        delay={80}
                        size={80}
                    />
                </div>
            </div>

            {/* ── MOBILE: 2×2 grid ── */}
            <div className="md:hidden grid grid-cols-2 gap-3 place-items-center">
                <HexStat value={stats.xp.current.toLocaleString()} label="XP TOTAL" color={C.cyan}    size={90} delay={0} />
                <HexStat value={stats.level.toString()}             label="NIVEL"    color={C.yellow}  size={90} delay={80} />
                <HexStat value={stats.experiences.toString()}       label="EXP."     color={C.green}   size={90} delay={160} />
                <HexStat value={`${stats.achievements.current}/${stats.achievements.total}`} label="LOGROS" color={C.magenta} size={90} delay={240} />
            </div>
        </div>
    )
}
