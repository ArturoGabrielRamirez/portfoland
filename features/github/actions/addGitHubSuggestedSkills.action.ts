'use server';

/**
 * Add GitHub Suggested Skills Action
 *
 * Creates UserSkill records for skills detected by GitHub sync but not yet
 * in the user's profile. Each skill is immediately marked as githubValidated
 * and gets a GITHUB SkillSource with `dateStarted` from the earliest repo date.
 */

import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { prisma } from '@/lib/prisma';
import { calculateLevelFromXP } from '@/features/skills/constants/xp';
import { GITHUB_SKILL_CATEGORY_SLUG } from '../constants/github-mappings';
import type { GitHubSuggestedSkill } from '../types/sync';

// XP granted for a GitHub-validated skill added automatically.
// APPRENTICE tier (200 XP) — represents real, proven code usage.
const GITHUB_SKILL_XP = 200

// =============================================================================
// Action
// =============================================================================

export interface AddGitHubSuggestedSkillsInput {
  skills: GitHubSuggestedSkill[]
}

export const addGitHubSuggestedSkillsAction = async (
  input: AddGitHubSuggestedSkillsInput
) => {
  return actionWrapper<{ addedCount: number }>(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error('Please sign in to add skills');
    }

    const userId = session.user.id;

    // Look up the 'core' category as fallback (always exists after seeding)
    const fallbackCategory = await prisma.skillCategory.findFirst({
      where: { isDefault: true, slug: 'core' },
      select: { id: true },
    });

    let addedCount = 0;

    for (const suggested of input.skills) {
      // Resolve category for this skill slug
      const categorySlug = GITHUB_SKILL_CATEGORY_SLUG[suggested.slug] ?? 'core';
      const category = await prisma.skillCategory.findFirst({
        where: { isDefault: true, slug: categorySlug },
        select: { id: true },
      });
      const categoryId = category?.id ?? fallbackCategory?.id;
      if (!categoryId) continue;

      const level = calculateLevelFromXP(GITHUB_SKILL_XP);

      await prisma.$transaction(async (tx) => {
        // Find or create the global Skill record
        const skill = await tx.skill.upsert({
          where: { slug: suggested.slug },
          create: {
            name: suggested.name,
            slug: suggested.slug,
            categoryId,
            isCore: false,
          },
          update: {},
        });

        // Skip if user already has this skill
        const existing = await tx.userSkill.findUnique({
          where: { userId_skillId: { userId, skillId: skill.id } },
        });
        if (existing) return;

        // Create UserSkill marked as githubValidated from the start
        await tx.userSkill.create({
          data: {
            userId,
            skillId: skill.id,
            totalXP: GITHUB_SKILL_XP,
            level,
            githubValidated: true,
            sources: {
              create: {
                sourceType: 'GITHUB',
                xpAmount: GITHUB_SKILL_XP,
                metadata: {
                  firstSeen: suggested.firstSeen ?? null,
                },
              },
            },
          },
        });

        addedCount++;
      });
    }

    revalidatePath('/dashboard/skills');
    revalidateTag(`user-stats-${userId}`);
    revalidateTag('user-skills');

    return {
      payload: { addedCount },
      message: `${addedCount} skill${addedCount !== 1 ? 's' : ''} added from GitHub`,
    };
  });
};
