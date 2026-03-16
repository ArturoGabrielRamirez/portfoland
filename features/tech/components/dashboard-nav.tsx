"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Clock, GitBranch, FolderOpen, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PortfolioModeToggle } from '@/features/portfolio/components/PortfolioModeToggle'
import { LanguageSwitcher } from '@/features/i18n'
import { UserMenu } from '@/features/dashboard/components/UserMenu'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
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

export function DashboardNav({ locale, user }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { href: '/dashboard/timeline', label: t('timeline'), icon: Clock, exact: false },
    { href: '/dashboard/skills', label: t('skills'), icon: GitBranch, exact: false },
    { href: '/dashboard/projects', label: t('projects'), icon: FolderOpen, exact: false },
    { href: '/dashboard/cv', label: t('cv'), icon: FileText, exact: false },
  ]

  const cleanPathname = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/, '/')

  return (
    <>
      {/* =============================================
          DESKTOP NAV — horizontal top bar
          ============================================= */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)] bg-[hsl(200,30%,6%)]">
        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="28" height="28" viewBox="0 0 100 100">
              <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.3" stroke="hsl(174,100%,50%)" strokeWidth="2" />
              <text x="50" y="62" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="40" fontWeight="bold" fontFamily="monospace">P</text>
            </svg>
            <span className="font-mono font-bold text-foreground tracking-wider">Portfoland</span>
          </Link>

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
                      ? "bg-[hsl(174,100%,50%)] text-[#0A0E1A] font-bold shadow-[0_0_15px_hsl(174,100%,50%,0.3)] clip-hex-tab"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}

          </nav>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <PortfolioModeToggle currentMode={user.portfolioMode} />
          <LanguageSwitcher isAuthenticated={true} />
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[hsl(150,100%,45%)]">
            <span className="w-1.5 h-1.5 bg-[hsl(150,100%,45%)] rounded-full animate-pulse" />
            {t('online')}
          </span>
          <NotificationBell portfolioMode={user.portfolioMode} />
          <UserMenu user={user} locale={locale} />
        </div>
      </div>

      {/* =============================================
          MOBILE FLOATING BOTTOM TOOLBAR — hex honeycomb style
          ============================================= */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        {/* Backdrop blur pill */}
        <div
          className="flex items-center gap-1 px-3 py-2 border"
          style={{
            background: "hsl(200,30%,6%,0.92)",
            borderColor: "hsl(174,100%,50%,0.2)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 0 24px hsl(174,100%,50%,0.1), 0 8px 32px hsl(200,50%,0%,0.5)",
          }}
        >
          {/* Portfolio logo in center-left */}
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center justify-center w-10 h-10 mr-1"
          >
            <svg width="32" height="32" viewBox="0 0 100 100">
              <path
                d="M50 2 L95 26 L95 74 L50 98 L5 74 L5 26 Z"
                fill="hsl(174,100%,50%)"
                fillOpacity={cleanPathname === '/dashboard' ? 0.3 : 0.1}
                stroke="hsl(174,100%,50%)"
                strokeWidth="3"
                strokeOpacity={cleanPathname === '/dashboard' ? 1 : 0.4}
              />
              <text x="50" y="66" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="42" fontWeight="bold" fontFamily="monospace">P</text>
            </svg>
          </Link>

          {/* Nav items as hex buttons */}
          {navItems.slice(1).map((item) => {
            const isActive = 'exact' in item && item.exact
              ? cleanPathname === item.href
              : cleanPathname === item.href || cleanPathname.startsWith(item.href + '/')
            const Icon = item.icon
            const color = isActive ? "hsl(174,100%,50%)" : "hsl(200,20%,45%)"

            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="relative flex flex-col items-center justify-center"
              >
                {/* Hex SVG button */}
                <svg width="44" height="44" viewBox="0 0 100 100" className="transition-all duration-300">
                  <path
                    d="M50 2 L95 26 L95 74 L50 98 L5 74 L5 26 Z"
                    fill={isActive ? "hsl(174,100%,50%)" : "transparent"}
                    fillOpacity={isActive ? 0.15 : 0}
                    stroke={color}
                    strokeWidth="3"
                    strokeOpacity={isActive ? 0.8 : 0.3}
                    style={{
                      filter: isActive ? "drop-shadow(0 0 6px hsl(174,100%,50%))" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                </svg>
                {/* Icon over hex */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-0.5"
                  style={{ color }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[7px] font-mono uppercase tracking-wider opacity-70">
                    {item.label.substring(0, 3)}
                  </span>
                </div>

                {/* Active dot */}
                {isActive && (
                  <div
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full animate-pulse"
                    style={{ background: "hsl(174,100%,50%)", boxShadow: "0 0 4px hsl(174,100%,50%)" }}
                  />
                )}
              </Link>
            )
          })}

          {/* User avatar */}
          <div className="ml-1">
            <UserMenu user={user} locale={locale} />
          </div>
        </div>
      </div>
    </>
  )
}
