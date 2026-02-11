// =============================================================================
// Dashboard Header Component
// =============================================================================
// Server component for the dashboard header. Contains logo, navigation,
// and user menu. Uses dark gamer aesthetic with cyan/magenta/purple accents.
// =============================================================================

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import type { DashboardHeaderProps } from '../types/dashboard'
import { UserMenu } from './UserMenu'
import { LanguageSwitcher } from '@/features/i18n'
import { PortfolioModeToggle } from '@/features/portfolio/components/PortfolioModeToggle'

// =============================================================================
// Component
// =============================================================================

/**
 * Dashboard header with navigation and user controls.
 *
 * Displays:
 * - Application logo linking to dashboard
 * - Navigation links (Dashboard, Timeline, Skill Tree)
 * - Portfolio mode toggle (professional/gaming)
 * - Language switcher for locale selection
 * - User menu with avatar and actions
 */
export async function DashboardHeader({ user, locale }: DashboardHeaderProps) {
  const tCommon = await getTranslations('common')
  const tNav = await getTranslations('navigation')

  // Navigation items
  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: tCommon('dashboard'),
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/timeline`,
      label: tCommon('timeline'),
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/skills`,
      label: tNav('skillTree'),
      icon: (
        // Sparkles icon for skill tree
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/projects`,
      label: tNav('projects'),
      icon: (
        // FolderOpen icon for projects
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
        </svg>
      ),
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#334155]/50 bg-[#0A0F1A]/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80"
          >
            {/* Logo icon with gradient */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6]">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="hidden sm:inline">{tCommon('appName')}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 rounded-lg transition-colors hover:bg-[#1E293B] hover:text-white"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center gap-3">
          {/* Portfolio mode toggle */}
          <PortfolioModeToggle currentMode={user.portfolioMode} />

          {/* Language switcher */}
          <LanguageSwitcher isAuthenticated={true} />

          {/* User menu */}
          <UserMenu user={user} locale={locale} />
        </div>
      </div>
    </header>
  )
}
