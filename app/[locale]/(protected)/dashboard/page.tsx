// =============================================================================
// Dashboard Page - Cyberpunk V2
// =============================================================================
// Main dashboard following the cyberpunk design system with hexagonal stat cards,
// CRT monitor, goals tracking, and activity feed. All monospace, sharp edges.
// =============================================================================

import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'
import { Zap, TrendingUp, Star, Trophy, Target, Briefcase, Award, BookOpen, GitBranch, MapPin, Clock, User } from 'lucide-react'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  WelcomeCard,
  CRTMonitor,
  HexBadge,
  DashboardNav,
} from '@/features/tech'
import type { DashboardPageProps } from '@/features/dashboard/types/dashboard'

// =============================================================================
// Helper Functions
// =============================================================================

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

function getDisplayName(name: string | null, email: string): string {
  if (name) {
    return name.split(' ')[0]
  }
  return email.split('@')[0]
}

// =============================================================================
// Mock Data (will be replaced with real data)
// =============================================================================

const stats = [
  { value: "2,450", label: "TOTAL XP", color: "cyan" as const, icon: <Zap className="w-5 h-5" />, sub: "+150 this week" },
  { value: "18", label: "CURRENT LEVEL", color: "yellow" as const, icon: <TrendingUp className="w-5 h-5" />, sub: "Explorer rank" },
  { value: "7", label: "EXPERIENCES", color: "green" as const, icon: <Star className="w-5 h-5" />, sub: "2 active" },
  { value: "18/42", label: "ACHIEVEMENTS", color: "magenta" as const, icon: <Trophy className="w-5 h-5" />, sub: "43% unlocked" },
]

const goals = [
  { title: "Reach Level 20", desc: "Unlock Advanced Portfolio features", pct: 90, current: "18/20 levels", color: "hsl(174,100%,50%)" },
  { title: "Complete 5 Certifications", desc: "Earn the Certified Pro badge", pct: 60, current: "3/5 certs", color: "hsl(60,100%,50%)" },
  { title: "Master 5 Skills", desc: "Reach max XP in 5 skill nodes", pct: 60, current: "3/5 skills", color: "hsl(330,100%,65%)" },
]

const activities = [
  { icon: Briefcase, text: "Added Senior Developer experience", time: "2 hours ago", xp: "+200 XP", color: "cyan" as const },
  { icon: Award, text: "Earned 'First Certification' badge", time: "1 day ago", xp: "+100 XP", color: "yellow" as const },
  { icon: BookOpen, text: "Completed React Advanced course", time: "3 days ago", xp: "+150 XP", color: "magenta" as const },
  { icon: GitBranch, text: "TypeScript skill reached Lv.4", time: "5 days ago", xp: "+50 XP", color: "green" as const },
  { icon: MapPin, text: "Updated location: Buenos Aires", time: "1 week ago", xp: "+10 XP", color: "cyan" as const },
]

// =============================================================================
// Page Component
// =============================================================================

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user
  if (!user) {
    return null
  }

  // Fetch user with image and portfolioMode from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      portfolioMode: true,
    },
  })

  const userData = {
    id: user.id,
    name: dbUser?.name ?? user.name ?? 'User',
    email: dbUser?.email ?? user.email,
    image: dbUser?.image ?? user.image ?? null,
    portfolioMode: (dbUser?.portfolioMode ?? 'classic') as 'classic' | 'tech',
  }

  const displayName = getDisplayName(userData.name, userData.email)
  const initials = getInitials(userData.name, userData.email)

  // Mock user stats
  const userStats = {
    currentXP: 1900,
    maxXP: 2450,
    level: 18,
    streakDays: 12,
  }

  // Quick Actions with functional links
  const quickActions = [
    { icon: "Briefcase", label: "Timeline", color: "hsl(174,100%,50%)", href: `/${locale}/dashboard/timeline` },
    { icon: "Clock", label: "Projects", color: "hsl(60,100%,50%)", href: `/${locale}/dashboard/projects` },
    { icon: "GitBranch", label: "Skills", color: "hsl(330,100%,65%)", href: `/${locale}/dashboard/skills` },
    { icon: "User", label: "Portfolio", color: "hsl(150,100%,45%)", href: `/${locale}/dashboard/portfolio` },
  ]

  return (
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      {/* Main Navigation */}
      <DashboardNav locale={locale} user={userData} />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome + CRT Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 mb-6">
          <WelcomeCard
            userName={displayName}
            userInitial={initials}
            userImage={userData.image}
            level={userStats.level}
            currentXP={userStats.currentXP}
            maxXP={userStats.maxXP}
            streakDays={userStats.streakDays}
            quickActions={quickActions}
          />
          <CRTMonitor className="min-h-[220px]" />
        </div>

        {/* Stats Row - Hex styled */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="relative border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-4 overflow-hidden group hover:border-[hsl(174,100%,50%,0.3)] transition-colors">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[hsl(174,100%,50%,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3">
                <HexBadge color={stat.color} size="lg" filled>
                  {stat.icon}
                </HexBadge>
                <div>
                  <div className={`text-2xl font-mono font-bold ${
                    stat.color === "cyan" ? "text-[hsl(174,100%,50%)]" :
                    stat.color === "yellow" ? "text-[hsl(60,100%,50%)]" :
                    stat.color === "green" ? "text-[hsl(150,100%,45%)]" :
                    "text-[hsl(330,100%,65%)]"
                  }`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</div>
                  <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{stat.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Goals + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[hsl(174,100%,50%)]" />
                <h3 className="font-mono font-bold text-sm text-foreground">Current Goals</h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">3 active</span>
            </div>
            <div className="flex flex-col gap-3">
              {goals.map((goal) => (
                <div key={goal.title} className="border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,8%)] p-4 group hover:border-[hsl(174,100%,50%,0.25)] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Hex percentage badge */}
                    <div className="relative flex-shrink-0">
                      <svg width="44" height="44" viewBox="0 0 100 100">
                        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="transparent" stroke={goal.color} strokeWidth="2" strokeOpacity="0.3" />
                        <clipPath id={`goal-${goal.title.replace(/\s+/g, '-')}`}>
                          <rect x="0" y={100 - goal.pct} width="100" height={goal.pct} />
                        </clipPath>
                        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill={goal.color} fillOpacity="0.2" clipPath={`url(#goal-${goal.title.replace(/\s+/g, '-')})`} />
                        <text x="50" y="58" textAnchor="middle" fill={goal.color} fontSize="24" fontFamily="monospace" fontWeight="bold">
                          {goal.pct}%
                        </text>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-mono font-bold text-foreground">{goal.title}</h4>
                      <p className="text-[10px] font-mono text-muted-foreground">{goal.desc}</p>
                      <div className="mt-2 h-1.5 bg-[hsl(200,20%,13%)] overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }}>
                        <div className="h-full transition-all duration-1000" style={{ width: `${goal.pct}%`, backgroundColor: goal.color, boxShadow: `0 0 8px ${goal.color}` }} />
                      </div>
                      <p className="text-[9px] font-mono text-muted-foreground mt-1 text-right">{goal.current}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[hsl(60,100%,50%)]" />
                <h3 className="font-mono font-bold text-sm text-foreground">Recent Activity</h3>
              </div>
              <span className="text-[10px] font-mono text-[hsl(174,100%,50%)] cursor-pointer hover:underline">VIEW ALL</span>
            </div>
            <div className="border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,8%)]">
              {activities.map((act, i) => {
                const Icon = act.icon
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 hover:bg-[hsl(200,20%,10%)] transition-colors ${i !== activities.length - 1 ? "border-b border-[hsl(174,100%,50%,0.08)]" : ""}`}>
                    <HexBadge color={act.color} size="sm">
                      <Icon className="w-3.5 h-3.5" />
                    </HexBadge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-foreground truncate">{act.text}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">{act.time}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${
                      act.color === "cyan" ? "text-[hsl(174,100%,50%)]" :
                      act.color === "yellow" ? "text-[hsl(60,100%,50%)]" :
                      act.color === "magenta" ? "text-[hsl(330,100%,65%)]" :
                      "text-[hsl(150,100%,45%)]"
                    }`}>
                      {act.xp}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
