"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface HexStatGridProps {
    stats: {
        portfolioViews: number
        rank: number
        cvCount: number
        activeQuestsCount: number
    }
    className?: string
}

// Pointy-top hexagon path in a 100×100 viewBox
const HEX_POINTS = "50,3 97,27.5 97,72.5 50,97 3,72.5 3,27.5"

interface HexStatProps {
    value: string
    label: string
    color: string
    /** Rendered width/height in px */
    size: number
    left: number
    top: number
    delay?: number
    zIndex?: number
}

function HexStat({ value, label, color, size, left, top, delay = 0, zIndex = 1 }: HexStatProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay)
        return () => clearTimeout(t)
    }, [delay])

    const fontSize = size >= 105 ? "1.45rem" : "1.15rem"
    const labelSize = size >= 105 ? "0.48rem" : "0.4rem"

    return (
        <div
            className={cn(
                "absolute transition-all duration-700",
                visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
            style={{ left, top, zIndex, transitionDelay: `${delay}ms` }}
        >
            <div className="relative group cursor-default select-none">
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
                    className="transition-all duration-300 group-hover:scale-[1.03]"
                >
                    {/* Outer glow stroke */}
                    <polygon
                        points={HEX_POINTS}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.6"
                        strokeOpacity="0.18"
                    />
                    {/* Main border + fill */}
                    <polygon
                        points={HEX_POINTS}
                        fill={color}
                        fillOpacity="0.07"
                        stroke={color}
                        strokeWidth="1.8"
                        strokeOpacity="0.6"
                        className="group-hover:fill-opacity-[0.14] group-hover:stroke-opacity-100 transition-all duration-300"
                    />
                    {/* Inner accent ring */}
                    <polygon
                        points="50,12 88,33 88,67 50,88 12,67 12,33"
                        fill="none"
                        stroke={color}
                        strokeWidth="0.4"
                        strokeOpacity="0.12"
                    />
                </svg>
                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                        className="font-mono font-bold leading-none tabular-nums"
                        style={{
                            color,
                            fontSize,
                            textShadow: `0 0 14px ${color}60`,
                        }}
                    >
                        {value}
                    </span>
                    <span
                        className="font-mono uppercase tracking-[0.16em] mt-0.5"
                        style={{ color, fontSize: labelSize, opacity: 0.7 }}
                    >
                        {label}
                    </span>
                </div>
            </div>
        </div>
    )
}

// =============================================================================
// Hex Diamond Cluster — hexes OVERLAP to form one unified diamond shape
//
//         ╔══════════╗           ← VIEWS (112px) top-center
//     ╔══════╗   ╔══════╗       ← RANK (left) + CVS (right) overlap VIEWS flanks
//         ╔══════╗               ← QUESTS (bottom) fits between RANK and CVS
//
// Container: 248 × 212px
// =============================================================================

const CLUSTER_W = 248
const CLUSTER_H = 212

const MOBILE_STATS = (C: Record<string, string>, stats: HexStatGridProps["stats"]) => [
    { value: stats.portfolioViews.toLocaleString(), label: "VIEWS",  color: C.cyan,    delay: 0   },
    { value: stats.rank > 0 ? `#${stats.rank}` : "—", label: "RANK",   color: C.yellow,  delay: 80  },
    { value: stats.cvCount.toString(),              label: "CVS",    color: C.magenta, delay: 160 },
    { value: stats.activeQuestsCount > 0 ? stats.activeQuestsCount.toString() : "—", label: "QUESTS", color: C.green, delay: 240 },
]

export function HexStatGrid({ stats, className }: HexStatGridProps) {
    const C = {
        cyan:    "hsl(174,100%,50%)",
        yellow:  "hsl(52,100%,50%)",
        green:   "hsl(150,100%,45%)",
        magenta: "hsl(330,100%,65%)",
    }

    // ── Sizes ──────────────────────────────────────────────────────────────
    const BIG = 112   // VIEWS hex (top)
    const SM  = 92    // RANK, CVS, QUESTS

    // ── Positions ──────────────────────────────────────────────────────────
    const XP_L  = 68
    const EXP_L = 0
    const ACH_L = 156
    const LVL_L = 78

    const XP_T  = 0
    const EXP_T = 54
    const ACH_T = 54
    const LVL_T = 108

    return (
        <div className={cn("flex items-center justify-center w-full", className)}>

            {/* ── DESKTOP: overlapping diamond cluster ── */}
            <div className="hidden md:block">
                <div className="relative" style={{ width: CLUSTER_W, height: CLUSTER_H }}>

                    {/* QUESTS — bottom, behind RANK/CVS */}
                    <HexStat
                        value={stats.activeQuestsCount > 0 ? stats.activeQuestsCount.toString() : "—"}
                        label="QUESTS"
                        color={C.green}
                        size={SM}
                        left={LVL_L} top={LVL_T}
                        delay={140} zIndex={1}
                    />

                    {/* RANK — left flank, in front of VIEWS */}
                    <HexStat
                        value={stats.rank > 0 ? `#${stats.rank}` : "—"}
                        label="RANK"
                        color={C.yellow}
                        size={SM}
                        left={EXP_L} top={EXP_T}
                        delay={80} zIndex={3}
                    />

                    {/* CVS — right flank, in front of VIEWS */}
                    <HexStat
                        value={stats.cvCount.toString()}
                        label="CVS"
                        color={C.magenta}
                        size={SM}
                        left={ACH_L} top={ACH_T}
                        delay={80} zIndex={3}
                    />

                    {/* VIEWS — top center, behind flanks */}
                    <HexStat
                        value={stats.portfolioViews.toLocaleString()}
                        label="VIEWS"
                        color={C.cyan}
                        size={BIG}
                        left={XP_L} top={XP_T}
                        delay={0} zIndex={2}
                    />
                </div>
            </div>

            {/* ── MOBILE: 2×2 grid ── */}
            <div className="md:hidden grid grid-cols-2 gap-3">
                {MOBILE_STATS(C, stats).map((s) => (
                    <div key={s.label} className="relative" style={{ width: 90, height: 90 }}>
                        <HexStat
                            value={s.value}
                            label={s.label}
                            color={s.color}
                            size={90}
                            left={0} top={0}
                            delay={s.delay}
                            zIndex={1}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
