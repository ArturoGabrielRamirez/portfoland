/**
 * Assessment Messages Constants
 *
 * User-facing string messages for the AI skill assessment feature.
 * Centralised here so UI components and action layers use identical copy.
 */

// =============================================================================
// Assessment Messages
// =============================================================================

export const ASSESSMENT_MESSAGES = {
  /** Returned when an assessment session is successfully initialised */
  START_SUCCESS: 'Assessment initialized',

  /** Guard message when the user attempts to assess a skill already validated */
  ALREADY_VALIDATED: 'This skill is already AI assessment validated',

  /** Shown when the user has exhausted their daily token allocation */
  NO_TOKENS: 'No assessment tokens remaining today. Come back tomorrow.',

  /** Shown when the user has hit MAX_ATTEMPTS_BEFORE_COOLDOWN within 24 h */
  COOLDOWN_ACTIVE: 'Maximum attempts reached. Try again in 24 hours.',

  /** Shown on the result screen when the user passes */
  PASS: 'Assessment passed! Skill validated.',

  /** Shown on the result screen when the user fails */
  FAIL: 'Assessment failed. Review the skill and try again.',

  /** Shown when Claude fails to generate valid question JSON */
  GENERATION_ERROR: 'Failed to generate assessment questions. Please try again.',
} as const;
