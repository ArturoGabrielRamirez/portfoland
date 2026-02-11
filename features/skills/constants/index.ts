/**
 * Skill Constants Index
 *
 * Re-exports all skill-related constants for convenient imports.
 */

// XP and Level Constants
export {
  SKILL_LEVEL_THRESHOLDS,
  LEVEL_THRESHOLDS_ARRAY,
  SKILL_LEVEL_NAMES,
  SKILL_LEVEL_NAMES_ES,
  DURATION_XP_VALUES,
  DURATION_XP_ARRAY,
  SELF_ASSESSMENT_XP_VALUES,
  calculateDurationXP,
  calculateLevelFromXP,
  calculateMonthsDuration,
  getXPToNextLevel,
  calculateLevelProgress,
  aggregateTotalXP,
  getSelfAssessmentXP,
  getSkillLevelName,
} from './xp';
export type { SelfAssessmentLevel } from './xp';

// Category Constants
export {
  DEFAULT_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_GLOW_COLORS,
  CATEGORY_COLOR_CLASSES,
  CATEGORY_ICONS,
  getCategoryBySlug,
  getCategoryColor,
  getCategoryName,
  getAllCategorySlugs,
} from './categories';
export type { CategorySlug } from './categories';

// Level Visual Constants
export {
  LEVEL_VISUAL_STYLES,
  LEVEL_TAILWIND_CLASSES,
  LEVEL_BADGE_COLORS,
  LEVEL_GLOW_FILTERS,
  LEVEL_ANIMATIONS,
  getLevelVisualStyle,
  getLevelTailwindClasses,
  getLevelBadgeColors,
  shouldShowParticles,
  shouldShowCrown,
} from './levels';

// Message Constants
export {
  SKILL_MESSAGES,
  SKILL_MESSAGES_EN,
  SKILL_MESSAGES_ES,
  SKILL_FORM_LABELS,
  SKILL_FORM_LABELS_EN,
  SKILL_FORM_LABELS_ES,
  SELF_ASSESSMENT_LABELS,
  SELF_ASSESSMENT_LABELS_EN,
  SELF_ASSESSMENT_LABELS_ES,
  getSkillMessage,
  getSkillMessages,
  getSkillFormLabels,
  getSelfAssessmentLabels,
} from './messages';
export type { MessageKey } from './messages';
