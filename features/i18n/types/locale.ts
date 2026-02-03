// =============================================================================
// Internationalization Types
// =============================================================================
// Type definitions for i18n-related components and hooks.
// =============================================================================

import type { Locale } from '@/i18n/config'

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the LocaleDisplay component.
 * Used to display the current locale information.
 */
export interface LocaleDisplayProps {
  /** Optional CSS class name for styling */
  className?: string
}

/**
 * Props for components that need locale information.
 */
export interface WithLocaleProps {
  /** The current locale */
  locale: Locale
}

/**
 * Props for the LanguageSwitcher component.
 * Provides a dropdown to switch between supported locales.
 */
export interface LanguageSwitcherProps {
  /** Optional CSS class name for styling the trigger button */
  className?: string
  /** Optional: Whether the user is authenticated (enables saving preference) */
  isAuthenticated?: boolean
  /** Optional: Variant for display style */
  variant?: 'dropdown' | 'inline'
}

/**
 * Language option displayed in the switcher.
 */
export interface LanguageOption {
  /** Locale code (e.g., 'en', 'es') */
  code: Locale
  /** Display label (e.g., 'English', 'Espanol') */
  label: string
  /** Flag emoji or icon identifier */
  flag: string
}
