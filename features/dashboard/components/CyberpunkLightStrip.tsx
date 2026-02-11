'use client'

/**
 * CyberpunkLightStrip Component
 * 
 * Animated light strip with sequential lighting effects:
 * - Multiple light points that can be turned on/off
 * - Sequential animation when light turns on
 * - Color customization
 * - Glow and cyberpunk effects
 * - Perfect for accent lighting
 */

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LightPoint {
  id: number
  isOn: boolean
  delay: number
}

interface CyberpunkLightStripProps {
  activeColor?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'white'
  size?: 'sm' | 'md' | 'lg'
  lightCount?: number
  className?: string
  activeLight?: number | null
  onLightChange?: (lightIndex: number) => void
}

export function CyberpunkLightStrip({
  activeColor = 'cyan',
  size = 'md',
  lightCount = 4,
  className,
  activeLight = null,
  onLightChange
}: CyberpunkLightStripProps) {
  const [lights, setLights] = useState<LightPoint[]>(
    Array.from({ length: lightCount }, (_, i) => ({
      id: i,
      isOn: false,
      delay: i * 100
    }))
  )

  const colorConfig = {
    cyan: {
      on: 'bg-[#00D4FF]',
      off: 'bg-[#0A4158]',
      glowOn: 'shadow-[0_0_15px_rgba(0,212,255,0.8),0_0_30px_rgba(0,212,255,0.4)]',
      glowOff: 'shadow-[0_0_2px_rgba(0,212,255,0.2)]',
      scanLine: 'rgba(0, 212, 255, 0.6)',
    },
    magenta: {
      on: 'bg-[#D946EF]',
      off: 'bg-[#4A1E4A]',
      glowOn: 'shadow-[0_0_15px_rgba(217,70,239,0.8),0_0_30px_rgba(217,70,239,0.4)]',
      glowOff: 'shadow-[0_0_2px_rgba(217,70,239,0.2)]',
      scanLine: 'rgba(217, 70, 239, 0.6)',
    },
    green: {
      on: 'bg-[#22C55E]',
      off: 'bg-[#0A2E1A]',
      glowOn: 'shadow-[0_0_15px_rgba(34,197,94,0.8),0_0_30px_rgba(34,197,94,0.4)]',
      glowOff: 'shadow-[0_0_2px_rgba(34,197,94,0.2)]',
      scanLine: 'rgba(34, 197, 94, 0.6)',
    },
    yellow: {
      on: 'bg-[#EAB308]',
      off: 'bg-[#4A3E08]',
      glowOn: 'shadow-[0_0_15px_rgba(234,179,8,0.8),0_0_30px_rgba(234,179,8,0.4)]',
      glowOff: 'shadow-[0_0_2px_rgba(234,179,8,0.2)]',
      scanLine: 'rgba(234, 179, 8, 0.6)',
    },
    white: {
      on: 'bg-[#FFFFFF]',
      off: 'bg-[#3A3A3A]',
      glowOn: 'shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.4)]',
      glowOff: 'shadow-[0_0_2px_rgba(255,255,255,0.2)]',
      scanLine: 'rgba(255, 255, 255, 0.6)',
    },
  }

  const sizeConfig = {
    sm: {
      container: 'h-1',
      light: 'w-2 h-2',
      spacing: 'gap-4'
    },
    md: {
      container: 'h-2',
      light: 'w-3 h-3',
      spacing: 'gap-6'
    },
    lg: {
      container: 'h-3',
      light: 'w-4 h-4',
      spacing: 'gap-8'
    }
  }

  const colors = colorConfig[activeColor]
  const sizes = sizeConfig[size]

  // Activate/deactivate lights
  useEffect(() => {
    if (activeLight !== null && activeLight >= 0 && activeLight < lightCount) {
      // Turn on the active light with sequential animation
      setLights(prev => 
        prev.map((light, index) => ({
          ...light,
          isOn: index <= activeLight
        }))
      )
    } else {
      // Turn off all lights
      setLights(prev => 
        prev.map(light => ({
          ...light,
          isOn: false
        }))
      )
    }
  }, [activeLight, lightCount])

  // Handle light click
  const handleLightClick = (index: number) => {
    onLightChange?.(index)
  }

  return (
    <div className={cn('relative', className)}>
      {/* Light strip container */}
      <div className={cn('flex items-center justify-center relative', sizes.spacing)}>
        {/* Background track */}
        <div className="absolute inset-0 bg-black/30 rounded-full" />
        
        {/* Light points */}
        {lights.map((light, index) => (
          <button
            key={light.id}
            onClick={() => handleLightClick(index)}
            className={cn(
              'relative rounded-full transition-all duration-500 cursor-pointer transform hover:scale-125 z-10',
              sizes.light,
              light.isOn 
                ? cn(colors.on, colors.glowOn) 
                : cn(colors.off, colors.glowOff, 'opacity-60'),
              'before:absolute before:inset-0 before:rounded-full before:bg-current before:opacity-20 before:blur-sm',
              'after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-10 after:blur-md'
            )}
            style={{
              animationDelay: `${light.isOn ? light.delay : 0}ms`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Inner glow when on */}
            {light.isOn && (
              <div 
                className="absolute inset-1 rounded-full animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${colors.scanLine} 0%, transparent 70%)`,
                }}
              />
            )}
            
            {/* Sparkle effect when turning on */}
            {light.isOn && (
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: colors.scanLine,
                  opacity: 0.3,
                }}
              />
            )}
          </button>
        ))}
        
        {/* Connecting wire effect */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${colors.scanLine}20 10%, 
              ${colors.scanLine}20 90%, 
              transparent 100%)`,
            height: '1px'
          }}
        />
        
        {/* Animated scan line when active */}
        {activeLight !== null && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: 'lightStripScan 2s linear infinite',
            }}
          >
            <div 
              className="h-px w-8"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${colors.scanLine} 50%, transparent 100%)`,
                boxShadow: `0 0 10px ${colors.scanLine}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes lightStripScan {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}