/**
 * Create Project Server Action
 *
 * Creates a new project for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Project } from '../types/project';
import { createProjectSchema } from '../schemas/project.schema';
import { createProjectService } from '../services/project.service';
import { PROJECT_MESSAGES } from '../constants/messages';
import type { ProjectStatus } from '@/app/generated/prisma/enums';

/**
 * Create a new project
 *
 * @param formData - Form data or plain object with project fields
 * @returns ActionResponse with created project
 */
export async function createProject(
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
            title: formData.get('title'),
            slug: formData.get('slug') || undefined,
            description: formData.get('description'),
            shortDescription: formData.get('shortDescription') || undefined,
            imageUrl: formData.get('imageUrl') || undefined,
            technologies: formData.has('technologies')
              ? (formData.getAll('technologies') as string[])
              : undefined,
            links: formData.get('links')
              ? JSON.parse(formData.get('links') as string)
              : undefined,
            featured: formData.get('featured') === 'true',
            status: formData.get('status') || undefined,
            startDate: formData.get('startDate')
              ? new Date(formData.get('startDate') as string)
              : undefined,
            endDate: formData.get('endDate')
              ? new Date(formData.get('endDate') as string)
              : null,
            order: formData.get('order')
              ? parseInt(formData.get('order') as string, 10)
              : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await createProjectSchema.validate(rawData);

    // Call service
    const project = await createProjectService({
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

    return {
      payload: project,
      message: PROJECT_MESSAGES.CREATE_SUCCESS,
    };
  });
}
