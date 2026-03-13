/**
 * Get Portfolio Snapshot Data Function
 *
 * Fetches the user's portfolio state in a single efficient Prisma query
 * for use in quest condition checking.
 */

import { prisma } from '@/lib/prisma'
import type { UserPortfolioSnapshot } from '../types/quest'

// =============================================================================
// Query Function
// =============================================================================

/**
 * Build a snapshot of the user's portfolio state for quest condition evaluation.
 * Uses a single Prisma query with selective fields.
 *
 * @param userId - The authenticated user's ID
 * @returns A UserPortfolioSnapshot ready for condition checking
 */
export async function getPortfolioSnapshot(
  userId: string
): Promise<UserPortfolioSnapshot> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      bio: true,
      currentStreak: true,
      githubSyncedAt: true,
      _count: {
        select: {
          userSkills: true,
          projects: true,
          experiences: true,
          cvDocuments: true,
          accounts: { where: { providerId: 'github' } },
        },
      },
      skillAssessments: {
        where: { status: 'PASSED' },
        select: { id: true },
        take: 1,
      },
    },
  })

  return {
    hasBio: user.bio != null && user.bio.trim().length > 0,
    skillCount: user._count.userSkills,
    projectCount: user._count.projects,
    experienceCount: user._count.experiences,
    hasGitHub: user._count.accounts > 0,
    hasPassedAssessment: user.skillAssessments.length > 0,
    cvCount: user._count.cvDocuments,
    currentStreak: user.currentStreak,
    githubSyncedAt: user.githubSyncedAt ?? null,
  }
}
