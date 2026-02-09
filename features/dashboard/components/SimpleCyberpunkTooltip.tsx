'use client'

/**
 * SimpleCyberpunkTooltip Component
 * 
 * Clean tooltip positioned exactly where current tooltip appears:
 * - Controls external spotlights
 * - Clean minimal design
 * - Same positioning as current tooltip
 * - No distracting effects
 */

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SimpleCyberpunkTooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'white'
  delay?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  spotlightIndex?: number
  onSpotlightActivate?: (spotlightIndex: number) => void
  onMouseLeave?: () => void
}

export function SimpleCyberpunkTooltip({
  children,
  content,
  position = 'top',
  color = 'cyan',
  delay = 600,
  size = 'md',
  className,
  spotlightIndex,
  onSpotlightActivate
}: SimpleCyberpunkTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const colorConfig = {
    cyan: {
      border: 'border-[#00D4FF]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#00D4FF]',
    },
    magenta: {
      border: 'border-[#D946EF]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#D946EF]',
    },
    green: {
      border: 'border-[#22C55E]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#22C55E]',
    },
    yellow: {
      border: 'border-[#EAB308]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#EAB308]',
    },
    white: {
      border: 'border-[#FFFFFF]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#FFFFFF]',
    },
  }

  const sizeConfig = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }

  const colors = colorConfig[color]
  const sizes = sizeConfig[size]

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      
      // Trigger spotlight activation
      if (spotlightIndex !== undefined && onSpotlightActivate) {
        onSpotlightActivate(spotlightIndex)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px]'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px]'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px]'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]'
    }
  }

  return (
    <div 
      className={cn('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {/* Simple tooltip - positioned exactly where current tooltip appears */}
      {isVisible && (
        <div 
          className={cn(
            'absolute z-50 whitespace-nowrap',
            getPositionClasses()
          )}
        >
          {/* Clean tooltip container */}
          <div 
            className={cn(
              'relative border backdrop-blur-sm font-bold',
              colors.border,
              colors.bg,
              colors.text,
              sizes
            )}
          >
            {/* Simple text only */}
            <span>{content}</span>
          </div>
          
          {/* Simple arrow */}
          <div 
            className={cn(
              'absolute w-0 h-0',
              getArrowClasses(),
              colors.border
            )}
            style={{
              borderTopColor: position === 'top' ? colors.bg.replace('bg-', '').replace('/95', '') : 'transparent',
              borderBottomColor: position === 'bottom' ? colors.bg.replace('bg-', '').replace('/95', '') : 'transparent',
              borderLeftColor: position === 'left' ? colors.bg.replace('bg-', '').replace('/95', '') : 'transparent',
              borderRightColor: position === 'right' ? colors.bg.replace('bg-', '').replace('/95', '') : 'transparent',
            }}
          />
        </div>
      )}
    </div>
  )
}