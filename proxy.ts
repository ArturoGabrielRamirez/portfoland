// =============================================================================
// Next.js 16 Proxy Configuration
// =============================================================================
// Handles route protection, authentication redirects, and locale routing.
// This file replaces middleware.ts in Next.js 16 and provides request
// interception capabilities for both auth and i18n.
// =============================================================================

import { type NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// =============================================================================
// Route Configuration
// =============================================================================

/**
 * Supported locales for the application.
 * Paths may be prefixed with these locale codes.
 */
const SUPPORTED_LOCALES = ['en', 'es'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/**
 * Default locale when none is specified in the URL or detected from headers.
 */
const DEFAULT_LOCALE: SupportedLocale = 'en'

/**
 * Cookie name for storing user's locale preference.
 */
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

/**
 * Protected path patterns that require authentication.
 * These patterns match the path after any locale prefix is removed.
 */
const PROTECTED_PATHS = ['/dashboard', '/settings'] as const

/**
 * Public path patterns accessible without authentication.
 * The root path '/' and auth-related paths are always public.
 */
const PUBLIC_PATHS = ['/', '/login', '/register'] as const

/**
 * API paths that should bypass authentication checks.
 * Better Auth handles its own authentication for these routes.
 */
const PUBLIC_API_PREFIXES = ['/api/auth'] as const

// =============================================================================
// Locale Detection Utilities
// =============================================================================

/**
 * Parses the Accept-Language header to extract language preferences.
 * Returns an array of locale codes sorted by quality value (preference).
 *
 * @param acceptLanguage - The Accept-Language header value
 * @returns Array of locale codes sorted by preference
 *
 * @example
 * parseAcceptLanguage('en-US,en;q=0.9,es;q=0.8')
 * // Returns: ['en-US', 'en', 'es']
 */
function parseAcceptLanguage(acceptLanguage: string | null): string[] {
  if (!acceptLanguage) {
    return []
  }

  return acceptLanguage
    .split(',')
    .map((part) => {
      const [locale, qualityStr] = part.trim().split(';q=')
      const quality = qualityStr ? parseFloat(qualityStr) : 1.0
      return { locale: locale.trim(), quality }
    })
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.locale)
}

/**
 * Matches a browser locale string against supported locales.
 * Handles both exact matches and language-only matches.
 *
 * @param browserLocale - Locale string from browser (e.g., 'en-US', 'es-AR')
 * @returns Matching supported locale or undefined
 *
 * @example
 * matchLocale('en-US') // Returns: 'en'
 * matchLocale('es-AR') // Returns: 'es'
 * matchLocale('fr')    // Returns: undefined
 */
function matchLocale(browserLocale: string): SupportedLocale | undefined {
  const normalizedLocale = browserLocale.toLowerCase()

  // Check for exact match first
  if (SUPPORTED_LOCALES.includes(normalizedLocale as SupportedLocale)) {
    return normalizedLocale as SupportedLocale
  }

  // Check for language-only match (e.g., 'en-US' -> 'en')
  const languageCode = normalizedLocale.split('-')[0]
  if (SUPPORTED_LOCALES.includes(languageCode as SupportedLocale)) {
    return languageCode as SupportedLocale
  }

  return undefined
}

/**
 * Detects the user's preferred locale from cookies or Accept-Language header.
 * Priority: Cookie > Accept-Language > Default
 *
 * @param request - The incoming Next.js request
 * @returns The detected locale code
 */
function detectLocale(request: NextRequest): SupportedLocale {
  // Priority 1: Check for locale cookie (user's saved preference)
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as SupportedLocale)) {
    return localeCookie as SupportedLocale
  }

  // Priority 2: Parse Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  const browserLocales = parseAcceptLanguage(acceptLanguage)

  for (const browserLocale of browserLocales) {
    const matched = matchLocale(browserLocale)
    if (matched) {
      return matched
    }
  }

  // Priority 3: Fall back to default locale
  return DEFAULT_LOCALE
}

// =============================================================================
// Route Matching Utilities
// =============================================================================

/**
 * Removes the locale prefix from a pathname if present.
 *
 * @param pathname - The URL pathname (e.g., '/en/dashboard')
 * @returns The pathname without locale prefix (e.g., '/dashboard')
 */
function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (SUPPORTED_LOCALES.includes(potentialLocale as SupportedLocale)) {
    const pathWithoutLocale = '/' + segments.slice(2).join('/')
    return pathWithoutLocale === '/' ? '/' : pathWithoutLocale
  }

  return pathname
}

/**
 * Extracts the locale from a pathname if present.
 *
 * @param pathname - The URL pathname (e.g., '/en/dashboard')
 * @returns The locale code or undefined if no locale prefix
 */
function extractLocale(pathname: string): SupportedLocale | undefined {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (SUPPORTED_LOCALES.includes(potentialLocale as SupportedLocale)) {
    return potentialLocale as SupportedLocale
  }

  return undefined
}

/**
 * Checks if a pathname already has a locale prefix.
 *
 * @param pathname - The URL pathname to check
 * @returns True if the pathname starts with a supported locale
 */
function hasLocalePrefix(pathname: string): boolean {
  return SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
}

/**
 * Checks if a path matches a protected route pattern.
 * Handles both exact matches and wildcard patterns (e.g., '/settings/*').
 *
 * @param pathWithoutLocale - The pathname with locale prefix removed
 * @returns True if the path requires authentication
 */
function isProtectedPath(pathWithoutLocale: string): boolean {
  return PROTECTED_PATHS.some((protectedPath) => {
    // Exact match
    if (pathWithoutLocale === protectedPath) {
      return true
    }

    // Wildcard match: '/settings' matches '/settings/anything'
    if (pathWithoutLocale.startsWith(protectedPath + '/')) {
      return true
    }

    return false
  })
}

/**
 * Checks if a path matches a public route pattern.
 *
 * @param pathWithoutLocale - The pathname with locale prefix removed
 * @returns True if the path is publicly accessible
 */
function isPublicPath(pathWithoutLocale: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => {
    // Exact match for public paths
    return pathWithoutLocale === publicPath
  })
}

/**
 * Checks if a path is a public API route.
 *
 * @param pathname - The full URL pathname
 * @returns True if the path is a public API route
 */
function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Checks if a path is an authentication-related page (login, register).
 *
 * @param pathWithoutLocale - The pathname with locale prefix removed
 * @returns True if the path is an auth page
 */
function isAuthPage(pathWithoutLocale: string): boolean {
  return pathWithoutLocale === '/login' || pathWithoutLocale === '/register'
}

/**
 * Builds a redirect URL with the appropriate locale prefix.
 *
 * @param request - The incoming request for URL construction
 * @param path - The target path without locale (e.g., '/login')
 * @param locale - The locale to use, defaults to DEFAULT_LOCALE
 * @returns The full URL with locale prefix
 */
function buildLocalizedUrl(request: NextRequest, path: string, locale?: SupportedLocale): URL {
  const effectiveLocale = locale ?? DEFAULT_LOCALE
  const localizedPath = `/${effectiveLocale}${path}`
  return new URL(localizedPath, request.url)
}

// =============================================================================
// Proxy Configuration
// =============================================================================

/**
 * Route matcher configuration for the proxy.
 *
 * Defines which paths should be processed by the proxy function.
 * Excludes static assets, images, and Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// =============================================================================
// Proxy Function
// =============================================================================

/**
 * Proxy function for handling route protection, locale routing, and redirects.
 *
 * This function intercepts requests and:
 * 1. Redirects requests without locale prefix to include detected locale
 * 2. Checks authentication status via Better Auth session cookie
 * 3. Redirects unauthenticated users from protected routes to login
 * 4. Redirects authenticated users from auth pages to dashboard
 * 5. Preserves locale in all redirects
 *
 * Locale detection priority:
 * - NEXT_LOCALE cookie (user's saved preference)
 * - Accept-Language header (browser preference)
 * - Default locale ('en')
 *
 * Note: Session cookie checks are for performance. Actual session
 * validation should happen in server components for security.
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse - Either continues the request or redirects
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Allow public API routes to pass through without locale handling
  if (isPublicApiPath(pathname)) {
    return NextResponse.next()
  }

  // Check if the request already has a locale prefix
  if (!hasLocalePrefix(pathname)) {
    // Detect user's preferred locale
    const detectedLocale = detectLocale(request)

    // Build the localized URL
    const localizedUrl = new URL(request.url)
    localizedUrl.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`

    // Redirect to the localized path
    return NextResponse.redirect(localizedUrl)
  }

  // From here, the request has a locale prefix
  const pathWithoutLocale = stripLocalePrefix(pathname)
  const locale = extractLocale(pathname)

  // Determine route types
  const isProtected = isProtectedPath(pathWithoutLocale)
  const isAuth = isAuthPage(pathWithoutLocale)

  // Check for session cookie using Better Auth
  // This checks for cookie existence, not validity (validation happens server-side)
  const sessionCookie = getSessionCookie(request)
  const isAuthenticated = sessionCookie !== null

  // Redirect unauthenticated users from protected routes to login
  if (isProtected && !isAuthenticated) {
    const loginUrl = buildLocalizedUrl(request, '/login', locale)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuth && isAuthenticated) {
    const dashboardUrl = buildLocalizedUrl(request, '/dashboard', locale)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export default proxy
