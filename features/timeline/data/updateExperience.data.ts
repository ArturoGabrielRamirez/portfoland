/**
 * Update Experience
 *
 * Updates an existing experience. Recalculates XP if type changes.
 */

import { prisma } from '@/lib/prisma';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { Experience } from '../types/experience';
import { calculateXP } from '../constants/xp';

/**
 * Input for updating an experience at the data layer
 */
export interface UpdateExperienceData {
  id: string;
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
 * Update an existing experience
 *
 * If the type is changed, XP is automatically recalculated.
 *
 * @param data - The update data (id is required, other fields optional)
 * @returns The updated experience
 */
export async function updateExperience(data: UpdateExperienceData): Promise<Experience> {
  const { id, ...updateFields } = data;

  // Build update data object, only including defined fields
  const updateData: Record<string, unknown> = {};

  if (updateFields.type !== undefined) {
    updateData.type = updateFields.type;
    updateData.xp = calculateXP(updateFields.type);
  }
  if (updateFields.title !== undefined) updateData.title = updateFields.title;
  if (updateFields.company !== undefined) updateData.company = updateFields.company;
  if (updateFields.latitude !== undefined) updateData.latitude = updateFields.latitude;
  if (updateFields.longitude !== undefined) updateData.longitude = updateFields.longitude;
  if (updateFields.address !== undefined) updateData.address = updateFields.address;
  if (updateFields.startDate !== undefined) updateData.startDate = updateFields.startDate;
  if (updateFields.endDate !== undefined) updateData.endDate = updateFields.endDate;
  if (updateFields.description !== undefined) updateData.description = updateFields.description;
  if (updateFields.skills !== undefined) updateData.skills = updateFields.skills;

  const experience = await prisma.experience.update({
    where: { id },
    data: updateData,
  });

  return experience;
}

/**
 * Update experience with user ownership validation
 *
 * @param data - The update data
 * @param userId - The user ID to validate ownership
 * @returns The updated experience or null if not owned by user
 */
export async function updateExperienceForUser(
  data: UpdateExperienceData,
  userId: string
): Promise<Experience | null> {
  // First check ownership
  const existing = await prisma.experience.findUnique({
    where: { id: data.id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return null;
  }

  return updateExperience(data);
}
