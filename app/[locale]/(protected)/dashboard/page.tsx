// =============================================================================
// Dashboard Page - Cyberpunk V2
// =============================================================================
// Main dashboard following the cyberpunk design system with hexagonal stat cards,
// CRT monitor, goals tracking, and activity feed. All monospace, sharp edges.
// =============================================================================

import { headers } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Zap, TrendingUp, Star, Trophy, Target, Briefcase, Award, BookOpen, GitBranch, MapPin, Clock, User } from 'lucide-react'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  WelcomeCard,
  CRTMonitor,
  HexBadge,
  DashboardNav,
  AIAssistantWidget,
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
// Page Component
// =============================================================================

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' })
  const tWelcomeMsg = await getTranslations({ locale, namespace: 'dashboard' })
  const tActions = await getTranslations({ locale, namespace: 'dashboard.home.quickActions' })
  const tStats = await getTranslations({ locale, namespace: 'dashboard.home.stats' })
  const tSkills = await getTranslations({ locale, namespace: 'dashboard.home.skills' })
  const tActivity = await getTranslations({ locale, namespace: 'dashboard.home.activity' })

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

  // Mock user stats - using translations for labels
  const userStats = {
    currentXP: 1900,
    maxXP: 2450,
    level: 18,
    streakDays: 12,
  }

  // Stats data with translations
  const stats = [
    { value: userStats.currentXP.toLocaleString(), label: tStats('totalXP'), color: "cyan" as const, icon: <Zap className="w-5 h-5" />, sub: tStats('xpSub', { count: 150 }) },
    { value: userStats.level.toString(), label: tStats('currentLevel'), color: "yellow" as const, icon: <TrendingUp className="w-5 h-5" />, sub: "Explorer rank" },
    { value: "7", label: tStats('experiences'), color: "green" as const, icon: <Star className="w-5 h-5" />, sub: tStats('expSub', { count: 2 }) },
    { value: "18/42", label: tStats('achievements'), color: "magenta" as const, icon: <Trophy className="w-5 h-5" />, sub: tStats('achSub', { percent: 43 }) },
  ]

  // Quick Actions with translations
  const quickActions = [
    { icon: "Briefcase", label: tActions('timeline'), color: "hsl(174,100%,50%)", href: `/${locale}/dashboard/timeline` },
    { icon: "Clock", label: tActions('projects'), color: "hsl(60,100%,50%)", href: `/${locale}/dashboard/projects` },
    { icon: "GitBranch", label: tActions('skills'), color: "hsl(330,100%,65%)", href: `/${locale}/dashboard/skills` },
    { icon: "User", label: tActions('portfolio'), color: "hsl(150,100%,45%)", href: `/${locale}/dashboard/portfolio` },
  ]

  // Skills Preview - mock data showing top skills with XP
  const skills = [
    { name: "TypeScript", category: "Frontend", xp: 2450, level: 4, maxXP: 3000, color: "hsl(174,100%,50%)" },
    { name: "React", category: "Frontend", xp: 3200, level: 5, maxXP: 4000, color: "hsl(60,100%,50%)" },
    { name: "Node.js", category: "Backend", xp: 1800, level: 3, maxXP: 2500, color: "hsl(330,100%,65%)" },
  ]

  // Activities - keeping mock data for now
  const activities = [
    { icon: Briefcase, text: "Added Senior Developer experience", time: "2 hours ago", xp: "+200 XP", color: "cyan" as const },
    { icon: Award, text: "Earned 'First Certification' badge", time: "1 day ago", xp: "+100 XP", color: "yellow" as const },
    { icon: BookOpen, text: "Completed React Advanced course", time: "3 days ago", xp: "+150 XP", color: "magenta" as const },
    { icon: GitBranch, text: "TypeScript skill reached Lv.4", time: "5 days ago", xp: "+50 XP", color: "green" as const },
    { icon: MapPin, text: "Updated location: Buenos Aires", time: "1 week ago", xp: "+10 XP", color: "cyan" as const },
  ]

  return (
    <div className="min-h-screen bg-[#0A0E1A] font-mono">
      {/* Main Navigation */}
      <DashboardNav locale={locale} user={userData} />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome + CRT + AI Sidebar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_340px_280px] gap-4 mb-6">
          <WelcomeCard
            userName={displayName}
            userInitial={initials}
            userImage={userData.image}
            level={userStats.level}
            currentXP={userStats.currentXP}
            maxXP={userStats.maxXP}
            streakDays={userStats.streakDays}
            translations={{
              welcomeTitle: tWelcomeMsg('welcome', { name: displayName }),
              welcomeSubtitle: tWelcomeMsg('welcomeSubtitle'),
              streak: tWelcome('streak', { count: userStats.streakDays }),
              quickActionsTitle: tWelcome('quickActions'),
              xpToLevel: tWelcome('xpToLevel', { xp: userStats.maxXP - userStats.currentXP, level: userStats.level + 1 }),
            }}
          />
          <CRTMonitor className="min-h-[220px]" />
          <AIAssistantWidget />
        </div>

        {/* Quick Actions Row - Tech Hex Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {quickActions.map((action, i) => {
            const icons: Record<string, React.ReactNode> = {
              Briefcase: <Briefcase className="w-5 h-5" />,
              Clock: <Clock className="w-5 h-5" />,
              GitBranch: <GitBranch className="w-5 h-5" />,
              User: <User className="w-5 h-5" />,
            }
            const Icon = icons[action.icon]
            return (
              <a
                key={action.label}
                href={action.href}
                className="group relative border bg-[hsl(200,30%,8%)] p-4 flex items-center gap-4 transition-all duration-300 hover:bg-[hsl(200,30%,10%)] hover:border-opacity-50"
                style={{ 
                  borderColor: `${action.color}30`,
                }}
              >
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle at center, ${action.color}15 0%, transparent 70%)`
                  }}
                />
                
                {/* Animated Hexagon Icon */}
                <div className="relative flex-shrink-0">
                  <svg width="48" height="48" viewBox="0 0 100 100" className="transition-transform duration-300 group-hover:scale-110">
                    {/* Outer ring - spinning on hover */}
                    <circle
                      cx="50" cy="50" r="44"
                      fill="none"
                      stroke={action.color}
                      strokeWidth="1"
                      strokeDasharray="4 8"
                      opacity="0.2"
                      className="group-hover:animate-spin-slow group-hover:opacity-40 transition-all duration-300"
                      style={{ animationDuration: "3s" }}
                    />
                    
                    {/* Middle ring */}
                    <circle
                      cx="50" cy="50" r="36"
                      fill="none"
                      stroke={action.color}
                      strokeWidth="0.5"
                      opacity="0.3"
                      className="group-hover:animate-pulse transition-all duration-300"
                    />
                    
                    {/* Hexagon outer */}
                    <path
                      d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                      fill="none"
                      stroke={action.color}
                      strokeWidth="2"
                      strokeOpacity="0.4"
                      className="group-hover:stroke-opacity-80 transition-all"
                    />
                    
                    {/* Hexagon inner glow */}
                    <path
                      d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
                      fill={action.color}
                      fillOpacity="0.08"
                      stroke={action.color}
                      strokeWidth="1.5"
                      className="group-hover:fill-opacity-20 transition-all duration-300"
                    />
                    
                    {/* Center icon with glow */}
                    <foreignObject x="20" y="25" width="60" height="50" className="overflow-visible">
                      <div 
                        className="flex items-center justify-center w-full h-full transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          color: action.color,
                          filter: `drop-shadow(0 0 4px ${action.color})`
                        }}
                      >
                        {Icon}
                      </div>
                    </foreignObject>
                    
                    {/* Center dot - pulsing */}
                    <circle
                      cx="50" cy="50" r="3"
                      fill={action.color}
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
                
                {/* Label */}
                <span className="text-xs font-mono text-foreground group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </a>
            )
          })}
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

        {/* Profile Completion + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profile Completion */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[hsl(174,100%,50%)]" />
                <h3 className="font-mono font-bold text-sm text-foreground">{tSkills('title')}</h3>
              </div>
            </div>
            <div className="border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,8%)] p-4">
              {/* Profile Completion Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-muted-foreground">Profile Completion</span>
                  <span className="text-[hsl(174,100%,50%)]">65%</span>
                </div>
                <div className="h-2 bg-[hsl(200,20%,13%)] overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 2% 100%)" }}>
                  <div className="h-full bg-[hsl(174,100%,50%)]" style={{ width: "65%", boxShadow: "0 0 8px hsl(174,100%,50%)" }} />
                </div>
              </div>
              
              {/* Checklist */}
              <div className="space-y-2">
                {[
                  { done: true, label: "Profile photo" },
                  { done: true, label: "Bio description" },
                  { done: false, label: "Location" },
                  { done: true, label: "Skills (3+)" },
                  { done: false, label: "Projects (1+)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${item.done ? 'bg-[hsl(150,100%,45%)]' : 'bg-[hsl(200,20%,20%)]'} clip-hexagon`} />
                    <span className={`text-[10px] font-mono ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Portfolio Link */}
              <div className="mt-4 pt-4 border-t border-[hsl(174,100%,50%,0.1)]">
                <p className="text-[10px] font-mono text-muted-foreground mb-2">Your Portfolio</p>
                <div className="flex items-center gap-2">
                  <input 
                    readOnly 
                    value={`portfoland.com/${userData.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}`}
                    className="flex-1 bg-[hsl(200,20%,13%)] border border-[hsl(174,100%,50%,0.2)] text-xs font-mono text-foreground px-3 py-2"
                  />
                  <button className="bg-[hsl(174,100%,50%,0.2)] border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] px-3 py-2 text-xs font-mono hover:bg-[hsl(174,100%,50%,0.3)] transition-colors">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[hsl(60,100%,50%)]" />
                <h3 className="font-mono font-bold text-sm text-foreground">{tActivity('title')}</h3>
              </div>
              <span className="text-[10px] font-mono text-[hsl(174,100%,50%)] cursor-pointer hover:underline">{tActivity('viewAll')}</span>
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
