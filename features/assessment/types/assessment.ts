/**
 * Assessment Types
 *
 * TypeScript types for the AI skill assessment feature.
 * Prisma model types are imported directly from the generated client.
 */

import type { UserSkillWithDetails } from '@/features/skills/types/skill';
import type {
  SkillAssessment,
  AssessmentQuestion,
  AssessmentAttempt,
} from '@/app/generated/prisma/client';

// =============================================================================
// Prisma Types (generated from schema — re-exported for consumers)
// =============================================================================

export type { SkillAssessment, AssessmentQuestion, AssessmentAttempt };
export { AssessmentStatus } from '@/app/generated/prisma/client';

// =============================================================================
// Client-Safe Types
// =============================================================================

/**
 * Subset of AssessmentQuestion that is safe to send to the client.
 * Deliberately excludes `correctIndex` and `explanation` so the browser
 * never receives the answer key.
 */
export type QuestionForClient = {
  id: string;
  questionIndex: number;
  questionText: string;
  options: string[];
};

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
 * Uses Prisma.SkillAssessmentGetPayload shape — extend as needed for other relations.
 */
export interface SkillAssessmentWithQuestions extends SkillAssessment {
  questions: AssessmentQuestion[];
}
