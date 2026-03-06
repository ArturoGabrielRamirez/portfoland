/**
 * Create Assessment Data
 *
 * Persists a new SkillAssessment and its associated AssessmentQuestion records
 * inside a single Prisma transaction. The action layer calls this after
 * generateQuestionsService returns validated question data.
 */

import { prisma } from '@/lib/prisma';
import type { SkillAssessment } from '@/app/generated/prisma/client';
import type { GeneratedQuestion } from '../services/generateQuestions.service';

// =============================================================================
// Types
// =============================================================================

export interface CreateAssessmentInput {
  userId: string;
  userSkillId: string;
  skillSlug: string;
  /** Numeric level (1-5) of the UserSkill at the time of the assessment */
  skillLevel: number;
  /** 1-based count of prior attempts for this user+skill within the cooldown window */
  attemptNumber: number;
  /** Validated questions from generateQuestionsService */
  questions: GeneratedQuestion[];
}

// =============================================================================
// Data function
// =============================================================================

/**
 * Persist a new assessment session with its questions inside a transaction.
 *
 * @param input - Assessment metadata and generated questions
 * @returns The created SkillAssessment record (without questions relation)
 */
export async function createAssessmentData(
  input: CreateAssessmentInput
): Promise<SkillAssessment> {
  const { userId, userSkillId, skillSlug, skillLevel, attemptNumber, questions } = input;

  return await prisma.$transaction(async (tx) => {
    // Create the parent assessment record
    const assessment = await tx.skillAssessment.create({
      data: {
        userId,
        userSkillId,
        skillSlug,
        skillLevel,
        attemptNumber,
      },
    });

    // Persist all questions linked to the assessment
    await tx.assessmentQuestion.createMany({
      data: questions.map((q, index) => ({
        assessmentId: assessment.id,
        questionIndex: index,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    });

    return assessment;
  });
}
