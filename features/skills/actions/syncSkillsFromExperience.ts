/**
 * Sync Skills From Experience Server Action
 *
 * Synchronizes skills from a timeline experience to the skill tree.
 * Called after experience create/update to keep skills in sync.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { UserSkillWithDetails } from '../types/skill';
import { syncSkillsFromExperienceSchema } from '../schemas/skill.schema';
import { syncSkillsFromExperienceService } from '../services/skill.service';
import { SKILL_MESSAGES_EN } from '../constants/messages';

/**
 * Response type for syncSkillsFromExperience action
 */
export interface SyncSkillsResponse {
  syncedSkills: UserSkillWithDetails[];
  count: number;
}

/**
 * Sync skills from an experience
 *
 * @param input - Object with experience details and skills array
 * @returns ActionResponse with synced skills
 */
export async function syncSkillsFromExperience(
  input: {
    experienceId: string;
    skills: string[];
    startDate: Date | string;
    endDate: Date | string | null;
  }
) {
  return actionWrapper<SyncSkillsResponse>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to sync skills');
    }

    // Parse dates if they're strings
    const startDate = typeof input.startDate === 'string'
      ? new Date(input.startDate)
      : input.startDate;

    const endDate = input.endDate
      ? (typeof input.endDate === 'string' ? new Date(input.endDate) : input.endDate)
      : null;

    // Validate with Yup
    const data = await syncSkillsFromExperienceSchema.validate({
      experienceId: input.experienceId,
      userId: session.user.id,
      skills: input.skills,
      startDate,
      endDate,
    });

    // Call service
    const syncedSkills = await syncSkillsFromExperienceService({
      userId: session.user.id,
      experienceId: data.experienceId,
      skills: data.skills,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
    });

    // Revalidate caches
    revalidatePath('/dashboard/skills');
    revalidatePath('/dashboard/timeline');

    return {
      payload: {
        syncedSkills,
        count: syncedSkills.length,
      },
      message: SKILL_MESSAGES_EN.skillsSynced,
    };
  });
}
