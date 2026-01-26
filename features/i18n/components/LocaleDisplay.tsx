// =============================================================================
// Locale Display Component
// =============================================================================
// A Client Component that displays the current locale using next-intl hooks.
// Demonstrates that Client Components have access to translations.
// =============================================================================

'use client'

import { useLocale, useTranslations } from 'next-intl'

import type { LocaleDisplayProps } from '../types/locale'

// =============================================================================
// Component
// =============================================================================

/**
 * Displays the current locale with localized text.
 *
 * This component demonstrates that Client Components can:
 * - Use the useLocale hook to get the current locale
 * - Use the useTranslations hook to access translation messages
 *
 * @example
 * ```tsx
 * <LocaleDisplay className="text-sm" />
 * ```
 */
export function LocaleDisplay({ className }: LocaleDisplayProps) {
  const locale = useLocale()
  const t = useTranslations('languageSwitcher')

  return (
    <span className={className}>
      {t('current', { language: locale.toUpperCase() })}
    </span>
  )
}
