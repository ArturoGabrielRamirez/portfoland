/**
 * Experience Service Layer
 *
 * Business logic for experience operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { Experience } from '../types/experience';
import {
  createExperience as createExperienceData,
  updateExperience as updateExperienceData,
  deleteExperience as deleteExperienceData,
  getExperienceById,
} from '../data';
import { EXPERIENCE_MESSAGES } from '../constants/messages';
import { isValidCoordinates } from '../constants/xp';

// Import skill sync functions
import {
  syncSkillsFromExperienceService,
  type SyncSkillsFromExperienceServiceInput,
} from '@/features/skills/services/skill.service';
import { removeSourcesByExperienceData } from '@/features/skills/data';
import { invalidateNarrativeCache } from '@/features/ai-narrator';

/**
 * Input for creating an experience via service
 */
export interface CreateExperienceServiceInput {
  userId: string;
  type: ExperienceType;
  title: string;
  company: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: Date;
  endDate?: Date | null;
  description: string;
  skills?: string[];
}

/**
 * Input for updating an experience via service
 */
export interface UpdateExperienceServiceInput {
  id: string;
  userId: string; // For ownership validation
  type?: ExperienceType;
  title?: string;
  company?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  startDate?: Date;
  endDate?: Date | null;
  description?: string;
  skills?: string[];
}

/**
 * Create a new experience
 *
 * @param input - The experience data
 * @returns The created experience
 * @throws Error if validation fails
 */
export async function createExperienceService(
  input: CreateExperienceServiceInput
): Promise<Experience> {
  // Validate coordinates
  if (!isValidCoordinates(input.latitude, input.longitude)) {
    throw new Error('Invalid coordinates');
  }

  // Validate end date is after start date
  if (input.endDate && input.endDate < input.startDate) {
    throw new Error('End date must be after start date');
  }

  // Create the experience
  const experience = await createExperienceData({
    userId: input.userId,
    type: input.type,
    title: input.title.trim(),
    company: input.company.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    address: input.address.trim(),
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    description: input.description.trim(),
    skills: input.skills?.map((s) => s.trim()) ?? [],
  });

  // Sync skills from the experience to the skill tree
  if (input.skills && input.skills.length > 0) {
    await syncExperienceSkills({
      userId: input.userId,
      experienceId: experience.id,
      skills: input.skills,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    });
  }

  invalidateNarrativeCache(input.userId).catch(() => {});
  return experience;
}

/**
 * Update an existing experience
 *
 * @param input - The update data with userId for ownership validation
 * @returns The updated experience
 * @throws Error if not found or not authorized
 */
export async function updateExperienceService(
  input: UpdateExperienceServiceInput
): Promise<Experience> {
  const { id, userId, ...updateFields } = input;

  // Check ownership
  const existing = await getExperienceById(id);
  if (!existing) {
    throw new Error(EXPERIENCE_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(EXPERIENCE_MESSAGES.UNAUTHORIZED);
  }

  // Validate coordinates if being updated
  if (
    updateFields.latitude !== undefined &&
    updateFields.longitude !== undefined &&
    !isValidCoordinates(updateFields.latitude, updateFields.longitude)
  ) {
    throw new Error('Invalid coordinates');
  }

  // Validate end date if being updated
  const startDate = updateFields.startDate ?? existing.startDate;
  const endDate = updateFields.endDate ?? existing.endDate;
  if (endDate && endDate < startDate) {
    throw new Error('End date must be after start date');
  }

  // Build update data, trimming strings
  const updateData: Record<string, unknown> = { id };
  if (updateFields.type !== undefined) updateData.type = updateFields.type;
  if (updateFields.title !== undefined) updateData.title = updateFields.title.trim();
  if (updateFields.company !== undefined) updateData.company = updateFields.company.trim();
  if (updateFields.latitude !== undefined) updateData.latitude = updateFields.latitude;
  if (updateFields.longitude !== undefined) updateData.longitude = updateFields.longitude;
  if (updateFields.address !== undefined) updateData.address = updateFields.address.trim();
  if (updateFields.startDate !== undefined) updateData.startDate = updateFields.startDate;
  if (updateFields.endDate !== undefined) updateData.endDate = updateFields.endDate;
  if (updateFields.description !== undefined)
    updateData.description = updateFields.description.trim();
  if (updateFields.skills !== undefined)
    updateData.skills = updateFields.skills.map((s) => s.trim());

  const experience = await updateExperienceData(updateData as unknown as Parameters<typeof updateExperienceData>[0]);

  // Sync skills if skills were updated
  if (updateFields.skills !== undefined) {
    await syncExperienceSkills({
      userId,
      experienceId: id,
      skills: updateFields.skills,
      startDate,
      endDate,
    });
  }

  invalidateNarrativeCache(userId).catch(() => {});
  return experience;
}

/**
 * Delete an experience
 *
 * @param id - The experience ID
 * @param userId - The user ID for ownership validation
 * @returns The deleted experience
 * @throws Error if not found or not authorized
 */
export async function deleteExperienceService(
  id: string,
  userId: string
): Promise<Experience> {
  // Check ownership
  const existing = await getExperienceById(id);
  if (!existing) {
    throw new Error(EXPERIENCE_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(EXPERIENCE_MESSAGES.UNAUTHORIZED);
  }

  // Remove skill sources linked to this experience before deleting
  await removeSourcesByExperienceData(id);

  const experience = await deleteExperienceData(id);
  invalidateNarrativeCache(userId).catch(() => {});
  return experience;
}

/**
 * Sync skills from an experience to the skill tree
 *
 * This is called after experience create/update to keep skills in sync.
 * Handles both adding new skill sources and removing sources for
 * skills that were removed from the experience.
 *
 * @param input - The sync input
 */
async function syncExperienceSkills(
  input: SyncSkillsFromExperienceServiceInput
): Promise<void> {
  try {
    await syncSkillsFromExperienceService(input);
  } catch (error) {
    // Log the error but don't fail the experience operation
    // Skills sync is secondary to the main experience operation
    console.error('Failed to sync skills from experience:', error);
  }
}
