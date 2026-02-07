'use client'

/**
 * CyberpunkScreen Component
 * 
 * Displays hexagonal stats with animated cyberpunk screen effects:
 * - Glow illumination
 * - Grid pattern with movement
 * - Interference/static effect
 * - Scanline animation
 * - Burn-in effect on status text
 */

import { HexagonStatCard } from '@/features/dashboard/components'
import { useTranslations } from 'next-intl'

interface CyberpunkScreenProps {
  stats: {
    xp: number
    level: number
    achievements: { unlocked: number; total: number }
    skills: number
  }
  className?: string
}

export function CyberpunkScreen({ stats, className }: CyberpunkScreenProps) {
  const t = useTranslations('dashboard')

  return (
    <div className={`relative overflow-visible bg-[#0A0E1A] ${className}`}>
      {/* Screen Glow Effect */}
      <div 
        className="absolute inset-0 opacity-20 animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, #00D4FF 0%, transparent 70%)',
        }}
      />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          animation: 'gridMove 10s linear infinite',
        }}
      />
      
      {/* Interference/Static Effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.03) 2px, transparent 4px)',
          animation: 'interference 0.5s linear infinite',
        }}
      />
      
      {/* Scanline Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%)',
          animation: 'scanline 3s linear infinite',
        }}
      />
      
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Top Bar: Title + Connection Status */}
        <div className="flex justify-between items-center mb-4">
          {/* Console Title */}
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-sm">$</span>
            <span className="text-green-400 font-mono text-sm">_</span>
            <span className="text-cyan-400 font-mono text-sm">session_stats</span>
            <span className="text-cyan-400 font-mono text-sm">--display</span>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {/* Main Status Text */}
            <div className="text-green-400 font-mono text-xs">
              ONLINE
            </div>
            
            {/* Timestamp with subtle burn-in */}
            <div className="text-green-400 font-mono text-xs">
              <span 
                style={{
                  opacity: 0.8,
                  textShadow: '0 0 2px rgba(74, 222, 128, 0.2)',
                }}
              >
                [{new Date().toLocaleTimeString()}]
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-row gap-6 items-center justify-center pb-4">
          {/* XP Stat */}
          <div className="flex-shrink-0">
            <HexagonStatCard
              value={stats.xp.toLocaleString()}
              label={t('gaming.stats.experience')}
              color="yellow"
              icon={<BoltIcon className="h-5 w-5" />}
              size="lg"
            />
          </div>
          
          {/* Level Stat */}
          <div className="flex-shrink-0">
            <HexagonStatCard
              value={`Lv.${stats.level}`}
              label={t('gaming.currentLevel')}
              color="cyan"
              icon={<LevelIcon className="h-4 w-4" />}
              size="md"
            />
          </div>
          
          {/* Achievements Stat */}
          <div className="flex-shrink-0">
            <HexagonStatCard
              value={`${stats.achievements.unlocked}/${stats.achievements.total}`}
              label={t('gaming.stats.achievements')}
              color="magenta"
              icon={<TrophyIcon className="h-4 w-4" />}
              size="md"
            />
          </div>
          
          {/* Skills Stat */}
          <div className="flex-shrink-0">
            <HexagonStatCard
              value={stats.skills.toString()}
              label={t('gaming.stats.skills')}
              color="green"
              icon={<LightbulbIcon className="h-4 w-4" />}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Icons needed
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function LevelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}