// =============================================================================
// Public Landing Page
// =============================================================================
// The main landing page for unauthenticated users. Features a hero section,
// feature highlights, and call-to-action buttons for sign up and login.
// Redirects authenticated users to the dashboard.
// =============================================================================

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { TechButton, TechCard } from '@/features/tech'

// =============================================================================
// Types
// =============================================================================

interface LandingPageProps {
  params: Promise<{ locale: string }>
}

// =============================================================================
// Icons
// =============================================================================

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function TimelineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

// =============================================================================
// Page Component
// =============================================================================

/**
 * Public landing page for the application.
 *
 * Displays:
 * - Hero section with product tagline and value proposition
 * - Feature highlights (Timeline, Skill Tree, Subdomain)
 * - How it works section
 * - Modes comparison (Professional vs Gaming)
 * - Call-to-action sections
 *
 * Authenticated users are redirected to the dashboard.
 */
export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect(`/${locale}/dashboard`)
  }

  // Get translations
  const t = await getTranslations('landing')
  const tNav = await getTranslations('navigation')
  const tCommon = await getTranslations('common')

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#334155]/50 bg-[#0A0F1A]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                <span className="font-bold text-[#0A0F1A] text-sm">P</span>
              </div>
              <span className="font-bold text-lg text-white">{tCommon('appName').toUpperCase()}</span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#caracteristicas" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                {t('features.title')}
              </Link>
              <Link href="#como-funciona" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                {t('howItWorks.title')}
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/login`}>
                <TechButton variant="outline" size="sm">
                  {tNav('signIn')}
                </TechButton>
              </Link>
              <Link href={`/${locale}/register`} className="hidden sm:block">
                <TechButton variant="primary" size="sm">
                  {tNav('signUp')}
                </TechButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D4FF]/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#D946EF]/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 mb-8">
            <SparklesIcon className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm text-[#00D4FF] font-medium">{t('hero.badge')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
            {t('hero.titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#D946EF] to-[#8B5CF6]">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-8 text-balance">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href={`/${locale}/register`}>
              <TechButton variant="primary" size="lg">
                {t('hero.ctaSignUp')}
              </TechButton>
            </Link>
            <Link href={`/${locale}/login`}>
              <TechButton variant="outline" size="lg">
                {t('hero.ctaSignIn')}
              </TechButton>
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1421]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#00D4FF] mb-4 tracking-wider uppercase">
              {t('features.title')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('features.headline')}
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              {t('features.subheadline')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 - Timeline */}
            <TechCard variant="glow" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center mb-4">
                <TimelineIcon className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('features.timeline.title')}
              </h3>
              <p className="text-[#94A3B8] text-sm mb-4">
                {t('features.timeline.description')}
              </p>
            </TechCard>

            {/* Feature 2 - Skill Tree */}
            <TechCard variant="magenta" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#D946EF]/20 flex items-center justify-center mb-4">
                <TreeIcon className="w-6 h-6 text-[#D946EF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('features.portfolio.title')}
              </h3>
              <p className="text-[#94A3B8] text-sm mb-4">
                {t('features.portfolio.description')}
              </p>
            </TechCard>

            {/* Feature 3 - Subdomain */}
            <TechCard variant="green" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center mb-4">
                <GlobeIcon className="w-6 h-6 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('features.aiAssistant.title')}
              </h3>
              <p className="text-[#94A3B8] text-sm mb-4">
                {t('features.aiAssistant.description')}
              </p>
            </TechCard>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#22C55E] mb-4 tracking-wider uppercase">
              {t('howItWorks.title')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('howItWorks.headline')}
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#00D4FF]">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="text-[#94A3B8] text-sm">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#D946EF] bg-[#D946EF]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#D946EF]">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="text-[#94A3B8] text-sm">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#22C55E] bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#22C55E]">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="text-[#94A3B8] text-sm">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1421]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#EAB308] mb-4 tracking-wider uppercase">
              {t('modes.title')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('modes.headline')}
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              {t('modes.subheadline')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Classic Mode */}
            <TechCard variant="glow" className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{t('modes.classic.title')}</h3>
                  <p className="text-sm text-[#00D4FF]">{t('modes.classic.subtitle')}</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#00D4FF]" />
                  {t('modes.classic.feature1')}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#00D4FF]" />
                  {t('modes.classic.feature2')}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#00D4FF]" />
                  {t('modes.classic.feature3')}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#00D4FF]" />
                  {t('modes.classic.feature4')}
                </li>
              </ul>
              <Link href={`/${locale}/register`}>
                <TechButton variant="primary" className="w-full">
                  {t('modes.classic.cta')}
                </TechButton>
              </Link>
            </TechCard>

            {/* Tech Mode */}
            <TechCard variant="magenta" className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#D946EF]/20 flex items-center justify-center">
                  <ChartIcon className="w-6 h-6 text-[#D946EF]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{t('modes.tech.title')}</h3>
                  <p className="text-sm text-[#D946EF]">{t('modes.tech.subtitle')}</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#D946EF]" />
                  {t('modes.tech.feature1')}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#D946EF]" />
                  {t('modes.tech.feature2')}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#D946EF]" />
                  {t('modes.tech.feature3')}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#94A3B8]">
                  <CheckIcon className="w-5 h-5 text-[#D946EF]" />
                  {t('modes.tech.feature4')}
                </li>
              </ul>
              <Link href={`/${locale}/register`}>
                <TechButton variant="secondary" className="w-full">
                  {t('modes.tech.cta')}
                </TechButton>
              </Link>
            </TechCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
            {t('cta.title')}
          </h2>
          <p className="text-[#94A3B8] mb-8">
            {t('cta.subtitle')}
          </p>
          <Link href={`/${locale}/register`}>
            <TechButton variant="primary" size="lg">
              {t('cta.button')}
            </TechButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#334155]/50 bg-[#0D1421] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                <span className="font-bold text-[#0A0F1A] text-sm">P</span>
              </div>
              <span className="font-bold text-lg text-white">{tCommon('appName').toUpperCase()}</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-[#64748B]">
              <Link href="#caracteristicas" className="hover:text-white transition-colors">
                {t('features.title')}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#334155]/50 text-center text-sm text-[#64748B]">
            &copy; {new Date().getFullYear()} {tCommon('appName')}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
