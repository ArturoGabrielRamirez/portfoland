/**
 * Get User Skills
 *
 * Retrieves all user skills with skill details, sources, and experience data.
 */

import { prisma } from '@/lib/prisma';
import type { UserSkillWithDetails } from '../types/skill';

/**
 * Get all skills for a user with full relations
 *
 * Includes skill details, category, and all sources with
 * experience data for EXPERIENCE type sources.
 *
 * @param userId - The user's ID
 * @returns Array of user skills with full details
 */
export async function getUserSkillsData(userId: string): Promise<UserSkillWithDetails[]> {
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
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
    orderBy: [
      { totalXP: 'desc' },
      { skill: { name: 'asc' } },
    ],
  });

  return userSkills;
}

/**
 * Get user skills grouped by category
 *
 * @param userId - The user's ID
 * @returns Array of user skills with category grouping info
 */
export async function getUserSkillsByCategoryData(userId: string): Promise<UserSkillWithDetails[]> {
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
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
      },
    },
    orderBy: [
      { skill: { category: { name: 'asc' } } },
      { totalXP: 'desc' },
    ],
  });

  return userSkills;
}

/**
 * Check if user has a skill by skill ID
 *
 * @param userId - The user's ID
 * @param skillId - The skill ID
 * @returns The user skill or null
 */
export async function getUserSkillBySkillIdData(
  userId: string,
  skillId: string
): Promise<UserSkillWithDetails | null> {
  const userSkill = await prisma.userSkill.findUnique({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
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
      },
    },
  });

  return userSkill;
}
