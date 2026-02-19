"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { HexBadgeProps, HexStatBadgeProps } from "../types/hex-badge"

const colorMap = {
  cyan: {
    border: "stroke-[hsl(174,100%,50%)]",
    fill: "fill-[hsl(174,100%,50%)]",
    bg: "hsl(174,100%,50%)",
    text: "text-[hsl(174,100%,50%)]",
    shadow: "drop-shadow(0 0 6px hsl(174 100% 50% / 0.5))",
  },
  magenta: {
    border: "stroke-[hsl(330,100%,65%)]",
    fill: "fill-[hsl(330,100%,65%)]",
    bg: "hsl(330,100%,65%)",
    text: "text-[hsl(330,100%,65%)]",
    shadow: "drop-shadow(0 0 6px hsl(330 100% 65% / 0.5))",
  },
  yellow: {
    border: "stroke-[hsl(60,100%,50%)]",
    fill: "fill-[hsl(60,100%,50%)]",
    bg: "hsl(60,100%,50%)",
    text: "text-[hsl(60,100%,50%)]",
    shadow: "drop-shadow(0 0 6px hsl(60 100% 50% / 0.5))",
  },
  green: {
    border: "stroke-[hsl(150,100%,45%)]",
    fill: "fill-[hsl(150,100%,45%)]",
    bg: "hsl(150,100%,45%)",
    text: "text-[hsl(150,100%,45%)]",
    shadow: "drop-shadow(0 0 6px hsl(150 100% 45% / 0.5))",
  },
}

const sizeMap = {
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
}

export function HexBadge({
  children,
  color = "cyan",
  size = "md",
  filled = false,
  fillPercent,
  glowing = false,
  className,
  onClick,
}: HexBadgeProps) {
  const s = sizeMap[size]
  const c = colorMap[color]
  const hexPath = "M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center cursor-default select-none",
        glowing && "animate-hex-pulse",
        onClick && "cursor-pointer",
        className
      )}
      style={{ width: s, height: s }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ filter: glowing ? c.shadow : undefined }}
      >
        {/* Background fill */}
        <path
          d={hexPath}
          fill={filled ? `${c.bg}` : "hsl(200 30% 10% / 0.8)"}
          fillOpacity={filled ? 0.2 : 0.8}
        />
        {/* Fill percent overlay */}
        {fillPercent !== undefined && (
          <clipPath id={`hex-fill-${color}-${fillPercent}`}>
            <rect
              x="0"
              y={100 - fillPercent}
              width="100"
              height={fillPercent}
            />
          </clipPath>
        )}
        {fillPercent !== undefined && (
          <path
            d={hexPath}
            fill={c.bg}
            fillOpacity={0.3}
            clipPath={`url(#hex-fill-${color}-${fillPercent})`}
          />
        )}
        {/* Border */}
        <path
          d={hexPath}
          fill="none"
          stroke={c.bg}
          strokeWidth="2"
          strokeOpacity={0.8}
        />
      </svg>
      <div className={cn("relative z-[1] flex items-center justify-center", c.text)} style={{ fontSize: s * 0.32 }}>
        {children}
      </div>
    </div>
  )
}

export function HexStatBadge({
  value,
  label,
  color = "cyan",
  icon,
}: HexStatBadgeProps) {
  const c = colorMap[color]
  return (
    <div className="flex items-center gap-3">
      <HexBadge color={color} size="lg" filled>
        {icon}
      </HexBadge>
      <div>
        <div className={cn("text-2xl font-mono font-bold tracking-wider", c.text)}>
          {value}
        </div>
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  )
}
