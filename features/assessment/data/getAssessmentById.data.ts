/**
 * Get Assessment By ID Data
 *
 * Fetches a SkillAssessment record with its associated questions, ordered by
 * questionIndex ascending. Validates userId ownership to prevent unauthorised access.
 */

import { prisma } from '@/lib/prisma';
import type { SkillAssessmentWithQuestions } from '../types/assessment';

// =============================================================================
// Data function
// =============================================================================

/**
 * Fetch a SkillAssessment with its questions, scoped to the requesting user.
 *
 * Returns `null` if:
 * - No assessment exists with the given ID
 * - The assessment belongs to a different user (ownership guard)
 *
 * @param assessmentId - The SkillAssessment `id` (cuid)
 * @param userId - The authenticated user's ID — must match `assessment.userId`
 * @returns Assessment with questions, or null if not found / not owned
 */
export async function getAssessmentByIdData(
  assessmentId: string,
  userId: string
): Promise<SkillAssessmentWithQuestions | null> {
  const assessment = await prisma.skillAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        orderBy: { questionIndex: 'asc' },
      },
    },
  });

  // Return null for both "not found" and "wrong owner" to avoid leaking IDs
  if (!assessment || assessment.userId !== userId) {
    return null;
  }

  return assessment;
}
