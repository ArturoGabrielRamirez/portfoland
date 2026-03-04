/**
 * Get GitHub Token Data Function
 *
 * Server-side only — retrieves the GitHub OAuth access token for a user
 * from the Better Auth `Account` table.
 */

import { prisma } from '@/lib/prisma'

// =============================================================================
// Data Function
// =============================================================================

/**
 * Retrieves the GitHub OAuth access token for the user from the Better Auth
 * Account record. Returns null if no GitHub account is connected.
 *
 * Queries `Account` where `userId` matches and `providerId === 'github'`.
 * GitHub tokens are long-lived; re-auth is triggered on 401 response.
 *
 * @param userId - The Portfoland user ID to look up
 * @returns The GitHub access token string, or `null` if not connected
 */
export async function getGitHubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: 'github',
    },
    select: {
      accessToken: true,
    },
  })

  return account?.accessToken ?? null
}
