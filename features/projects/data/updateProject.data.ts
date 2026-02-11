/**
 * Update Project
 *
 * Updates an existing project by ID.
 */

import { prisma } from '@/lib/prisma';
import type { Project } from '../types/project';

/**
 * Input for updating a project at the data layer
 */
export interface UpdateProjectData {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  links?: unknown;
  featured?: boolean;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  startDate?: Date;
  endDate?: Date | null;
  order?: number | null;
}

/**
 * Update an existing project
 *
 * @param data - The update data (id is required, other fields optional)
 * @returns The updated project
 */
export async function updateProjectData(data: UpdateProjectData): Promise<Project> {
  const { id, ...updateFields } = data;

  const updateData: Record<string, unknown> = {};

  if (updateFields.title !== undefined) updateData.title = updateFields.title;
  if (updateFields.slug !== undefined) updateData.slug = updateFields.slug;
  if (updateFields.description !== undefined) updateData.description = updateFields.description;
  if (updateFields.shortDescription !== undefined) updateData.shortDescription = updateFields.shortDescription;
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;
  if (updateFields.technologies !== undefined) updateData.technologies = updateFields.technologies;
  if (updateFields.links !== undefined) updateData.links = updateFields.links;
  if (updateFields.featured !== undefined) updateData.featured = updateFields.featured;
  if (updateFields.status !== undefined) updateData.status = updateFields.status;
  if (updateFields.startDate !== undefined) updateData.startDate = updateFields.startDate;
  if (updateFields.endDate !== undefined) updateData.endDate = updateFields.endDate;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  return project;
}
