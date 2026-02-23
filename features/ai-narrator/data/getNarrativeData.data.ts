/**
 * Get Narrative Data
 *
 * Retrieves user data needed for AI narrative generation.
 * Pure database query - no business logic.
 */

import { prisma } from '@/lib/prisma';
import type { NarrativeUserData, NarrativeUserDataPayload } from '../types/narrative';

/**
 * Cache duration: 24 hours in milliseconds
 */
export const NARRATIVE_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Get user data for narrative generation
 *
 * Retrieves the user's profile, skills, experiences, and projects
 * in a format optimized for AI narrative generation.
 *
 * @param username - The username to fetch data for
 * @returns User data for narrative or null if user not found
 */
export async function getNarrativeData(username: string): Promise<NarrativeUserData | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      bio: true,
      userSkills: {
        include: {
          skill: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { totalXP: 'desc' },
        take: 10,
      },
      experiences: {
        orderBy: { startDate: 'desc' },
        take: 5,
        select: {
          title: true,
          company: true,
          type: true,
          startDate: true,
          endDate: true,
        },
      },
      projects: {
        where: { status: 'COMPLETED' as const },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          title: true,
          description: true,
          technologies: true,
        },
      },
    },
  });

  if (!user) return null;

  return transformToNarrativeData(user);
}

/**
 * Transform Prisma user data to narrative format
 */
function transformToNarrativeData(
  user: NarrativeUserDataPayload
): NarrativeUserData {
  return {
    name: user.name,
    bio: user.bio,
    skills: user.userSkills.map((us) => ({
      name: us.skill.name,
      level: us.totalXP,
      category: us.skill.category.name,
    })),
    experiences: user.experiences.map((exp) => ({
      title: exp.title,
      company: exp.company,
      type: exp.type,
      startDate: exp.startDate,
      endDate: exp.endDate,
    })),
    projects: user.projects.map((proj) => ({
      title: proj.title,
      description: proj.description,
      technologies: proj.technologies,
    })),
  };
}

/**
 * Get user ID and meta for cache operations
 *
 * @param username - The username to look up
 * @returns User id and meta or null if not found
 */
export async function getUserMetaForCache(
  username: string
): Promise<{ id: string; meta: Record<string, unknown> } | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      meta: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    meta: (user.meta as Record<string, unknown>) || {},
  };
}

/**
 * Check if narrative cache is valid
 *
 * @param meta - User meta object
 * @param mode - Narrative mode
 * @param locale - Locale code
 * @returns Cached narrative if valid, null if expired/not found
 */
export function getCachedNarrative(
  meta: Record<string, unknown>,
  mode: string,
  locale: string
): string | null {
  const cacheKey = `aiNarrative_${mode}_${locale}`;
  const cached = meta[cacheKey] as { narrative?: string; timestamp?: string } | undefined;

  if (!cached?.narrative || !cached?.timestamp) {
    return null;
  }

  const age = Date.now() - new Date(cached.timestamp).getTime();
  if (age >= NARRATIVE_CACHE_DURATION_MS) {
    return null;
  }

  return cached.narrative;
}
