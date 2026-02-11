'use client'

/**
 * StaticSpotlights Component
 * 
 * Static off-spotlights displayed on landing:
 * - 4 rectangular spotlights in horizontal layout
 * - All off by default (dark/apagado state)
 * - Can be individually turned on by external control
 * - Perfect background effect for tooltips
 */

import { cn } from '@/lib/utils'

interface StaticSpotlightsProps {
  activeSpotlights: boolean[]
  colors: ('cyan' | 'magenta' | 'green' | 'yellow')[]
  className?: string
}

export function StaticSpotlights({ 
  activeSpotlights, 
  colors, 
  className 
}: StaticSpotlightsProps) {
  const colorConfig = {
    cyan: {
      off: 'bg-[#0A4158]',
      on: 'bg-[#00D4FF]',
      glowOn: 'shadow-[0_0_15px_rgba(0,212,255,0.8),0_0_30px_rgba(0,212,255,0.4)]',
      border: 'border-[#00D4FF]/20',
    },
    magenta: {
      off: 'bg-[#4A1E4A]',
      on: 'bg-[#D946EF]',
      glowOn: 'shadow-[0_0_15px_rgba(217,70,239,0.8),0_0_30px_rgba(217,70,239,0.4)]',
      border: 'border-[#D946EF]/20',
    },
    green: {
      off: 'bg-[#0A2E1A]',
      on: 'bg-[#22C55E]',
      glowOn: 'shadow-[0_0_15px_rgba(34,197,94,0.8),0_0_30px_rgba(34,197,94,0.4)]',
      border: 'border-[#22C55E]/20',
    },
    yellow: {
      off: 'bg-[#4A3E08]',
      on: 'bg-[#EAB308]',
      glowOn: 'shadow-[0_0_15px_rgba(234,179,8,0.8),0_0_30px_rgba(234,179,8,0.4)]',
      border: 'border-[#EAB308]/20',
    },
  }

  return (
    <div className={cn('flex justify-center gap-6', className)}>
      {colors.map((color, index) => {
        const colors = colorConfig[color]
        const isActive = activeSpotlights[index] || false
        
        return (
          <div
            key={index}
            className={cn(
              'relative w-16 h-4 rounded-sm border transition-all duration-300',
              colors.border,
              isActive 
                ? cn(colors.on, colors.glowOn, 'scale-110') 
                : cn(colors.off, 'opacity-60', 'scale-100')
            )}
          >
            {/* Inner texture when off */}
            {!isActive && (
              <div 
                className="absolute inset-0 rounded-sm opacity-30"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent 0px, transparent 1px, currentColor 1px, currentColor 2px),
                    repeating-linear-gradient(90deg, transparent 0px, transparent 1px, currentColor 1px, currentColor 2px)
                  `,
                }}
              />
            )}
            
            {/* Inner glow when on */}
            {isActive && (
              <div 
                className="absolute inset-1 rounded-sm animate-pulse"
                style={{
                  background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
                }}
              />
            )}
            
            {/* Flicker effect when on */}
            {isActive && (
              <div 
                className="absolute inset-0 rounded-sm"
                style={{
                  animation: 'spotlightFlicker 0.15s steps(1) infinite',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Add animation styles
const style = `
  @keyframes spotlightFlicker {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.85;
    }
  }
`

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = style
  document.head.appendChild(styleElement)
}