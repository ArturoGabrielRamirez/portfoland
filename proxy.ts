// =============================================================================
// Next.js 16 Proxy Configuration
// =============================================================================
// Handles route protection and authentication redirects. This file replaces
// middleware.ts in Next.js 16 and provides request interception capabilities.
// =============================================================================

import { type NextRequest, NextResponse } from 'next/server'

// =============================================================================
// Route Configuration
// =============================================================================

/**
 * Supported locales for the application.
 * Paths may be prefixed with these locale codes.
 */
const SUPPORTED_LOCALES = ['en', 'es'] as const

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

  if (SUPPORTED_LOCALES.includes(potentialLocale as (typeof SUPPORTED_LOCALES)[number])) {
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
function extractLocale(pathname: string): string | undefined {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (SUPPORTED_LOCALES.includes(potentialLocale as (typeof SUPPORTED_LOCALES)[number])) {
    return potentialLocale
  }

  return undefined
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
 * Proxy function for handling route protection and redirects.
 *
 * This function intercepts requests and:
 * - Checks authentication status for protected routes
 * - Redirects unauthenticated users to login
 * - Redirects authenticated users away from auth pages
 * - Preserves locale in all redirects
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse - Either continues the request or redirects
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Allow public API routes to pass through
  if (isPublicApiPath(pathname)) {
    return NextResponse.next()
  }

  // Strip locale to determine the actual route
  const pathWithoutLocale = stripLocalePrefix(pathname)
  const locale = extractLocale(pathname)

  // Store route type flags for use in authentication check (task 3.3)
  const routeInfo = {
    isProtected: isProtectedPath(pathWithoutLocale),
    isPublic: isPublicPath(pathWithoutLocale),
    isAuthPage: isAuthPage(pathWithoutLocale),
    locale,
    pathWithoutLocale,
  }

  // Route type is now available for authentication checks
  // Full authentication implementation in task 3.3
  void routeInfo

  return NextResponse.next()
}

export default proxy
