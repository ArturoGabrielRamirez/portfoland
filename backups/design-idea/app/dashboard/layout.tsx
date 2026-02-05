"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GamingAvatar, XPBar, LevelBadge } from "@/components/gaming"

// Navigation items
const navItems = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/timeline", 
    label: "Timeline", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/skills", 
    label: "Skill Tree", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/logros", 
    label: "Logros", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/mi-cv", 
    label: "Mi CV", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
]

// Mock user data
const userData = {
  name: "Maria Garcia",
  title: "Senior Photographer",
  level: 42,
  xp: 2450,
  xpMax: 3000,
  avatar: null,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">P</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">PORTFOLAND</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Journey Stats */}
        <div className="p-4 border-t border-border">
          <div className="bg-background-secondary rounded-xl p-4">
            <div className="text-xs text-primary font-medium mb-2 tracking-wider">MI JOURNEY</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-2xl font-bold text-warning">2,450</span>
              <span className="text-sm text-muted-foreground">XP</span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Hitos cumplidos</span>
                <span className="text-foreground">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Experiencias</span>
                <span className="text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Logros</span>
                <span className="text-foreground">12</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <Link href="/dashboard/settings" className="flex items-center gap-3 group">
            <GamingAvatar fallback="MG" size="sm" frame="cyan" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userData.name}</p>
              <p className="text-xs text-primary">Nivel {userData.level} - 2,450 XP</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">P</span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <span className="text-xs text-muted-foreground">Lv</span>
              <span className="font-display font-bold text-primary">{userData.level}</span>
            </div>

            {/* XP */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10">
              <span className="font-display font-bold text-warning">{userData.xp.toLocaleString()}</span>
              <span className="text-xs text-warning">XP</span>
            </div>

            {/* Progress */}
            <div className="hidden md:block w-24">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-warning to-yellow-400 rounded-full"
                  style={{ width: `${(userData.xp / userData.xpMax) * 100}%` }}
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>

            {/* User Menu */}
            <Link href="/dashboard/settings" className="hidden sm:block">
              <GamingAvatar fallback="MG" size="sm" frame="cyan" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
