/**
 * Update Experience Server Action
 *
 * Updates an existing experience for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Experience } from '../types/experience';
import { updateExperienceSchema } from '../schemas/experience.schema';
import { updateExperienceService } from '../services/experience.service';
import { EXPERIENCE_MESSAGES } from '../constants/messages';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import { updateStreak } from '@/features/dashboard/utils/updateStreak';

/**
 * Update an existing experience
 *
 * @param formData - Form data or plain object with experience fields
 * @returns ActionResponse with updated experience
 */
export async function updateExperience(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<Experience>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(EXPERIENCE_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or object
    const rawData =
      formData instanceof FormData
        ? {
            id: formData.get('id'),
            type: formData.get('type') || undefined,
            title: formData.get('title') || undefined,
            company: formData.get('company') || undefined,
            latitude: formData.get('latitude')
              ? parseFloat(formData.get('latitude') as string)
              : undefined,
            longitude: formData.get('longitude')
              ? parseFloat(formData.get('longitude') as string)
              : undefined,
            address: formData.get('address') || undefined,
            startDate: formData.get('startDate')
              ? new Date(formData.get('startDate') as string)
              : undefined,
            endDate: formData.get('endDate')
              ? new Date(formData.get('endDate') as string)
              : undefined,
            description: formData.get('description') || undefined,
            skills: formData.has('skills')
              ? (formData.getAll('skills') as string[])
              : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await updateExperienceSchema.validate(rawData);

    // Call service
    const experience = await updateExperienceService({
      id: data.id,
      userId: session.user.id,
      type: data.type as ExperienceType | undefined,
      title: data.title,
      company: data.company,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      skills: data.skills,
    });

    // Revalidate cache
    revalidatePath('/dashboard/timeline');
    revalidatePath('/dashboard/skills');
    revalidateTag(`user-stats-${session.user.id}`);
    try {
      await updateStreak(session.user.id);
    } catch {
      // Streak update failure must never block the primary action
    }

    return {
      payload: experience,
      message: EXPERIENCE_MESSAGES.UPDATE_SUCCESS,
    };
  });
}
