"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface MiniSkillNode {
  id: string
  name: string
  level: number
  maxLevel: number
  x: number
  y: number
  category: "frontend" | "backend" | "tools" | "other"
}

interface MiniSkillTreeProps {
  skills: MiniSkillNode[]
  className?: string
}

const categoryColors: Record<string, string> = {
  frontend: "hsl(174,100%,50%)",
  backend: "hsl(330,100%,65%)",
  tools: "hsl(60,100%,50%)",
  other: "hsl(150,100%,45%)",
}

export function MiniSkillTree({ skills, className }: MiniSkillTreeProps) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  const connections: [string, string][] = [
    ["react", "typescript"],
    ["typescript", "node"],
    ["node", "postgresql"],
    ["git", "docker"],
  ]

  const getNodePosition = (id: string) => {
    const skill = skills.find(s => s.id === id)
    return skill ? { x: skill.x, y: skill.y } : { x: 0, y: 0 }
  }

  return (
    <div className={cn("relative w-full h-[200px] overflow-hidden", className)}>
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Connection lines */}
        {connections.map(([from, to]) => {
          const fromPos = getNodePosition(from)
          const toPos = getNodePosition(to)
          return (
            <line
              key={`${from}-${to}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="hsl(174,100%,50%,0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Skill nodes */}
        {skills.map((skill) => {
          const pct = (skill.level / skill.maxLevel) * 100
          const color = categoryColors[skill.category] || categoryColors.other
          const isHovered = hoveredSkill === skill.id

          return (
            <g
              key={skill.id}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSkill(skill.id)}
              onMouseLeave={() => setHoveredSkill(null)}
              style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                transformOrigin: `${skill.x}px ${skill.y}px`,
              }}
            >
              {/* Outer hex */}
              <path
                d={`M${skill.x} ${skill.y - 20} L${skill.x + 17} ${skill.y - 10} L${skill.x + 17} ${skill.y + 10} L${skill.x} ${skill.y + 20} L${skill.x - 17} ${skill.y + 10} L${skill.x - 17} ${skill.y - 10} Z`}
                fill="transparent"
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity={isHovered ? "0.8" : "0.3"}
                className="transition-all duration-300"
              />

              {/* Inner filled hex */}
              <path
                d={`M${skill.x} ${skill.y - 16} L${skill.x + 14} ${skill.y - 8} L${skill.x + 14} ${skill.y + 8} L${skill.x} ${skill.y + 16} L${skill.x - 14} ${skill.y + 8} L${skill.x - 14} ${skill.y - 8} Z`}
                fill={color}
                fillOpacity={isHovered ? "0.3" : "0.1"}
                className="transition-all duration-300"
              />

              {/* Level indicator */}
              <text
                x={skill.x}
                y={skill.y + 4}
                textAnchor="middle"
                fill={color}
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {skill.level}
              </text>

              {/* Skill name on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={skill.x - 40}
                    y={skill.y + 25}
                    width="80"
                    height="18"
                    rx="4"
                    fill="hsl(200,30%,8%)"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <text
                    x={skill.x}
                    y={skill.y + 37}
                    textAnchor="middle"
                    fill={color}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {skill.name}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-4 text-[8px] font-mono">
        {Object.entries(categoryColors).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className="w-2 h-2" style={{ backgroundColor: color, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
            <span className="text-muted-foreground uppercase">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
