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

    // Side = 45px => Width = 90px, Height = 77.942px
    // The SVG is 90x90 to allow for stroke/overflow but paths are centered.
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
                        strokeWidth="2.5" // Thicker stroke for shared wall visibility
                        strokeOpacity="0.5"
                        className="group-hover:fill-opacity-15 group-hover:stroke-opacity-100 transition-all duration-300"
                    />
                </svg>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="font-mono font-bold leading-none tracking-tight"
                        style={{
                            color,
                            fontSize: "1.35rem",
                            textShadow: `0 0 10px ${color}60`,
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
       Interlocking logic for flat-topped hexes (90px wide):
       s = 45px
       dx (Center to side neighbor center) = 1.5 * s = 67.5px
       dy (Center to row below center) = sqrt(3)/2 * s = 38.97px
       
       Grid coordinates:
       Top (0,0):         X=67.5, Y=0
       Left (-1, 1):      X=0,    Y=39
       Right (1, 1):      X=135,  Y=39
       Bottom (0, 2):     X=67.5, Y=78
    */
    const S = 45
    const DX = 1.5 * S // 67.5
    const DY = (Math.sqrt(3) / 2) * S // ~38.97

    return (
        <div className={cn("flex items-center justify-center w-full py-12", className)}>
            {/* Desktop: Geometric Interlocking */}
            <div className="hidden md:block relative w-[225px] h-[168px]">
                {/* 
                   TOTAL WIDTH: 135 + 90 = 225px
                   TOTAL HEIGHT: 78 + 90? No, path height is ~78px. Plus some padding.
                */}

                {/* TOP: XP */}
                <div className="absolute" style={{ left: `${DX - 45}px`, top: '0px' }}>
                    <HexStat value={stats.xp.current.toLocaleString()} label="XP TOTAL" color={C.cyan} delay={0} />
                </div>

                {/* LEFT: EXP */}
                <div className="absolute" style={{ left: '0px', top: `${DY}px` }}>
                    <HexStat value={stats.experiences.toString()} label="EXP." color={C.green} delay={100} />
                </div>

                {/* RIGHT: LOGROS */}
                <div className="absolute" style={{ left: `${DX * 2 - 45}px`, top: `${DY}px` }}>
                    <HexStat value={`${stats.achievements.current}/${stats.achievements.total}`} label="LOGROS" color={C.magenta} delay={100} />
                </div>

                {/* BOTTOM: LEVEL */}
                <div className="absolute" style={{ left: `${DX - 45}px`, top: `${DY * 2}px` }}>
                    <HexStat value={stats.level.toString()} label="NIVEL" color={C.yellow} delay={200} sublabel={`${streakDays}d racha`} />
                </div>
            </div>

            {/* Mobile: Interlocking 2x2 grid */}
            <div className="md:hidden relative w-[160px] h-[130px]">
                <div className="absolute" style={{ left: '0px', top: '0px' }}>
                    <HexStat value={stats.xp.current.toLocaleString()} label="XP" color={C.cyan} delay={0} />
                </div>
                <div className="absolute" style={{ left: `${DX}px`, top: '0px' }}>
                    <HexStat value={stats.level.toString()} label="LVL" color={C.yellow} delay={100} />
                </div>
                <div className="absolute" style={{ left: `${DX / 2}px`, top: `${DY}px` }}>
                    <HexStat value={stats.experiences.toString()} label="EXP" color={C.green} delay={200} />
                </div>
            </div>

            {/* Minimal grid for clean mobile wrap if overflow */}
            <div className="md:hidden flex flex-wrap justify-center gap-0 scale-90">
                <div className="-mr-1"><HexStat value={stats.xp.current.toLocaleString()} label="XP" color={C.cyan} /></div>
                <div className="-ml-1"><HexStat value={stats.level.toString()} label="LVL" color={C.yellow} /></div>
                <div className="-mt-8 -mr-1"><HexStat value={stats.experiences.toString()} label="EXP" color={C.green} /></div>
                <div className="-mt-8 -ml-1"><HexStat value={`${stats.achievements.current}/${stats.achievements.total}`} label="LOGROS" color={C.magenta} /></div>
            </div>
        </div>
    )
}
