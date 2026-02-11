// =============================================================================
// Next.js 16 Proxy Configuration
// =============================================================================
// Handles route protection, authentication redirects, locale routing,
// and subdomain-based portfolio URL rewriting.
// This file replaces middleware.ts in Next.js 16 and provides request
// interception capabilities for auth, i18n, and subdomain routing.
// =============================================================================

import { type NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { isReservedSubdomain } from '@/features/core'

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

/**
 * Paths that are valid on subdomain-routed portfolios.
 * These correspond to routes under app/[locale]/[username]/.
 * Any path not in this list triggers a redirect to the root domain.
 */
const VALID_SUBDOMAIN_PATHS = ['/', '/skills'] as const

// =============================================================================
// Domain Configuration
// =============================================================================

/**
 * Returns the application's base domain from the environment.
 * Read at call time so that tests can set the env var before invoking proxy().
 * Development: 'localhost' -- Production: 'portfoland.com'
 */
function getAppDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'
}

// =============================================================================
// Subdomain Extraction
// =============================================================================

/**
 * Extracts the subdomain portion from a hostname by comparing it against a
 * base domain. Strips port numbers before comparison.
 *
 * @param hostname - The full hostname (e.g., 'john.portfoland.com', 'john.localhost:3000')
 * @param baseDomain - The application's base domain (e.g., 'portfoland.com', 'localhost')
 * @returns The subdomain string, or null if the hostname is the bare domain
 *
 * @example
 * extractSubdomain('john.portfoland.com', 'portfoland.com')   // 'john'
 * extractSubdomain('john.localhost:3000', 'localhost')         // 'john'
 * extractSubdomain('portfoland.com', 'portfoland.com')        // null
 */
export function extractSubdomain(hostname: string, baseDomain: string): string | null {
  // Strip port number if present
  const host = hostname.split(':')[0]

  // If the hostname exactly matches the base domain, there is no subdomain
  if (host === baseDomain) {
    return null
  }

  // The hostname must end with the base domain
  const suffix = `.${baseDomain}`
  if (!host.endsWith(suffix)) {
    return null
  }

  // Extract the subdomain by removing the base domain suffix
  const subdomain = host.slice(0, -suffix.length)

  // Guard against empty strings (e.g., '.portfoland.com')
  if (!subdomain) {
    return null
  }

  return subdomain
}

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
 * Proxy function for handling subdomain rewriting, route protection,
 * locale routing, and redirects.
 *
 * This function intercepts requests and:
 * 1. Detects subdomains and rewrites portfolio requests internally
 * 2. Redirects requests without locale prefix to include detected locale
 * 3. Checks authentication status via Better Auth session cookie
 * 4. Redirects unauthenticated users from protected routes to login
 * 5. Redirects authenticated users from auth pages to dashboard
 * 6. Preserves locale in all redirects
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
 * @returns NextResponse - Either continues the request, rewrites, or redirects
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const appDomain = getAppDomain()

  // Allow public API routes to pass through without locale handling
  if (isPublicApiPath(pathname)) {
    return NextResponse.next()
  }

  // ---------------------------------------------------------------------------
  // Subdomain detection and rewriting
  // ---------------------------------------------------------------------------

  const host = request.headers.get('host')
  const subdomain = host ? extractSubdomain(host, appDomain) : null

  if (subdomain && !isReservedSubdomain(subdomain)) {
    const locale = detectLocale(request)

    // Strip any locale prefix the user may have typed (subdomain URLs have no locale prefix)
    const cleanPathname = stripLocalePrefix(pathname)

    // Check if this path is valid for subdomain portfolio routing
    if ((VALID_SUBDOMAIN_PATHS as readonly string[]).includes(cleanPathname)) {
      // Rewrite to the internal portfolio route: /{locale}/{username}{path}
      const internalPath = cleanPathname === '/'
        ? `/${locale}/${subdomain}`
        : `/${locale}/${subdomain}${cleanPathname}`

      const rewriteUrl = new URL(internalPath, request.url)
      const response = NextResponse.rewrite(rewriteUrl)

      // Set custom header so downstream components can detect subdomain context
      response.headers.set('x-subdomain', subdomain)

      return response
    }

    // Non-portfolio path on subdomain -- redirect to root domain
    const protocol = request.url.startsWith('https') ? 'https' : 'http'
    const redirectUrl = new URL(`${protocol}://${appDomain}/${locale}${cleanPathname}`)
    return NextResponse.redirect(redirectUrl)
  }

  // Reserved subdomains and bare domain requests fall through to normal routing

  // ---------------------------------------------------------------------------
  // Standard locale and auth routing (existing logic)
  // ---------------------------------------------------------------------------

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
