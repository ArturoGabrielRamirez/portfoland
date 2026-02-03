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

// =============================================================================
// Component
// =============================================================================

/**
 * Dashboard header with navigation and user controls.
 *
 * Displays:
 * - Application logo linking to dashboard
 * - Navigation links (Dashboard, Timeline)
 * - Language switcher for locale selection
 * - User menu with avatar and actions
 */
export async function DashboardHeader({ user, locale }: DashboardHeaderProps) {
  const tCommon = await getTranslations('common')

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
          {/* Language switcher */}
          <LanguageSwitcher isAuthenticated={true} />

          {/* User menu */}
          <UserMenu user={user} locale={locale} />
        </div>
      </div>
    </header>
  )
}
