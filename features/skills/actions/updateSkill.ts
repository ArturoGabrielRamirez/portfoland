/**
 * Update Skill Server Action
 *
 * Updates an existing skill for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { UserSkillWithDetails } from '../types/skill';
import type { SelfAssessmentLevel } from '../constants/xp';
import { updateSkillSchema } from '../schemas/skill.schema';
import { updateSkillService } from '../services/skill.service';
import { SKILL_MESSAGES_EN } from '../constants/messages';
import { updateStreak } from '@/features/dashboard/utils/updateStreak';

/**
 * Update an existing skill
 *
 * @param formData - Form data or plain object with skill fields
 * @returns ActionResponse with updated skill
 */
export async function updateSkill(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<UserSkillWithDetails>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to update skills');
    }

    // Extract data from FormData or object
    const rawData =
      formData instanceof FormData
        ? {
            id: formData.get('id'),
            selfAssessmentLevel: formData.get('selfAssessmentLevel') || undefined,
            learningSources: formData.get('learningSources') || undefined,
          }
        : formData;

    // Validate with Yup
    const data = await updateSkillSchema.validate(rawData);

    // Call service
    const skill = await updateSkillService({
      id: data.id,
      userId: session.user.id,
      selfAssessmentLevel: data.selfAssessmentLevel as SelfAssessmentLevel | undefined,
      learningSources: data.learningSources,
    });

    // Revalidate cache
    revalidatePath('/dashboard/skills');
    revalidateTag(`user-stats-${session.user.id}`, {});
    try {
      await updateStreak(session.user.id);
    } catch {
      // Streak update failure must never block the primary action
    }

    return {
      payload: skill,
      message: SKILL_MESSAGES_EN.skillUpdated,
    };
  });
}
