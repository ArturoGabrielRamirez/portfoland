/**
 * Create Skill Server Action
 *
 * Creates a new manual skill entry for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { UserSkillWithDetails } from '../types/skill';
import type { SelfAssessmentLevel } from '../constants/xp';
import { createSkillSchema } from '../schemas/skill.schema';
import { createSkillService } from '../services/skill.service';
import { SKILL_MESSAGES_EN } from '../constants/messages';
import { updateStreak } from '@/features/dashboard/utils/updateStreak';

/**
 * Create a new manual skill
 *
 * @param formData - Form data or plain object with skill fields
 * @returns ActionResponse with created skill
 */
export async function createSkill(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<UserSkillWithDetails>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to add skills');
    }

    // Extract data from FormData or object
    const rawData =
      formData instanceof FormData
        ? {
            name: formData.get('name'),
            categoryId: formData.get('categoryId') || undefined,
            selfAssessmentLevel: formData.get('selfAssessmentLevel'),
            learningSources: formData.get('learningSources') || undefined,
            dateStarted: formData.get('dateStarted')
              ? new Date(formData.get('dateStarted') as string)
              : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await createSkillSchema.validate(rawData);

    // Call service
    const skill = await createSkillService({
      userId: session.user.id,
      name: data.name,
      categoryId: data.categoryId,
      selfAssessmentLevel: data.selfAssessmentLevel as SelfAssessmentLevel,
      learningSources: data.learningSources,
      dateStarted: data.dateStarted ?? undefined,
    });

    // Revalidate cache
    revalidatePath('/dashboard/skills');
    revalidateTag(`user-stats-${session.user.id}`);
    try {
      await updateStreak(session.user.id);
    } catch {
      // Streak update failure must never block the primary action
    }

    return {
      payload: skill,
      message: SKILL_MESSAGES_EN.skillCreated,
    };
  });
}
