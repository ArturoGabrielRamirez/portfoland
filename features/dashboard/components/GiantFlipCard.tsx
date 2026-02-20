'use client'

/**
 * GiantFlipCard Component - Simplified without 3D transforms
 * 
 * Simple card with hover flip, no complex 3D:
 * - Uses TechCard as base
 * - Clean hover transition
 * - No perspective or transform-style issues
 * - Guaranteed to work with layout
 */

import { useState } from 'react'
import { TechCard, XPBar, TechBadge } from '@/features/tech'

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

  const getTechCardVariant = () => {
    switch (color) {
      case 'magenta':
        return 'magenta'
      case 'green':
        return 'green'
      case 'yellow':
        return 'glow'
      default:
        return 'glow'
    }
  }

  const getProgressBarColor = () => {
    switch (color) {
      case 'magenta':
        return '#D946EF'
      case 'green':
        return '#22C55E'
      case 'yellow':
        return '#EAB308'
      default:
        return '#00D4FF'
    }
  }

  return (
    <div className="w-full h-full">
      {/* Simple Card Container - NO 3D transforms */}
      <div 
        className="relative w-full h-full cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
        onClick={handleFlip}
      >
        {/* Front Side */}
        {!isFlipped && (
          <TechCard variant={getTechCardVariant()} className="w-full h-full p-4 sm:p-6 border-2 border-transparent group-hover:border-opacity-20 transition-all group-hover:border-[--hover-color]" style={{ '--hover-color': getProgressBarColor() + '30' } as React.CSSProperties}>
            {/* Header Section */}
            <div className="mb-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${getProgressBarColor()}25 0%, transparent 100%)`,
                    borderColor: getProgressBarColor() + '60',
                    boxShadow: `0 0 25px ${getProgressBarColor()}40`
                  }}
                >
                  <div className="text-2xl sm:text-3xl transition-all group-hover:scale-110" style={{ color: getProgressBarColor() }}>
                    {icon}
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className="text-center mb-4">
              <TechBadge color="gray" className="mb-0">
                {version}
              </TechBadge>
            </div>

            {/* Stats Section */}
            {stats && (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-[#64748B] mb-2">
                    <span>Progress</span>
                    <span>{stats.progress || 0}%</span>
                  </div>
                  <XPBar
                    current={stats.progress || 0}
                    max={100}
                    showLabel={false}
                    className="mb-4"
                  />
                </div>

                {/* Current/Total Display */}
                {stats.current !== undefined && stats.total !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-[#1E293B]/50 border border-[#1E293B]">
                      <div className="text-2xl font-bold transition-colors" style={{ color: getProgressBarColor() }}>
                        {stats.current}
                      </div>
                      <div className="text-xs text-[#64748B]">Current</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#1E293B]/50 border border-[#1E293B]">
                      <div className="text-2xl font-bold text-white">
                        {stats.total}
                      </div>
                      <div className="text-xs text-[#64748B]">Total</div>
                    </div>
                  </div>
                )}

                {/* Flip Hint */}
                <div className="text-center text-xs text-[#64748B] animate-pulse group-hover:text-opacity-80">
                  Click to flip →
                </div>
              </div>
            )}
          </TechCard>
        )}

        {/* Back Side */}
        {isFlipped && (
          <TechCard variant="featured" className="w-full h-full p-6">
            {/* Back Content */}
            <div className="h-full flex flex-col justify-center items-center text-center">
              {/* Large Icon */}
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 border-2 transition-all hover:scale-105"
                style={{
                  background: getProgressBarColor(),
                  borderColor: getProgressBarColor(),
                  boxShadow: `0 0 30px ${getProgressBarColor()}60`
                }}
              >
                <div className="text-white text-4xl font-bold">
                  {title.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Title */}
              <h4 
                className="text-2xl font-bold text-white mb-3"
                style={{ textShadow: `0 0 15px ${getProgressBarColor()}` }}
              >
                {title.toUpperCase()}
              </h4>
              
              {/* Status Badge */}
              <div className="mb-4">
                <TechBadge color="gray" className="text-sm">
                  {title.toLowerCase().includes('level') && 'LEVEL ANALYTICS'}
                  {title.toLowerCase().includes('achievement') && 'ACHIEVEMENT TRACKER'}
                  {title.toLowerCase().includes('profile') && 'PROFILE INSIGHTS'}
                  {!['level', 'achievement', 'profile'].some(word => title.toLowerCase().includes(word)) && 'SYSTEM STATUS'}
                </TechBadge>
              </div>

              {/* Description */}
              <p className="text-[#94A3B8] text-sm mb-6 max-w-xs">
                Advanced metrics and detailed analysis of your {title.toLowerCase()} performance and progress.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button 
                  className="px-4 py-2 rounded-lg border text-sm font-bold transition-all hover:scale-105"
                  style={{ 
                    borderColor: getProgressBarColor(),
                    color: getProgressBarColor(),
                    background: 'transparent'
                  }}
                >
                  View Details
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ 
                    background: getProgressBarColor(),
                    borderColor: getProgressBarColor()
                  }}
                  onClick={handleFlip}
                >
                  ← Back
                </button>
              </div>
            </div>
          </TechCard>
        )}
      </div>
    </div>
  )
}