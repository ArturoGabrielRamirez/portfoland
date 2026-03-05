/**
 * Assessment Token Data
 *
 * Reads the current assessment token state from User.meta without consuming tokens.
 * Token state is stored as JSON in the User.meta field alongside other meta properties.
 */

import { prisma } from '@/lib/prisma';
import type { AssessmentTokenInfo } from '@/features/assessment/types/assessment';
import { DEFAULT_ASSESSMENT_TOKENS } from '@/features/assessment/constants/tokens';

// =============================================================================
// Data Access
// =============================================================================

/**
 * Retrieve the current assessment token info for a user.
 *
 * If the `assessmentTokens` field is absent from `User.meta` (new user or
 * field not yet written), returns a default value with a full token allowance
 * so the first call can proceed without a prior write.
 *
 * @param userId - The user ID to look up
 * @returns AssessmentTokenInfo with remaining count and last reset date
 */
export async function getAssessmentTokensData(userId: string): Promise<AssessmentTokenInfo> {
  const today = new Date().toISOString().split('T')[0];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user?.meta) {
    return { remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: today };
  }

  const meta = user.meta as { assessmentTokens?: AssessmentTokenInfo };

  if (!meta.assessmentTokens) {
    return { remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: today };
  }

  // If the last reset was on a previous day, the tokens have refreshed.
  // Return the full allowance so the widget displays correctly before the
  // first consumption (which triggers the actual atomic reset in the service).
  if (meta.assessmentTokens.lastResetDate !== today) {
    return { remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: today };
  }

  return meta.assessmentTokens;
}
