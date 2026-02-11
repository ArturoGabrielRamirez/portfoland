'use client'

/**
 * CyberpunkTooltip Component
 * 
 * Cyberpunk-styled tooltip with glow effects:
 * - Animated appearance
 * - Glow border and background
 * - Color-customizable
 * - Smart positioning
 * - Performance optimized
 */

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CyberpunkTooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'white'
  delay?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CyberpunkTooltip({
  children,
  content,
  position = 'top',
  color = 'cyan',
  delay = 800,
  size = 'md',
  className
}: CyberpunkTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const colorConfig = {
    cyan: {
      border: 'border-[#00D4FF]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#00D4FF]',
      glow: 'shadow-[0_0_20px_rgba(0,212,255,0.6)]',
    },
    magenta: {
      border: 'border-[#D946EF]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#D946EF]',
      glow: 'shadow-[0_0_20px_rgba(217,70,239,0.6)]',
    },
    green: {
      border: 'border-[#22C55E]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#22C55E]',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]',
    },
    yellow: {
      border: 'border-[#EAB308]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#EAB308]',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    },
    white: {
      border: 'border-[#FFFFFF]',
      bg: 'bg-[#0A0E1A]/95',
      text: 'text-[#FFFFFF]',
      glow: 'shadow-[0_0_20px_rgba(255,255,255,0.6)]',
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
      setIsAnimating(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
    }, 200) // Match animation duration
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
      ref={containerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {/* Tooltip */}
      {isVisible && (
        <div 
          className={cn(
            'absolute z-50 whitespace-nowrap',
            getPositionClasses()
          )}
        >
          {/* Tooltip content with cyberpunk styling */}
          <div 
            className={cn(
              'relative border backdrop-blur-sm font-bold',
              colors.border,
              colors.bg,
              colors.text,
              sizes,
              colors.glow,
              'transition-all duration-200',
              isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
            style={{
              animation: isAnimating ? 'cyberpunkPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            {/* Scanning line effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, currentColor 10%, transparent 20%, currentColor 30%, transparent 40%, currentColor 50%, transparent 60%, currentColor 70%, transparent 80%, currentColor 90%, transparent 100%)',
                animation: 'tooltipScan 3s linear infinite',
              }}
            />
            
            {/* Glitch effect */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, currentColor 50%, transparent 100%)',
                animation: 'tooltipGlitch 4s ease-in-out infinite',
              }}
            />
            
            {/* Text content */}
            <span className="relative z-10">{content}</span>
          </div>
          
          {/* Arrow */}
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

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes tooltipScan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes tooltipGlitch {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        @keyframes cyberpunkPulse {
          0%, 100% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}