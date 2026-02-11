/**
 * Delete Project Server Action
 *
 * Deletes a project for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Project } from '../types/project';
import { deleteProjectSchema } from '../schemas/project.schema';
import { deleteProjectService } from '../services/project.service';
import { PROJECT_MESSAGES } from '../constants/messages';

/**
 * Delete a project
 *
 * @param formData - Form data or plain object with project id
 * @returns ActionResponse with deleted project
 */
export async function deleteProject(
  formData: FormData | { id: string }
) {
  return actionWrapper<Project>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PROJECT_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data
    const rawData =
      formData instanceof FormData
        ? { id: formData.get('id') }
        : formData;

    // Validate with Yup
    const data = await deleteProjectSchema.validate(rawData);

    // Call service
    const project = await deleteProjectService(data.id, session.user.id);

    // Revalidate cache
    revalidatePath('/dashboard/projects');

    return {
      payload: project,
      message: PROJECT_MESSAGES.DELETE_SUCCESS,
    };
  });
}
