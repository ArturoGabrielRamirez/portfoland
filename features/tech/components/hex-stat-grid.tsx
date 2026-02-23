"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface StatItem {
    value: string
    label: string
    sublabel?: string
    color: string
    delay?: number
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

function HexStat({
    value,
    label,
    sublabel,
    color,
    delay = 0,
}: StatItem) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay)
        return () => clearTimeout(t)
    }, [delay])

    // Fixed path for 90px hexagon
    const hexPath = "M45 6.03 L83.97 28.53 L83.97 61.47 L45 83.97 L6.03 61.47 L6.03 28.53 Z"

    return (
        <div
            className={cn(
                "flex flex-col items-center transition-all duration-700 absolute",
                visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90"
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="relative group cursor-default">
                <svg width="90" height="90" viewBox="0 0 90 90">
                    <path
                        d={hexPath}
                        fill={color}
                        fillOpacity="0.06"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeOpacity="0.5"
                        className="group-hover:fill-opacity-15 group-hover:stroke-opacity-100 transition-all duration-300"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="font-mono font-bold leading-none tracking-tight"
                        style={{
                            color,
                            fontSize: "1.35rem",
                            textShadow: `0 0-10px ${color}60`,
                        }}
                    >
                        {value}
                    </span>
                    <span
                        className="font-mono uppercase tracking-[0.2em] mt-0.5"
                        style={{
                            color,
                            fontSize: "0.45rem",
                            opacity: 0.8,
                        }}
                    >
                        {label}
                    </span>
                </div>
            </div>

            {sublabel && (
                <span
                    className="absolute -bottom-4 text-[9px] font-mono whitespace-nowrap"
                    style={{ color, opacity: 0.5 }}
                >
                    {sublabel}
                </span>
            )}
        </div>
    )
}

export function HexStatGrid({ stats, streakDays, className }: HexStatGridProps) {
    const C = {
        cyan: "hsl(174,100%,50%)",
        yellow: "hsl(52,100%,50%)",
        green: "hsl(150,100%,45%)",
        magenta: "hsl(330,100%,65%)",
    }

    /* 
       Interlocking logic (V3.3):
       Only Top (XP) and Bottom (Level) are connected.
       Side = 45px
       Height = 77.94px
       Overlap for shared horizontal wall: dy = height * 0.75 - height * 0.25 ? 
       Actually, standard vertical honeycomb overlap: Y_STEP = 58.45px (3/4 height)
       
       Satellites (Experiences, Achievements) are detached.
    */
    const S = 45
    const H_WIDTH = 90
    const H_HEIGHT = Math.sqrt(3) * S // ~77.94
    const CORE_STEP = H_HEIGHT * 0.75 // ~58.45px interlock step

    // Total vertical core height = H_HEIGHT + CORE_STEP
    // XP is at Y=0, LVL is at Y=CORE_STEP

    return (
        <div className={cn("flex items-center justify-center w-full py-12", className)}>
            {/* Desktop: Vertical Core + Satellites */}
            <div className="hidden md:block relative w-[240px] h-[160px]">

                {/* 1. THE VERTICAL CORE (Interlocking) */}
                <div className="absolute" style={{ left: '75px', top: '0px' }}>
                    <HexStat value={stats.xp.current.toLocaleString()} label="XP TOTAL" color={C.cyan} delay={0} />
                </div>
                <div className="absolute" style={{ left: '75px', top: `${CORE_STEP}px` }}>
                    <HexStat value={stats.level.toString()} label="NIVEL" color={C.yellow} delay={200} sublabel={`${streakDays}d racha`} />
                </div>

                {/* 2. THE SATELLITES (Detached) */}
                <div className="absolute" style={{ left: '0px', top: '30px' }}>
                    <HexStat value={stats.experiences.toString()} label="EXP." color={C.green} delay={100} />
                </div>
                <div className="absolute" style={{ right: '0px', top: '30px' }}>
                    <HexStat value={`${stats.achievements.current}/${stats.achievements.total}`} label="LOGROS" color={C.magenta} delay={100} />
                </div>
            </div>

            {/* Mobile: Interlocking 2x2 grid (standard) */}
            <div className="md:hidden grid grid-cols-2 gap-2 place-items-center">
                <HexStat value={stats.xp.current.toLocaleString()} label="XP" color={C.cyan} />
                <HexStat value={stats.level.toString()} label="LVL" color={C.yellow} />
                <HexStat value={stats.experiences.toString()} label="EXP" color={C.green} />
                <HexStat value={`${stats.achievements.current}/${stats.achievements.total}`} label="LOGROS" color={C.magenta} />
            </div>
        </div>
    )
}
