/**
 * Get Skill By ID
 *
 * Retrieves a single user skill with full relations including
 * all sources and experience metadata.
 */

import { prisma } from '@/lib/prisma';
import type { UserSkillWithDetails, Skill } from '../types/skill';

/**
 * Get a user skill by its ID with full relations
 *
 * Includes skill details, category, and all sources with
 * experience data for EXPERIENCE type sources.
 *
 * @param userSkillId - The user skill ID
 * @returns The user skill with details or null if not found
 */
export async function getSkillByIdData(userSkillId: string): Promise<UserSkillWithDetails | null> {
  const userSkill = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
    include: {
      skill: {
        include: { category: true },
      },
      sources: {
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return userSkill;
}

/**
 * Get a user skill by ID with ownership validation
 *
 * @param userSkillId - The user skill ID
 * @param userId - The user ID to validate ownership
 * @returns The user skill with details or null if not found/owned
 */
export async function getSkillByIdForUserData(
  userSkillId: string,
  userId: string
): Promise<UserSkillWithDetails | null> {
  const userSkill = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
    include: {
      skill: {
        include: { category: true },
      },
      sources: {
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Validate ownership
  if (!userSkill || userSkill.userId !== userId) {
    return null;
  }

  return userSkill;
}

/**
 * Get a global skill by its ID (not user-specific)
 *
 * @param skillId - The skill ID
 * @returns The skill or null if not found
 */
export async function getGlobalSkillByIdData(skillId: string): Promise<Skill | null> {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  return skill;
}

/**
 * Get a global skill by slug
 *
 * @param slug - The skill slug
 * @returns The skill or null if not found
 */
export async function getGlobalSkillBySlugData(slug: string): Promise<Skill | null> {
  const skill = await prisma.skill.findUnique({
    where: { slug },
  });

  return skill;
}
