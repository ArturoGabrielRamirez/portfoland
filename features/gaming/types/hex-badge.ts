import { ReactNode } from "react"

export interface HexBadgeProps {
  children: ReactNode
  color?: "cyan" | "magenta" | "yellow" | "green"
  size?: "sm" | "md" | "lg" | "xl"
  filled?: boolean
  fillPercent?: number
  glowing?: boolean
  className?: string
  onClick?: () => void
}

export interface HexStatBadgeProps {
  value: string | number
  label: string
  color?: "cyan" | "magenta" | "yellow" | "green"
  icon?: ReactNode
}
