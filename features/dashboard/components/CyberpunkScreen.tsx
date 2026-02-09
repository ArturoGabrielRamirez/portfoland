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
    <div className={`relative overflow-hidden bg-[#0A0E1A] rounded-lg ${className}`}>
      {/* Screen Glow Effect - Enhanced */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #00D4FF20 0%, #0A0E1A 50%, #000000 100%)',
        }}
      />
      
      {/* Grid Pattern Overlay - Optimized */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px',
          animation: 'gridMove 8s linear infinite',
        }}
      />
      
      {/* Interference/Static Effect - Optimized */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 212, 255, 0.02) 3px, transparent 6px)',
          animation: 'interference 0.3s linear infinite',
        }}
      />
      
      {/* Scanline Effect - Enhanced */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.08) 50%, transparent 100%)',
          animation: 'scanline 2s linear infinite',
        }}
      />
      
      {/* Screen Border Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 40px rgba(0, 212, 255, 0.05)',
        }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
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
        
        <div className="flex-1 flex flex-row gap-6 lg:gap-10 items-center justify-center relative py-4 px-2">
          {/* Scan Line Effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%)',
              animation: 'hexScan 4s ease-in-out infinite',
              height: '2px',
              width: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
            }}
          />
          
          {/* CRT Screen Simulation Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Phosphor Persistence Effect */}
            <div 
              className="absolute inset-0 opacity-3"
              style={{
                background: 'radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.05) 1%, transparent 3%), radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.05) 1%, transparent 3%)',
                mixBlendMode: 'screen',
                animation: 'phosphor 4s ease-in-out infinite',
              }}
            />
            
            {/* Screen Flicker */}
            <div 
              className="absolute inset-0 opacity-2"
              style={{
                background: 'rgba(0, 212, 255, 0.02)',
                animation: 'flicker 0.15s steps(1) infinite',
              }}
            />
            
            {/* CRT Ray Drawing Effect Behind Hexagons */}
            <div 
              className="absolute w-full h-px opacity-60"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.8) 20%, transparent 30%, rgba(0, 212, 255, 0.8) 70%, transparent 100%)',
                left: '0%',
                top: '50%',
                transform: 'translateX(-100%)',
                animation: 'crtRayDrawing 3s linear infinite',
                boxShadow: '0 0 12px rgba(0, 212, 255, 0.6)',
              }}
            />
            
            {/* Additional fading scan lines for depth */}
            <div 
              className="absolute w-full h-px opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.3) 10%, transparent 20%, rgba(0, 212, 255, 0.3) 30%, transparent 40%, rgba(0, 212, 255, 0.3) 50%, rgba(0, 212, 255, 0.3) 60%, transparent 70%, rgba(0, 212, 255, 0.3) 80%, transparent 90%, transparent 100%)',
                left: '0%',
                top: '48%',
                transform: 'translateX(-100%)',
                animation: 'crtRayDrawing 3s linear infinite reverse',
                boxShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
              }}
            />
            <div 
              className="absolute w-full h-px opacity-15"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.2) 10%, transparent 20%, rgba(0, 212, 255, 0.2) 30%, transparent 40%, rgba(0, 212, 255, 0.2) 50%, rgba(0, 212, 255, 0.2) 60%, transparent 70%, rgba(0, 212, 255, 0.2) 80%, transparent 90%, transparent 100%)',
                left: '0%',
                top: '52%',
                transform: 'translateX(-100%)',
                animation: 'crtRayDrawing 3.5s linear infinite',
                boxShadow: '0 0 6px rgba(0, 212, 255, 0.2)',
              }}
            />
            
            {/* Random Radiation Particles */}
            <div 
              className="absolute w-1 h-1 rounded-full opacity-15"
              style={{
                background: '#00D4FF',
                left: '25%',
                top: '30%',
                animation: 'radiation1 8s ease-in-out infinite',
                boxShadow: '0 0 4px #00D4FF'
              }}
            />
            <div 
              className="absolute w-1 h-1 rounded-full opacity-12"
              style={{
                background: '#22D3EE',
                left: '75%',
                top: '70%',
                animation: 'radiation2 10s ease-in-out infinite',
                boxShadow: '0 0 3px #22D3EE'
              }}
            />
            <div 
              className="absolute w-2 h-2 rounded-full opacity-8"
              style={{
                background: '#D946EF',
                left: '45%',
                top: '45%',
                animation: 'radiation3 12s ease-in-out infinite',
                boxShadow: '0 0 6px #D946EF'
              }}
            />
            <div 
              className="absolute w-1 h-1 rounded-full opacity-10"
              style={{
                background: '#22C55E',
                left: '60%',
                top: '85%',
                animation: 'radiation4 15s ease-in-out infinite',
                boxShadow: '0 0 2px #22C55E'
              }}
            />
            
            {/* Scan Pattern */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                background: 'radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.1) 2%, transparent 5%)',
                animation: 'scanPattern 20s linear infinite',
              }}
            />
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                background: 'radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 3%, transparent 6%)',
                animation: 'scanPattern 16s linear infinite reverse',
              }}
            />
            <div 
              className="absolute inset-0 opacity-3"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.1) 4%, transparent 8%)',
                animation: 'scanPattern 25s linear infinite',
              }}
            />
          </div>

          {/* XP Stat */}
          <div className="flex-shrink-0 relative z-10 transform hover:scale-105 transition-transform duration-300">
            <HexagonStatCard
              value={stats.xp.toLocaleString()}
              label={t('gaming.stats.experience')}
              color="yellow"
              icon={<BoltIcon className="h-5 w-5 lg:h-6 lg:w-6" />}
              size="md"
            />
          </div>
          
          {/* Level Stat */}
          <div className="flex-shrink-0 relative z-10 transform hover:scale-105 transition-transform duration-300">
            <HexagonStatCard
              value={`Lv.${stats.level}`}
              label={t('gaming.currentLevel')}
              color="cyan"
              icon={<LevelIcon className="h-4 w-4 lg:h-5 lg:w-5" />}
              size="md"
            />
          </div>
          
          {/* Achievements Stat */}
          <div className="flex-shrink-0 relative z-10 transform hover:scale-105 transition-transform duration-300">
            <HexagonStatCard
              value={`${stats.achievements.unlocked}/${stats.achievements.total}`}
              label={t('gaming.stats.achievements')}
              color="magenta"
              icon={<TrophyIcon className="h-4 w-4 lg:h-5 lg:w-5" />}
              size="md"
            />
          </div>
          
          {/* Skills Stat */}
          <div className="flex-shrink-0 relative z-10 transform hover:scale-105 transition-transform duration-300">
            <HexagonStatCard
              value={stats.skills.toString()}
              label={t('gaming.stats.skills')}
              color="green"
              icon={<LightbulbIcon className="h-4 w-4 lg:h-5 lg:w-5" />}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom CSS animations for CRT screen simulation and neon effects
const style = `
  @keyframes radiation1 {
    0%, 100% {
      opacity: 0.2;
      transform: translate(0, 0) scale(1);
    }
    50% {
      opacity: 0.4;
      transform: translate(10px, -15px) scale(1.5);
    }
  }
  
  @keyframes radiation2 {
    0%, 100% {
      opacity: 0.15;
      transform: translate(0, 0) rotate(0deg) scale(1);
    }
    33% {
      opacity: 0.3;
      transform: translate(-8px, 10px) rotate(120deg) scale(1.2);
    }
    66% {
      opacity: 0.25;
      transform: translate(5px, -8px) rotate(240deg) scale(0.8);
    }
  }
  
  @keyframes radiation3 {
    0%, 100% {
      opacity: 0.1;
      transform: translate(0, 0) scale(0.5);
    }
    50% {
      opacity: 0.2;
      transform: translate(0, -10px) scale(1);
    }
  }
  
  @keyframes radiation4 {
    0%, 100% {
      opacity: 0.12;
      transform: translate(0, 0) scale(1);
    }
    25% {
      opacity: 0.2;
      transform: translate(5px, 5px) scale(1.3);
    }
    75% {
      opacity: 0.15;
      transform: translate(-3px, -3px) scale(0.7);
    }
  }
  
  @keyframes scanPattern {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(200%) translateY(200%);
    }
  }
  
  @keyframes phosphor {
    0%, 100% {
      opacity: 0.03;
    }
    50% {
      opacity: 0.08;
    }
  }
  
  @keyframes flicker {
    0%, 100% {
      opacity: 0;
    }
    50% {
      opacity: 0.02;
    }
  }
  
  @keyframes neonFall {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    10% {
      transform: translateY(10px);
      opacity: 0.3;
    }
    90% {
      transform: translateY(100px);
      opacity: 0;
    }
    100% {
      transform: translateY(120px);
      opacity: 0;
    }
  }
  
  @keyframes hexScan {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes hexScanLine {
    0% {
      opacity: 0.2;
      transform: translateX(-100%);
    }
    50% {
      opacity: 0.6;
      transform: translateX(0%);
    }
    100% {
      opacity: 0.2;
      transform: translateX(100%);
    }
  }
  
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