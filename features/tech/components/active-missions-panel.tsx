"use client"

import { cn } from "@/lib/utils"

interface Mission {
    label: string
    progress: number // 0-100
    xp: number
    status: "active" | "near" | "complete"
}

interface ActiveMissionsPanelProps {
    missions?: Mission[]
    className?: string
}

const COLOR_MAP = {
    active: "hsl(174,100%,50%)",
    near: "hsl(52,100%,50%)",
    complete: "hsl(150,100%,45%)",
}

const defaultMissions: Mission[] = [
    { label: "Optimizar perfil SEO", progress: 70, xp: 120, status: "active" },
    { label: "Subir proyecto SaaS", progress: 30, xp: 280, status: "active" },
    { label: "Mejorar bio profesional", progress: 100, xp: 80, status: "complete" },
]

export function ActiveMissionsPanel({ missions = defaultMissions, className }: ActiveMissionsPanelProps) {
    return (
        <div className={cn("border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,6%)] flex flex-col overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,8%)]">
                <div className="flex items-center gap-2">
                    {/* Hex icon */}
                    <svg width="14" height="14" viewBox="0 0 100 100">
                        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.2" stroke="hsl(174,100%,50%)" strokeWidth="4" />
                        <text x="50" y="68" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="50" fontFamily="monospace" fontWeight="bold">!</text>
                    </svg>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(174,100%,50%,0.8)]">Misiones Activas</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">
                    {missions.filter(m => m.status !== "complete").length} pendientes
                </span>
            </div>

            {/* Missions list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {missions.map((mission, i) => {
                    const color = COLOR_MAP[mission.status]
                    return (
                        <div key={i} className="group">
                            {/* Mission header */}
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    {/* Diamond indicator */}
                                    <svg width="8" height="8" viewBox="0 0 10 10" className="flex-shrink-0">
                                        <path d="M5 0 L10 5 L5 10 L0 5 Z"
                                            fill={mission.status === "complete" ? color : "none"}
                                            stroke={color}
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                    <span
                                        className={cn(
                                            "text-[10px] font-mono",
                                            mission.status === "complete" ? "line-through opacity-60" : "text-foreground"
                                        )}
                                    >
                                        {mission.label}
                                    </span>
                                </div>
                                <span
                                    className="text-[10px] font-mono font-bold"
                                    style={{ color }}
                                >
                                    +{mission.xp} XP
                                </span>
                            </div>

                            {/* Progress bar — cyberpunk style */}
                            <div
                                className="h-[3px] bg-[hsl(200,20%,12%)] overflow-hidden"
                                style={{ clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)" }}
                            >
                                <div
                                    className="h-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${mission.progress}%`,
                                        background: color,
                                        boxShadow: `0 0 6px ${color}`,
                                    }}
                                />
                            </div>

                            {/* Percent */}
                            <div className="flex justify-between mt-0.5">
                                <span className="text-[8px] font-mono text-muted-foreground/50">
                                    {mission.status === "complete" ? "COMPLETADO" : "EN PROGRESO"}
                                </span>
                                <span className="text-[8px] font-mono" style={{ color, opacity: 0.7 }}>
                                    {mission.progress}%
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[hsl(174,100%,50%,0.08)]">
                <span className="text-[8px] font-mono text-muted-foreground/40">
                    &gt; MISSION_TRACKER --active
                </span>
            </div>
        </div>
    )
}
