'use client'

/**
 * GiantFlipCard Component - Simplified for debugging
 */

import { useState } from 'react'

interface GiantFlipCardProps {
  title: string
  description: string
  version: string
  icon: React.ReactNode
  color: 'cyan' | 'magenta' | 'green' | 'yellow'
  onFlip?: () => void
  stats?: {
    current?: number
    total?: number
    progress?: number
  }
}

export function GiantFlipCard({ 
  title, 
  description, 
  version, 
  icon, 
  color, 
  onFlip,
  stats
}: GiantFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
  }

  const colorConfig = {
    cyan: {
      primary: '#00D4FF',
      border: 'border-[#00D4FF]',
      bg: 'bg-[#00D4FF]/10',
      text: 'text-[#00D4FF]',
    },
    magenta: {
      primary: '#D946EF',
      border: 'border-[#D946EF]',
      bg: 'bg-[#D946EF]/10',
      text: 'text-[#D946EF]',
    },
    green: {
      primary: '#22C55E',
      border: 'border-[#22C55E]',
      bg: 'bg-[#22C55E]/10',
      text: 'text-[#22C55E]',
    },
    yellow: {
      primary: '#EAB308',
      border: 'border-[#EAB308]',
      bg: 'bg-[#EAB308]/10',
      text: 'text-[#EAB308]',
    },
  }

  const config = colorConfig[color]

  return (
    <div 
      className="w-full h-full bg-[#0A0E1A] border-2 rounded-xl p-6 cursor-pointer transition-all hover:scale-105"
      style={{ borderColor: config.primary }}
      onClick={handleFlip}
    >
      {!isFlipped ? (
        // Front Side - Simple
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="text-center mb-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border"
                style={{ 
                  backgroundColor: config.bg,
                  borderColor: config.primary
                }}
              >
                <div className={config.text}>
                  {icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {title}
              </h3>
              <p className="text-[#94A3B8] text-sm">
                {description}
              </p>
            </div>
          </div>

          <div>
            {/* Badge */}
            <div className="text-center mb-4">
              <div 
                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: config.primary }}
              >
                {version}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-[#64748B]">
                  <span>Progress</span>
                  <span>{stats.progress || 0}%</span>
                </div>
                <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.progress || 0}%`,
                      backgroundColor: config.primary
                    }}
                  />
                </div>
                {stats.current !== undefined && stats.total !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className={config.text + " font-bold"}>{stats.current}</span>
                    <span className="text-white font-bold">{stats.total}</span>
                  </div>
                )}
              </div>
            )}

            {/* Flip hint */}
            <div className="text-center text-xs text-[#64748B] mt-4">
              Click to flip →
            </div>
          </div>
        </div>
      ) : (
        // Back Side - Simple
        <div className="h-full flex flex-col justify-center items-center">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: config.primary }}
          >
            <div className="text-white text-2xl font-bold">
              {title.charAt(0)}
            </div>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">
            {title} Details
          </h4>
          <p className="text-[#94A3B8] text-sm text-center mb-4">
            Advanced information and metrics about {title.toLowerCase()}
          </p>
          <button 
            className="px-4 py-2 rounded-lg border text-sm font-medium"
            style={{ 
              borderColor: config.primary,
              color: config.primary
            }}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}