// =============================================================================
// Locale Home Page (Placeholder)
// =============================================================================
// Placeholder page for the locale root route.
// Will be replaced with the public landing page in Task Group 7.
// =============================================================================

import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'

import { LocaleDisplay } from '@/features/i18n'

// =============================================================================
// Types
// =============================================================================

interface LocaleHomePageProps {
  params: Promise<{ locale: string }>
}

// =============================================================================
// Page Component
// =============================================================================

/**
 * Locale home page placeholder.
 *
 * Displays a simple welcome message using translations.
 * This will be replaced with the full landing page implementation.
 */
export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  return <HomeContent />
}

// =============================================================================
// Content Component
// =============================================================================

/**
 * Home content component that uses translations.
 * Separated to enable useTranslations hook usage.
 */
function HomeContent() {
  const t = useTranslations('common')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">{t('appName')}</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        {t('loading')}
      </p>
      {/* Client Component demonstrating useLocale hook works */}
      <LocaleDisplay className="mt-2 text-sm text-zinc-500" />
    </main>
  )
}
