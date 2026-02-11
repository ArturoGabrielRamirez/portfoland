/**
 * Delete Experience
 *
 * Deletes an experience by ID.
 */

import { prisma } from '@/lib/prisma';
import type { Experience } from '../types/experience';

/**
 * Delete an experience by ID
 *
 * @param id - The experience ID to delete
 * @returns The deleted experience
 */
export async function deleteExperience(id: string): Promise<Experience> {
  const experience = await prisma.experience.delete({
    where: { id },
  });

  return experience;
}

/**
 * Delete experience with user ownership validation
 *
 * @param id - The experience ID to delete
 * @param userId - The user ID to validate ownership
 * @returns The deleted experience or null if not owned by user
 */
export async function deleteExperienceForUser(
  id: string,
  userId: string
): Promise<Experience | null> {
  // First check ownership
  const existing = await prisma.experience.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return null;
  }

  return deleteExperience(id);
}
