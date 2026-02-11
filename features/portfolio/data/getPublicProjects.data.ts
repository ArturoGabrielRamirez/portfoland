/**
 * Get Public Projects by Username
 *
 * Retrieves a user's projects by username from the Project model,
 * and also includes Experience records with type PROJECT (legacy data)
 * transformed to match the Project model shape.
 * Used for the projects section on the public portfolio page.
 */

import { prisma } from '@/lib/prisma';
import type { ProjectData } from '../types/portfolio';

/**
 * Get public projects for a username
 *
 * Fetches from both the Project model and Experience model (type: PROJECT).
 * Experience records are transformed to match ProjectData shape.
 * Orders by: featured first, then startDate desc.
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

  // Fetch from both models in parallel
  const [projects, legacyExperiences] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { startDate: 'desc' },
      ],
    }),
    prisma.experience.findMany({
      where: { userId: user.id, type: 'PROJECT' },
      orderBy: { startDate: 'desc' },
    }),
  ]);

  // Transform legacy Experience PROJECT records to ProjectData shape
  const legacyProjects: ProjectData[] = legacyExperiences.map((exp) => ({
    id: exp.id,
    userId: exp.userId,
    title: exp.title,
    slug: exp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: exp.description,
    shortDescription: exp.description.length > 200 ? exp.description.slice(0, 197) + '...' : exp.description,
    imageUrl: null,
    technologies: exp.skills ?? [],
    links: [],
    featured: false,
    status: exp.endDate ? 'COMPLETED' as const : 'IN_PROGRESS' as const,
    startDate: exp.startDate,
    endDate: exp.endDate,
    order: null,
    createdAt: exp.createdAt,
    updatedAt: exp.updatedAt,
  }));

  // Merge: new Project records first (they support featured), then legacy
  return [...projects, ...legacyProjects];
}
