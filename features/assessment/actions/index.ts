/**
 * Assessment Actions Barrel
 *
 * Re-exports all server actions for the AI skill assessment feature.
 * Import from here when consuming actions in client components or other modules.
 */

export { startAssessmentAction } from './startAssessment.action';
export type { StartAssessmentInput, StartAssessmentResult } from './startAssessment.action';

export { submitAnswersAction } from './submitAnswers.action';
export type { SubmitAnswersInput } from './submitAnswers.action';
