"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, LayoutDashboard, Clock, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
]

export function CyberpunkNav() {
  const pathname = usePathname()

  // Remove locale prefix for matching: /en/dashboard → /dashboard
  const cleanPathname = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/')

  return (
    <nav className="flex items-center justify-center gap-1 py-3 px-4">
      <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#64748B] mr-4">
        VIEW:
      </span>
      {navItems.map((item) => {
        const isActive = cleanPathname === item.href || cleanPathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-300",
              isActive
                ? "bg-[#00D4FF] text-[#0A0E1A] font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] clip-hex-tab"
                : "text-[#64748B] hover:text-[#E2E8F0]"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
