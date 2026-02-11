/**
 * Create User Skill
 *
 * Creates a new user skill record with initial source.
 * Handles skill creation/lookup, XP calculation, and level determination.
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { UserSkillWithDetails, SkillSourceMetadata } from '../types/skill';
import type { SelfAssessmentLevel } from '../constants/xp';
import {
  getSelfAssessmentXP,
  calculateLevelFromXP,
} from '../constants/xp';

/**
 * Input for creating a user skill (manual entry)
 */
export interface CreateUserSkillInput {
  userId: string;
  skillName: string;
  categoryId: string;
  selfAssessmentLevel: SelfAssessmentLevel;
  learningSources?: string;
  dateStarted?: Date;
}

/**
 * Create a new manual user skill with initial source
 *
 * Creates or finds the global Skill, creates the UserSkill,
 * and creates the initial SkillSource with MANUAL type.
 *
 * @param input - The skill creation input
 * @returns The created user skill with details
 */
export async function createUserSkillData(
  input: CreateUserSkillInput
): Promise<UserSkillWithDetails> {
  const { userId, skillName, categoryId, selfAssessmentLevel, learningSources, dateStarted } = input;

  // Calculate initial XP and level
  const xpAmount = getSelfAssessmentXP(selfAssessmentLevel);
  const level = calculateLevelFromXP(xpAmount);

  // Normalize skill name for slug
  const slug = normalizeSkillSlug(skillName);

  return await prisma.$transaction(async (tx): Promise<UserSkillWithDetails> => {
    // Find or create the global skill
    const skill = await tx.skill.upsert({
      where: { slug },
      create: {
        name: skillName.trim(),
        slug,
        categoryId,
        isCore: false,
      },
      update: {}, // Don't update if exists
    });

    // Build metadata for the manual source
    const metadata: SkillSourceMetadata = {
      selfAssessmentLevel,
      learningSources,
      dateStarted: dateStarted?.toISOString(),
    };

    // Create the user skill with initial source
    const userSkill = await tx.userSkill.create({
      data: {
        userId,
        skillId: skill.id,
        totalXP: xpAmount,
        level,
        sources: {
          create: {
            sourceType: 'MANUAL',
            xpAmount,
            metadata: metadata as Prisma.InputJsonValue,
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

    return userSkill;
  });
}

/**
 * Create user skill from experience (internal use for sync)
 *
 * @param userId - The user ID
 * @param skillId - The global skill ID
 * @param xpAmount - The XP amount from the experience
 * @param experienceId - The experience ID
 * @returns The created user skill
 */
export async function createUserSkillFromExperienceData(
  userId: string,
  skillId: string,
  xpAmount: number,
  experienceId: string
): Promise<UserSkillWithDetails> {
  const level = calculateLevelFromXP(xpAmount);

  const userSkill = await prisma.userSkill.create({
    data: {
      userId,
      skillId,
      totalXP: xpAmount,
      level,
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

  return userSkill;
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
