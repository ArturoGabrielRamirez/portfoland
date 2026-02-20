'use client'

/**
 * ConsolePanelCard Component
 *
 * Cyberpunk Pokédex-style flip card for dashboard configuration panels.
 * Front side shows module info, back side shows configuration options.
 */

import { useState } from 'react'
import { TechCard, TechBadge } from '@/features/tech'

interface ConsolePanelCardProps {
  title: string
  description: string
  version: string
  icon: React.ReactNode
  color: 'cyan' | 'magenta' | 'green' | 'yellow'
  onFlip?: () => void
  backContent?: React.ReactNode
}

export function ConsolePanelCard({
  title,
  description,
  version,
  icon,
  color,
  onFlip,
  backContent,
}: ConsolePanelCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const colorStyles = {
    cyan: {
      border: 'border-[#00D4FF]/50',
      iconBg: 'bg-[#00D4FF]/20',
      iconColor: 'text-[#00D4FF]',
      glow: 'shadow-[0_0_30px_rgba(0,212,255,0.3)]',
      badge: 'cyan' as const,
      scanline: 'bg-gradient-to-b from-transparent via-[#00D4FF]/10 to-transparent',
    },
    magenta: {
      border: 'border-[#D946EF]/50',
      iconBg: 'bg-[#D946EF]/20',
      iconColor: 'text-[#D946EF]',
      glow: 'shadow-[0_0_30px_rgba(217,70,239,0.3)]',
      badge: 'magenta' as const,
      scanline: 'bg-gradient-to-b from-transparent via-[#D946EF]/10 to-transparent',
    },
    green: {
      border: 'border-[#22C55E]/50',
      iconBg: 'bg-[#22C55E]/20',
      iconColor: 'text-[#22C55E]',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
      badge: 'green' as const,
      scanline: 'bg-gradient-to-b from-transparent via-[#22C55E]/10 to-transparent',
    },
    yellow: {
      border: 'border-[#EAB308]/50',
      iconBg: 'bg-[#EAB308]/20',
      iconColor: 'text-[#EAB308]',
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
      badge: 'yellow' as const,
      scanline: 'bg-gradient-to-b from-transparent via-[#EAB308]/10 to-transparent',
    },
  }

  const styles = colorStyles[color]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
  }

  return (
    <div className="relative h-full preserve-3d transition-all duration-700 hover:scale-[1.02]" 
         style={{ 
           transformStyle: 'preserve-3d',
           transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
         }}>
      
      {/* Front Side */}
      <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
        <TechCard
          variant="default"
          className={`relative h-full p-5 transition-all border ${styles.border} ${styles.glow} overflow-hidden`}
        >
          {/* Animated Scanline Effect */}
          <div className={`absolute inset-0 pointer-events-none ${styles.scanline} opacity-20`} 
               style={{
                 background: `linear-gradient(0deg, transparent 0%, ${styles.iconColor.replace('text-', 'rgba(').replace(')', ', 0.1)')} 50%, transparent 100%)`,
                 animation: 'scanline 3s linear infinite'
               }} />
          
          {/* Glitch Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-20 transition-opacity"
               style={{
                 background: `linear-gradient(45deg, transparent 30%, ${styles.iconColor.replace('text-', 'rgba(').replace(')', ', 0.3)')} 50%, transparent 70%)`,
                 animation: 'glitch 0.3s ease-in-out infinite'
               }} />

          {/* Corner Brackets (Cyberpunk Style) */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00D4FF]/50 animate-pulse" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00D4FF]/50 animate-pulse" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00D4FF]/50 animate-pulse" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00D4FF]/50 animate-pulse" />

          {/* Data Stream Effect */}
          <div className="absolute top-0 left-0 w-1 h-full opacity-30"
               style={{
                 background: `linear-gradient(180deg, transparent, ${styles.iconColor.replace('text-', 'rgba(').replace(')', ', 0.8)')}, transparent)`,
                 animation: 'dataStream 2s ease-in-out infinite'
               }} />

          {/* Status Badge with Glow */}
          <div className="absolute top-3 right-3">
            <div className={`relative ${styles.iconBg} rounded-full p-1`}>
              <TechBadge color={styles.badge} className="text-xs">
                {version}
              </TechBadge>
              <div className={`absolute inset-0 ${styles.iconColor} opacity-30 blur-md animate-pulse`} />
            </div>
          </div>

          {/* Icon with Enhanced Glow */}
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg} relative group`}>
            <div className={`absolute inset-0 ${styles.iconColor} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
            <div className={`absolute inset-0 ${styles.iconColor} opacity-10 blur-2xl animate-pulse`} />
            <div className={`relative ${styles.iconColor} transition-transform group-hover:scale-110`}>{icon}</div>
          </div>

          {/* Content with Typewriter Effect */}
          <h3 className="mb-2 text-lg font-bold text-white tracking-wide" 
              style={{ textShadow: `0 0 10px ${styles.iconColor.replace('text-', 'rgba(').replace(')', ', 0.5)')}` }}>
            {title}
          </h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed mb-4 font-mono">{description}</p>

          {/* Enhanced Action Button */}
          <button
            onClick={handleFlip}
            className={`w-full py-2 px-4 rounded-lg border ${styles.border} ${styles.iconBg} ${styles.iconColor} text-sm font-medium transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group`}
          >
            <div className={`absolute inset-0 ${styles.iconColor} opacity-0 group-hover:opacity-20 transition-opacity`} />
            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="relative z-10">CONFIG</span>
          </button>
        </TechCard>
      </div>

      {/* Back Side */}
      <div className="absolute inset-0 backface-hidden" 
           style={{ 
             backfaceVisibility: 'hidden',
             transform: 'rotateY(180deg)'
           }}>
        <TechCard
          variant="default"
          className={`relative h-full p-5 border ${styles.border} ${styles.glow} overflow-hidden`}
        >
          {/* Animated Scanline Effect */}
          <div className={`absolute inset-0 pointer-events-none ${styles.scanline} opacity-20`} 
               style={{
                 background: `linear-gradient(0deg, transparent 0%, ${styles.iconColor.replace('text-', 'rgba(').replace(')', ', 0.1)')} 50%, transparent 100%)`,
                 animation: 'scanline 3s linear infinite reverse'
               }} />
          
          {/* Corner Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00D4FF]/50 animate-pulse" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00D4FF]/50 animate-pulse" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00D4FF]/50 animate-pulse" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00D4FF]/50 animate-pulse" />

          {/* Back Content */}
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-wide">CONFIGURATION</h3>
              <button
                onClick={handleFlip}
                className={`p-2 rounded-lg ${styles.iconBg} ${styles.iconColor} transition-all hover:opacity-80 flex-shrink-0`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {backContent || (
                <div className="text-center text-[#64748B] py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37 2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">Configuration panel coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </TechCard>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        
        @keyframes dataStream {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  )
}