import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

export interface WelcomeCardProps {
  userName: string
  userInitial: string
  userImage?: string | null
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  quickActions?: QuickAction[]
  translations?: {
    welcomeTitle: string
    welcomeSubtitle: string
    streak: string
    quickActionsTitle: string
    xpToLevel: string
  }
  className?: string
}

export interface QuickAction {
  icon: string  // Icon name instead of component
  label: string
  color: string
  onClick?: () => void
  href?: string
}

export interface DashboardStat {
  value: string | number
  label: string
  color: "cyan" | "magenta" | "yellow" | "green"
  icon: ReactNode
  subtitle: string
}
