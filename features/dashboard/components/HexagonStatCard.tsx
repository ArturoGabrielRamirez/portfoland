'use client'

/**
 * HexagonStatCard Component
 *
 * Hexagonal stat card with cyberpunk styling and animations.
 * Replaces rectangular StatCard with hexagonal design.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HexagonStatCardProps {
  value: string
  label: string
  color: 'yellow' | 'magenta' | 'cyan' | 'green'
  icon: React.ReactNode
  className?: string
}

function HexagonStatCardComponent({
  value,
  label,
  color,
  icon,
  className,
}: HexagonStatCardProps) {
  // Color configurations
  const colorConfig = {
    yellow: {
      bg: 'rgba(234, 179, 8, 0.1)',
      stroke: '#EAB308',
      glow: 'rgba(234, 179, 8, 0.4)',
      text: '#EAB308',
    },
    magenta: {
      bg: 'rgba(217, 70, 239, 0.1)',
      stroke: '#D946EF',
      glow: 'rgba(217, 70, 239, 0.4)',
      text: '#D946EF',
    },
    cyan: {
      bg: 'rgba(0, 212, 255, 0.1)',
      stroke: '#00D4FF',
      glow: 'rgba(0, 212, 255, 0.4)',
      text: '#00D4FF',
    },
    green: {
      bg: 'rgba(34, 197, 94, 0.1)',
      stroke: '#22C55E',
      glow: 'rgba(34, 197, 94, 0.4)',
      text: '#22C55E',
    },
  }

  const currentColor = colorConfig[color]

return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Hexagon SVG Background */}
      <svg
        viewBox="0 0 48 56"
        className="w-full h-full max-w-22 max-h-26 relative z-10"
        style={{
          filter: `drop-shadow(0 0 12px ${currentColor.glow})`,
        }}
      >
        <defs>
          {/* Gradient background */}
          <linearGradient id={`stat-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentColor.stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={currentColor.stroke} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {/* Hexagon path */}
        <path
          d="M24 2 L46 15 L46 41 L24 54 L2 41 L2 15 Z"
          fill={`url(#stat-grad-${color})`}
          stroke={currentColor.stroke}
          strokeWidth={2}
          className="transition-all duration-200"
        />
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5 z-20">
        {/* Icon */}
        <div className="mb-0.5" style={{ color: currentColor.text }}>
          {icon}
        </div>
        
        {/* Value */}
        <div className="text-base font-bold text-white" style={{ textShadow: `0 0 8px ${currentColor.glow}` }}>
          {value}
        </div>
        
        {/* Label */}
        <div className="text-xs text-[#94A3B8] text-center leading-tight">
          {label}
        </div>
      </div>
    </div>
  )
}

export const HexagonStatCard = memo(HexagonStatCardComponent)