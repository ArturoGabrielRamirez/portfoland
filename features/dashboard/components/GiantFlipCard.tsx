'use client'

/**
 * GiantFlipCard Component
 * 
 * Simplified flip card for dashboard with cyberpunk effects
 */

import { useState } from 'react'

interface GiantFlipCardProps {
  title: string
  description: string
  version: string
  icon: React.ReactNode
  color: 'cyan' | 'magenta' | 'green' | 'yellow'
  onFlip?: () => void
}

export function GiantFlipCard({ 
  title, 
  description, 
  version, 
  icon, 
  color, 
  onFlip 
}: GiantFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
  }

  const colorStyles = {
    cyan: {
      border: 'border-[#00D4FF]/50',
      bg: 'bg-[#00D4FF]/20',
      iconBg: 'bg-[#00D4FF]/10',
      iconColor: 'text-[#00D4FF]',
    },
    magenta: {
      border: 'border-[#D946EF]/50',
      bg: 'bg-[#D946EF]/20',
      iconBg: 'bg-[#D946EF]/10',
      iconColor: 'text-[#D946EF]',
    },
    green: {
      border: 'border-[#22C55E]/50',
      bg: 'bg-[#22C55E]/20',
      iconBg: 'bg-[#22C55E]/10',
      iconColor: 'text-[#22C55E]',
    },
    yellow: {
      border: 'border-[#EAB308]/50',
      bg: 'bg-[#EAB308]/20',
      iconBg: 'bg-[#EAB308]/10',
      iconColor: 'text-[#EAB308]',
    },
  }

  const styles = colorStyles[color]

  return (
    <div 
      className={`relative h-full bg-[#0A0E1A] border ${styles.border} rounded-xl p-6 transition-all duration-500 hover:scale-[1.02] hover:border-[#00D4FF]/80`}
      onClick={handleFlip}
    >
      {!isFlipped ? (
        // Front Side
        <div className="h-full flex flex-col">
          {/* Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#1E293B] border border-[#334155]/50">
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
            {description}
          </p>
          
          {/* Version Badge */}
          <div className="absolute top-3 right-3">
            <div className={`relative ${styles.iconBg} rounded-full px-3 py-1`}>
              <div className="text-xs text-white font-bold">{version}</div>
            </div>
          </div>
          
          {/* Flip Button */}
          <div className="mt-auto">
            <button 
              className="w-full px-4 py-2 rounded-lg bg-transparent border border-[#00D4FF]/50 text-[#00D4FF] text-sm font-medium transition-colors hover:bg-[#00D4FF]/20 hover:border-[#00D4FF]/80"
            >
              {isFlipped ? 'BACK' : 'FLIP'}
            </button>
          </div>
        </div>
      ) : (
        // Back Side
        <div className="p-6 h-full bg-[#0A0E1A] rounded-xl">
          <div className="space-y-4">
            {version.includes('XP') && (
              <div className="text-yellow-400 text-sm font-mono">
                <div className="text-yellow-400 text-lg font-bold mb-2">→ PROGRESS TRACKER</div>
                <div className="text-yellow-400 text-xs mt-1">Experience points analysis</div>
              </div>
            )}
            
            {version.includes('%') && (
              <div className="text-green-400 text-sm font-mono">
                <div className="text-green-400 text-lg font-bold mb-2">→ ACHIEVEMENTS</div>
                <div className="text-green-400 text-xs mt-1">Completion status overview</div>
              </div>
            )}
            
            {version.includes('Active') && (
              <div className="text-cyan-400 text-sm font-mono">
                <div className="text-cyan-400 text-lg font-bold mb-2">→ ACTIVITY</div>
                <div className="text-cyan-400 text-xs mt-1">Recent system activity</div>
              </div>
            )}
            
            <div className="text-blue-400 text-sm font-mono">
              <div className="text-blue-400 text-lg font-bold mb-2">→ SYSTEM STATUS</div>
              <div className="text-blue-400 text-xs mt-1">Click to flip back</div>
            </div>
          </div>
          
          <button 
            className="mt-4 w-full px-4 py-2 rounded-lg bg-transparent border border-[#00D4FF]/50 text-[#00D4FF] text-sm font-medium transition-colors hover:bg-[#00D4FF]/20 hover:border-[#00D4FF]/80"
          >
            {isFlipped ? 'BACK' : 'FLIP'}
          </button>
        </div>
      )}
    </div>
  )
}