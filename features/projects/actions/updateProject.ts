/**
 * Update Project Server Action
 *
 * Updates an existing project for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Project } from '../types/project';
import { updateProjectSchema } from '../schemas/project.schema';
import { updateProjectService } from '../services/project.service';
import { PROJECT_MESSAGES } from '../constants/messages';
import type { ProjectStatus } from '@/app/generated/prisma/enums';
import { updateStreak } from '@/features/dashboard/utils/updateStreak';

/**
 * Update an existing project
 *
 * @param formData - Form data or plain object with project fields
 * @returns ActionResponse with updated project
 */
export async function updateProject(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<Project>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PROJECT_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or object
    const rawData =
      formData instanceof FormData
        ? {
            id: formData.get('id'),
            title: formData.get('title') || undefined,
            slug: formData.get('slug') || undefined,
            description: formData.get('description') || undefined,
            shortDescription: formData.get('shortDescription') || undefined,
            imageUrl: formData.get('imageUrl') || undefined,
            technologies: formData.has('technologies')
              ? (formData.getAll('technologies') as string[])
              : undefined,
            links: formData.get('links')
              ? JSON.parse(formData.get('links') as string)
              : undefined,
            featured:
              formData.has('featured')
                ? formData.get('featured') === 'true'
                : undefined,
            status: formData.get('status') || undefined,
            startDate: formData.get('startDate')
              ? new Date(formData.get('startDate') as string)
              : undefined,
            endDate: formData.get('endDate')
              ? new Date(formData.get('endDate') as string)
              : undefined,
            order: formData.get('order')
              ? parseInt(formData.get('order') as string, 10)
              : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await updateProjectSchema.validate(rawData);

    // Call service
    const project = await updateProjectService({
      id: data.id,
      userId: session.user.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      imageUrl: data.imageUrl,
      technologies: data.technologies,
      links: data.links,
      featured: data.featured,
      status: data.status as ProjectStatus | undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      order: data.order,
    });

    // Revalidate cache
    revalidatePath('/dashboard/projects');
    revalidateTag(`user-stats-${session.user.id}`, {});
    try {
      await updateStreak(session.user.id);
    } catch {
      // Streak update failure must never block the primary action
    }

    return {
      payload: project,
      message: PROJECT_MESSAGES.UPDATE_SUCCESS,
    };
  });
}
