"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Clock, GitBranch, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PortfolioModeToggle } from '@/features/portfolio/components/PortfolioModeToggle'
import { LanguageSwitcher } from '@/features/i18n'
import { UserMenu } from '@/features/dashboard/components/UserMenu'
import type { PortfolioMode } from '@/features/portfolio/types/portfolio'

interface DashboardNavProps {
  locale: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    portfolioMode: PortfolioMode
  }
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/timeline', label: 'Timeline', icon: Clock, exact: false },
  { href: '/dashboard/skills', label: 'Skills', icon: GitBranch, exact: false },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen, exact: false },
]

export function DashboardNav({ locale, user }: DashboardNavProps) {
  const pathname = usePathname()

  // Remove locale prefix for matching: /en/dashboard → /dashboard
  const cleanPathname = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/')

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)]">
      {/* Left side - Logo and Navigation */}
      <div className="flex items-center gap-6">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 100 100">
            <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.3" stroke="hsl(174,100%,50%)" strokeWidth="2" />
            <text x="50" y="62" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="40" fontWeight="bold" fontFamily="monospace">P</text>
          </svg>
          <span className="font-mono font-bold text-foreground tracking-wider">Portfoland</span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? cleanPathname === item.href
              : cleanPathname === item.href || cleanPathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-300",
                  isActive
                    ? "bg-[#00D4FF] text-[#0A0E1A] font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] clip-hex-tab"
                    : "text-[#64748B] hover:text-[#E2E8F0]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right side - Controls and User */}
      <div className="flex items-center gap-3">
        <PortfolioModeToggle currentMode={user.portfolioMode} />
        <LanguageSwitcher isAuthenticated={true} />

        {/* Online Status */}
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-[hsl(150,100%,45%)]">
          <span className="w-1.5 h-1.5 bg-[hsl(150,100%,45%)] rounded-full animate-pulse" />
          ONLINE
        </span>

        {/* Single User Menu (hexagonal avatar integrated) */}
        <UserMenu user={user} locale={locale} />
      </div>
    </div>
  )
}
