/**
 * Assessment Types
 *
 * TypeScript types for the AI skill assessment feature.
 *
 * NOTE: The Prisma models SkillAssessment, AssessmentQuestion, AssessmentAttempt,
 * and AssessmentStatus enum are defined by TG1 (schema changes). Until TG1 runs
 * and `bunx prisma generate` is executed, those types are defined manually below
 * using the same shape as the planned Prisma schema. Once TG1 is complete, replace
 * the manual definitions with direct imports from `@/app/generated/prisma/client`.
 */

import type { UserSkillWithDetails } from '@/features/skills/types/skill';

// =============================================================================
// Prisma Type Placeholders
// (Replace with imports from @/app/generated/prisma/client after TG1 + prisma generate)
// =============================================================================

/**
 * Assessment completion status — mirrors the planned AssessmentStatus Prisma enum.
 * After TG1: import { AssessmentStatus } from '@/app/generated/prisma/client'
 */
export type AssessmentStatus = 'PENDING' | 'PASSED' | 'FAILED';

/**
 * SkillAssessment record — mirrors the planned Prisma model shape.
 * After TG1: import { SkillAssessment } from '@/app/generated/prisma/client'
 */
export interface SkillAssessment {
  id: string;
  userId: string;
  userSkillId: string;
  skillSlug: string;
  skillLevel: number;
  status: AssessmentStatus;
  score: number | null;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AssessmentQuestion record — mirrors the planned Prisma model shape.
 * After TG1: import { AssessmentQuestion } from '@/app/generated/prisma/client'
 */
export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionIndex: number;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  createdAt: Date;
}

/**
 * AssessmentAttempt record — mirrors the planned Prisma model shape.
 * After TG1: import { AssessmentAttempt } from '@/app/generated/prisma/client'
 */
export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: Date;
}

// =============================================================================
// Client-Safe Types
// =============================================================================

/**
 * Subset of AssessmentQuestion that is safe to send to the client.
 * Deliberately excludes `correctIndex` and `explanation` so the browser
 * never receives the answer key.
 */
export type QuestionForClient = Pick<
  AssessmentQuestion,
  'id' | 'questionIndex' | 'questionText' | 'options'
>;

// =============================================================================
// Result and State Types
// =============================================================================

/**
 * Returned by scoreAssessmentService after all answers are evaluated.
 */
export interface ScoreResult {
  score: number;
  passed: boolean;
  correctCount: number;
  xpAwarded: number;
  attemptsUsed: number;
  /** Set when the user has hit MAX_ATTEMPTS_BEFORE_COOLDOWN — UI shows countdown */
  cooldownEndsAt?: Date;
}

/**
 * UI state machine for the AssessmentModal flow.
 */
export type AssessmentState =
  | 'idle'
  | 'loading'
  | 'in_progress'
  | 'submitting'
  | 'result';

// =============================================================================
// Token Types
// =============================================================================

/**
 * Assessment token availability for a user, persisted in User.meta.
 */
export interface AssessmentTokenInfo {
  remaining: number;
  /** ISO date string — used to detect when a daily reset is due */
  lastResetDate: string;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for AssessmentWidget dashboard component.
 */
export interface AssessmentWidgetProps {
  /** Pre-filtered to supported slugs by the page server component */
  userSkills: UserSkillWithDetails[];
  assessmentTokens: AssessmentTokenInfo;
  /** Fires when any assessment is passed — used to trigger CRT xpGain animation */
  onAssessmentPass?: () => void;
}

/**
 * Props for AssessmentModal quiz flow component.
 */
export interface AssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillSlug: string;
  skillName: string;
  skillLevel: number;
  /** Optional callback fired after the user closes the modal following a pass */
  onPassComplete?: () => void;
}

// =============================================================================
// Extended Relation Types
// =============================================================================

/**
 * SkillAssessment with its questions relation included.
 * Mirrors what Prisma.SkillAssessmentGetPayload<{ include: { questions: true } }> will return
 * once TG1 schema is applied and prisma generate runs.
 */
export interface SkillAssessmentWithQuestions extends SkillAssessment {
  questions: AssessmentQuestion[];
}
