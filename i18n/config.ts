// =============================================================================
// Internationalization Configuration
// =============================================================================
// Centralized configuration for next-intl internationalization.
// These values align with the locale constants defined in proxy.ts.
// =============================================================================

import { defineRouting } from 'next-intl/routing'

// =============================================================================
// Locale Constants
// =============================================================================

/**
 * Supported locales for the application.
 * Must be kept in sync with SUPPORTED_LOCALES in proxy.ts.
 */
export const locales = ['en', 'es'] as const

/**
 * Default locale when no locale is specified or detected.
 * Must be kept in sync with DEFAULT_LOCALE behavior in proxy.ts.
 */
export const defaultLocale = 'en' as const

/**
 * Cookie name for storing locale preference.
 * Used by next-intl for locale detection and persistence.
 */
export const localeCookieName = 'NEXT_LOCALE' as const

// =============================================================================
// Type Exports
// =============================================================================

/**
 * Union type of all supported locale codes.
 * Use this for type-safe locale handling throughout the application.
 *
 * @example
 * function formatDate(date: Date, locale: Locale): string { ... }
 */
export type Locale = (typeof locales)[number]

/**
 * Type guard to check if a string is a valid locale.
 *
 * @param value - The string to check
 * @returns True if the value is a supported locale
 *
 * @example
 * if (isValidLocale(userInput)) {
 *   // userInput is typed as Locale here
 * }
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

// =============================================================================
// Routing Configuration
// =============================================================================

/**
 * next-intl routing configuration.
 * Defines how locale-based routing behaves in the application.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeCookie: {
    name: localeCookieName,
  },
})
