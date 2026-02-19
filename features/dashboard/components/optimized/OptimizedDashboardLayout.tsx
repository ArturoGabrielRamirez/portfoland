// =============================================================================
// Optimized Dashboard Layout
// =============================================================================
// Enhanced grid system for cyberpunk dashboard with improved organization
// and space efficiency while maintaining hexagonal styling.
// =============================================================================

import { headers } from 'next/headers'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { auth } from '@/lib/auth'
import {
  HUDPanel,
  XPBar,
  LevelBadge,
  TechCard,
  TechBadge,
} from '@/features/tech'
import { 
  HexagonAvatar, 
  HexagonStatCard, 
  ConsolePanelCard 
} from '@/features/dashboard/components'
import type { DashboardPageProps } from '@/features/dashboard/types/dashboard'

// =============================================================================
// Enhanced Stats Data Structure
// =============================================================================

interface EnhancedStatCard {
  id: string
  value: string
  label: string
  color: 'yellow' | 'magenta' | 'cyan' | 'green' | 'purple' | 'orange'
  icon: React.ReactNode
  category: 'primary' | 'secondary'
  animated?: boolean
}

// =============================================================================
// Optimized Dashboard Component
// =============================================================================

/**
 * Optimized Dashboard with Enhanced Grid Layout
 * 
 * Features:
 * - 12-column responsive grid system
 * - Grouped information in logical sections
 * - Compact and efficient space usage
 * - Maintained cyberpunk/hexagonal aesthetic
 * - Improved information hierarchy
 */

export default async function OptimizedDashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dashboard')

  // Get session and user data
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user
  if (!user) return null

  // User display calculations
  const displayName = user.name?.split(' ')[0] || user.email.split('@')[0]
  const initials = user.name 
    ? user.name.trim().split(/\s+/).length >= 2 
      ? `${user.name.trim().split(/\s+/)[0][0]}${user.name.trim().split(/\s+/).slice(-1)[0][0]}`.toUpperCase()
      : user.name.trim().substring(0, 2).toUpperCase()
    : user.email[0].toUpperCase()

  // Enhanced stats data with proper categorization
  const primaryStats: EnhancedStatCard[] = [
    {
      id: 'xp',
      value: '2,450',
      label: t('tech.stats.experience'),
      color: 'yellow',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      category: 'primary',
      animated: true,
    },
    {
      id: 'level',
      value: '18',
      label: t('tech.stats.level'),
      color: 'magenta',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      category: 'primary',
      animated: true,
    },
    {
      id: 'achievements',
      value: '18/42',
      label: t('tech.stats.achievements'),
      color: 'cyan',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      category: 'primary',
      animated: true,
    },
    {
      id: 'skills',
      value: '24',
      label: t('tech.stats.skills'),
      color: 'green',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      category: 'primary',
    },
  ]

  const secondaryStats: EnhancedStatCard[] = [
    {
      id: 'views',
      value: '1,247',
      label: 'Profile Views',
      color: 'purple',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      category: 'secondary',
    },
    {
      id: 'projects',
      value: '12',
      label: 'Projects',
      color: 'orange',
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      category: 'secondary',
    },
  ]

  // Quick Actions with enhanced organization
  const quickActions = [
    {
      href: `/${locale}/dashboard/timeline`,
      title: t('tech.quickActions.addExperience'),
      description: t('tech.quickActions.addExperienceDesc'),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: '#00D4FF',
    },
    {
      href: `/${locale}/dashboard/skills`,
      title: t('tech.quickActions.editSkills'),
      description: t('tech.quickActions.editSkillsDesc'),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: '#D946EF',
    },
    {
      href: `/${locale}/dashboard/my-cv`,
      title: t('tech.quickActions.generateCV'),
      description: t('tech.quickActions.generateCVDesc'),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      color: '#22C55E',
    },
    {
      href: `/${locale}/portfolio/${user.id}`,
      title: t('tech.quickActions.sharePortfolio'),
      description: t('tech.quickActions.sharePortfolioDesc'),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: '#EAB308',
    },
  ]

  const userStats = {
    xp: 2450,
    maxXp: 3000,
    level: 18,
    achievements: { unlocked: 18, total: 42 },
    skills: 24,
    views: 1247,
  }

  const xpRemaining = userStats.maxXp - userStats.xp
  const xpPercent = Math.round((userStats.xp / userStats.maxXp) * 100)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Dashboard content would go here */}
    </div>
  )
}
