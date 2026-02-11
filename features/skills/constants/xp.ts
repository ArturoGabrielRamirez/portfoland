/**
 * Skill XP and Level Constants
 *
 * Constants for XP values, level thresholds, and utility functions
 * for the skill tree visualization feature.
 */

// =============================================================================
// Level Thresholds
// =============================================================================

/**
 * XP thresholds for each skill level
 * Level 1: 0-199 XP (Novice)
 * Level 2: 200-499 XP (Apprentice)
 * Level 3: 500-999 XP (Journeyman)
 * Level 4: 1000-1999 XP (Expert)
 * Level 5: 2000+ XP (Master)
 */
export const SKILL_LEVEL_THRESHOLDS = {
  NOVICE: { min: 0, max: 199 },
  APPRENTICE: { min: 200, max: 499 },
  JOURNEYMAN: { min: 500, max: 999 },
  EXPERT: { min: 1000, max: 1999 },
  MASTER: { min: 2000, max: Infinity },
} as const;

/**
 * Ordered array of level thresholds for iteration
 */
export const LEVEL_THRESHOLDS_ARRAY = [
  { level: 1, name: 'NOVICE', min: 0, max: 199 },
  { level: 2, name: 'APPRENTICE', min: 200, max: 499 },
  { level: 3, name: 'JOURNEYMAN', min: 500, max: 999 },
  { level: 4, name: 'EXPERT', min: 1000, max: 1999 },
  { level: 5, name: 'MASTER', min: 2000, max: Infinity },
] as const;

// =============================================================================
// Level Names
// =============================================================================

/**
 * Display names for each skill level
 */
export const SKILL_LEVEL_NAMES = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Journeyman',
  4: 'Expert',
  5: 'Master',
} as const;

/**
 * Spanish translations for skill level names
 */
export const SKILL_LEVEL_NAMES_ES = {
  1: 'Novato',
  2: 'Aprendiz',
  3: 'Oficial',
  4: 'Experto',
  5: 'Maestro',
} as const;

/**
 * Get skill level name by locale
 */
export function getSkillLevelName(level: 1 | 2 | 3 | 4 | 5, locale: 'en' | 'es' = 'en'): string {
  return locale === 'es' ? SKILL_LEVEL_NAMES_ES[level] : SKILL_LEVEL_NAMES[level];
}

// =============================================================================
// Duration-based XP Values (Experience-linked skills)
// =============================================================================

/**
 * XP awarded based on experience duration
 * - 1-6 months: 100 XP
 * - 6-12 months: 250 XP
 * - 1-2 years: 500 XP
 * - 2+ years: 750 XP
 */
export const DURATION_XP_VALUES = {
  SHORT: { minMonths: 0, maxMonths: 6, xp: 100 },
  MEDIUM: { minMonths: 6, maxMonths: 12, xp: 250 },
  LONG: { minMonths: 12, maxMonths: 24, xp: 500 },
  EXTENDED: { minMonths: 24, maxMonths: Infinity, xp: 750 },
} as const;

/**
 * Ordered array of duration XP for calculation
 */
export const DURATION_XP_ARRAY = [
  { minMonths: 0, maxMonths: 6, xp: 100 },
  { minMonths: 6, maxMonths: 12, xp: 250 },
  { minMonths: 12, maxMonths: 24, xp: 500 },
  { minMonths: 24, maxMonths: Infinity, xp: 750 },
] as const;

// =============================================================================
// Self-Assessment XP Values (Manual skills)
// =============================================================================

/**
 * XP values for self-assessed skill levels
 * - Beginner: 100 XP
 * - Intermediate: 300 XP
 * - Advanced: 600 XP
 */
export const SELF_ASSESSMENT_XP_VALUES = {
  BEGINNER: 100,
  INTERMEDIATE: 300,
  ADVANCED: 600,
} as const;

export type SelfAssessmentLevel = keyof typeof SELF_ASSESSMENT_XP_VALUES;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate the number of months between two dates
 */
export function calculateMonthsDuration(startDate: Date, endDate: Date | null): number {
  const end = endDate ?? new Date();
  const start = new Date(startDate);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  return Math.max(0, yearDiff * 12 + monthDiff);
}

/**
 * Calculate XP based on experience duration
 * @param startDate - Start date of the experience
 * @param endDate - End date of the experience (null for current)
 * @returns XP value based on duration
 */
export function calculateDurationXP(startDate: Date, endDate: Date | null = null): number {
  const months = calculateMonthsDuration(startDate, endDate);

  // Find the appropriate XP tier based on duration
  for (const tier of DURATION_XP_ARRAY) {
    if (months >= tier.minMonths && months < tier.maxMonths) {
      return tier.xp;
    }
  }

  // Default to extended tier for 2+ years
  return DURATION_XP_VALUES.EXTENDED.xp;
}

/**
 * Calculate skill level from total XP
 * @param totalXP - Total accumulated XP for the skill
 * @returns Skill level (1-5)
 */
export function calculateLevelFromXP(totalXP: number): 1 | 2 | 3 | 4 | 5 {
  if (totalXP >= SKILL_LEVEL_THRESHOLDS.MASTER.min) return 5;
  if (totalXP >= SKILL_LEVEL_THRESHOLDS.EXPERT.min) return 4;
  if (totalXP >= SKILL_LEVEL_THRESHOLDS.JOURNEYMAN.min) return 3;
  if (totalXP >= SKILL_LEVEL_THRESHOLDS.APPRENTICE.min) return 2;
  return 1;
}

/**
 * Get XP required for next level
 * @param currentXP - Current XP amount
 * @returns XP needed to reach next level, or 0 if at max level
 */
export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevelFromXP(currentXP);

  if (currentLevel === 5) return 0;

  const nextLevelThreshold = LEVEL_THRESHOLDS_ARRAY[currentLevel].min;
  return nextLevelThreshold - currentXP;
}

/**
 * Calculate progress percentage within current level
 * @param totalXP - Total XP amount
 * @returns Progress percentage (0-100)
 */
export function calculateLevelProgress(totalXP: number): number {
  const level = calculateLevelFromXP(totalXP);
  const levelInfo = LEVEL_THRESHOLDS_ARRAY[level - 1];

  if (level === 5) {
    // For master level, show progress from 2000 to some cap (e.g., 5000)
    const masterCap = 5000;
    const progress = Math.min(100, ((totalXP - levelInfo.min) / (masterCap - levelInfo.min)) * 100);
    return Math.round(progress);
  }

  const xpInLevel = totalXP - levelInfo.min;
  const levelRange = levelInfo.max - levelInfo.min + 1;
  const progress = (xpInLevel / levelRange) * 100;

  return Math.round(Math.min(100, Math.max(0, progress)));
}

/**
 * Calculate total XP from multiple sources
 * @param xpAmounts - Array of XP values from different sources
 * @returns Total aggregated XP
 */
export function aggregateTotalXP(xpAmounts: number[]): number {
  return xpAmounts.reduce((total, xp) => total + xp, 0);
}

/**
 * Get self-assessment XP value
 * @param level - Self-assessment level
 * @returns XP value for the assessment level
 */
export function getSelfAssessmentXP(level: SelfAssessmentLevel): number {
  return SELF_ASSESSMENT_XP_VALUES[level];
}
