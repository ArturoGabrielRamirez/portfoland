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

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
      allowDifferentEmails: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ['user:email', 'read:user', 'repo'],
      getUserInfo: async (token) => {
        // Fetch main profile
        const profileRes = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            'User-Agent': 'portfoland',
          },
        })
        if (!profileRes.ok) return null
        const profile = await profileRes.json()

        // Fetch emails separately (handles private emails)
        let email = profile.email as string | null
        if (!email) {
          const emailsRes = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              'User-Agent': 'portfoland',
            },
          })
          if (emailsRes.ok) {
            const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>
            email = emails.find(e => e.primary && e.verified)?.email
              ?? emails.find(e => e.primary)?.email
              ?? emails[0]?.email
              ?? null
          }
        }

        // Final fallback: GitHub noreply email (always unique)
        if (!email) {
          email = `${profile.id}+${profile.login}@users.noreply.github.com`
        }

        return {
          user: {
            id: String(profile.id),
            name: profile.name || profile.login,
            email,
            image: profile.avatar_url,
            emailVerified: true,
          },
          data: profile,
        }
      },
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
