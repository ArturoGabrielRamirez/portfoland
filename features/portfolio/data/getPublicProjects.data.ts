/**
 * Get Public Projects by Username
 *
 * Retrieves a user's projects by username from the Project model.
 * Used for the projects section on the public portfolio page.
 */

import { prisma } from '@/lib/prisma';
import type { ProjectData } from '../types/portfolio';

/**
 * Get public projects for a username
 *
 * Orders by: featured desc (featured first), then order asc (nulls last),
 * then startDate desc.
 *
 * @param username - The user's username
 * @returns Array of projects or null if user not found
 */
export async function getPublicProjectsByUsername(
  username: string
): Promise<ProjectData[] | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (!user || !user.username) {
    return null;
  }

  return await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      { featured: 'desc' },
      { order: 'asc' },
      { startDate: 'desc' },
    ],
  });
}
