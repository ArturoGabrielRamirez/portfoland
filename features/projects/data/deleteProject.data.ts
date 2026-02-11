/**
 * Delete Project
 *
 * Deletes a project by ID.
 */

import { prisma } from '@/lib/prisma';
import type { Project } from '../types/project';

/**
 * Delete a project by ID
 *
 * @param id - The project ID to delete
 * @returns The deleted project
 */
export async function deleteProjectData(id: string): Promise<Project> {
  const project = await prisma.project.delete({
    where: { id },
  });

  return project;
}
