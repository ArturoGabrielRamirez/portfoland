"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// =============================================================================
// GAMING BUTTON
// =============================================================================
const gamingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary shadow-[0_0_15px_rgba(233,48,255,0.3)] hover:shadow-[0_0_25px_rgba(233,48,255,0.5)]",
        outline: "border border-border bg-transparent text-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]",
        ghost: "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive shadow-[0_0_15px_rgba(248,81,73,0.3)]",
        success: "bg-success text-success-foreground hover:bg-success/90 border border-success shadow-[0_0_15px_rgba(63,185,80,0.3)]",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 border border-warning shadow-[0_0_15px_rgba(240,180,41,0.3)]",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface GamingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gamingButtonVariants> {}

export const GamingButton = React.forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(gamingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GamingButton.displayName = "GamingButton"

// =============================================================================
// GAMING INPUT
// =============================================================================
export interface GamingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

export const GamingInput = React.forwardRef<HTMLInputElement, GamingInputProps>(
  ({ className, error, success, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive shadow-[0_0_10px_rgba(248,81,73,0.2)]",
          success && "border-success focus:ring-success shadow-[0_0_10px_rgba(63,185,80,0.2)]",
          !error && !success && "border-border hover:border-border-hover focus:border-primary focus:ring-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GamingInput.displayName = "GamingInput"

// =============================================================================
// GAMING CARD
// =============================================================================
const gamingCardVariants = cva(
  "rounded-xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border hover:border-border-hover",
        glow: "bg-card border-primary/30 shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]",
        magenta: "bg-card border-secondary/30 shadow-[0_0_20px_rgba(233,48,255,0.15)] hover:shadow-[0_0_30px_rgba(233,48,255,0.25)]",
        featured: "bg-gradient-to-br from-card to-card-hover border-primary/50 shadow-[0_0_25px_rgba(0,212,255,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GamingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gamingCardVariants> {}

export const GamingCard = React.forwardRef<HTMLDivElement, GamingCardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gamingCardVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
GamingCard.displayName = "GamingCard"

export const GamingCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
))
GamingCardHeader.displayName = "GamingCardHeader"

export const GamingCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-lg font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
))
GamingCardTitle.displayName = "GamingCardTitle"

export const GamingCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
))
GamingCardContent.displayName = "GamingCardContent"

// =============================================================================
// STAT CARD (for XP, Level, etc.)
// =============================================================================
interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  color?: "cyan" | "magenta" | "green" | "yellow" | "purple"
  className?: string
}

const colorMap = {
  cyan: {
    text: "text-primary",
    bg: "bg-primary-muted",
    border: "border-primary/30",
    glow: "shadow-[0_0_15px_rgba(0,212,255,0.2)]",
  },
  magenta: {
    text: "text-secondary",
    bg: "bg-secondary-muted",
    border: "border-secondary/30",
    glow: "shadow-[0_0_15px_rgba(233,48,255,0.2)]",
  },
  green: {
    text: "text-success",
    bg: "bg-success-muted",
    border: "border-success/30",
    glow: "shadow-[0_0_15px_rgba(63,185,80,0.2)]",
  },
  yellow: {
    text: "text-warning",
    bg: "bg-warning-muted",
    border: "border-warning/30",
    glow: "shadow-[0_0_15px_rgba(240,180,41,0.2)]",
  },
  purple: {
    text: "text-accent",
    bg: "bg-accent-muted",
    border: "border-accent/30",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  },
}

export function StatCard({ value, label, icon, color = "cyan", className }: StatCardProps) {
  const colors = colorMap[color]
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-xl border p-4 bg-card transition-all duration-300 hover:scale-105",
      colors.border,
      colors.glow,
      className
    )}>
      {icon && <div className={cn("mb-2", colors.text)}>{icon}</div>}
      <span className={cn("font-display text-2xl font-bold", colors.text)}>{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
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

export function XPBar({ current, max, level, showLabel = true, className }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100)
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          {level && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm">
                {level}
              </span>
              <span className="text-sm text-muted-foreground">Nivel</span>
            </div>
          )}
          <span className="text-sm text-warning font-medium">
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-warning to-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            boxShadow: '0 0 10px rgba(240, 180, 41, 0.5)'
          }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// SKILL PROGRESS
// =============================================================================
interface SkillProgressProps {
  name: string
  level: number
  maxLevel?: number
  category?: "frontend" | "backend" | "database" | "devops" | "design" | "soft"
  className?: string
}

const categoryColors = {
  frontend: { color: "text-skill-frontend", bg: "bg-skill-frontend" },
  backend: { color: "text-skill-backend", bg: "bg-skill-backend" },
  database: { color: "text-skill-database", bg: "bg-skill-database" },
  devops: { color: "text-skill-devops", bg: "bg-skill-devops" },
  design: { color: "text-skill-design", bg: "bg-skill-design" },
  soft: { color: "text-skill-soft", bg: "bg-skill-soft" },
}

export function SkillProgress({ name, level, maxLevel = 10, category = "frontend", className }: SkillProgressProps) {
  const colors = categoryColors[category]
  const percentage = (level / maxLevel) * 100
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className={cn("text-sm font-display font-bold", colors.color)}>
          Nv. {level}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.bg)}
          style={{ 
            width: `${percentage}%`,
            boxShadow: `0 0 8px currentColor`
          }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// ACHIEVEMENT BADGE
// =============================================================================
interface AchievementBadgeProps {
  title: string
  description: string
  xp: number
  unlocked?: boolean
  icon?: React.ReactNode
  rarity?: "common" | "rare" | "epic" | "legendary"
  className?: string
}

const rarityColors = {
  common: { border: "border-muted-foreground/50", text: "text-muted-foreground" },
  rare: { border: "border-primary", text: "text-primary" },
  epic: { border: "border-secondary", text: "text-secondary" },
  legendary: { border: "border-warning", text: "text-warning" },
}

export function AchievementBadge({ 
  title, 
  description, 
  xp, 
  unlocked = false, 
  icon,
  rarity = "common",
  className 
}: AchievementBadgeProps) {
  const colors = rarityColors[rarity]
  
  return (
    <div className={cn(
      "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300",
      unlocked ? colors.border : "border-muted",
      unlocked ? "bg-card" : "bg-card/50 opacity-60",
      unlocked && rarity === "legendary" && "shadow-[0_0_20px_rgba(240,180,41,0.3)]",
      unlocked && rarity === "epic" && "shadow-[0_0_20px_rgba(233,48,255,0.3)]",
      unlocked && rarity === "rare" && "shadow-[0_0_20px_rgba(0,212,255,0.3)]",
      className
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center mb-3",
        unlocked ? colors.border : "border-muted",
        unlocked ? "bg-muted" : "bg-muted/50"
      )}>
        {icon || (
          <svg className={cn("w-8 h-8", unlocked ? colors.text : "text-muted-foreground")} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
      <h4 className={cn(
        "font-display font-semibold text-center text-sm mb-1",
        unlocked ? "text-foreground" : "text-muted-foreground"
      )}>
        {title}
      </h4>
      <p className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">
        {description}
      </p>
      <span className={cn(
        "text-xs font-bold px-2 py-1 rounded-full",
        unlocked ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
      )}>
        +{xp} XP
      </span>
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// TIMELINE EVENT
// =============================================================================
interface TimelineEventProps {
  title: string
  company: string
  period: string
  description: string
  tags?: string[]
  type?: "work" | "education" | "project" | "certification"
  xp?: number
  current?: boolean
  className?: string
}

const typeColors = {
  work: { dot: "bg-primary", border: "border-primary/30", label: "Trabajo" },
  education: { dot: "bg-accent", border: "border-accent/30", label: "Educacion" },
  project: { dot: "bg-success", border: "border-success/30", label: "Proyecto" },
  certification: { dot: "bg-warning", border: "border-warning/30", label: "Certificacion" },
}

export function TimelineEvent({
  title,
  company,
  period,
  description,
  tags = [],
  type = "work",
  xp,
  current = false,
  className
}: TimelineEventProps) {
  const colors = typeColors[type]
  
  return (
    <div className={cn("relative pl-8", className)}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
      
      {/* Dot */}
      <div className={cn(
        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center",
        colors.dot,
        current && "ring-4 ring-primary/20"
      )}>
        {current && (
          <div className="w-2 h-2 rounded-full bg-background animate-pulse" />
        )}
      </div>
      
      <GamingCard variant="default" className={cn("mb-4", colors.border)}>
        <GamingCardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={cn(
                "inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2",
                `bg-${type === 'work' ? 'primary' : type === 'education' ? 'accent' : type === 'project' ? 'success' : 'warning'}/20`,
                type === 'work' ? 'text-primary' : type === 'education' ? 'text-accent' : type === 'project' ? 'text-success' : 'text-warning'
              )}>
                {current ? "ACTUAL" : colors.label.toUpperCase()}
              </span>
              <GamingCardTitle>{title}</GamingCardTitle>
              <p className="text-sm text-muted-foreground mt-1">{company}</p>
            </div>
            {xp && (
              <span className="text-sm font-bold text-warning bg-warning/20 px-2 py-1 rounded-lg">
                +{xp} XP
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{period}</span>
        </GamingCardHeader>
        <GamingCardContent>
          <p className="text-sm text-foreground/80 mb-3">{description}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:text-primary transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </GamingCardContent>
      </GamingCard>
    </div>
  )
}

// =============================================================================
// SKILL TREE NODE
// =============================================================================
interface SkillTreeNodeProps {
  name: string
  level?: number
  icon?: React.ReactNode
  unlocked?: boolean
  active?: boolean
  category?: keyof typeof categoryColors
  onClick?: () => void
  className?: string
}

export function SkillTreeNode({
  name,
  level,
  icon,
  unlocked = false,
  active = false,
  category = "frontend",
  onClick,
  className
}: SkillTreeNodeProps) {
  const colors = categoryColors[category]
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 group",
        className
      )}
    >
      <div className={cn(
        "w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300",
        unlocked ? colors.color.replace("text-", "border-") : "border-muted",
        unlocked ? "bg-card" : "bg-card/50",
        active && "ring-4 ring-primary/30",
        unlocked && "hover:scale-110",
        unlocked && "shadow-[0_0_15px_rgba(0,212,255,0.2)]"
      )}>
        {icon || (
          <span className={cn(
            "font-display font-bold text-lg",
            unlocked ? colors.color : "text-muted-foreground"
          )}>
            {name.substring(0, 2).toUpperCase()}
          </span>
        )}
        {!unlocked && (
          <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <span className={cn(
          "text-xs font-medium block",
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </span>
        {level !== undefined && (
          <span className={cn(
            "text-xs",
            unlocked ? colors.color : "text-muted-foreground"
          )}>
            Nv. {level}
          </span>
        )}
      </div>
    </button>
  )
}

// =============================================================================
// LEVEL BADGE
// =============================================================================
interface LevelBadgeProps {
  level: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  }
  
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold",
      "shadow-[0_0_15px_rgba(0,212,255,0.4)]",
      sizeClasses[size],
      className
    )}>
      {level}
    </div>
  )
}

// =============================================================================
// AVATAR WITH FRAME
// =============================================================================
interface GamingAvatarProps {
  src?: string
  alt?: string
  fallback: string
  size?: "sm" | "md" | "lg" | "xl"
  frame?: "none" | "cyan" | "magenta" | "gold" | "legendary"
  className?: string
}

export function GamingAvatar({ 
  src, 
  alt, 
  fallback, 
  size = "md", 
  frame = "cyan",
  className 
}: GamingAvatarProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-3xl",
  }
  
  const frameClasses = {
    none: "border-transparent",
    cyan: "border-primary shadow-[0_0_15px_rgba(0,212,255,0.4)]",
    magenta: "border-secondary shadow-[0_0_15px_rgba(233,48,255,0.4)]",
    gold: "border-warning shadow-[0_0_15px_rgba(240,180,41,0.4)]",
    legendary: "border-warning shadow-[0_0_20px_rgba(240,180,41,0.6)] ring-2 ring-warning/30",
  }
  
  return (
    <div className={cn(
      "rounded-full border-2 overflow-hidden bg-muted flex items-center justify-center",
      sizeClasses[size],
      frameClasses[frame],
      className
    )}>
      {src ? (
        <img src={src || "/placeholder.svg"} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-display font-bold text-muted-foreground">{fallback}</span>
      )}
    </div>
  )
}

// =============================================================================
// NAVIGATION TAB (Gaming Style)
// =============================================================================
interface NavTabProps {
  children: React.ReactNode
  active?: boolean
  icon?: React.ReactNode
  badge?: number
  onClick?: () => void
  className?: string
}

export function NavTab({ children, active = false, icon, badge, onClick, className }: NavTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
        active 
          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
    >
      {icon}
      {children}
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold",
          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}>
          {badge}
        </span>
      )}
    </button>
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

export function HUDPanel({ title, children, action, className }: HUDPanelProps) {
  return (
    <div className={cn(
      "relative rounded-xl border border-border bg-card overflow-hidden",
      className
    )}>
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  )
}

// =============================================================================
// CHARACTER SELECT CARD
// =============================================================================
interface CharacterSelectProps {
  name: string
  icon: React.ReactNode
  selected?: boolean
  color?: "cyan" | "magenta" | "yellow" | "green"
  onClick?: () => void
  className?: string
}

export function CharacterSelect({ 
  name, 
  icon, 
  selected = false, 
  color = "cyan",
  onClick,
  className 
}: CharacterSelectProps) {
  const colorClasses = {
    cyan: selected ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,212,255,0.3)]" : "border-border hover:border-primary/50",
    magenta: selected ? "border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(233,48,255,0.3)]" : "border-border hover:border-secondary/50",
    yellow: selected ? "border-warning bg-warning/10 shadow-[0_0_20px_rgba(240,180,41,0.3)]" : "border-border hover:border-warning/50",
    green: selected ? "border-success bg-success/10 shadow-[0_0_20px_rgba(63,185,80,0.3)]" : "border-border hover:border-success/50",
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 bg-card",
        colorClasses[color],
        className
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
        selected ? "scale-110" : ""
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-sm font-medium",
        selected ? "text-foreground" : "text-muted-foreground"
      )}>
        {name}
      </span>
    </button>
  )
}

// =============================================================================
// STAT BOX (Small stat display)
// =============================================================================
interface StatBoxProps {
  value: string | number
  label: string
  color?: "cyan" | "magenta" | "green" | "yellow" | "purple"
  size?: "sm" | "md"
  className?: string
}

export function StatBox({ value, label, color = "cyan", size = "md", className }: StatBoxProps) {
  const colors = colorMap[color]
  const sizeClasses = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
  }
  const valueSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
  }
  
  return (
    <div className={cn(
      "rounded-lg border bg-card text-center",
      colors.border,
      sizeClasses[size],
      className
    )}>
      <span className={cn("font-display font-bold block", colors.text, valueSizeClasses[size])}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}

// =============================================================================
// GAMING BADGE (Small colored badge)
// =============================================================================
interface GamingBadgeProps {
  children: React.ReactNode
  color?: "cyan" | "magenta" | "green" | "yellow" | "purple" | "gray"
  className?: string
}

export function GamingBadge({ children, color = "cyan", className }: GamingBadgeProps) {
  const colorClasses = {
    cyan: "bg-primary/20 text-primary border-primary/30",
    magenta: "bg-secondary/20 text-secondary border-secondary/30",
    green: "bg-success/20 text-success border-success/30",
    yellow: "bg-warning/20 text-warning border-warning/30",
    purple: "bg-accent/20 text-accent border-accent/30",
    gray: "bg-muted text-muted-foreground border-border",
  }
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
      colorClasses[color],
      className
    )}>
      {children}
    </span>
  )
}

// =============================================================================
// CATEGORY PILL (Filter pill button)
// =============================================================================
interface CategoryPillProps {
  children: React.ReactNode
  active?: boolean
  color?: "cyan" | "magenta" | "green" | "yellow" | "purple"
  onClick?: () => void
  className?: string
}

export function CategoryPill({ children, active = false, color = "cyan", onClick, className }: CategoryPillProps) {
  const activeColors = {
    cyan: "bg-primary text-primary-foreground border-primary",
    magenta: "bg-secondary text-secondary-foreground border-secondary",
    green: "bg-success text-success-foreground border-success",
    yellow: "bg-warning text-warning-foreground border-warning",
    purple: "bg-accent text-accent-foreground border-accent",
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
        active 
          ? activeColors[color]
          : "bg-card text-muted-foreground border-border hover:border-border-hover hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

// =============================================================================
// NAV ITEM (Sidebar navigation)
// =============================================================================
interface NavItemProps {
  children: React.ReactNode
  icon?: React.ReactNode
  active?: boolean
  badge?: number
  href?: string
  onClick?: () => void
  className?: string
}

export function NavItem({ children, icon, active = false, badge, href, onClick, className }: NavItemProps) {
  const Component = href ? 'a' : 'button'
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      <span className="flex-1 text-left">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "px-2 py-0.5 text-xs rounded-full font-bold",
          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}>
          {badge}
        </span>
      )}
    </Component>
  )
}

// =============================================================================
// CHARACTER AVATAR (For login class selection)
// =============================================================================
interface CharacterAvatarProps {
  type: "developer" | "designer" | "wizard" | "warrior" | "student"
  selected?: boolean
  onClick?: () => void
  className?: string
}

const characterData = {
  developer: { label: "Developer", color: "cyan" as const },
  designer: { label: "Designer", color: "magenta" as const },
  wizard: { label: "Wizard", color: "purple" as const },
  warrior: { label: "Warrior", color: "yellow" as const },
  student: { label: "Student", color: "green" as const },
}

export function CharacterAvatar({ type, selected = false, onClick, className }: CharacterAvatarProps) {
  const data = characterData[type]
  const colorClasses = {
    cyan: selected ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,212,255,0.3)]" : "border-border hover:border-primary/50",
    magenta: selected ? "border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(233,48,255,0.3)]" : "border-border hover:border-secondary/50",
    yellow: selected ? "border-warning bg-warning/10 shadow-[0_0_20px_rgba(240,180,41,0.3)]" : "border-border hover:border-warning/50",
    green: selected ? "border-success bg-success/10 shadow-[0_0_20px_rgba(63,185,80,0.3)]" : "border-border hover:border-success/50",
    purple: selected ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "border-border hover:border-accent/50",
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 bg-card",
        colorClasses[data.color],
        className
      )}
    >
      <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center">
        <span className="text-2xl">{type === "developer" ? "D" : type === "designer" ? "De" : type === "wizard" ? "W" : type === "warrior" ? "Wa" : "S"}</span>
      </div>
      <span className={cn(
        "text-xs font-medium",
        selected ? "text-foreground" : "text-muted-foreground"
      )}>
        {data.label}
      </span>
    </button>
  )
}
