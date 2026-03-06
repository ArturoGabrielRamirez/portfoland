// =============================================================================
// Better Auth Client
// =============================================================================
// Client-side authentication utilities for React components. Provides hooks
// and methods for sign-in, sign-up, sign-out, and session management.
// =============================================================================

import { createAuthClient } from 'better-auth/react'

/**
 * Better Auth client configured for browser-side authentication.
 *
 * Uses the NEXT_PUBLIC_BETTER_AUTH_URL environment variable to determine
 * the base URL for auth API requests. Falls back to the current origin
 * if the environment variable is not set.
 *
 * Exports:
 * - signIn: Sign in with email/password or social providers
 * - signUp: Register a new user with email/password
 * - signOut: Sign out the current user
 * - useSession: React hook for accessing session state
 */
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession, linkSocial } = authClient
