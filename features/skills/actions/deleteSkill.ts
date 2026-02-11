/**
 * Delete Skill Server Action
 *
 * Deletes a skill for the authenticated user.
 * Prevents deletion of skills that have experience sources.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { deleteSkillSchema } from '../schemas/skill.schema';
import { deleteSkillService } from '../services/skill.service';
import { SKILL_MESSAGES_EN } from '../constants/messages';

/**
 * Delete result type
 */
export interface DeleteSkillResult {
  success: boolean;
}

/**
 * Delete a skill
 *
 * @param formData - Form data or plain object with skill id
 * @returns ActionResponse with deletion result
 */
export async function deleteSkill(
  formData: FormData | { id: string }
) {
  return actionWrapper<DeleteSkillResult>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to delete skills');
    }

    // Extract data
    const rawData =
      formData instanceof FormData
        ? { id: formData.get('id') }
        : formData;

    // Validate with Yup
    const data = await deleteSkillSchema.validate(rawData);

    // Call service
    const result = await deleteSkillService(data.id, session.user.id);

    if (!result.success) {
      throw new Error(result.error || SKILL_MESSAGES_EN.skillNotFound);
    }

    // Revalidate cache
    revalidatePath('/dashboard/skills');

    return {
      payload: { success: true },
      message: SKILL_MESSAGES_EN.skillDeleted,
    };
  });
}
