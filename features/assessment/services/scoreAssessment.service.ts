/**
 * Score Assessment Service
 *
 * Evaluates a submitted answer set against the stored correct answers,
 * persists attempt records, updates assessment status/score, and (on pass)
 * delegates to applyAssessmentRewardsService.
 */

import { prisma } from '@/lib/prisma';
import { getAssessmentByIdData } from '../data/getAssessmentById.data';
import { applyAssessmentRewardsService } from './applyAssessmentRewards.service';
import { QUESTIONS_PER_ASSESSMENT, PASS_THRESHOLD, MAX_ATTEMPTS_BEFORE_COOLDOWN, COOLDOWN_HOURS } from '../constants/tokens';
import type { ScoreResult, ReviewItem } from '../types/assessment';

// =============================================================================
// Types
// =============================================================================

export interface AnswerInput {
  /** 0-based index of the question being answered */
  questionIndex: number;
  /** 0-based index of the selected option */
  selectedIndex: number;
}

// =============================================================================
// Service function
// =============================================================================

/**
 * Score a completed assessment and apply rewards on pass.
 *
 * Steps:
 * 1. Fetch assessment + questions (ownership-validated)
 * 2. Compute correctCount, score percentage, and pass/fail
 * 3. Persist one AssessmentAttempt record per answer
 * 4. Update SkillAssessment status, score, and completedAt
 * 5. On pass — call applyAssessmentRewardsService
 * 6. Check if a cooldown should now apply (≥ MAX_ATTEMPTS_BEFORE_COOLDOWN failed)
 *
 * @param assessmentId - The ID of the SkillAssessment to score
 * @param userId - Must match assessment.userId (ownership enforced by data layer)
 * @param answers - Exactly 5 answer inputs indexed 0-4
 * @returns ScoreResult with score, pass/fail, XP awarded, and optional cooldown info
 * @throws Error if assessment not found or userId mismatch
 */
export async function scoreAssessmentService(
  assessmentId: string,
  userId: string,
  answers: AnswerInput[]
): Promise<ScoreResult> {
  // -------------------------------------------------------------------------
  // Step 1: Fetch assessment with questions (ownership guard built-in)
  // -------------------------------------------------------------------------
  const assessment = await getAssessmentByIdData(assessmentId, userId);

  if (!assessment) {
    throw new Error('Assessment not found or access denied.');
  }

  const { questions } = assessment;

  // -------------------------------------------------------------------------
  // Step 2: Compute score
  // -------------------------------------------------------------------------
  const correctCount = answers.filter(
    (a) => questions[a.questionIndex]?.correctIndex === a.selectedIndex
  ).length;

  const score = Math.round((correctCount / QUESTIONS_PER_ASSESSMENT) * 100);
  const passed = score >= PASS_THRESHOLD;

  // -------------------------------------------------------------------------
  // Step 3: Persist attempt records
  // -------------------------------------------------------------------------
  await prisma.assessmentAttempt.createMany({
    data: answers.map((a) => ({
      assessmentId,
      questionIndex: a.questionIndex,
      selectedIndex: a.selectedIndex,
      isCorrect: questions[a.questionIndex]?.correctIndex === a.selectedIndex,
    })),
  });

  // -------------------------------------------------------------------------
  // Step 4: Update SkillAssessment status, score, completedAt
  // -------------------------------------------------------------------------
  await prisma.skillAssessment.update({
    where: { id: assessmentId },
    data: {
      status: passed ? 'PASSED' : 'FAILED',
      score,
      completedAt: new Date(),
    },
  });

  // -------------------------------------------------------------------------
  // Step 5: Apply rewards on pass
  // -------------------------------------------------------------------------
  if (passed) {
    await applyAssessmentRewardsService(userId, assessment.userSkillId, score);
  }

  // -------------------------------------------------------------------------
  // Step 6: Count failed attempts in the last 24 h to detect cooldown
  // -------------------------------------------------------------------------
  const cooldownWindowStart = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);

  const failedAttemptsCount = await prisma.skillAssessment.count({
    where: {
      userId,
      skillSlug: assessment.skillSlug,
      status: 'FAILED',
      startedAt: { gte: cooldownWindowStart },
    },
  });

  const attemptsUsed = failedAttemptsCount;
  let cooldownEndsAt: Date | undefined;

  if (!passed && failedAttemptsCount >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
    // The earliest failed attempt in the window sets the cooldown expiry
    const earliest = await prisma.skillAssessment.findFirst({
      where: {
        userId,
        skillSlug: assessment.skillSlug,
        status: 'FAILED',
        startedAt: { gte: cooldownWindowStart },
      },
      orderBy: { startedAt: 'asc' },
      select: { startedAt: true },
    });

    if (earliest) {
      cooldownEndsAt = new Date(earliest.startedAt.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);
    }
  }

  // Build per-question review items — safe post-submit since scoring is done
  const reviewItems: ReviewItem[] = answers.map((a) => {
    const q = questions[a.questionIndex];
    return {
      questionIndex: a.questionIndex,
      questionText: q?.questionText ?? '',
      options: (q?.options as string[]) ?? [],
      selectedIndex: a.selectedIndex,
      correctIndex: q?.correctIndex ?? 0,
      explanation: q?.explanation ?? '',
      isCorrect: q?.correctIndex === a.selectedIndex,
    };
  }).sort((a, b) => a.questionIndex - b.questionIndex);

  return {
    score,
    passed,
    correctCount,
    xpAwarded: passed ? 200 : 0,
    attemptsUsed,
    cooldownEndsAt,
    reviewItems,
  };
}
