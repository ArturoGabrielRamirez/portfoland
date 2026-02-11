/**
 * Get Projects by User ID
 *
 * Retrieves all projects for a user, ordered by order asc (nulls last)
 * then createdAt desc.
 */

import { prisma } from '@/lib/prisma';
import type { Project } from '../types/project';

/**
 * Get all projects for a user
 *
 * Projects with an explicit order value appear first (ascending),
 * followed by projects without an order (nulls last), then sorted
 * by createdAt descending within each group.
 *
 * @param userId - The user's ID
 * @returns Array of projects
 */
export async function getProjectsByUserIdData(userId: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: [
      { order: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'desc' },
    ],
  });

  return projects;
}
