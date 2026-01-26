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
