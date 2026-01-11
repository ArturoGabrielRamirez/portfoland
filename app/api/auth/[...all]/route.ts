// =============================================================================
// Better Auth API Route Handler
// =============================================================================
// Catch-all route handler that delegates all authentication requests to
// Better Auth. This handles sign-in, sign-up, sign-out, OAuth callbacks,
// session management, and all other auth-related endpoints.
// =============================================================================

import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/lib/auth'

/**
 * Better Auth route handlers for Next.js App Router.
 *
 * This catch-all route handles all authentication endpoints:
 * - POST /api/auth/sign-in/email - Email/password sign in
 * - POST /api/auth/sign-up/email - Email/password registration
 * - POST /api/auth/sign-out - Sign out
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/callback/google - Google OAuth callback
 * - And other Better Auth endpoints
 */
export const { GET, POST } = toNextJsHandler(auth)
