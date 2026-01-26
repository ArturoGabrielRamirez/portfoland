// =============================================================================
// Internationalized Navigation Helpers
// =============================================================================
// Typed navigation utilities for locale-aware routing.
// These wrappers ensure all navigation respects the current locale.
// =============================================================================

import { createNavigation } from 'next-intl/navigation'

import { routing } from './config'

// =============================================================================
// Navigation Utilities
// =============================================================================

/**
 * Locale-aware navigation utilities created from the routing configuration.
 *
 * - Link: Drop-in replacement for Next.js Link with automatic locale handling
 * - redirect: Server-side redirect that includes the current locale
 * - usePathname: Returns pathname without the locale prefix
 * - useRouter: Router hook with locale-aware navigation methods
 * - getPathname: Constructs pathnames for specific locales
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
