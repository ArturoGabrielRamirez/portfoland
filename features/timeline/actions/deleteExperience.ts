/**
 * Delete Experience Server Action
 *
 * Deletes an experience for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Experience } from '../types/experience';
import { deleteExperienceSchema } from '../schemas/experience.schema';
import { deleteExperienceService } from '../services/experience.service';
import { EXPERIENCE_MESSAGES } from '../constants/messages';

/**
 * Delete an experience
 *
 * @param formData - Form data or plain object with experience id
 * @returns ActionResponse with deleted experience
 */
export async function deleteExperience(
  formData: FormData | { id: string }
) {
  return actionWrapper<Experience>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(EXPERIENCE_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data
    const rawData =
      formData instanceof FormData
        ? { id: formData.get('id') }
        : formData;

    // Validate with Yup
    const data = await deleteExperienceSchema.validate(rawData);

    // Call service
    const experience = await deleteExperienceService(data.id, session.user.id);

    // Revalidate cache
    revalidatePath('/dashboard/timeline');
    revalidatePath('/dashboard/skills');

    return {
      payload: experience,
      message: EXPERIENCE_MESSAGES.DELETE_SUCCESS,
    };
  });
}
