"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { GitBranch, Clock, FileText, ExternalLink } from "lucide-react"

interface QuickActionsBarProps {
  className?: string
  username?: string | null
}

// Small hex SVG for each action button
const MINI_HEX = "M25 2 L47 14.5 L47 39.5 L25 52 L3 39.5 L3 14.5 Z"

export function QuickActionsBar({ className, username }: QuickActionsBarProps) {
  const portfolioUrl = username ? `https://${username}.portfoland.com` : null

  const actions = [
    {
      icon: <GitBranch className="w-3.5 h-3.5" />,
      label: "Add Skill",
      href: "/dashboard/skills",
      color: "hsl(174,100%,50%)",
      disabled: false,
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Timeline",
      href: "/dashboard/timeline",
      color: "hsl(52,100%,50%)",
      disabled: false,
    },
    {
      icon: <FileText className="w-3.5 h-3.5" />,
      label: "Generate CV",
      href: "/dashboard/cv",
      color: "hsl(330,100%,65%)",
      disabled: false,
    },
    {
      icon: <ExternalLink className="w-3.5 h-3.5" />,
      label: "Portfolio",
      href: portfolioUrl,
      color: "hsl(150,100%,45%)",
      disabled: !portfolioUrl,
      external: true,
      tooltip: !portfolioUrl ? "Set username first" : undefined,
    },
  ]

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {actions.map((action) => {
        const inner = (
          <>
            <div className="relative">
              <svg
                width="42"
                height="44"
                viewBox="0 0 50 54"
                className="transition-all duration-300"
                style={{ filter: action.disabled ? "none" : `drop-shadow(0 0 2px ${action.color}20)` }}
              >
                <path
                  d={MINI_HEX}
                  fill={action.color}
                  fillOpacity={action.disabled ? "0.02" : "0.05"}
                  stroke={action.color}
                  strokeWidth="1.2"
                  strokeOpacity={action.disabled ? "0.15" : "0.35"}
                  className={action.disabled ? "" : "group-hover:fill-opacity-15 group-hover:stroke-opacity-80 transition-all duration-300"}
                />
              </svg>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                  action.disabled ? "opacity-20" : "opacity-60 group-hover:opacity-100"
                )}
                style={{ color: action.color }}
              >
                {action.icon}
              </div>
            </div>
            <span
              className={cn(
                "text-[7px] font-mono uppercase tracking-wider transition-colors duration-300",
                action.disabled
                  ? "text-muted-foreground/20"
                  : "text-muted-foreground/50 group-hover:text-muted-foreground"
              )}
            >
              {action.label}
            </span>
          </>
        )

        if (action.disabled) {
          return (
            <div
              key={action.label}
              title={action.tooltip}
              className="group flex flex-col items-center gap-0.5 cursor-not-allowed"
            >
              {inner}
            </div>
          )
        }

        return (
          <Link
            key={action.label}
            href={action.href!}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
            className="group flex flex-col items-center gap-0.5 transition-all duration-300 hover:scale-105"
          >
            {inner}
          </Link>
        )
      })}
    </div>
  )
}
