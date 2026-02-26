/**
 * Locale Detection Utility
 *
 * Provides functions to detect user's locale from cookies or headers.
 */

import { cookies } from 'next/headers';
import { localeCookieName, locales, type Locale } from '@/i18n/config';

/**
 * Detect locale from cookie or use default
 *
 * Priority:
 * 1. Explicitly provided locale (if valid)
 * 2. NEXT_LOCALE cookie
 * 3. Accept-Language header
 * 4. Default locale ('en')
 *
 * @param request - Optional Request object for Accept-Language header
 * @param fallbackLocale - Optional fallback if nothing detected
 * @returns Detected locale
 */
export async function detectLocale(request?: Request, fallbackLocale?: Locale): Promise<Locale> {
  // Try to get from cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(localeCookieName);

  if (localeCookie?.value && isValidLocale(localeCookie.value)) {
    return localeCookie.value as Locale;
  }

  // Try Accept-Language header if no cookie
  if (request) {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const detected = parseAcceptLanguage(acceptLanguage);
      if (detected && isValidLocale(detected)) {
        return detected;
      }
    }
  }

  // Fallback to provided or default
  return fallbackLocale || 'en';
}

/**
 * Parse Accept-Language header to find best locale match
 */
function parseAcceptLanguage(acceptLanguage: string): Locale | null {
  const preferences = acceptLanguage
    .split(',')
    .map((part) => {
      const [lang, quality] = part.trim().split(';q=');
      return {
        lang: lang.trim().split('-')[0], // Take just the language code
        quality: quality ? parseFloat(quality) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const bestMatch = preferences[0]?.lang;
  if (bestMatch && isValidLocale(bestMatch)) {
    return bestMatch as Locale;
  }
  return null;
}

/**
 * Validate locale string against supported locales
 */
function isValidLocale(value: string): boolean {
  return locales.includes(value as Locale);
}

/**
 * Get locale from request query params or detect automatically
 *
 * @param request - The incoming request
 * @param queryParam - Query parameter name to check (default: 'locale')
 * @returns Locale from query param or auto-detected
 */
export async function getLocaleFromRequest(
  request: Request,
  queryParam: string = 'locale'
): Promise<Locale> {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get(queryParam);

  // If valid locale in query, use it
  if (queryLocale && isValidLocale(queryLocale)) {
    return queryLocale as Locale;
  }

  // Otherwise detect from cookie/header
  return detectLocale(request);
}
