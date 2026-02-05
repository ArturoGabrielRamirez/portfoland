/**
 * Sync Skill From Experience
 *
 * Synchronizes skills from an experience to user skills.
 * Handles skill creation/lookup, source creation, and XP calculation.
 */

import { prisma } from '@/lib/prisma';
import type { UserSkillWithDetails } from '../types/skill';
import {
  calculateDurationXP,
  calculateLevelFromXP,
} from '../constants/xp';

/**
 * Input for syncing a skill from an experience
 */
export interface SyncSkillFromExperienceInput {
  userId: string;
  experienceId: string;
  skillName: string;
  startDate: Date;
  endDate: Date | null;
  defaultCategoryId: string;
}

/**
 * Sync a single skill from an experience
 *
 * Handles the full flow:
 * 1. Find or create the global Skill by normalized name
 * 2. Find or create the UserSkill for this user
 * 3. Create SkillSource with EXPERIENCE type
 * 4. Calculate duration-based XP
 * 5. Update UserSkill totalXP and level
 *
 * @param input - The sync input
 * @returns The updated user skill with details
 */
export async function syncSkillFromExperienceData(
  input: SyncSkillFromExperienceInput
): Promise<UserSkillWithDetails> {
  const { userId, experienceId, skillName, startDate, endDate, defaultCategoryId } = input;

  // Calculate XP based on duration
  const xpAmount = calculateDurationXP(startDate, endDate);

  // Normalize skill name for slug
  const slug = normalizeSkillSlug(skillName);
  const normalizedName = skillName.trim();

  return await prisma.$transaction(async (tx): Promise<UserSkillWithDetails> => {
    // Find or create the global skill
    let skill = await tx.skill.findUnique({
      where: { slug },
    });

    if (!skill) {
      skill = await tx.skill.create({
        data: {
          name: normalizedName,
          slug,
          categoryId: defaultCategoryId,
          isCore: false,
        },
      });
    }

    // Find or create the user skill
    let userSkill = await tx.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: skill.id,
        },
      },
      include: {
        sources: true,
      },
    });

    if (userSkill) {
      // Check if this experience is already linked
      const existingSource = userSkill.sources.find(
        (s) => s.experienceId === experienceId
      );

      if (existingSource) {
        // Update existing source XP
        await tx.skillSource.update({
          where: { id: existingSource.id },
          data: { xpAmount },
        });
      } else {
        // Add new source
        await tx.skillSource.create({
          data: {
            userSkillId: userSkill.id,
            sourceType: 'EXPERIENCE',
            experienceId,
            xpAmount,
          },
        });
      }

      // Recalculate total XP
      const sourcesAgg = await tx.skillSource.aggregate({
        where: { userSkillId: userSkill.id },
        _sum: { xpAmount: true },
      });

      const totalXP = sourcesAgg._sum.xpAmount ?? 0;
      const level = calculateLevelFromXP(totalXP);

      // Update user skill
      userSkill = await tx.userSkill.update({
        where: { id: userSkill.id },
        data: {
          totalXP,
          level,
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
    } else {
      // Create new user skill with source
      userSkill = await tx.userSkill.create({
        data: {
          userId,
          skillId: skill.id,
          totalXP: xpAmount,
          level: calculateLevelFromXP(xpAmount),
          sources: {
            create: {
              sourceType: 'EXPERIENCE',
              experienceId,
              xpAmount,
            },
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
    }

    return userSkill as UserSkillWithDetails;
  });
}

/**
 * Sync multiple skills from an experience
 *
 * @param userId - The user ID
 * @param experienceId - The experience ID
 * @param skillNames - Array of skill names from the experience
 * @param startDate - Experience start date
 * @param endDate - Experience end date (null if current)
 * @param defaultCategoryId - Default category for new skills
 * @returns Array of synced user skills
 */
export async function syncSkillsFromExperienceData(
  userId: string,
  experienceId: string,
  skillNames: string[],
  startDate: Date,
  endDate: Date | null,
  defaultCategoryId: string
): Promise<UserSkillWithDetails[]> {
  const results: UserSkillWithDetails[] = [];

  for (const skillName of skillNames) {
    if (!skillName.trim()) continue;

    const userSkill = await syncSkillFromExperienceData({
      userId,
      experienceId,
      skillName,
      startDate,
      endDate,
      defaultCategoryId,
    });

    results.push(userSkill);
  }

  return results;
}

/**
 * Remove skills that are no longer in an experience
 *
 * When an experience is updated and skills are removed,
 * this removes the corresponding sources.
 *
 * @param experienceId - The experience ID
 * @param remainingSkillSlugs - Slugs of skills still in the experience
 */
export async function removeUnlinkedSkillSourcesData(
  experienceId: string,
  remainingSkillSlugs: string[]
): Promise<void> {
  // Get all sources for this experience
  const sources = await prisma.skillSource.findMany({
    where: { experienceId },
    include: {
      userSkill: {
        include: { skill: true },
      },
    },
  });

  // Find sources for skills no longer in the experience
  const sourcesToRemove = sources.filter(
    (s) => !remainingSkillSlugs.includes(s.userSkill.skill.slug)
  );

  if (sourcesToRemove.length === 0) return;

  // Get affected user skill IDs
  const affectedUserSkillIds = sourcesToRemove.map((s) => s.userSkillId);

  // Delete the sources
  await prisma.skillSource.deleteMany({
    where: {
      id: { in: sourcesToRemove.map((s) => s.id) },
    },
  });

  // Recalculate XP for affected user skills
  for (const userSkillId of affectedUserSkillIds) {
    await recalculateAfterSourceRemoval(userSkillId);
  }
}

/**
 * Recalculate user skill after source removal
 */
async function recalculateAfterSourceRemoval(userSkillId: string): Promise<void> {
  const sources = await prisma.skillSource.findMany({
    where: { userSkillId },
    select: { xpAmount: true },
  });

  if (sources.length === 0) {
    // No sources left, delete the user skill
    await prisma.userSkill.delete({
      where: { id: userSkillId },
    });
    return;
  }

  // Recalculate totals
  const totalXP = sources.reduce((sum, s) => sum + s.xpAmount, 0);
  const level = calculateLevelFromXP(totalXP);

  await prisma.userSkill.update({
    where: { id: userSkillId },
    data: {
      totalXP,
      level,
    },
  });
}

/**
 * Get the default category ID for experience skills
 *
 * Uses the "Core / Fundamentals" category by default.
 *
 * @returns The default category ID
 */
export async function getDefaultCategoryForExperienceData(): Promise<string> {
  const coreCategory = await prisma.skillCategory.findFirst({
    where: {
      slug: 'core',
      isDefault: true,
    },
  });

  if (coreCategory) {
    return coreCategory.id;
  }

  // Fallback: get any default category
  const anyDefault = await prisma.skillCategory.findFirst({
    where: { isDefault: true },
  });

  if (anyDefault) {
    return anyDefault.id;
  }

  throw new Error('No default skill category found. Please seed the database.');
}

/**
 * Normalize skill name to slug
 *
 * @param name - The skill name
 * @returns Normalized slug
 */
function normalizeSkillSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
