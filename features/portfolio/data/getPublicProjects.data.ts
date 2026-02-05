/**
 * Get Public Projects by Username
 *
 * Retrieves a user's project experiences (type: PROJECT) by username.
 * Used for the projects section on the public portfolio page.
 */

import { prisma } from '@/lib/prisma';
import type { ProjectData } from '../types/portfolio';

/**
 * Get public projects for a username
 *
 * @param username - The user's username
 * @returns Array of project experiences or null if user not found
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

  return await prisma.experience.findMany({
    where: {
      userId: user.id,
      type: 'PROJECT',
    },
    orderBy: { startDate: 'desc' },
  });
}
