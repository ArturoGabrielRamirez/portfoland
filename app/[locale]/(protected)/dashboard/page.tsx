// =============================================================================
// Dashboard Page
// =============================================================================
// Main dashboard page with gamified UI showing user stats, XP progress,
// quick actions, recent achievements, and activity feed. Uses the dark gaming
// aesthetic with cyan/magenta/purple accents.
// =============================================================================

import { headers } from 'next/headers'
import Link from 'next/link'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { auth } from '@/lib/auth'
import {
  HUDPanel,
  StatCard,
  XPBar,
  GamingAvatar,
  LevelBadge,
  GamingCard,
  GamingBadge,
} from '@/features/gaming'
import type { DashboardPageProps } from '@/features/dashboard/types/dashboard'

// =============================================================================
// Icons
// =============================================================================

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  )
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generates user initials from their name.
 * Falls back to email first character if no name is available.
 */
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email[0].toUpperCase()
}

/**
 * Gets the display name for the user.
 * Falls back to email username if no name is set.
 */
function getDisplayName(name: string | null, email: string): string {
  if (name) {
    return name.split(' ')[0]
  }
  return email.split('@')[0]
}

/**
 * Calculates account completion percentage based on profile data.
 */
function calculateProfileCompletion(user: {
  name?: string | null
  image?: string | null
  email: string
}): number {
  let completed = 0
  const total = 5 // Total checkpoints

  // Basic account created = 20%
  completed += 1

  // Has name = 20%
  if (user.name && user.name.trim().length > 0) {
    completed += 1
  }

  // Has profile image = 20%
  if (user.image) {
    completed += 1
  }

  // Placeholder for skills = 20% (not implemented yet)
  // Placeholder for timeline = 20% (not implemented yet)

  return Math.round((completed / total) * 100)
}

// =============================================================================
// Profile Completion Component
// =============================================================================

interface ProfileCompletionProps {
  percentage: number
  title: string
  subtitle: string
}

function ProfileCompletion({
  percentage,
  title,
  subtitle,
}: ProfileCompletionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-[#64748B]">{subtitle}</p>
        </div>
        <span className="text-lg font-bold text-[#00D4FF]">{percentage}%</span>
      </div>
      <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00D4FF] to-[#22C55E] rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
          }}
        />
      </div>
      <div className="flex items-center gap-4 text-xs text-[#64748B]">
        <div className="flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3 text-[#22C55E]" />
          <span>Account</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircleIcon
            className={`h-3 w-3 ${percentage >= 40 ? 'text-[#22C55E]' : 'text-[#334155]'}`}
          />
          <span>Profile</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircleIcon
            className={`h-3 w-3 ${percentage >= 60 ? 'text-[#22C55E]' : 'text-[#334155]'}`}
          />
          <span>Avatar</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3 text-[#334155]" />
          <span>Skills</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3 text-[#334155]" />
          <span>Timeline</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Feature Card Component
// =============================================================================

interface FeatureCardProps {
  title: string
  description: string
  version: string
  icon: React.ReactNode
  color: 'cyan' | 'magenta' | 'green'
}

function FeatureCard({
  title,
  description,
  version,
  icon,
  color,
}: FeatureCardProps) {
  const colorStyles = {
    cyan: {
      border: 'border-[#00D4FF]/30',
      iconBg: 'bg-[#00D4FF]/20',
      iconColor: 'text-[#00D4FF]',
      glow: 'hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]',
      badge: 'cyan' as const,
    },
    magenta: {
      border: 'border-[#D946EF]/30',
      iconBg: 'bg-[#D946EF]/20',
      iconColor: 'text-[#D946EF]',
      glow: 'hover:shadow-[0_0_20px_rgba(217,70,239,0.15)]',
      badge: 'magenta' as const,
    },
    green: {
      border: 'border-[#22C55E]/30',
      iconBg: 'bg-[#22C55E]/20',
      iconColor: 'text-[#22C55E]',
      glow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
      badge: 'green' as const,
    },
  }

  const styles = colorStyles[color]

  return (
    <GamingCard
      variant="default"
      className={`relative p-5 transition-all ${styles.border} ${styles.glow}`}
    >
      {/* Coming Soon Badge */}
      <div className="absolute top-3 right-3">
        <GamingBadge color={styles.badge}>{version}</GamingBadge>
      </div>

      {/* Icon */}
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg}`}
      >
        <div className={styles.iconColor}>{icon}</div>
      </div>

      {/* Content */}
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>

      {/* Locked Overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#0A0E1A]/60 opacity-0 hover:opacity-100 transition-opacity">
        <div className="text-center">
          <svg
            className="mx-auto h-8 w-8 text-[#64748B] mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm font-medium text-[#94A3B8]">
            Coming Soon
          </span>
        </div>
      </div>
    </GamingCard>
  )
}

// =============================================================================
// Page Component
// =============================================================================

/**
 * Dashboard page with gamified UI.
 *
 * Displays:
 * - Welcome message with user avatar
 * - Stats row (XP, achievements, skills, views)
 * - Level progress bar
 * - Profile completion indicator
 * - Feature cards (Coming Soon)
 * - Quick action cards
 *
 * Uses Server Component for data fetching.
 * Session data is available from the protected layout.
 */
export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  // Get translations
  const t = await getTranslations('dashboard')

  // Get session from the protected layout (already validated)
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // User should be authenticated (protected layout validates this)
  const user = session?.user
  if (!user) {
    return null
  }

  // User display data
  const displayName = getDisplayName(user.name ?? null, user.email)
  const initials = getInitials(user.name ?? null, user.email)
  const profileCompletion = calculateProfileCompletion({
    name: user.name,
    image: user.image,
    email: user.email,
  })

  // Mock user stats (will be replaced with real data later)
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
    <div className="space-y-6">
      {/* Welcome Header with Avatar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* User Avatar with Level Badge */}
          <div className="relative">
            <GamingAvatar
              src={user.image ?? undefined}
              alt={user.name ?? user.email}
              fallback={initials}
              size="lg"
              frame="cyan"
            />
            {/* Level badge overlay */}
            <div className="absolute -bottom-1 -right-1">
              <LevelBadge level={userStats.level} size="sm" />
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {t('welcome', { name: displayName })}
            </h1>
            <p className="mt-1 text-[#94A3B8]">{t('welcomeSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          value={userStats.xp.toLocaleString()}
          label={t('gaming.stats.experience')}
          color="yellow"
          icon={<BoltIcon className="h-5 w-5" />}
        />
        <StatCard
          value={`${userStats.achievements.unlocked}/${userStats.achievements.total}`}
          label={t('gaming.stats.achievements')}
          color="magenta"
          icon={<TrophyIcon className="h-5 w-5" />}
        />
        <StatCard
          value={userStats.skills.toString()}
          label={t('gaming.stats.skills')}
          color="cyan"
          icon={<LightbulbIcon className="h-5 w-5" />}
        />
        <StatCard
          value={userStats.views.toLocaleString()}
          label={t('gaming.stats.views')}
          color="green"
          icon={<ChartIcon className="h-5 w-5" />}
        />
      </div>

      {/* Level Progress */}
      <HUDPanel
        title={t('gaming.levelProgress', { level: userStats.level + 1 })}
        className="relative overflow-hidden"
      >
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-[#94A3B8]">
              {t('gaming.currentLevel')}
            </span>
            <LevelBadge level={userStats.level} size="md" />
          </div>
          <div className="flex-1">
            <XPBar
              current={userStats.xp}
              max={userStats.maxXp}
              level={userStats.level}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-[#94A3B8]">
          {t('gaming.xpRemaining', { xp: xpRemaining, percent: xpPercent })}
        </p>
      </HUDPanel>

      {/* Profile Completion */}
      <HUDPanel title={t('progress.title')} className="relative overflow-hidden">
        <ProfileCompletion
          percentage={profileCompletion}
          title={t('progress.percentage', { percent: profileCompletion })}
          subtitle={t('progress.completeProfile')}
        />
      </HUDPanel>

      {/* Feature Cards - Coming Soon */}
      <HUDPanel title={t('features.title')} className="relative overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title={t('features.timeline.title')}
            description={t('features.timeline.description')}
            version={t('features.timeline.comingSoon')}
            icon={<ClockIcon className="h-6 w-6" />}
            color="cyan"
          />
          <FeatureCard
            title={t('features.portfolio.title')}
            description={t('features.portfolio.description')}
            version={t('features.portfolio.comingSoon')}
            icon={<BriefcaseIcon className="h-6 w-6" />}
            color="magenta"
          />
          <FeatureCard
            title={t('features.aiAssistant.title')}
            description={t('features.aiAssistant.description')}
            version={t('features.aiAssistant.comingSoon')}
            icon={<SparklesIcon className="h-6 w-6" />}
            color="green"
          />
        </div>
      </HUDPanel>

      {/* Quick Actions */}
      <HUDPanel title={t('gaming.quickActions.title')}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href={`/${locale}/dashboard/timeline`}>
            <GamingCard
              variant="default"
              className="group cursor-pointer p-4 text-center transition-all hover:border-[#00D4FF]/50"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D4FF]/20 transition-transform group-hover:scale-110">
                <PlusIcon className="h-5 w-5 text-[#00D4FF]" />
              </div>
              <span className="text-sm font-medium text-white">
                {t('gaming.quickActions.addExperience')}
              </span>
              <p className="mt-1 text-xs text-[#64748B]">
                {t('gaming.quickActions.addExperienceDesc')}
              </p>
            </GamingCard>
          </Link>

          <Link href={`/${locale}/dashboard/skill-tree`}>
            <GamingCard
              variant="default"
              className="group cursor-pointer p-4 text-center transition-all hover:border-[#D946EF]/50"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D946EF]/20 transition-transform group-hover:scale-110">
                <EditIcon className="h-5 w-5 text-[#D946EF]" />
              </div>
              <span className="text-sm font-medium text-white">
                {t('gaming.quickActions.editSkills')}
              </span>
              <p className="mt-1 text-xs text-[#64748B]">
                {t('gaming.quickActions.editSkillsDesc')}
              </p>
            </GamingCard>
          </Link>

          <Link href={`/${locale}/dashboard/my-cv`}>
            <GamingCard
              variant="default"
              className="group cursor-pointer p-4 text-center transition-all hover:border-[#22C55E]/50"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/20 transition-transform group-hover:scale-110">
                <DownloadIcon className="h-5 w-5 text-[#22C55E]" />
              </div>
              <span className="text-sm font-medium text-white">
                {t('gaming.quickActions.generateCV')}
              </span>
              <p className="mt-1 text-xs text-[#64748B]">
                {t('gaming.quickActions.generateCVDesc')}
              </p>
            </GamingCard>
          </Link>

          <Link href={`/${locale}/portfolio/${user.id}`}>
            <GamingCard
              variant="default"
              className="group cursor-pointer p-4 text-center transition-all hover:border-[#EAB308]/50"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAB308]/20 transition-transform group-hover:scale-110">
                <ShareIcon className="h-5 w-5 text-[#EAB308]" />
              </div>
              <span className="text-sm font-medium text-white">
                {t('gaming.quickActions.sharePortfolio')}
              </span>
              <p className="mt-1 text-xs text-[#64748B]">
                {t('gaming.quickActions.sharePortfolioDesc')}
              </p>
            </GamingCard>
          </Link>
        </div>
      </HUDPanel>
    </div>
  )
}
