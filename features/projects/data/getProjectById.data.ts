/**
 * Get Project by ID
 *
 * Retrieves a single project by its ID.
 */

import { prisma } from '@/lib/prisma';
import type { Project } from '../types/project';

/**
 * Get a single project by ID
 *
 * @param id - The project ID
 * @returns The project or null if not found
 */
export async function getProjectByIdData(id: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  return project;
}
