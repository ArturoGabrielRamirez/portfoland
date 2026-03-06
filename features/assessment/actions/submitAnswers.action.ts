/**
 * Submit Answers Server Action
 *
 * Receives the completed answer set for an in-progress assessment, scores it
 * via scoreAssessmentService, and invalidates the relevant caches on success.
 *
 * Validation guards:
 *   1. Session — reject unauthenticated requests
 *   2. Yup schema — assessmentId required + exactly 5 answers with valid ranges
 *   3. Ownership — SkillAssessment must belong to the authenticated user
 *   4. Status guard — assessment must still be PENDING (not already completed)
 */

'use server';

import * as yup from 'yup';
import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { scoreAssessmentService } from '../services/scoreAssessment.service';
import type { ScoreResult } from '../types/assessment';
import type { AnswerInput } from '../services/scoreAssessment.service';

// =============================================================================
// Types
// =============================================================================

export interface SubmitAnswersInput {
  assessmentId: string;
  answers: AnswerInput[];
}

// =============================================================================
// Validation schema
// =============================================================================

const submitAnswersSchema = yup.object({
  assessmentId: yup.string().required('assessmentId is required'),
  answers: yup
    .array()
    .of(
      yup.object({
        questionIndex: yup
          .number()
          .min(0, 'questionIndex must be 0-4')
          .max(4, 'questionIndex must be 0-4')
          .required('questionIndex is required'),
        selectedIndex: yup
          .number()
          .min(0, 'selectedIndex must be 0-3')
          .max(3, 'selectedIndex must be 0-3')
          .required('selectedIndex is required'),
      })
    )
    .length(5, 'Exactly 5 answers are required')
    .required('answers are required'),
});

// =============================================================================
// Action
// =============================================================================

/**
 * Score a completed assessment and update the user's skill validation status.
 *
 * Calls `scoreAssessmentService` which handles:
 *   - Correct answer evaluation
 *   - AssessmentAttempt record creation
 *   - SkillAssessment status / score update
 *   - Reward application on pass (aiAssessmentValidated + XP)
 *   - Cooldown detection
 *
 * @param input - `{ assessmentId: string; answers: AnswerInput[] }`
 * @returns ActionResponse with ScoreResult on success
 */
export const submitAnswersAction = async (
  input: SubmitAnswersInput
): Promise<Awaited<ReturnType<typeof actionWrapper<ScoreResult>>>> => {
  return actionWrapper<ScoreResult>(async () => {
    // -------------------------------------------------------------------------
    // Step 1: Authenticate
    // -------------------------------------------------------------------------
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to submit answers');
    }

    const userId = session.user.id;

    // -------------------------------------------------------------------------
    // Step 2: Yup validation (exactly 5 answers, valid index ranges)
    // -------------------------------------------------------------------------
    const { assessmentId, answers } = await submitAnswersSchema.validate(input);

    // -------------------------------------------------------------------------
    // Step 3: Ownership check — fetch the assessment scoped to this user
    // -------------------------------------------------------------------------
    const assessment = await prisma.skillAssessment.findFirst({
      where: { id: assessmentId, userId },
      select: { id: true, status: true },
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // -------------------------------------------------------------------------
    // Step 4: Status guard — must still be PENDING
    // -------------------------------------------------------------------------
    if (assessment.status !== 'PENDING') {
      throw new Error('Assessment already completed');
    }

    // -------------------------------------------------------------------------
    // Step 5: Score the assessment (persists attempts, updates status/score,
    //         applies rewards on pass, computes cooldown if applicable)
    // -------------------------------------------------------------------------
    const scoreResult = await scoreAssessmentService(
      assessmentId,
      userId,
      answers as AnswerInput[]
    );

    // -------------------------------------------------------------------------
    // Step 6: Invalidate caches so the dashboard reflects the new state.
    // The second argument `{}` is required by this Next.js version's type signature.
    // -------------------------------------------------------------------------
    revalidatePath('/dashboard/skills');
    revalidateTag(`user-stats-${userId}`);

    return {
      payload: scoreResult,
      message: scoreResult.passed
        ? 'Assessment passed! Skill validated.'
        : 'Assessment failed. Review the skill and try again.',
    };
  });
};
