// =============================================================================
// Next.js 16 Proxy Configuration
// =============================================================================
// Handles route protection and authentication redirects. This file replaces
// middleware.ts in Next.js 16 and provides request interception capabilities.
// =============================================================================

import { type NextRequest, NextResponse } from 'next/server'

/**
 * Route matcher configuration for the proxy.
 *
 * Defines which paths should be processed by the proxy function.
 * Protected paths require authentication; public paths are accessible to all.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

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
  // Allow the request to continue for now
  // Full implementation in tasks 3.2, 3.3, and 3.4
  return NextResponse.next()
}

export default proxy
