/**
 * Create Project
 *
 * Creates a new project in the database.
 */

import { prisma } from '@/lib/prisma';
import type { Project } from '../types/project';

/**
 * Input for creating a project at the data layer
 */
export interface CreateProjectData {
  userId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  technologies?: string[];
  links?: unknown;
  featured?: boolean;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  startDate: Date;
  endDate?: Date | null;
  order?: number | null;
}

/**
 * Create a new project
 *
 * @param data - The project data
 * @returns The created project
 */
export async function createProjectData(data: CreateProjectData): Promise<Project> {
  const project = await prisma.project.create({
    data: {
      userId: data.userId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription ?? null,
      imageUrl: data.imageUrl ?? null,
      technologies: data.technologies ?? [],
      links: (data.links as any) ?? [],
      featured: data.featured ?? false,
      status: data.status ?? 'IN_PROGRESS',
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      order: data.order ?? null,
    },
  });

  return project;
}
