'use client'

/**
 * HexagonAvatar Component
 *
 * Hexagonal avatar with level-based styling and cyberpunk effects.
 * Adapted from SkillHexagonNode for avatar display.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LEVEL_VISUAL_STYLES, LEVEL_GLOW_FILTERS } from '@/features/skills/constants/levels'

interface HexagonAvatarProps {
  src?: string
  alt: string
  fallback: string
  size?: 'sm' | 'md' | 'lg'
  level?: number
  color?: string
  className?: string
}

function HexagonAvatarComponent({
  src,
  alt,
  fallback,
  size = 'md',
  level = 1,
  color = '#00D4FF',
  className,
}: HexagonAvatarProps) {
  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-10', height: 'h-12', fontSize: 'text-xs' },
    md: { width: 'w-12', height: 'h-14', fontSize: 'text-sm' },
    lg: { width: 'w-16', height: 'h-20', fontSize: 'text-base' },
  }

  const currentSize = sizeConfig[size]
  
  // Level-based styling
  const visualLevel = Math.min(level, 5) as 1 | 2 | 3 | 4 | 5
  const visualStyle = LEVEL_VISUAL_STYLES[visualLevel]
  const glowFilter = LEVEL_GLOW_FILTERS[visualLevel]
  const isLegendary = visualLevel === 5
  const legendaryColor = '#F59E0B'

  return (
    <div className={cn('relative flex items-center justify-center', currentSize.width, currentSize.height, className)}>
      {/* Hexagon SVG Background */}
      <svg
        viewBox="0 0 48 56"
        className="absolute inset-0 w-full h-full"
        style={{
          filter: visualStyle.hasGlow
            ? `drop-shadow(0 0 ${glowFilter.stdDeviation * 2}px ${isLegendary ? legendaryColor : color})`
            : `drop-shadow(0 0 8px ${color})`,
        }}
      >
        <defs>
          {/* Gradient background */}
          <linearGradient id={`avatar-grad-${alt}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLegendary ? legendaryColor : color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={isLegendary ? legendaryColor : color} stopOpacity={0.1} />
          </linearGradient>
          
          {/* Glow filter */}
          {visualStyle.hasGlow && (
            <filter id={`avatar-glow-${alt}`}>
              <feGaussianBlur stdDeviation={glowFilter.stdDeviation} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Hexagon path */}
        <path
          d="M24 2 L46 15 L46 41 L24 54 L2 41 L2 15 Z"
          fill={`url(#avatar-grad-${alt})`}
          stroke={isLegendary ? legendaryColor : color}
          strokeWidth={2}
          strokeOpacity={visualStyle.strokeOpacity}
          className="transition-all duration-200"
        />
      </svg>

      {/* Avatar Image or Fallback */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {src ? (
          <img
            src={src}
            alt={alt}
            className={cn(
              'rounded-full object-cover',
              size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
            )}
            style={{
              boxShadow: `0 0 12px ${isLegendary ? legendaryColor : color}40`,
            }}
          />
        ) : (
          <span
            className={cn(
              'font-bold',
              currentSize.fontSize,
              isLegendary ? 'text-[#0A0E1A]' : 'text-white'
            )}
            style={{
              textShadow: visualStyle.hasGlow
                ? `0 0 8px ${isLegendary ? legendaryColor : color}`
                : undefined,
            }}
          >
            {fallback}
          </span>
        )}
      </div>

      {/* Level Badge */}
      {level > 1 && (
        <motion.div
          className="absolute -bottom-1 -right-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div
            className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
              isLegendary ? 'bg-[#F59E0B] text-[#0A0E1A]' : 'bg-[#00D4FF] text-white'
            )}
            style={{
              boxShadow: `0 0 8px ${isLegendary ? legendaryColor : color}`,
            }}
          >
            {level}
          </div>
        </motion.div>
      )}

      {/* Crown for Legendary Level */}
      {isLegendary && (
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.86-2h8.28l.96-5.88-3.54 3.32L12 8.9l-1.56 2.54-3.54-3.32.96 5.88z" />
          </svg>
        </motion.div>
      )}
    </div>
  )
}

export const HexagonAvatar = memo(HexagonAvatarComponent)