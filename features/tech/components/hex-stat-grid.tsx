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
// 4-Hex Cluster Layout
//
//  [EXP 90px] [XP 110px] [ACH 90px]
//              [LVL 90px]
//
// Container: 265 × 190px
//
// Geometry — hexes touch at flat edges / bottom vertex:
//   XP  (110px): left=77,  top=0   → center at (132, 55)
//   EXP (90px):  left=0,   top=10  → center at (45,  55)  — same mid-y as XP
//   ACH (90px):  left=173, top=10  → center at (218, 55)  — same mid-y as XP
//   LVL (90px):  left=87,  top=97  → top vertex at (132, 103) ≈ XP bottom vertex
//
// EXP right edge ≈ XP left edge  (x ≈ 84)
// ACH left edge  ≈ XP right edge (x ≈ 180)
// LVL top vertex ≈ XP bottom vertex (x=132, y≈103)
// =============================================================================

export function HexStatGrid({ stats, className }: HexStatGridProps) {
    const C = {
        cyan:    "hsl(174,100%,50%)",
        yellow:  "hsl(52,100%,50%)",
        green:   "hsl(150,100%,45%)",
        magenta: "hsl(330,100%,65%)",
    }

    return (
        <div className={cn("flex items-center justify-center w-full", className)}>

            {/* ── DESKTOP: 4-hex cluster ── */}
            <div className="hidden md:block relative w-[265px] h-[190px]">

                {/* XP — big center hex */}
                <div className="absolute" style={{ left: 77, top: 0, zIndex: 1 }}>
                    <HexStat
                        value={stats.xp.current.toLocaleString()}
                        label="XP TOTAL"
                        color={C.cyan}
                        delay={0}
                        size={110}
                    />
                </div>

                {/* EXP — left, touches XP left flat edge */}
                <div className="absolute" style={{ left: 0, top: 10, zIndex: 1 }}>
                    <HexStat
                        value={stats.experiences.toString()}
                        label="EXP."
                        color={C.green}
                        delay={80}
                        size={90}
                    />
                </div>

                {/* ACH — right, touches XP right flat edge */}
                <div className="absolute" style={{ left: 173, top: 10, zIndex: 1 }}>
                    <HexStat
                        value={`${stats.achievements.current}/${stats.achievements.total}`}
                        label="LOGROS"
                        color={C.magenta}
                        delay={80}
                        size={90}
                    />
                </div>

                {/* LVL — below XP, top vertex touches XP bottom vertex */}
                <div className="absolute" style={{ left: 87, top: 97, zIndex: 1 }}>
                    <HexStat
                        value={stats.level.toString()}
                        label="NIVEL"
                        color={C.yellow}
                        delay={120}
                        size={90}
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
