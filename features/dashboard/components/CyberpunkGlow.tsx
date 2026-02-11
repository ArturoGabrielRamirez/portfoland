'use client'

/**
 * CyberpunkGlow Effect Component
 * 
 * Adds animated cyberpunk glow effects to any container:
 * - Multi-layered glow effects
 * - Animated pulse and flicker
 * - Color-customizable
 * - Performance optimized
 */

import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface CyberpunkGlowProps {
  children: React.ReactNode
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'white'
  intensity?: 'subtle' | 'medium' | 'strong'
  className?: string
  animated?: boolean
}

export function CyberpunkGlow({ 
  children, 
  color = 'cyan',
  intensity = 'medium',
  className,
  animated = true
}: CyberpunkGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const colorConfig = {
    cyan: {
      primary: 'rgba(0, 212, 255, 0.8)',
      secondary: 'rgba(0, 212, 255, 0.4)',
      glow: 'rgba(0, 212, 255, 0.6)',
      shadow: '0 0 20px rgba(0, 212, 255, 0.4)',
    },
    magenta: {
      primary: 'rgba(217, 70, 239, 0.8)',
      secondary: 'rgba(217, 70, 239, 0.4)',
      glow: 'rgba(217, 70, 239, 0.6)',
      shadow: '0 0 20px rgba(217, 70, 239, 0.4)',
    },
    green: {
      primary: 'rgba(34, 197, 94, 0.8)',
      secondary: 'rgba(34, 197, 94, 0.4)',
      glow: 'rgba(34, 197, 94, 0.6)',
      shadow: '0 0 20px rgba(34, 197, 94, 0.4)',
    },
    yellow: {
      primary: 'rgba(234, 179, 8, 0.8)',
      secondary: 'rgba(234, 179, 8, 0.4)',
      glow: 'rgba(234, 179, 8, 0.6)',
      shadow: '0 0 20px rgba(234, 179, 8, 0.4)',
    },
    white: {
      primary: 'rgba(255, 255, 255, 0.8)',
      secondary: 'rgba(255, 255, 255, 0.4)',
      glow: 'rgba(255, 255, 255, 0.6)',
      shadow: '0 0 20px rgba(255, 255, 255, 0.4)',
    },
  }

  const intensityConfig = {
    subtle: {
      opacity: 0.3,
      blur: 'blur(1px)',
    },
    medium: {
      opacity: 0.6,
      blur: 'blur(2px)',
    },
    strong: {
      opacity: 1,
      blur: 'blur(3px)',
    },
  }

  const colors = colorConfig[color]
  const intensities = intensityConfig[intensity]

  useEffect(() => {
    if (!animated || !containerRef.current) return

    const container = containerRef.current
    const style = document.createElement('style')
    
    style.textContent = `
      @keyframes cyberpunkPulse {
        0%, 100% {
          opacity: ${intensities.opacity * 0.5};
        }
        50% {
          opacity: ${intensities.opacity};
        }
      }
      
      @keyframes cyberpunkFlicker {
        0%, 100% {
          opacity: ${intensities.opacity};
        }
        92% {
          opacity: ${intensities.opacity * 0.8};
        }
        94% {
          opacity: ${intensities.opacity};
        }
        96% {
          opacity: ${intensities.opacity * 0.6};
        }
      }
    `
    
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [animated, intensities.opacity])

  return (
    <div 
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        '--cyberpunk-glow': colors.shadow,
        '--cyberpunk-color': colors.primary,
      } as React.CSSProperties}
    >
      {/* Outer glow layer */}
      <div 
        className={cn(
          'absolute inset-0 rounded-2xl pointer-events-none',
          animated && 'animate-cyberpunkPulse'
        )}
        style={{
          background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
          filter: intensities.blur,
          opacity: intensities.opacity,
        }}
      />
      
      {/* Inner glow layer */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${colors.secondary}`,
          opacity: intensities.opacity * 0.5,
        }}
      />
      
      {/* Scan line effect */}
      {animated && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        >
          <div 
            className="absolute w-full h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 50%, transparent 100%)`,
              top: '20%',
              animation: 'cyberpunkScan 3s linear infinite',
            }}
          />
          <div 
            className="absolute w-full h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 50%, transparent 100%)`,
              bottom: '30%',
              animation: 'cyberpunkScan 4s linear infinite reverse',
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Add animation styles */}
      {animated && (
        <style jsx>{`
          @keyframes cyberpunkScan {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      )}
    </div>
  )
}