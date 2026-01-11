// =============================================================================
// Better Auth Configuration
// =============================================================================
// Configures Better Auth with Prisma adapter for MongoDB, email/password
// authentication, and Google OAuth social login.
// =============================================================================

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

/**
 * Better Auth instance configured with Prisma adapter for MongoDB.
 *
 * This configuration enables:
 * - Email/password authentication
 * - Google OAuth social login
 * - Session management via Prisma/MongoDB
 * - Custom user fields: locale and username
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
    },
  },
})
