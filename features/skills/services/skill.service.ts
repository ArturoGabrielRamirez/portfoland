/**
 * Skill Service Layer
 *
 * Business logic for skill operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { SelfAssessmentLevel } from '../constants/xp';
import { SKILL_MESSAGES_EN } from '../constants/messages';
import type { UserSkillWithDetails } from '../types/skill';
import {
  createUserSkillData,
  updateUserSkillData,
  deleteUserSkillData,
  getSkillByIdForUserData,
  getSkillCategoriesData,
  syncSkillsFromExperienceData,
  removeUnlinkedSkillSourcesData,
  getDefaultCategoryForExperienceData,
} from '../data';
import { invalidateNarrativeCache } from '@/lib/ai/cache';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a skill via service
 */
export interface CreateSkillServiceInput {
  userId: string;
  name: string;
  categoryId?: string;
  selfAssessmentLevel: SelfAssessmentLevel;
  learningSources?: string;
  dateStarted?: Date;
}

/**
 * Input for updating a skill via service
 */
export interface UpdateSkillServiceInput {
  id: string;
  userId: string; // For ownership validation
  selfAssessmentLevel?: SelfAssessmentLevel;
  learningSources?: string;
}

/**
 * Input for syncing skills from an experience
 */
export interface SyncSkillsFromExperienceServiceInput {
  userId: string;
  experienceId: string;
  skills: string[];
  startDate: Date;
  endDate: Date | null;
}

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Create a new manual skill entry
 *
 * Validates input and creates skill with MANUAL source.
 *
 * @param input - The skill creation data
 * @returns The created user skill with details
 * @throws Error if validation fails
 */
export async function createSkillService(
  input: CreateSkillServiceInput
): Promise<UserSkillWithDetails> {
  const { userId, name, categoryId, selfAssessmentLevel, learningSources, dateStarted } = input;

  // Validate skill name is not empty
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error(SKILL_MESSAGES_EN.invalidInput);
  }

  // Get default category if not provided
  let finalCategoryId = categoryId;
  if (!finalCategoryId) {
    // Use the first available category (Core/Fundamentals)
    const categories = await getSkillCategoriesData(userId);
    const coreCategory = categories.find((c) => c.slug === 'core') || categories[0];
    if (!coreCategory) {
      throw new Error('No skill categories available');
    }
    finalCategoryId = coreCategory.id;
  }

  // Create the skill
  const userSkill = await createUserSkillData({
    userId,
    skillName: trimmedName,
    categoryId: finalCategoryId,
    selfAssessmentLevel,
    learningSources: learningSources?.trim(),
    dateStarted,
  });

  invalidateNarrativeCache(userId).catch(() => {});
  return userSkill;
}

/**
 * Update an existing skill
 *
 * Validates ownership and updates skill fields.
 *
 * @param input - The update data with userId for ownership validation
 * @returns The updated user skill
 * @throws Error if not found or not authorized
 */
export async function updateSkillService(
  input: UpdateSkillServiceInput
): Promise<UserSkillWithDetails> {
  const { id, userId, selfAssessmentLevel, learningSources } = input;

  // Check ownership
  const existing = await getSkillByIdForUserData(id, userId);
  if (!existing) {
    throw new Error(SKILL_MESSAGES_EN.skillNotFound);
  }

  // Verify the user owns this skill
  if (existing.userId !== userId) {
    throw new Error(SKILL_MESSAGES_EN.unauthorized);
  }

  // Update the skill
  const updatedSkill = await updateUserSkillData({
    id,
    userId,
    selfAssessmentLevel,
    learningSources: learningSources?.trim(),
  });

  invalidateNarrativeCache(userId).catch(() => {});
  return updatedSkill;
}

/**
 * Delete a skill
 *
 * Validates ownership and ensures skill has no experience sources.
 *
 * @param id - The user skill ID
 * @param userId - The user ID for ownership validation
 * @returns The deleted user skill
 * @throws Error if not found, not authorized, or has experience sources
 */
export async function deleteSkillService(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Call data layer which handles validation
  const result = await deleteUserSkillData(id, userId);

  if (!result.success) {
    // Check if error is about experience sources
    if (result.error?.includes('experience')) {
      throw new Error(SKILL_MESSAGES_EN.cannotDeleteLinkedSkill);
    }
    throw new Error(result.error || SKILL_MESSAGES_EN.skillNotFound);
  }

  invalidateNarrativeCache(userId).catch(() => {});
  return result;
}

/**
 * Sync skills from an experience
 *
 * Processes all skills from an experience, creating/updating
 * UserSkill and SkillSource records.
 *
 * @param input - The sync input with experience details
 * @returns Array of synced user skills
 */
export async function syncSkillsFromExperienceService(
  input: SyncSkillsFromExperienceServiceInput
): Promise<UserSkillWithDetails[]> {
  const { userId, experienceId, skills, startDate, endDate } = input;

  // Filter out empty skill names
  const validSkills = skills.filter((s) => s.trim().length > 0);

  if (validSkills.length === 0) {
    return [];
  }

  // Get default category for experience skills
  const defaultCategoryId = await getDefaultCategoryForExperienceData();

  // Sync each skill
  const syncedSkills = await syncSkillsFromExperienceData(
    userId,
    experienceId,
    validSkills,
    startDate,
    endDate,
    defaultCategoryId
  );

  // Remove sources for skills no longer in the experience
  const currentSkillSlugs = validSkills.map((s) => normalizeSkillSlug(s));
  await removeUnlinkedSkillSourcesData(experienceId, currentSkillSlugs);

  return syncedSkills;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalize skill name to slug
 */
function normalizeSkillSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
