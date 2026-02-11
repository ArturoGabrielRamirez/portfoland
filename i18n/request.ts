// =============================================================================
// next-intl Request Configuration
// =============================================================================
// Configures how next-intl handles the locale on each request.
// This file is used by next-intl to load messages and set up the locale.
// =============================================================================

import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'

import { routing } from './config'

// =============================================================================
// Request Configuration
// =============================================================================

/**
 * Request configuration for next-intl.
 *
 * This function runs on each request to:
 * 1. Validate the requested locale against supported locales
 * 2. Load the corresponding translation messages
 * 3. Return the locale configuration for the request
 *
 * The locale is determined by the [locale] dynamic segment in the URL,
 * which is passed via requestLocale from the routing configuration.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the requested locale from the URL segment
  const requested = await requestLocale

  // Validate the locale, falling back to default if invalid
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  // Load messages for the validated locale
  const messages = (await import(`../messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
