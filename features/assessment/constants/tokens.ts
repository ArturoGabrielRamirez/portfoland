/**
 * Assessment Token Constants
 *
 * Numeric configuration values for the AI skill assessment system.
 * All feature code imports these rather than using magic numbers inline.
 */

// =============================================================================
// Token Limits
// =============================================================================

/** Daily token allowance granted to each user for running assessments */
export const DEFAULT_ASSESSMENT_TOKENS = 3;

// =============================================================================
// Scoring
// =============================================================================

/** Minimum percentage score required to pass an assessment */
export const PASS_THRESHOLD = 60;

/** Number of questions generated and presented per assessment session */
export const QUESTIONS_PER_ASSESSMENT = 5;

// =============================================================================
// Cooldown
// =============================================================================

/** Number of failed attempts within the cooldown window before a cooldown is applied */
export const MAX_ATTEMPTS_BEFORE_COOLDOWN = 3;

/** Hours a user must wait after hitting MAX_ATTEMPTS_BEFORE_COOLDOWN */
export const COOLDOWN_HOURS = 24;
