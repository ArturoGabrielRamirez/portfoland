"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SkillPoint {
    label: string
    value: number // 0-100
    color: string
}

interface SkillRadarPanelProps {
    skills?: SkillPoint[]
    className?: string
}

const defaultSkills: SkillPoint[] = [
    { label: "Frontend", value: 85, color: "hsl(174,100%,50%)" },
    { label: "Backend", value: 65, color: "hsl(330,100%,65%)" },
    { label: "DevOps", value: 45, color: "hsl(52,100%,50%)" },
    { label: "AI/ML", value: 60, color: "hsl(260,80%,65%)" },
    { label: "Design", value: 70, color: "hsl(150,100%,45%)" },
]

// Compute polygon points for a radar chart
function computePoints(values: number[], cx: number, cy: number, r: number): string {
    const n = values.length
    return values
        .map((v, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2
            const len = (v / 100) * r
            const x = cx + len * Math.cos(angle)
            const y = cy + len * Math.sin(angle)
            return `${x},${y}`
        })
        .join(" ")
}

function computeLabelPoints(n: number, cx: number, cy: number, r: number) {
    return Array.from({ length: n }, (_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
        }
    })
}

function computeAxisPoints(n: number, cx: number, cy: number, r: number) {
    return Array.from({ length: n }, (_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    })
}

export function SkillRadarPanel({ skills = defaultSkills, className }: SkillRadarPanelProps) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 400)
        return () => clearTimeout(t)
    }, [])

    const cx = 90
    const cy = 90
    const r = 65
    const n = skills.length

    // Grid circles at 25%, 50%, 75%, 100%
    const rings = [0.25, 0.5, 0.75, 1]

    const fullPoints = computePoints(skills.map(() => 100), cx, cy, r)
    const dataPoints = computePoints(skills.map(s => s.value), cx, cy, r)
    const labelPositions = computeLabelPoints(n, cx, cy, r + 16)
    const axisEndpoints = computeAxisPoints(n, cx, cy, r)

    // Dominant color = the one with highest value
    const dominant = skills.reduce((a, b) => (a.value >= b.value ? a : b))

    return (
        <div className={cn("border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,6%)] flex flex-col overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,8%)]">
                <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 100 100">
                        <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" fill="hsl(260,80%,65%)" fillOpacity="0.2" stroke="hsl(260,80%,65%)" strokeWidth="4" />
                    </svg>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[hsl(260,80%,65%,0.8)]">Skill Matrix</span>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">
                    {skills.length} áreas
                </span>
            </div>

            {/* Radar SVG */}
            <div className="flex-1 flex items-center justify-center p-2">
                <svg width="180" height="180" viewBox="0 0 180 180">
                    {/* Grid rings */}
                    {rings.map((ring, ri) => (
                        <polygon
                            key={ri}
                            points={computePoints(skills.map(() => ring * 100), cx, cy, r)}
                            fill="none"
                            stroke="hsl(174,100%,50%)"
                            strokeWidth="0.5"
                            strokeOpacity={ri === 3 ? 0.2 : 0.1}
                        />
                    ))}

                    {/* Axis lines */}
                    {axisEndpoints.map((pt, i) => (
                        <line
                            key={i}
                            x1={cx}
                            y1={cy}
                            x2={pt.x}
                            y2={pt.y}
                            stroke="hsl(174,100%,50%)"
                            strokeWidth="0.5"
                            strokeOpacity="0.15"
                        />
                    ))}

                    {/* Data polygon — animated fill */}
                    <polygon
                        points={animated ? dataPoints : computePoints(skills.map(() => 0), cx, cy, r)}
                        fill={dominant.color}
                        fillOpacity="0.12"
                        stroke={dominant.color}
                        strokeWidth="1.5"
                        strokeOpacity="0.7"
                        style={{
                            transition: "points 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            filter: `drop-shadow(0 0 6px ${dominant.color}60)`,
                        }}
                    />

                    {/* Vertex dots */}
                    {skills.map((s, i) => {
                        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
                        const len = animated ? (s.value / 100) * r : 0
                        const x = cx + len * Math.cos(angle)
                        const y = cy + len * Math.sin(angle)
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill={s.color}
                                style={{
                                    transition: `cx 1s ease-out, cy 1s ease-out`,
                                    filter: `drop-shadow(0 0 4px ${s.color})`,
                                }}
                            />
                        )
                    })}

                    {/* Center dot */}
                    <circle cx={cx} cy={cy} r="2" fill="hsl(174,100%,50%)" opacity="0.4" />

                    {/* Labels */}
                    {labelPositions.map((pt, i) => {
                        const s = skills[i]
                        // Anchor logic based on position
                        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
                        const deg = (angle * 180) / Math.PI
                        const anchor = deg < -45 && deg > -135 ? "middle" :
                            deg >= -45 && deg <= 45 ? "start" :
                                deg > 45 && deg < 135 ? "middle" : "end"
                        return (
                            <g key={i}>
                                <text
                                    x={pt.x}
                                    y={pt.y + 3}
                                    textAnchor={anchor}
                                    fill={s.color}
                                    fontSize="7"
                                    fontFamily="monospace"
                                    opacity="0.9"
                                >
                                    {s.label}
                                </text>
                                <text
                                    x={pt.x}
                                    y={pt.y + 11}
                                    textAnchor={anchor}
                                    fill={s.color}
                                    fontSize="6"
                                    fontFamily="monospace"
                                    opacity="0.5"
                                >
                                    {s.value}%
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[hsl(174,100%,50%,0.08)]">
                <span className="text-[8px] font-mono text-muted-foreground/40">
                    &gt; SKILL_RADAR --verbose
                </span>
            </div>
        </div>
    )
}
