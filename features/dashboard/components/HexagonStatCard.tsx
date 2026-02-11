'use client'

/**
 * HexagonStatCard Component
 *
 * Hexagonal stat card with cyberpunk styling and animations.
 * Replaces rectangular StatCard with hexagonal design.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'

interface HexagonStatCardProps {
  value: string
  label: string
  color: 'yellow' | 'magenta' | 'cyan' | 'green'
  icon: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

function HexagonStatCardComponent({
  value,
  label,
  color,
  icon,
  size = 'md',
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

  // Size configurations
  const sizeConfig = {
    xs: { 
      svgSize: 'w-10 h-12', 
      valueSize: 'text-xs font-bold', 
      labelSize: 'text-[9px]', 
      iconSize: 'h-2.5 w-2.5',
      padding: 'p-0.5'
    },
    sm: { 
      svgSize: 'w-12 h-14', 
      valueSize: 'text-xs font-bold', 
      labelSize: 'text-[10px]', 
      iconSize: 'h-3 w-3',
      padding: 'p-1'
    },
    md: { 
      svgSize: 'w-16 h-20', 
      valueSize: 'text-sm font-bold', 
      labelSize: 'text-xs', 
      iconSize: 'h-4 w-4',
      padding: 'p-1.5'
    },
    lg: { 
      svgSize: 'w-20 h-24', 
      valueSize: 'text-base font-bold', 
      labelSize: 'text-sm', 
      iconSize: 'h-5 w-5',
      padding: 'p-2'
    },
  }

  const currentSize = sizeConfig[size]

  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center group"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hexagon SVG Background */}
      <svg
        viewBox="0 0 48 56"
        className={`${currentSize.svgSize} relative z-10 transition-all duration-300`}
        style={{
          filter: `drop-shadow(0 0 12px ${currentColor.glow})`,
        }}
      >
        <defs>
          {/* Gradient background */}
          <linearGradient id={`stat-grad-${color}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentColor.stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={currentColor.stroke} stopOpacity={0.1} />
          </linearGradient>
          
          {/* Animated glow gradient */}
          <radialGradient id={`stat-glow-${color}-${size}`}>
            <stop offset="0%" stopColor={currentColor.stroke} stopOpacity={0.6} />
            <stop offset="100%" stopColor={currentColor.stroke} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Hexagon path */}
        <path
          d="M24 2 L46 15 L46 41 L24 54 L2 41 L2 15 Z"
          fill={`url(#stat-grad-${color}-${size})`}
          stroke={currentColor.stroke}
          strokeWidth={2}
          className="transition-all duration-200 group-hover:stroke-opacity-100"
          style={{ strokeOpacity: 0.8 }}
        />
        
        {/* Inner glow effect on hover */}
        <path
          d="M24 8 L40 18 L40 38 L24 48 L8 38 L8 18 Z"
          fill={`url(#stat-glow-${color}-${size})`}
          className="opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        />
      </svg>

      {/* Content */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${currentSize.padding} z-20`}>
        {/* Icon */}
        <div className="mb-1 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: currentColor.text }}>
          {icon}
        </div>
        
        {/* Value */}
        <div className={`${currentSize.valueSize} text-white transition-all duration-300`} style={{ 
          textShadow: `0 0 8px ${currentColor.glow}` 
        }}>
          {value}
        </div>
        
        {/* Label */}
        <div className={`${currentSize.labelSize} text-[#94A3B8] text-center leading-tight mt-0.5`}>
          {label}
        </div>
      </div>
    </motion.div>
  )
}

export const HexagonStatCard = memo(HexagonStatCardComponent)