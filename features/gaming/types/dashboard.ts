import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

export interface WelcomeCardProps {
  userName: string
  userInitial: string
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  quickActions?: QuickAction[]
  className?: string
}

export interface QuickAction {
  icon: LucideIcon
  label: string
  color: string
  onClick?: () => void
}

export interface DashboardStat {
  value: string | number
  label: string
  color: "cyan" | "magenta" | "yellow" | "green"
  icon: ReactNode
  subtitle: string
}
