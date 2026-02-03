/**
 * Get Experience by ID
 *
 * Retrieves a single experience by its ID.
 */

import { prisma } from '@/lib/prisma';
import type { Experience } from '../types/experience';

/**
 * Get a single experience by ID
 *
 * @param id - The experience ID
 * @returns The experience or null if not found
 */
export async function getExperienceById(id: string): Promise<Experience | null> {
  const experience = await prisma.experience.findUnique({
    where: { id },
  });

  return experience;
}

/**
 * Get experience by ID with user ownership validation
 *
 * @param id - The experience ID
 * @param userId - The user ID to validate ownership
 * @returns The experience or null if not found or not owned by user
 */
export async function getExperienceByIdForUser(
  id: string,
  userId: string
): Promise<Experience | null> {
  const experience = await prisma.experience.findUnique({
    where: { id },
  });

  if (!experience || experience.userId !== userId) {
    return null;
  }

  return experience;
}
