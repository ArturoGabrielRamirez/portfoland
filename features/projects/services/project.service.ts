/**
 * Project Service Layer
 *
 * Business logic for project operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { ProjectStatus } from '@/app/generated/prisma/enums';
import type { Project } from '../types/project';
import {
  createProjectData,
  updateProjectData,
  deleteProjectData,
  getProjectByIdData,
  getProjectsByUserIdData,
} from '../data';
import { PROJECT_MESSAGES } from '../constants/messages';
import { invalidateNarrativeCache } from '@/features/ai-narrator';

/**
 * Input for creating a project via service
 */
export interface CreateProjectServiceInput {
  userId: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  links?: unknown;
  featured?: boolean;
  status?: ProjectStatus;
  startDate: Date;
  endDate?: Date | null;
  order?: number | null;
}

/**
 * Input for updating a project via service
 */
export interface UpdateProjectServiceInput {
  id: string;
  userId: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  links?: unknown;
  featured?: boolean;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date | null;
  order?: number | null;
}

/**
 * Generate a URL-friendly slug from a title
 *
 * Converts to lowercase, replaces spaces and special characters with hyphens,
 * removes consecutive hyphens, and trims leading/trailing hyphens.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a new project
 *
 * @param input - The project data
 * @returns The created project
 */
export async function createProjectService(
  input: CreateProjectServiceInput
): Promise<Project> {
  const slug = input.slug?.trim() || generateSlug(input.title);

  const project = await createProjectData({
    userId: input.userId,
    title: input.title.trim(),
    slug,
    description: input.description.trim(),
    shortDescription: input.shortDescription?.trim() ?? null,
    imageUrl: input.imageUrl ?? null,
    technologies: input.technologies?.map((t) => t.trim()) ?? [],
    links: input.links ?? [],
    featured: input.featured ?? false,
    status: input.status ?? 'IN_PROGRESS',
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    order: input.order ?? null,
  });

  invalidateNarrativeCache(input.userId).catch(() => {});
  return project;
}

/**
 * Update an existing project
 *
 * @param input - The update data with userId for ownership validation
 * @returns The updated project
 * @throws Error if not found or not authorized
 */
export async function updateProjectService(
  input: UpdateProjectServiceInput
): Promise<Project> {
  const { id, userId, ...updateFields } = input;

  // Check ownership
  const existing = await getProjectByIdData(id);
  if (!existing) {
    throw new Error(PROJECT_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(PROJECT_MESSAGES.UNAUTHORIZED);
  }

  // Build update data, trimming strings
  const updateData: Record<string, unknown> = { id };
  if (updateFields.title !== undefined) updateData.title = updateFields.title.trim();
  if (updateFields.slug !== undefined) updateData.slug = updateFields.slug.trim();
  if (updateFields.description !== undefined)
    updateData.description = updateFields.description.trim();
  if (updateFields.shortDescription !== undefined)
    updateData.shortDescription = updateFields.shortDescription?.trim() ?? null;
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;
  if (updateFields.technologies !== undefined)
    updateData.technologies = updateFields.technologies.map((t) => t.trim());
  if (updateFields.links !== undefined) updateData.links = updateFields.links;
  if (updateFields.featured !== undefined) updateData.featured = updateFields.featured;
  if (updateFields.status !== undefined) updateData.status = updateFields.status;
  if (updateFields.startDate !== undefined) updateData.startDate = updateFields.startDate;
  if (updateFields.endDate !== undefined) updateData.endDate = updateFields.endDate;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;

  const project = await updateProjectData(
    updateData as unknown as Parameters<typeof updateProjectData>[0]
  );

  invalidateNarrativeCache(userId).catch(() => {});
  return project;
}

/**
 * Delete a project
 *
 * @param id - The project ID
 * @param userId - The user ID for ownership validation
 * @returns The deleted project
 * @throws Error if not found or not authorized
 */
export async function deleteProjectService(
  id: string,
  userId: string
): Promise<Project> {
  // Check ownership
  const existing = await getProjectByIdData(id);
  if (!existing) {
    throw new Error(PROJECT_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(PROJECT_MESSAGES.UNAUTHORIZED);
  }

  // Clean up blob storage if image exists
  if (existing.imageUrl) {
    try {
      const { deleteProjectImage } = await import('../actions/deleteProjectImage');
      await deleteProjectImage(existing.imageUrl);
    } catch {
      // Log but don't fail the delete operation -- image cleanup is secondary
      console.error('Failed to delete project image from blob storage');
    }
  }

  const project = await deleteProjectData(id);
  invalidateNarrativeCache(userId).catch(() => {});
  return project;
}

/**
 * Get all projects for a user
 *
 * @param userId - The user ID
 * @returns Array of projects
 */
export async function getProjectsService(userId: string): Promise<Project[]> {
  return getProjectsByUserIdData(userId);
}
