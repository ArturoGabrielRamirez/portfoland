/**
 * Create Experience Server Action
 *
 * Creates a new experience for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Experience } from '../types/experience';
import { createExperienceSchema } from '../schemas/experience.schema';
import { createExperienceService } from '../services/experience.service';
import { EXPERIENCE_MESSAGES } from '../constants/messages';
import type { ExperienceType } from '@/app/generated/prisma/enums';

/**
 * Create a new experience
 *
 * @param formData - Form data or plain object with experience fields
 * @returns ActionResponse with created experience
 */
export async function createExperience(
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
            type: formData.get('type'),
            title: formData.get('title'),
            company: formData.get('company'),
            latitude: formData.get('latitude')
              ? parseFloat(formData.get('latitude') as string)
              : undefined,
            longitude: formData.get('longitude')
              ? parseFloat(formData.get('longitude') as string)
              : undefined,
            address: formData.get('address'),
            startDate: formData.get('startDate')
              ? new Date(formData.get('startDate') as string)
              : undefined,
            endDate: formData.get('endDate')
              ? new Date(formData.get('endDate') as string)
              : null,
            description: formData.get('description'),
            skills: formData.getAll('skills') as string[],
          }
        : formData;

    // Validate with Yup
    const data = await createExperienceSchema.validate(rawData);

    // Call service
    const experience = await createExperienceService({
      userId: session.user.id,
      type: data.type as ExperienceType,
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

    return {
      payload: experience,
      message: EXPERIENCE_MESSAGES.CREATE_SUCCESS,
    };
  });
}
