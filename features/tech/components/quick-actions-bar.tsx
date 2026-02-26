"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Briefcase, FileText, Sparkles, Eye } from "lucide-react"

interface QuickActionItem {
  icon: React.ReactNode
  label: string
  href: string
  color: string
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    icon: <Eye className="w-3.5 h-3.5" />,
    label: "Portfolio",
    href: "/dashboard/portfolio",
    color: "hsl(174,100%,50%)",
  },
  {
    icon: <Briefcase className="w-3.5 h-3.5" />,
    label: "Experiencia",
    href: "/dashboard/portfolio",
    color: "hsl(150,100%,45%)",
  },
  {
    icon: <FileText className="w-3.5 h-3.5" />,
    label: "Generar CV",
    href: "/dashboard/portfolio",
    color: "hsl(330,100%,65%)",
  },
  {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    label: "Mejorar Bio",
    href: "/dashboard/portfolio",
    color: "hsl(52,100%,50%)",
  },
]

// Small hex SVG for each action button
const MINI_HEX = "M25 2 L47 14.5 L47 39.5 L25 52 L3 39.5 L3 14.5 Z"

export function QuickActionsBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex flex-col items-center gap-0.5 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <svg
              width="42"
              height="44"
              viewBox="0 0 50 54"
              className="transition-all duration-300"
              style={{ filter: `drop-shadow(0 0 2px ${action.color}20)` }}
            >
              <path
                d={MINI_HEX}
                fill={action.color}
                fillOpacity="0.05"
                stroke={action.color}
                strokeWidth="1.2"
                strokeOpacity="0.35"
                className="group-hover:fill-opacity-15 group-hover:stroke-opacity-80 transition-all duration-300"
              />
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{ color: action.color }}
            >
              {action.icon}
            </div>
          </div>
          <span
            className="text-[7px] font-mono uppercase tracking-wider text-muted-foreground/50 group-hover:text-muted-foreground transition-colors duration-300"
          >
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
