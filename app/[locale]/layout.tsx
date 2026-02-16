// =============================================================================
// Locale Layout
// =============================================================================
// Layout component for locale-specific routes. Wraps all pages under
// app/[locale]/ with the NextIntlClientProvider for translations.
// =============================================================================

import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

import { routing } from '@/i18n/config'
import { Toaster } from '@/features/shadcn/ui/sonner'
import { ToastBorderEffect } from '@/features/ui'

// =============================================================================
// Types
// =============================================================================

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// =============================================================================
// Static Generation
// =============================================================================

/**
 * Generate static params for all supported locales.
 * This enables static generation for locale-based routes.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// =============================================================================
// Layout Component
// =============================================================================

/**
 * Locale-specific layout that provides internationalization context.
 *
 * Validates the locale parameter and wraps children with NextIntlClientProvider
 * to enable translations in both Server and Client Components.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  // Validate the locale parameter
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering by setting the request locale
  setRequestLocale(locale)

  // Load messages for the current locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster position="top-right" richColors closeButton />
      <ToastBorderEffect />
    </NextIntlClientProvider>
  )
}
