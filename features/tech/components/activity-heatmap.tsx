"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ActivityHeatmapProps {
    className?: string
}

export function ActivityHeatmap({ className }: ActivityHeatmapProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Generate random activity levels for the heatmap
    const [activity, setActivity] = useState<number[]>([])

    useEffect(() => {
        // 30 days of activity
        const data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5))
        setActivity(data)
    }, [])

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return "bg-[#1E293B] opacity-20" // None
            case 1: return "bg-[hsl(150,100%,45%)] opacity-20" // Low
            case 2: return "bg-[hsl(150,100%,45%)] opacity-40" // Medium-Low
            case 3: return "bg-[hsl(150,100%,45%)] opacity-70" // Medium-High
            case 4: return "bg-[hsl(150,100%,45%)] opacity-100 shadow-[0_0_8px_hsl(150,100%,45%,0.5)]" // High
            default: return "bg-[#1E293B]"
        }
    }

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    ACTIVITY_HEATMAP
                </span>
                <span className="text-[7px] font-mono text-muted-foreground/50 border border-muted-foreground/20 px-1 py-0.5 rounded-sm">
                    LAST 30 DAYS
                </span>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 max-w-[240px]">
                {activity.map((level, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-2.5 h-3.5 transition-all duration-700",
                            mounted ? "scale-100" : "scale-0",
                            getLevelColor(level)
                        )}
                        style={{
                            transitionDelay: `${i * 20}ms`,
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                        }}
                    />
                ))}
            </div>

            <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-muted-foreground/60">
                <span>Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(l => (
                        <div
                            key={l}
                            className={cn("w-1.5 h-1.5", getLevelColor(l))}
                            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                        />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    )
}
