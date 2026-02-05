/**
 * Skills Feature Module
 *
 * RPG-style skill tree visualization with XP-based progression,
 * ecosystem dependencies, and interactive galaxy/constellation navigation.
 *
 * @module features/skills
 */

// =============================================================================
// Components
// =============================================================================

export {
  // Core components
  SkillHexagonNode,
  SkillDetailCard,
  XPSourceList,
  // Form components
  ManualSkillForm,
  ManualSkillModal,
  CategorySelect,
  CreateCategoryModal,
  // List components
  MobileSkillList,
  MobileSkillItem,
  // Suggestion components
  SkillSuggestions,
  // Galaxy visualization components
  StarfieldBackground,
  CategoryCluster,
  SkillConnections,
  GalaxyCanvas,
  ZoomControls,
  // View components
  SkillTreeView,
  AddSkillFAB,
} from './components';

// =============================================================================
// Server Actions
// =============================================================================

export {
  // Query actions
  getSkills,
  getSkillById,
  getPublicSkillById,
  // Mutation actions
  createSkill,
  updateSkill,
  deleteSkill,
  createCategory,
  syncSkillsFromExperience,
  // Types
  type GetSkillsResponse,
  type DeleteSkillResult,
  type SyncSkillsResponse,
} from './actions';

// =============================================================================
// Types
// =============================================================================

export type {
  // Prisma re-exports
  Skill,
  SkillCategory,
  UserSkill,
  SkillSource,
  SourceType,
  // Extended types with relations
  SkillWithCategory,
  UserSkillWithDetails,
  SkillSourceWithExperience,
  SkillCategoryWithCount,
  // Metadata types
  SkillSourceMetadata,
  // Input types
  CreateSkillInput,
  UpdateSkillInput,
  CreateCategoryInput,
  SyncSkillsFromExperienceInput,
  // Component props
  SkillHexagonNodeProps,
  SkillDetailCardProps,
  ManualSkillFormProps,
  CategorySelectProps,
  XPSourceListProps,
  MobileSkillItemProps,
  MobileSkillListProps,
  SkillTreeViewProps,
  // Stats types
  SkillStats,
  SkillsByCategory,
} from './types/skill';

export { SkillLevel, SourceTypeEnum } from './types/skill';

// =============================================================================
// Constants
// =============================================================================

// XP and Level constants
export {
  SKILL_LEVEL_THRESHOLDS,
  LEVEL_THRESHOLDS_ARRAY,
  SKILL_LEVEL_NAMES,
  SKILL_LEVEL_NAMES_ES,
  getSkillLevelName,
  DURATION_XP_VALUES,
  DURATION_XP_ARRAY,
  SELF_ASSESSMENT_XP_VALUES,
  calculateMonthsDuration,
  calculateDurationXP,
  calculateLevelFromXP,
  getXPToNextLevel,
  calculateLevelProgress,
  aggregateTotalXP,
  getSelfAssessmentXP,
  type SelfAssessmentLevel,
} from './constants/xp';

// Category constants
export {
  DEFAULT_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  getCategoryBySlug,
  getCategoryColor,
} from './constants/categories';

// Level visual constants
export {
  LEVEL_VISUAL_STYLES,
  getLevelVisualStyle,
} from './constants/levels';

// Suggestion constants
export {
  SKILL_PROGRESSIONS,
  SKILL_PAIRINGS,
  getSmartSuggestions,
} from './constants/suggestions';

// Message constants
export { SKILL_MESSAGES } from './constants/messages';

// =============================================================================
// Data Layer
// =============================================================================

export {
  // Category queries
  getSkillCategoriesData,
  getDefaultCategoriesData,
  getCategoryByIdData,
  getCategoryBySlugData,
  // User skills queries
  getUserSkillsData,
  getUserSkillsByCategoryData,
  getUserSkillBySkillIdData,
  // Single skill queries
  getSkillByIdData,
  getSkillByIdForUserData,
  getGlobalSkillByIdData,
  getGlobalSkillBySlugData,
  // Public skills queries
  getPublicSkillsByUsername,
  type PublicSkillsData,
  // Create operations
  createUserSkillData,
  createUserSkillFromExperienceData,
  type CreateUserSkillInput,
  // Update operations
  updateUserSkillData,
  recalculateUserSkillXPData,
  addSourceToUserSkillData,
  type UpdateUserSkillInput,
  // Delete operations
  deleteUserSkillData,
  forceDeleteUserSkillData,
  removeSkillSourceData,
  removeSourcesByExperienceData,
  type DeleteUserSkillResult,
  // Category operations
  createSkillCategoryData,
  updateSkillCategoryData,
  deleteSkillCategoryData,
  type CreateSkillCategoryInput,
  // Experience sync operations
  syncSkillFromExperienceData,
  syncSkillsFromExperienceData,
  removeUnlinkedSkillSourcesData,
  getDefaultCategoryForExperienceData,
  type SyncSkillFromExperienceInput,
} from './data';

// =============================================================================
// Schemas
// =============================================================================

export {
  createSkillSchema,
  updateSkillSchema,
  createCategorySchema,
  manualSkillEntrySchema,
} from './schemas/skill.schema';
