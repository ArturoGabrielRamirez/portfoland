/**
 * Get Attempt Count Data
 *
 * Returns the number of completed (non-PENDING) SkillAssessment records for a
 * given user + skill combination within a rolling time window.
 *
 * Used by startAssessment.action for two purposes:
 *   1. Cooldown enforcement — count FAILED records to compare against MAX_ATTEMPTS_BEFORE_COOLDOWN
 *   2. Attempt numbering — count all completed records to derive the next attemptNumber
 */

import { prisma } from '@/lib/prisma';

// =============================================================================
// Data function
// =============================================================================

/**
 * Count completed assessment attempts for a user+skill pair since a given date.
 *
 * Excludes PENDING assessments so only finalised records are counted. This
 * prevents in-flight sessions from inflating the cooldown counter.
 *
 * @param userId    - The authenticated user's ID
 * @param skillSlug - Skill identifier, e.g. `'typescript'`
 * @param since     - Lower bound for `startedAt` (inclusive); pass `new Date(Date.now() - 24h)` for the cooldown window
 * @returns Count of matching SkillAssessment records
 */
export async function getAttemptCountData(
  userId: string,
  skillSlug: string,
  since: Date
): Promise<number> {
  return prisma.skillAssessment.count({
    where: {
      userId,
      skillSlug,
      startedAt: { gte: since },
      // Only finalised assessments count — exclude sessions still in progress
      status: { not: 'PENDING' },
    },
  });
}
