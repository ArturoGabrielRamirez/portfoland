/**
 * Skills Data Layer
 *
 * Pure database query functions for the Skills feature.
 * These functions handle direct database operations without business logic.
 */

// Category queries
export {
  getSkillCategoriesData,
  getDefaultCategoriesData,
  getCategoryByIdData,
  getCategoryBySlugData,
} from './getSkillCategories.data';

// User skills queries
export {
  getUserSkillsData,
  getUserSkillsByCategoryData,
  getUserSkillBySkillIdData,
} from './getUserSkills.data';

// Single skill queries
export {
  getSkillByIdData,
  getSkillByIdForUserData,
  getGlobalSkillByIdData,
  getGlobalSkillBySlugData,
} from './getSkillById.data';

// Public skills queries
export {
  getPublicSkillsByUsername,
  type PublicSkillsData,
} from './getPublicSkills.data';

// Create operations
export {
  createUserSkillData,
  createUserSkillFromExperienceData,
  type CreateUserSkillInput,
} from './createUserSkill.data';

// Update operations
export {
  updateUserSkillData,
  recalculateUserSkillXPData,
  addSourceToUserSkillData,
  type UpdateUserSkillInput,
} from './updateUserSkill.data';

// Delete operations
export {
  deleteUserSkillData,
  forceDeleteUserSkillData,
  removeSkillSourceData,
  removeSourcesByExperienceData,
  type DeleteUserSkillResult,
} from './deleteUserSkill.data';

// Category operations
export {
  createSkillCategoryData,
  updateSkillCategoryData,
  deleteSkillCategoryData,
  type CreateSkillCategoryInput,
} from './createSkillCategory.data';

// Seed operations
export {
  seedDefaultCategories,
  ensureDefaultCategories,
} from './seedDefaultCategories.data';

// Experience sync operations
export {
  syncSkillFromExperienceData,
  syncSkillsFromExperienceData,
  removeUnlinkedSkillSourcesData,
  getDefaultCategoryForExperienceData,
  type SyncSkillFromExperienceInput,
} from './syncSkillFromExperience.data';
