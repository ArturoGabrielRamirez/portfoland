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
  XPBar,
  LevelBadge,
  GamingCard,
} from '@/features/gaming'
import { ConsolePanelCard, HexagonAvatar, HexagonStatCard, AnimatedSection, CyberpunkScreen, GiantFlipCard, CRTScanLine, HexagonFeatureCard, CyberpunkGlow, CyberpunkTooltip, CyberpunkLightStrip, CyberpunkSpotlight, CleanQuickAccess } from '@/features/dashboard/components'
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

function LevelIcon({ className }: { className?: string }) {
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
    <div 
      className="min-h-screen w-full overflow-hidden bg-black"
      style={{
        background: 'radial-gradient(ellipse at center, #0A0F1A 0%, #000000 100%)',
      }}
    >
      {/* Main Dashboard Frame */}
      <div className="min-h-screen p-6 space-y-32 max-w-7xl mx-auto">
        
        {/* ROW 1: Welcome + Cyberpunk Screen - Flex Row */}
        <div className="flex flex-row gap-8 h-48">
          
          {/* Welcome Section - Left Side */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-4 h-full">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <HexagonAvatar
                  src={user.image ?? undefined}
                  alt={user.name ?? user.email}
                  fallback={initials}
                  size="lg"
                  level={userStats.level}
                  color="#00D4FF"
                />
              </div>
              
              {/* Welcome Text + Quick Access */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-lg font-bold text-white bg-gradient-to-r from-[#00D4FF] to-[#D946EF] bg-clip-text text-transparent mb-1">
                  {t('welcome', { name: displayName })}
                </h1>
                <p className="text-sm text-[#94A3B8] mb-2 truncate">{t('welcomeSubtitle')}</p>
                
                 {/* Clean Quick Access with Simple Tooltips */}
                 <CleanQuickAccess locale={locale} userId={user.id} />
              </div>
            </div>
          </div>
          
          {/* Cyberpunk Screen - Right Side */}
          <div className="flex-1">
            <HUDPanel className="h-full p-0">
              <CyberpunkScreen 
                stats={userStats}
                className="h-full"
              />
            </HUDPanel>
          </div>
        </div>

        {/* CRT Scan Separator between ROW 1 and ROW 2 */}
        <CRTScanLine color="cyan" intensity="medium" speed="medium" />

        {/* ROW 2: 3 Giant Flip Cards */}
        <div className="grid grid-cols-12 gap-12 h-[22rem]">
          {/* Giant Card 1 - Level Progress */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <CyberpunkGlow color="yellow" intensity="medium">
              <GiantFlipCard
                title="Level Progress"
                description={`Level ${userStats.level} • ${xpPercent}% Complete`}
                version={`${xpRemaining} XP to go`}
                icon={<BoltIcon className="h-8 w-8" />}
                color="yellow"
                stats={{
                  current: userStats.level,
                  total: 50,
                  progress: xpPercent
                }}
              />
            </CyberpunkGlow>
          </div>

          {/* Giant Card 2 - Achievements */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <CyberpunkGlow color="magenta" intensity="medium">
              <GiantFlipCard
                title="Achievements"
                description={`${userStats.achievements.unlocked} of ${userStats.achievements.total} unlocked`}
                version={`${Math.round((userStats.achievements.unlocked / userStats.achievements.total) * 100)}% Complete`}
                icon={<TrophyIcon className="h-8 w-8" />}
                color="magenta"
                stats={{
                  current: userStats.achievements.unlocked,
                  total: userStats.achievements.total,
                  progress: Math.round((userStats.achievements.unlocked / userStats.achievements.total) * 100)
                }}
              />
            </CyberpunkGlow>
          </div>

          {/* Giant Card 3 - Profile Stats */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <CyberpunkGlow color="cyan" intensity="medium">
              <GiantFlipCard
                title="Profile Status"
                description={`${profileCompletion}% Complete`}
                version="Keep Building"
                icon={<CheckCircleIcon className="h-8 w-8" />}
                color="cyan"
                stats={{
                  current: profileCompletion,
                  total: 100,
                  progress: profileCompletion
                }}
              />
            </CyberpunkGlow>
          </div>
        </div>

        {/* CRT Scan Separator between ROW 2 and ROW 3 */}
        <CRTScanLine color="magenta" intensity="subtle" speed="slow" />

        {/* ROW 3: 3 Feature Cards (Timeline, Skills, Portfolio) */}
        <div className="grid grid-cols-12 gap-8 h-[22rem]">
          {/* Timeline Feature */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <HexagonFeatureCard
              title="Timeline"
              description="Build your professional journey"
              status="ACTIVE NOW"
              color="cyan"
              href={`/${locale}/dashboard/timeline`}
              icon={<ClockIcon className="h-6 w-6" />}
            />
          </div>

          {/* Skills Feature */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <HexagonFeatureCard
              title="Skills"
              description="Showcase your expertise"
              status="EXPLORE NOW"
              color="magenta"
              href={`/${locale}/dashboard/skills`}
              icon={<LightbulbIcon className="h-6 w-6" />}
            />
          </div>

          {/* Portfolio Feature */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <HexagonFeatureCard
              title="Portfolio"
              description="Share your work with world"
              status="VIEW NOW"
              color="green"
              href={`/${locale}/portfolio/${user.id}`}
              icon={<BriefcaseIcon className="h-6 w-6" />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
