'use client'

/**
 * CyberpunkSpotlight Component
 * 
 * Individual spotlight light effect for each hexagon:
 * - Rectangle/foco style light positioned below hexagon
 * - Off by default, turns on with sequential animation
 * - Vertical light beam effect
 * - Color-matched to hexagon
 * - Perfect for tooltip background effect
 */

import { cn } from '@/lib/utils'

interface CyberpunkSpotlightProps {
  isActive: boolean
  color: 'cyan' | 'magenta' | 'green' | 'yellow' | 'white'
  delay: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CyberpunkSpotlight({
  isActive,
  color,
  delay,
  size = 'md',
  className
}: CyberpunkSpotlightProps) {
  const colorConfig = {
    cyan: {
      off: 'bg-[#0A4158]',
      on: 'bg-[#00D4FF]',
      glowOn: 'shadow-[0_0_20px_rgba(0,212,255,0.6),0_0_40px_rgba(0,212,255,0.3)]',
      beam: 'rgba(0, 212, 255, 0.3)',
      beamActive: 'rgba(0, 212, 255, 0.6)',
    },
    magenta: {
      off: 'bg-[#4A1E4A]',
      on: 'bg-[#D946EF]',
      glowOn: 'shadow-[0_0_20px_rgba(217,70,239,0.6),0_0_40px_rgba(217,70,239,0.3)]',
      beam: 'rgba(217, 70, 239, 0.3)',
      beamActive: 'rgba(217, 70, 239, 0.6)',
    },
    green: {
      off: 'bg-[#0A2E1A]',
      on: 'bg-[#22C55E]',
      glowOn: 'shadow-[0_0_20px_rgba(34,197,94,0.6),0_0_40px_rgba(34,197,94,0.3)]',
      beam: 'rgba(34, 197, 94, 0.3)',
      beamActive: 'rgba(34, 197, 94, 0.6)',
    },
    yellow: {
      off: 'bg-[#4A3E08]',
      on: 'bg-[#EAB308]',
      glowOn: 'shadow-[0_0_20px_rgba(234,179,8,0.6),0_0_40px_rgba(234,179,8,0.3)]',
      beam: 'rgba(234, 179, 8, 0.3)',
      beamActive: 'rgba(234, 179, 8, 0.6)',
    },
    white: {
      off: 'bg-[#3A3A3A]',
      on: 'bg-[#FFFFFF]',
      glowOn: 'shadow-[0_0_20px_rgba(255,255,255,0.6),0_0_40px_rgba(255,255,255,0.3)]',
      beam: 'rgba(255, 255, 255, 0.3)',
      beamActive: 'rgba(255, 255, 255, 0.6)',
    },
  }

  const sizeConfig = {
    sm: {
      spotlight: 'w-8 h-3',
      beamHeight: 'h-12'
    },
    md: {
      spotlight: 'w-12 h-4',
      beamHeight: 'h-16'
    },
    lg: {
      spotlight: 'w-16 h-5',
      beamHeight: 'h-20'
    }
  }

  const colors = colorConfig[color]
  const sizes = sizeConfig[size]

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* Light beam effect - appears when active */}
      <div 
        className={cn(
          'absolute top-full left-1/2 transform -translate-x-1/2 w-1 transition-all duration-700',
          sizes.beamHeight,
          isActive ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: isActive 
            ? `linear-gradient(180deg, ${colors.beamActive} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${colors.beam} 0%, transparent 100%)`,
          animationDelay: isActive ? `${delay}ms` : '0ms',
          transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Spotlight rectangle (the foco/light fixture) */}
      <div 
        className={cn(
          'relative rounded-sm transition-all duration-700 transform',
          sizes.spotlight,
          isActive 
            ? cn(colors.on, colors.glowOn, 'scale-110') 
            : cn(colors.off, 'opacity-60', 'scale-100'),
          'border border-current/20'
        )}
        style={{
          animationDelay: isActive ? `${delay}ms` : '0ms',
          transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Inner glow when on */}
        {isActive && (
          <div 
            className="absolute inset-1 rounded-sm animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.beamActive} 0%, transparent 70%)`,
            }}
          />
        )}
        
        {/* Light flicker effect when on */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-sm animate-ping"
            style={{
              background: colors.beamActive,
              opacity: 0.2,
            }}
          />
        )}
        
        {/* Grille texture for realism */}
        <div 
          className="absolute inset-0 rounded-sm opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent 0px, transparent 1px, currentColor 1px, currentColor 2px),
              repeating-linear-gradient(90deg, transparent 0px, transparent 1px, currentColor 1px, currentColor 2px)
            `,
          }}
        />
      </div>
    </div>
  )
}