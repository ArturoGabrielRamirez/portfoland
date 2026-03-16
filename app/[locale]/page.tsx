// =============================================================================
// Public Landing Page
// =============================================================================
// The main landing page for unauthenticated users.
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
// Inline SVG Icons
// =============================================================================

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  )
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

// =============================================================================
// Page Component
// =============================================================================

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params

  setRequestLocale(locale)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations('landing')
  const tNav = await getTranslations('navigation')
  const tCommon = await getTranslations('common')

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">

      {/* ================================================================
          Navigation
      ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#334155]/50 bg-[#0A0F1A]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                <span className="font-bold text-[#0A0F1A] text-sm">P</span>
              </div>
              <span className="font-bold text-lg text-white">{tCommon('appName').toUpperCase()}</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#ia" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                {t('aiSection.tag')}
              </Link>
              <Link href="#modos" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                {t('modes.title')}
              </Link>
              <Link href="#como-funciona" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                {t('howItWorks.title')}
              </Link>
            </div>

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

      {/* ================================================================
          Hero Section
      ================================================================ */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D4FF]/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#D946EF]/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 mb-8">
            <SparklesIcon className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-sm text-[#00D4FF] font-medium">{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
            {t('hero.titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#D946EF] to-[#8B5CF6]">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-8 text-balance">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href={`/${locale}/register`}>
              <TechButton variant="primary" size="lg">
                {t('hero.ctaPrimary')}
              </TechButton>
            </Link>
            <Link href="#como-funciona">
              <TechButton variant="outline" size="lg">
                {t('hero.ctaSecondary')}
              </TechButton>
            </Link>
          </div>

          {/* Terminal preview */}
          <div className="max-w-2xl mx-auto border border-[#00D4FF]/20 bg-[#0D1421] rounded-sm text-left p-4 font-mono text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2 mb-3 border-b border-[#334155]/50 pb-2">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <div className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[#475569]">SYS_CONSOLE v3.10_AI</span>
            </div>
            <div className="space-y-1.5">
              <p><span className="text-[#475569]">$ </span><span className="text-white">Agrega mi trabajo en Accenture como backend developer desde 2022</span></p>
              <p><span className="text-[#00D4FF]">&gt;</span> Creando experiencia: Accenture — Backend Developer [2022–presente]</p>
              <p><span className="text-[#00D4FF]">&gt;</span> Detectando habilidades: Node.js, PostgreSQL, AWS... <span className="text-[#22C55E]">[+450 XP]</span></p>
              <p><span className="text-[#00D4FF]">&gt;</span> Portfolio actualizado. <span className="text-[#22C55E]">✓ Listo</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          AI Section — "Ask, don't fill forms"
      ================================================================ */}
      <section id="ia" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1421]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#00D4FF] mb-4 tracking-wider uppercase">
              {t('aiSection.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('aiSection.headline')}
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              {t('aiSection.subheadline')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TechCard variant="glow" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center mb-4">
                <BotIcon className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('aiSection.chat.title')}</h3>
              <p className="text-[#94A3B8] text-sm">{t('aiSection.chat.description')}</p>
            </TechCard>

            <TechCard variant="magenta" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#D946EF]/20 flex items-center justify-center mb-4">
                <FileTextIcon className="w-6 h-6 text-[#D946EF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('aiSection.cv.title')}</h3>
              <p className="text-[#94A3B8] text-sm">{t('aiSection.cv.description')}</p>
            </TechCard>

            <TechCard variant="green" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center mb-4">
                <ZapIcon className="w-6 h-6 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('aiSection.assessment.title')}</h3>
              <p className="text-[#94A3B8] text-sm">{t('aiSection.assessment.description')}</p>
            </TechCard>
          </div>
        </div>
      </section>

      {/* ================================================================
          Import Section — "Go from zero to portfolio in minutes"
      ================================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#D946EF] mb-4 tracking-wider uppercase">
              {t('importSection.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('importSection.headline')}
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              {t('importSection.subheadline')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <TechCard variant="glow" className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center shrink-0">
                  <GithubIcon className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('importSection.github.title')}</h3>
              </div>
              <p className="text-[#94A3B8] text-sm">{t('importSection.github.description')}</p>
            </TechCard>

            <TechCard variant="magenta" className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#D946EF]/20 flex items-center justify-center shrink-0">
                  <UploadIcon className="w-6 h-6 text-[#D946EF]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('importSection.cvImport.title')}</h3>
              </div>
              <p className="text-[#94A3B8] text-sm">{t('importSection.cvImport.description')}</p>
            </TechCard>
          </div>
        </div>
      </section>

      {/* ================================================================
          Modes Section — "Two modes, one platform"
      ================================================================ */}
      <section id="modos" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1421]">
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
                {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((k) => (
                  <li key={k} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                    <CheckIcon className="w-5 h-5 text-[#00D4FF] shrink-0 mt-0.5" />
                    {t(`modes.classic.${k}`)}
                  </li>
                ))}
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
                {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((k) => (
                  <li key={k} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                    <CheckIcon className="w-5 h-5 text-[#D946EF] shrink-0 mt-0.5" />
                    {t(`modes.tech.${k}`)}
                  </li>
                ))}
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

      {/* ================================================================
          Visibility Section — "Your portfolio gets found"
      ================================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#22C55E] mb-4 tracking-wider uppercase">
              {t('visibilitySection.tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('visibilitySection.headline')}
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              {t('visibilitySection.subheadline')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TechCard variant="green" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center mb-4">
                <GlobeIcon className="w-6 h-6 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('visibilitySection.seo.title')}</h3>
              <p className="text-[#94A3B8] text-sm">{t('visibilitySection.seo.description')}</p>
            </TechCard>

            <TechCard variant="glow" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center mb-4">
                <BarChartIcon className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('visibilitySection.analytics.title')}</h3>
              <p className="text-[#94A3B8] text-sm">{t('visibilitySection.analytics.description')}</p>
            </TechCard>

            <TechCard variant="magenta" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#D946EF]/20 flex items-center justify-center mb-4">
                <ZapIcon className="w-6 h-6 text-[#D946EF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('visibilitySection.subdomain.title')}</h3>
              <p className="text-[#94A3B8] text-sm">{t('visibilitySection.subdomain.description')}</p>
            </TechCard>
          </div>
        </div>
      </section>

      {/* ================================================================
          How It Works
      ================================================================ */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1421]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-[#EAB308] mb-4 tracking-wider uppercase">
              {t('howItWorks.title')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              {t('howItWorks.headline')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', color: '#00D4FF', key: 'step1' },
              { num: '2', color: '#D946EF', key: 'step2' },
              { num: '3', color: '#22C55E', key: 'step3' },
            ].map(({ num, color, key }) => (
              <div key={key} className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2"
                  style={{ borderColor: color, background: `${color}1A` }}
                >
                  <span className="text-2xl font-bold" style={{ color }}>{num}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t(`howItWorks.${key}.title` as `howItWorks.step1.title`)}
                </h3>
                <p className="text-[#94A3B8] text-sm">
                  {t(`howItWorks.${key}.description` as `howItWorks.step1.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA Section
      ================================================================ */}
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

      {/* ================================================================
          Footer
      ================================================================ */}
      <footer className="border-t border-[#334155]/50 bg-[#0D1421] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                <span className="font-bold text-[#0A0F1A] text-sm">P</span>
              </div>
              <span className="font-bold text-lg text-white">{tCommon('appName').toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#64748B]">
              <Link href="#ia" className="hover:text-white transition-colors">
                {t('aiSection.tag')}
              </Link>
              <Link href="#modos" className="hover:text-white transition-colors">
                {t('modes.title')}
              </Link>
              <Link href={`/${locale}/login`} className="hover:text-white transition-colors">
                {tNav('signIn')}
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
