// =============================================================================
// Tech Mode UI Components
// =============================================================================
// Tech-futurista UI components with glow effects, neon colors, and
// terminal-inspired styling. These components provide the visual foundation for
// the Tech Mode portfolio experience.
// =============================================================================

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// =============================================================================
// TECH BUTTON
// =============================================================================

const techButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[#00D4FF] text-[#0A0E1A] hover:bg-[#00D4FF]/90 border border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]',
        secondary:
          'bg-[#D946EF] text-white hover:bg-[#D946EF]/90 border border-[#D946EF] shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)]',
        outline:
          'border border-[#1E293B] bg-transparent text-[#94A3B8] hover:border-[#00D4FF] hover:text-[#00D4FF] hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]',
        ghost:
          'bg-transparent text-[#94A3B8] hover:bg-[#1E293B] hover:text-white',
        destructive:
          'bg-[#EF4444] text-white hover:bg-[#EF4444]/90 border border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        success:
          'bg-[#22C55E] text-white hover:bg-[#22C55E]/90 border border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        warning:
          'bg-[#EAB308] text-[#0A0E1A] hover:bg-[#EAB308]/90 border border-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-sm',
        sm: 'h-8 px-3 text-xs rounded-sm',
        lg: 'h-12 px-6 text-base rounded-sm',
        icon: 'h-10 w-10 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface TechButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof techButtonVariants> { }

export const TechButton = React.forwardRef<
  HTMLButtonElement,
  TechButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(techButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
TechButton.displayName = 'TechButton'

// =============================================================================
// TECH INPUT
// =============================================================================

export interface TechInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

export const TechInput = React.forwardRef<HTMLInputElement, TechInputProps>(
  ({ className, error, success, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-sm border bg-[#0D1421] px-4 py-2 text-sm text-white placeholder:text-[#64748B] transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0E1A]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error &&
          'border-[#EF4444] focus:ring-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]',
          success &&
          'border-[#22C55E] focus:ring-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.2)]',
          !error &&
          !success &&
          'border-[#1E293B] hover:border-[#334155] focus:border-[#00D4FF] focus:ring-[#00D4FF]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TechInput.displayName = 'TechInput'

// =============================================================================
// TECH CARD
// =============================================================================

const techCardVariants = cva(
  'rounded-sm border transition-all duration-300',
  {
    variants: {
      variant: {
        default:
          'bg-[#0D1421] border-[#1E293B] hover:border-[#334155]',
        glow: 'bg-[#0D1421] border-[#00D4FF]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:border-[#00D4FF]/50',
        magenta:
          'bg-[#0D1421] border-[#D946EF]/30 shadow-[0_0_20px_rgba(217,70,239,0.15)] hover:shadow-[0_0_30px_rgba(217,70,239,0.25)] hover:border-[#D946EF]/50',
        green:
          'bg-[#0D1421] border-[#22C55E]/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:border-[#22C55E]/50',
        featured:
          'bg-gradient-to-br from-[#0D1421] to-[#131B2E] border-[#00D4FF]/50 shadow-[0_0_25px_rgba(0,212,255,0.2)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TechCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof techCardVariants> { }

export const TechCard = React.forwardRef<HTMLDivElement, TechCardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(techCardVariants({ variant, className }), 'relative group')}
        {...props}
      >
        {/* Decorative corner markers */}
        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-tighter">
            STAT: OK
          </span>
        </div>
        <div className="absolute bottom-0 left-0 p-1 opacity-10">
          <span className="text-[6px] font-mono text-slate-500 uppercase">
            SEC_AUTH_v2.1
          </span>
        </div>
        {props.children}
      </div>
    )
  }
)
TechCard.displayName = 'TechCard'

export const TechCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
))
TechCardHeader.displayName = 'TechCardHeader'

export const TechCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-white',
      className
    )}
    {...props}
  />
))
TechCardTitle.displayName = 'TechCardTitle'

export const TechCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
TechCardContent.displayName = 'TechCardContent'

// =============================================================================
// CHARACTER SELECT
// =============================================================================

export interface CharacterSelectProps {
  name: string
  icon: React.ReactNode
  selected?: boolean
  color?: 'cyan' | 'magenta' | 'yellow' | 'green'
  onClick?: () => void
  className?: string
}

export function CharacterSelect({
  name,
  icon,
  selected = false,
  color = 'cyan',
  onClick,
  className,
}: CharacterSelectProps) {
  const colorClasses = {
    cyan: selected
      ? 'border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
      : 'border-[#1E293B] hover:border-[#00D4FF]/50',
    magenta: selected
      ? 'border-[#D946EF] bg-[#D946EF]/10 shadow-[0_0_20px_rgba(217,70,239,0.3)]'
      : 'border-[#1E293B] hover:border-[#D946EF]/50',
    yellow: selected
      ? 'border-[#EAB308] bg-[#EAB308]/10 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
      : 'border-[#1E293B] hover:border-[#EAB308]/50',
    green: selected
      ? 'border-[#22C55E] bg-[#22C55E]/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
      : 'border-[#1E293B] hover:border-[#22C55E]/50',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-3 p-4 rounded-sm border-2 transition-all duration-300 bg-[#0D1421]',
        colorClasses[color],
        className
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-sm flex items-center justify-center text-3xl',
          selected ? 'scale-110' : ''
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          selected ? 'text-white' : 'text-[#94A3B8]'
        )}
      >
        {name}
      </span>
    </button>
  )
}

// =============================================================================
// STAT CARD (for XP, Level, etc.)
// =============================================================================

interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'purple'
  className?: string
}

const colorMap = {
  cyan: {
    text: 'text-[#00D4FF]',
    border: 'border-[#00D4FF]/30',
    glow: 'shadow-[0_0_15px_rgba(0,212,255,0.2)]',
  },
  magenta: {
    text: 'text-[#D946EF]',
    border: 'border-[#D946EF]/30',
    glow: 'shadow-[0_0_15px_rgba(217,70,239,0.2)]',
  },
  green: {
    text: 'text-[#22C55E]',
    border: 'border-[#22C55E]/30',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]',
  },
  yellow: {
    text: 'text-[#EAB308]',
    border: 'border-[#EAB308]/30',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
  },
  purple: {
    text: 'text-[#A855F7]',
    border: 'border-[#A855F7]/30',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  },
}

export function StatCard({
  value,
  label,
  icon,
  color = 'cyan',
  className,
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-sm border p-4 bg-[#0D1421] transition-all duration-300 hover:scale-105',
        colors.border,
        colors.glow,
        className
      )}
    >
      {icon && <div className={cn('mb-2', colors.text)}>{icon}</div>}
      <span className={cn('text-2xl font-bold', colors.text)}>{value}</span>
      <span className="text-xs text-[#64748B] uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

// =============================================================================
// XP PROGRESS BAR
// =============================================================================

interface XPBarProps {
  current: number
  max: number
  level?: number
  showLabel?: boolean
  className?: string
}

export function XPBar({
  current,
  max,
  level,
  showLabel = true,
  className,
}: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          {level && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-[#00D4FF] text-[#0A0E1A] font-bold text-sm">
                {level}
              </span>
              <span className="text-sm text-[#64748B]">Level</span>
            </div>
          )}
          <span className="text-sm text-[#EAB308] font-medium">
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="h-3 bg-[#1E293B] rounded-sm overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#EAB308] to-[#FCD34D] transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)',
            clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
          }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// HUD PANEL
// =============================================================================

interface HUDPanelProps {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function HUDPanel({
  title,
  children,
  action,
  className,
}: HUDPanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-sm border border-[#1E293B] bg-[#0D1421] overflow-hidden',
        className
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />

      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E293B]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/50 to-transparent" />
    </div>
  )
}

// =============================================================================
// LEVEL BADGE
// =============================================================================

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center clip-hexagon bg-[#00D4FF] text-[#0A0E1A] font-bold',
        'shadow-[0_0_15px_rgba(0,212,255,0.4)]',
        sizeClasses[size],
        className
      )}
    >
      {level}
    </div>
  )
}

// =============================================================================
// TECH AVATAR
// =============================================================================

interface TechAvatarProps {
  src?: string
  alt?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  frame?: 'none' | 'cyan' | 'magenta' | 'gold' | 'legendary'
  shape?: 'circle' | 'hexagon'
  className?: string
}

export function TechAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  frame = 'cyan',
  shape = 'circle',
  className,
}: TechAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl',
  }

  const frameClasses = {
    none: 'border-transparent',
    cyan: 'border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.4)]',
    magenta: 'border-[#D946EF] shadow-[0_0_15px_rgba(217,70,239,0.4)]',
    gold: 'border-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.4)]',
    legendary:
      'border-[#EAB308] shadow-[0_0_20px_rgba(234,179,8,0.6)] ring-2 ring-[#EAB308]/30',
  }

  const shapeClass = shape === 'hexagon' ? 'clip-hexagon' : 'rounded-full'

  return (
    <div
      className={cn(
        'border-2 overflow-hidden bg-[#1E293B] flex items-center justify-center',
        shapeClass,
        sizeClasses[size],
        frameClasses[frame],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-bold text-[#64748B]">{fallback}</span>
      )}
    </div>
  )
}

// =============================================================================
// TECH BADGE
// =============================================================================

interface TechBadgeProps {
  children: React.ReactNode
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'purple' | 'gray'
  className?: string
}

export function TechBadge({
  children,
  color = 'cyan',
  className,
}: TechBadgeProps) {
  const colorClasses = {
    cyan: 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30',
    magenta: 'bg-[#D946EF]/20 text-[#D946EF] border-[#D946EF]/30',
    green: 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30',
    yellow: 'bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/30',
    purple: 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/30',
    gray: 'bg-[#1E293B] text-[#64748B] border-[#334155]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  )
}

// =============================================================================
// ICON COMPONENTS FOR AUTH PAGES
// =============================================================================

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  )
}

export function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  )
}

// =============================================================================
// SPINNER
// =============================================================================

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  )
}

// =============================================================================
// CYBERPUNK COMPONENTS
// =============================================================================

export { HexBadge, HexStatBadge } from './components/hex-badge'
export { CRTMonitor } from './components/crt-monitor'
export { CyberpunkNav } from './components/cyberpunk-nav'
export { WelcomeCard } from './components/welcome-card'
export { DashboardNav } from './components/dashboard-nav'
export { ParticleField } from './components/particle-field'
export { AIAssistant } from './components/ai-assistant'
export { AIAssistantWidget } from './components/ai-assistant-widget'
export { AIAssistantFloat } from './components/ai-assistant-float'
// Dashboard Redesign V2
export { CRTWithAI } from './components/crt-with-ai'
export { HexStatGrid } from './components/hex-stat-grid'
export { ActiveMissionsPanel } from './components/active-missions-panel'
export { SkillRadarPanel } from './components/skill-radar-panel'
export { TopRunnersPanel } from './components/top-runners-panel'
export { ActivityHeatmap } from './components/activity-heatmap'
export { QuickActionsBar } from './components/quick-actions-bar'
export { DashboardRow1 } from './components/dashboard-row1'
