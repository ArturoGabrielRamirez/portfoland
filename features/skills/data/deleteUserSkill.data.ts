/**
 * Delete User Skill
 *
 * Deletes a user skill and cascades to its sources.
 * Only allows deletion if no EXPERIENCE sources exist.
 */

import { prisma } from '@/lib/prisma';
import type { UserSkill } from '../types/skill';

/**
 * Result of delete operation
 */
export interface DeleteUserSkillResult {
  success: boolean;
  error?: string;
  deletedSkill?: UserSkill;
}

/**
 * Delete a user skill by ID
 *
 * Only allows deletion if the skill has no EXPERIENCE sources.
 * Skills linked to experiences should not be manually deleted.
 *
 * @param userSkillId - The user skill ID
 * @param userId - The user ID for ownership validation
 * @returns Result indicating success or failure with reason
 */
export async function deleteUserSkillData(
  userSkillId: string,
  userId: string
): Promise<DeleteUserSkillResult> {
  // First check ownership and get sources
  const userSkill = await prisma.userSkill.findUnique({
    where: { id: userSkillId },
    include: {
      sources: {
        select: {
          id: true,
          sourceType: true,
        },
      },
    },
  });

  // Validate ownership
  if (!userSkill) {
    return {
      success: false,
      error: 'Skill not found',
    };
  }

  if (userSkill.userId !== userId) {
    return {
      success: false,
      error: 'Not authorized to delete this skill',
    };
  }

  // Check for EXPERIENCE sources
  const hasExperienceSources = userSkill.sources.some(
    (source) => source.sourceType === 'EXPERIENCE'
  );

  if (hasExperienceSources) {
    return {
      success: false,
      error: 'Cannot delete skill linked to experience. Remove the skill from the experience first.',
    };
  }

  // Delete the user skill (sources will cascade delete due to schema relation)
  const deletedSkill = await prisma.userSkill.delete({
    where: { id: userSkillId },
  });

  return {
    success: true,
    deletedSkill,
  };
}

/**
 * Force delete a user skill (removes all sources including EXPERIENCE)
 *
 * Use with caution - this bypasses the EXPERIENCE source check.
 * Only use when an experience is being deleted and needs to clean up skills.
 *
 * @param userSkillId - The user skill ID
 * @returns The deleted user skill
 */
export async function forceDeleteUserSkillData(userSkillId: string): Promise<UserSkill> {
  // Delete sources first (to be explicit, though cascade would handle it)
  await prisma.skillSource.deleteMany({
    where: { userSkillId },
  });

  // Delete the user skill
  const deletedSkill = await prisma.userSkill.delete({
    where: { id: userSkillId },
  });

  return deletedSkill;
}

/**
 * Remove a specific source from a user skill
 *
 * @param sourceId - The skill source ID to remove
 * @param userId - The user ID for ownership validation
 * @returns Result indicating success or failure
 */
export async function removeSkillSourceData(
  sourceId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Get the source with user skill info for ownership check
  const source = await prisma.skillSource.findUnique({
    where: { id: sourceId },
    include: {
      userSkill: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!source) {
    return {
      success: false,
      error: 'Source not found',
    };
  }

  if (source.userSkill.userId !== userId) {
    return {
      success: false,
      error: 'Not authorized to remove this source',
    };
  }

  // Delete the source
  await prisma.skillSource.delete({
    where: { id: sourceId },
  });

  return { success: true };
}

/**
 * Remove all sources for an experience from user skills
 *
 * Called when an experience is deleted to clean up skill sources.
 * After removal, recalculates XP for affected user skills.
 *
 * @param experienceId - The experience ID
 * @returns Number of sources removed
 */
export async function removeSourcesByExperienceData(experienceId: string): Promise<number> {
  // Get affected user skill IDs before deletion
  const affectedSources = await prisma.skillSource.findMany({
    where: { experienceId },
    select: { userSkillId: true },
  });

  const affectedUserSkillIds = [...new Set(affectedSources.map((s) => s.userSkillId))];

  // Delete all sources for this experience
  const deleteResult = await prisma.skillSource.deleteMany({
    where: { experienceId },
  });

  // Recalculate XP for affected user skills
  for (const userSkillId of affectedUserSkillIds) {
    await recalculateUserSkillAfterSourceRemoval(userSkillId);
  }

  return deleteResult.count;
}

/**
 * Recalculate user skill XP after source removal
 *
 * If user skill has no remaining sources, it will be deleted.
 *
 * @param userSkillId - The user skill ID
 */
async function recalculateUserSkillAfterSourceRemoval(userSkillId: string): Promise<void> {
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
  const level = calculateLevel(totalXP);

  await prisma.userSkill.update({
    where: { id: userSkillId },
    data: {
      totalXP,
      level,
    },
  });
}

/**
 * Simple level calculation helper
 */
function calculateLevel(totalXP: number): number {
  if (totalXP >= 2000) return 5;
  if (totalXP >= 1000) return 4;
  if (totalXP >= 500) return 3;
  if (totalXP >= 200) return 2;
  return 1;
}
