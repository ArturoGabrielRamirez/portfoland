// =============================================================================
// Better Auth Configuration
// =============================================================================
// Configures Better Auth with Prisma adapter for MongoDB, email/password
// authentication, Google OAuth social login, and cross-subdomain cookie
// sharing for username.portfoland.com subdomain routing.
// =============================================================================

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

// Read the app domain to determine cookie configuration.
// In production (e.g., "portfoland.com"), cookies are shared across subdomains.
// In development ("localhost"), no cookie domain is set -- browsers handle
// localhost subdomains differently.
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'
const isProduction = appDomain !== 'localhost'

/**
 * Better Auth instance configured with Prisma adapter for MongoDB.
 *
 * This configuration enables:
 * - Email/password authentication
 * - Google OAuth social login
 * - Session management via Prisma/MongoDB
 * - Custom user fields: locale and username
 * - Cross-subdomain session cookies (production only)
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: true,
      },
      locale: {
        type: 'string',
        required: false,
        defaultValue: 'en',
        input: true,
      },
      bio: {
        type: 'string',
        required: false,
        input: true,
      },
      meta: {
        type: 'string', // JSON is handled as string in Better Auth schema map if not specialized
        required: false,
        input: true,
      },
    },
  },

  advanced: {
    ...(isProduction && {
      crossSubDomainCookies: {
        enabled: true,
        domain: `.${appDomain}`,
      },
    }),
  },
})
