/**
 * Update User Skill
 *
 * Updates an existing user skill record.
 * Recalculates totalXP from all sources and updates level.
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { UserSkillWithDetails, SkillSourceMetadata } from '../types/skill';
import type { SelfAssessmentLevel } from '../constants/xp';
import {
  getSelfAssessmentXP,
  calculateLevelFromXP,
  aggregateTotalXP,
} from '../constants/xp';

/**
 * Input for updating a user skill
 */
export interface UpdateUserSkillInput {
  id: string;
  userId: string;
  selfAssessmentLevel?: SelfAssessmentLevel;
  learningSources?: string;
}

/**
 * Update a user skill's manual source
 *
 * Updates the MANUAL source's XP and metadata,
 * then recalculates total XP and level.
 *
 * @param input - The update input
 * @returns The updated user skill with details
 */
export async function updateUserSkillData(
  input: UpdateUserSkillInput
): Promise<UserSkillWithDetails> {
  const { id, userId, selfAssessmentLevel, learningSources } = input;

  return await prisma.$transaction(async (tx) => {
    // Get current user skill with sources
    const current = await tx.userSkill.findUnique({
      where: { id },
      include: {
        sources: true,
      },
    });

    if (!current || current.userId !== userId) {
      throw new Error('User skill not found or unauthorized');
    }

    // Find the MANUAL source to update
    const manualSource = current.sources.find((s) => s.sourceType === 'MANUAL');

    if (manualSource && selfAssessmentLevel) {
      // Calculate new XP for the manual source
      const newXpAmount = getSelfAssessmentXP(selfAssessmentLevel);

      // Build updated metadata
      const currentMetadata = (manualSource.metadata as SkillSourceMetadata) ?? {};
      const updatedMetadata: SkillSourceMetadata = {
        ...currentMetadata,
        selfAssessmentLevel,
        learningSources: learningSources ?? currentMetadata.learningSources,
      };

      // Update the manual source
      await tx.skillSource.update({
        where: { id: manualSource.id },
        data: {
          xpAmount: newXpAmount,
          metadata: updatedMetadata as Prisma.InputJsonValue,
        },
      });
    }

    // Recalculate total XP from all sources
    const sourcesAgg = await tx.skillSource.aggregate({
      where: { userSkillId: id },
      _sum: { xpAmount: true },
    });

    const totalXP = sourcesAgg._sum.xpAmount ?? 0;
    const level = calculateLevelFromXP(totalXP);

    // Update user skill with new totals
    const updatedUserSkill = await tx.userSkill.update({
      where: { id },
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

    return updatedUserSkill;
  });
}

/**
 * Recalculate user skill XP and level from all sources
 *
 * Called after adding or removing sources to update totals.
 *
 * @param userSkillId - The user skill ID
 * @returns The updated user skill
 */
export async function recalculateUserSkillXPData(
  userSkillId: string
): Promise<UserSkillWithDetails> {
  // Get all sources for this user skill
  const sources = await prisma.skillSource.findMany({
    where: { userSkillId },
    select: { xpAmount: true },
  });

  // Aggregate XP
  const totalXP = aggregateTotalXP(sources.map((s) => s.xpAmount));
  const level = calculateLevelFromXP(totalXP);

  // Update user skill
  const updatedUserSkill = await prisma.userSkill.update({
    where: { id: userSkillId },
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

  return updatedUserSkill;
}

/**
 * Add XP source to existing user skill
 *
 * @param userSkillId - The user skill ID
 * @param xpAmount - The XP amount to add
 * @param experienceId - The experience ID (for EXPERIENCE type)
 * @returns The updated user skill
 */
export async function addSourceToUserSkillData(
  userSkillId: string,
  xpAmount: number,
  experienceId: string
): Promise<UserSkillWithDetails> {
  return await prisma.$transaction(async (tx) => {
    // Create the new source
    await tx.skillSource.create({
      data: {
        userSkillId,
        sourceType: 'EXPERIENCE',
        experienceId,
        xpAmount,
      },
    });

    // Recalculate total XP
    const sourcesAgg = await tx.skillSource.aggregate({
      where: { userSkillId },
      _sum: { xpAmount: true },
    });

    const totalXP = sourcesAgg._sum.xpAmount ?? 0;
    const level = calculateLevelFromXP(totalXP);

    // Update user skill
    const updatedUserSkill = await tx.userSkill.update({
      where: { id: userSkillId },
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

    return updatedUserSkill;
  });
}
