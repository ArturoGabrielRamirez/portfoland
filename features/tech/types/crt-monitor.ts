import { ReactNode } from "react"

export interface CRTLine {
  text: string
  color: "cyan" | "green" | "yellow" | "magenta" | "white"
  prefix?: string
}

export interface CRTMonitorProps {
  className?: string
  lines?: CRTLine[]
  title?: string
  statusText?: string
  children?: ReactNode
}
