/**
 * Start Assessment Server Action
 *
 * Initialises a new AI skill assessment session for the authenticated user.
 * Guards are enforced in strict order before any token is consumed or any
 * AI generation is triggered.
 *
 * Guard order:
 *   1. Session — reject unauthenticated requests
 *   2. Yup schema — reject invalid / unsupported skillSlug
 *   3. Already-validated — skip if the skill already has aiAssessmentValidated
 *   4. Cooldown — reject if >= MAX_ATTEMPTS_BEFORE_COOLDOWN failures in 24 h
 *   5. Token consumption — reject if no daily tokens remain
 *   6. AI generation → DB persist → client-safe projection
 *
 * IMPORTANT: `correctIndex` and `explanation` are NEVER included in the
 * returned questions. The mapping to QuestionForClient happens here so the
 * answer key stays server-side only.
 */

'use server';

import * as yup from 'yup';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { ASSESSMENT_MESSAGES } from '../constants/messages';
import {
  MAX_ATTEMPTS_BEFORE_COOLDOWN,
  COOLDOWN_HOURS,
} from '../constants/tokens';
import { ASSESSMENT_SUPPORTED_SKILL_SLUGS } from '../constants/supportedSkills';
import { consumeAssessmentToken } from '../services/assessmentToken.service';
import { generateQuestionsService } from '../services/generateQuestions.service';
import { createAssessmentData } from '../data/createAssessment.data';
import { getAttemptCountData } from '../data/getAttemptCount.data';
import { SKILL_LEVEL_NAMES } from '@/features/skills/constants/xp';
import type { QuestionForClient } from '../types/assessment';

// =============================================================================
// Types
// =============================================================================

export interface StartAssessmentInput {
  skillSlug: string;
}

export interface StartAssessmentResult {
  assessmentId: string;
  questions: QuestionForClient[];
  attemptsUsed: number;
  tokensRemaining: number;
}

// =============================================================================
// Validation schema
// =============================================================================

const startAssessmentSchema = yup.object({
  skillSlug: yup
    .string()
    .required('skillSlug is required')
    .oneOf(ASSESSMENT_SUPPORTED_SKILL_SLUGS, 'Skill is not supported for assessment'),
});

// =============================================================================
// Action
// =============================================================================

/**
 * Begin an AI skill assessment for a supported skill slug.
 *
 * @param input - `{ skillSlug: string }` — must be one of ASSESSMENT_SUPPORTED_SKILL_SLUGS
 * @returns ActionResponse with StartAssessmentResult on success,
 *          or an error response with a descriptive message
 */
export const startAssessmentAction = async (
  input: StartAssessmentInput
): Promise<Awaited<ReturnType<typeof actionWrapper<StartAssessmentResult>>>> => {
  return actionWrapper<StartAssessmentResult>(async () => {
    // -------------------------------------------------------------------------
    // Step 1: Authenticate
    // -------------------------------------------------------------------------
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to start an assessment');
    }

    const userId = session.user.id;

    // -------------------------------------------------------------------------
    // Step 2: Yup validation
    // -------------------------------------------------------------------------
    const { skillSlug } = await startAssessmentSchema.validate(input);

    // -------------------------------------------------------------------------
    // Step 3: Fetch the user's UserSkill for this slug — needed for level info
    //         and for the aiAssessmentValidated guard
    // -------------------------------------------------------------------------
    const userSkill = await prisma.userSkill.findFirst({
      where: {
        userId,
        skill: { slug: skillSlug },
      },
      include: { skill: true },
    });

    if (!userSkill) {
      throw new Error('You do not have this skill in your profile');
    }

    // -------------------------------------------------------------------------
    // Guard 1: Already validated — do not allow re-assessment
    // -------------------------------------------------------------------------
    if (userSkill.aiAssessmentValidated === true) {
      throw new Error(ASSESSMENT_MESSAGES.ALREADY_VALIDATED);
    }

    // -------------------------------------------------------------------------
    // Guard 2: Cooldown — count FAILED attempts in the last 24 h
    // -------------------------------------------------------------------------
    const cooldownWindowStart = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);

    const failedCount = await prisma.skillAssessment.count({
      where: {
        userId,
        skillSlug,
        status: { in: ['FAILED'] },
        startedAt: { gte: cooldownWindowStart },
      },
    });

    if (failedCount >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
      // Find the earliest failed attempt to compute when the cooldown expires
      const earliest = await prisma.skillAssessment.findFirst({
        where: {
          userId,
          skillSlug,
          status: 'FAILED',
          startedAt: { gte: cooldownWindowStart },
        },
        orderBy: { startedAt: 'asc' },
        select: { startedAt: true },
      });

      const cooldownEndsAt = earliest
        ? new Date(earliest.startedAt.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000)
        : new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000);

      throw new Error(
        `${ASSESSMENT_MESSAGES.COOLDOWN_ACTIVE} Cooldown ends at: ${cooldownEndsAt.toISOString()}`
      );
    }

    // -------------------------------------------------------------------------
    // Guard 3: Consume a token — reject if the user is out of tokens
    // -------------------------------------------------------------------------
    const tokenResult = await consumeAssessmentToken(userId);

    if (!tokenResult.hasTokens) {
      throw new Error(ASSESSMENT_MESSAGES.NO_TOKENS);
    }

    // -------------------------------------------------------------------------
    // Step 4: Determine attemptNumber (completed attempts in window + 1)
    // -------------------------------------------------------------------------
    const attemptsUsed = await getAttemptCountData(userId, skillSlug, cooldownWindowStart);
    const attemptNumber = attemptsUsed + 1;

    // -------------------------------------------------------------------------
    // Step 5: Resolve level name from the UserSkill level
    // -------------------------------------------------------------------------
    const skillLevel = userSkill.level as 1 | 2 | 3 | 4 | 5;
    const levelName = SKILL_LEVEL_NAMES[skillLevel] ?? 'Novice';
    const skillName = userSkill.skill.name;

    // -------------------------------------------------------------------------
    // Step 6: Generate questions via Claude
    // -------------------------------------------------------------------------
    const generatedQuestions = await generateQuestionsService(skillName, levelName);

    // -------------------------------------------------------------------------
    // Step 7: Persist assessment + questions to DB
    // -------------------------------------------------------------------------
    const assessment = await createAssessmentData({
      userId,
      userSkillId: userSkill.id,
      skillSlug,
      skillLevel,
      attemptNumber,
      questions: generatedQuestions,
    });

    // -------------------------------------------------------------------------
    // Step 8: Map to QuestionForClient — strip correctIndex and explanation
    //         so the answer key never reaches the browser
    // -------------------------------------------------------------------------
    const questionsForClient: QuestionForClient[] = generatedQuestions.map((q, index) => ({
      // The DB id is not yet available from createAssessmentData (questions are
      // created via createMany which doesn't return individual ids). We use a
      // deterministic placeholder that the submit action doesn't rely on.
      id: `${assessment.id}-q${index}`,
      questionIndex: index,
      questionText: q.questionText,
      options: q.options,
      // correctIndex and explanation are intentionally omitted
    }));

    return {
      payload: {
        assessmentId: assessment.id,
        questions: questionsForClient,
        attemptsUsed: attemptNumber,
        tokensRemaining: tokenResult.remaining === Infinity ? 999 : tokenResult.remaining,
      },
      message: ASSESSMENT_MESSAGES.START_SUCCESS,
    };
  });
};
