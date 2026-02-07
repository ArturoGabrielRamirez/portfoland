'use client'

/**
 * CRTScanLine Component
 * 
 * Reusable CRT scan line effect that can be used as a visual separator:
 * - Horizontal scan line with glow effect
 * - Customizable colors and animation speed
 * - Can be used to separate sections visually
 * - Creates depth and visual hierarchy
 */

import { cn } from '@/lib/utils'

interface CRTScanLineProps {
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'white'
  intensity?: 'subtle' | 'medium' | 'bright'
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
  children?: React.ReactNode
}

export function CRTScanLine({ 
  color = 'cyan',
  intensity = 'medium',
  speed = 'medium',
  className,
  children
}: CRTScanLineProps) {
  const colorConfig = {
    cyan: {
      primary: 'rgba(0, 212, 255, 0.8)',
      secondary: 'rgba(0, 212, 255, 0.3)',
      glow: 'rgba(0, 212, 255, 0.6)',
      shadow: '0 0 12px rgba(0, 212, 255, 0.4)',
    },
    magenta: {
      primary: 'rgba(217, 70, 239, 0.8)',
      secondary: 'rgba(217, 70, 239, 0.3)',
      glow: 'rgba(217, 70, 239, 0.6)',
      shadow: '0 0 12px rgba(217, 70, 239, 0.4)',
    },
    green: {
      primary: 'rgba(34, 197, 94, 0.8)',
      secondary: 'rgba(34, 197, 94, 0.3)',
      glow: 'rgba(34, 197, 94, 0.6)',
      shadow: '0 0 12px rgba(34, 197, 94, 0.4)',
    },
    yellow: {
      primary: 'rgba(234, 179, 8, 0.8)',
      secondary: 'rgba(234, 179, 8, 0.3)',
      glow: 'rgba(234, 179, 8, 0.6)',
      shadow: '0 0 12px rgba(234, 179, 8, 0.4)',
    },
    white: {
      primary: 'rgba(255, 255, 255, 0.8)',
      secondary: 'rgba(255, 255, 255, 0.3)',
      glow: 'rgba(255, 255, 255, 0.6)',
      shadow: '0 0 12px rgba(255, 255, 255, 0.4)',
    },
  }

  const intensityConfig = {
    subtle: {
      opacity: 0.2,
      strokeWidth: '1px',
    },
    medium: {
      opacity: 0.4,
      strokeWidth: '2px',
    },
    bright: {
      opacity: 0.6,
      strokeWidth: '3px',
    },
  }

  const speedConfig = {
    slow: '4s',
    medium: '3s',
    fast: '2s',
  }

  const colors = colorConfig[color]
  const intensities = intensityConfig[intensity]
  const speeds = speedConfig[speed]

  return (
    <div className={cn('relative w-full', className)}>
      {/* Main CRT Scan Line */}
      <div 
        className="h-px relative"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.primary} 20%, transparent 30%, ${colors.primary} 70%, transparent 100%)`,
          opacity: intensities.opacity,
          left: '0%',
          top: '0%',
          transform: 'translateX(-100%)',
          animation: `crtRayDrawing ${speeds} linear infinite`,
          boxShadow: colors.shadow,
          height: intensities.strokeWidth,
        }}
      />

      {/* Additional glow effect */}
      <div 
        className="h-px absolute top-0 left-0 w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.glow} 10%, transparent 20%, ${colors.glow} 40%, transparent 50%, ${colors.glow} 60%, transparent 70%, ${colors.glow} 80%, transparent 90%, transparent 100%)`,
          opacity: intensities.opacity * 0.3,
          transform: 'translateX(-100%)',
          animation: `crtRayDrawing ${speeds} linear infinite reverse`,
          filter: 'blur(1px)',
        }}
      />

      {/* Secondary scan line for depth */}
      <div 
        className="h-px absolute top-1 left-0 w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.secondary} 15%, transparent 25%, ${colors.secondary} 55%, transparent 65%, ${colors.secondary} 75%, transparent 85%, transparent 95%, transparent 100%)`,
          opacity: intensities.opacity * 0.5,
          transform: 'translateX(-100%)',
          animation: `crtRayDrawing ${speeds}s linear infinite`,
          filter: 'blur(0.5px)',
        }}
      />

      {/* Content overlay (optional) */}
      {children && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  )
}

// Add CSS animations to document
const style = `
  @keyframes crtRayDrawing {
    0% {
      opacity: 0;
      transform: translateX(-100%);
    }
    10% {
      opacity: 0.3;
      transform: translateX(-80%);
    }
    20% {
      opacity: 0.5;
      transform: translateX(-60%);
    }
    30% {
      opacity: 0.7;
      transform: translateX(-40%);
    }
    40% {
      opacity: 0.9;
      transform: translateX(-20%);
    }
    50% {
      opacity: 1;
      transform: translateX(0%);
    }
    60% {
      opacity: 0.9;
      transform: translateX(20%);
    }
    70% {
      opacity: 0.7;
      transform: translateX(40%);
    }
    80% {
      opacity: 0.5;
      transform: translateX(60%);
    }
    90% {
      opacity: 0.3;
      transform: translateX(80%);
    }
    100% {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = style
  document.head.appendChild(styleElement)
}