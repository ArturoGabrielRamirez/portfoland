"use client"

import { cn } from "@/lib/utils"

interface Runner {
    rank: number
    name: string
    xp: number
    isCurrentUser?: boolean
    initial?: string
}

interface TopRunnersPanelProps {
    runners?: Runner[]
    className?: string
}

const defaultRunners: Runner[] = [
    { rank: 1, name: "neo_dev", xp: 31200, initial: "N" },
    { rank: 2, name: "sarah_l", xp: 21300, initial: "S" },
    { rank: 3, name: "Arturo", xp: 18500, initial: "A", isCurrentUser: true },
    { rank: 4, name: "cipher_99", xp: 14900, initial: "C" },
    { rank: 5, name: "ghost_protocol", xp: 12100, initial: "G" },
]

const RANK_COLORS = [
    "hsl(52,100%,50%)",   // 1st — gold
    "hsl(210,20%,75%)",   // 2nd — silver
    "hsl(30,80%,55%)",    // 3rd — bronze
    "hsl(174,100%,50%)",  // 4th+
    "hsl(174,100%,50%)",
]

export function TopRunnersPanel({ runners = defaultRunners, className }: TopRunnersPanelProps) {
    const maxXP = Math.max(...runners.map(r => r.xp))

    return (
        <div className={cn("border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,6%)] flex flex-col overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,8%)]">
                <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 100 100">
                        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(52,100%,50%)" fillOpacity="0.2" stroke="hsl(52,100%,50%)" strokeWidth="4" />
                        <text x="50" y="68" textAnchor="middle" fill="hsl(52,100%,50%)" fontSize="46" fontFamily="monospace" fontWeight="bold">★</text>
                    </svg>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(52,100%,50%,0.8)]">Top Runners</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">Global</span>
            </div>

            {/* Runners list */}
            <div className="flex-1 overflow-y-auto">
                {runners.map((runner, i) => {
                    const color = RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)]
                    const barWidth = (runner.xp / maxXP) * 100

                    return (
                        <div
                            key={runner.rank}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 transition-all duration-200",
                                runner.isCurrentUser
                                    ? "bg-[hsl(174,100%,50%,0.06)] border-l-2 border-[hsl(174,100%,50%,0.4)]"
                                    : "hover:bg-[hsl(200,20%,8%)]",
                                i !== runners.length - 1 && "border-b border-[hsl(174,100%,50%,0.06)]"
                            )}
                        >
                            {/* Rank number */}
                            <span
                                className="text-[10px] font-mono font-bold w-4 text-right flex-shrink-0"
                                style={{ color }}
                            >
                                #{runner.rank}
                            </span>

                            {/* Hex Avatar */}
                            <div className="relative flex-shrink-0">
                                <svg width="26" height="26" viewBox="0 0 100 100">
                                    <path
                                        d="M50 2 L97 26 L97 74 L50 98 L3 74 L3 26 Z"
                                        fill={color}
                                        fillOpacity={runner.isCurrentUser ? 0.25 : 0.12}
                                        stroke={color}
                                        strokeWidth="3"
                                        strokeOpacity={runner.isCurrentUser ? 0.8 : 0.4}
                                    />
                                    <text
                                        x="50" y="66"
                                        textAnchor="middle"
                                        fill={color}
                                        fontSize="42"
                                        fontFamily="monospace"
                                        fontWeight="bold"
                                    >
                                        {runner.initial ?? runner.name[0].toUpperCase()}
                                    </text>
                                </svg>
                                {runner.isCurrentUser && (
                                    <div
                                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                                        style={{ background: "hsl(150,100%,45%)", boxShadow: "0 0 4px hsl(150,100%,45%)" }}
                                    />
                                )}
                            </div>

                            {/* Name + XP bar */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={cn(
                                            "text-[10px] font-mono truncate",
                                            runner.isCurrentUser ? "font-bold" : ""
                                        )}
                                        style={{ color: runner.isCurrentUser ? color : "hsl(210,20%,75%)" }}
                                    >
                                        {runner.isCurrentUser ? `${runner.name} (Tú)` : `@${runner.name}`}
                                    </span>
                                    <span
                                        className="text-[9px] font-mono flex-shrink-0 ml-2"
                                        style={{ color, opacity: 0.8 }}
                                    >
                                        {(runner.xp / 1000).toFixed(1)}k ⚡
                                    </span>
                                </div>

                                {/* Mini progress bar */}
                                <div className="h-[2px] bg-[hsl(200,20%,12%)] overflow-hidden rounded-full">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${barWidth}%`,
                                            background: color,
                                            boxShadow: `0 0 4px ${color}60`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[hsl(174,100%,50%,0.08)]">
                <span className="text-[8px] font-mono text-muted-foreground/40">
                    &gt; LEADERBOARD --top5 --global
                </span>
            </div>
        </div>
    )
}
