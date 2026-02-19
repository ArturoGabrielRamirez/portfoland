"use client"

import { cn } from "@/lib/utils"

interface ParticleFieldProps {
  count?: number           // default 40
  color?: string          // default "hsl(174,100%,50%)"
  opacity?: number        // default 0.15
  className?: string
}

export function ParticleField({
  count = 40,
  color = "hsl(174,100%,50%)",
  opacity = 0.15,
  className
}: ParticleFieldProps) {
  // Generate stable random positions using index-based seed
  const particles = Array.from({ length: count }, (_, i) => ({
    cx: `${(i * 37 % 100)}%`,
    cy: `${(i * 67 % 100)}%`,
    r: (i % 3) * 0.5 + 0.5,
    duration: `${3 + (i % 5)}s`,
    opacityValues: `${0.1 + (i % 3) * 0.1};${0.4 + (i % 4) * 0.1};${0.1 + (i % 3) * 0.1}`,
  }))

  return (
    <svg
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ opacity }}
    >
      {particles.map((particle, i) => (
        <circle
          key={i}
          cx={particle.cx}
          cy={particle.cy}
          r={particle.r}
          fill={color}
        >
          <animate
            attributeName="opacity"
            values={particle.opacityValues}
            dur={particle.duration}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  )
}
