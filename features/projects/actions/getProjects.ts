/**
 * Get Projects Server Action
 *
 * Retrieves projects for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { Project } from '../types/project';
import { getProjectsService } from '../services/project.service';
import { PROJECT_MESSAGES } from '../constants/messages';

/**
 * Get all projects for the current user
 *
 * @returns ActionResponse with projects array
 */
export async function getProjects() {
  return actionWrapper<Project[]>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PROJECT_MESSAGES.LOGIN_REQUIRED);
    }

    // Get projects
    const projects = await getProjectsService(session.user.id);

    return {
      payload: projects,
      message: 'Projects loaded',
    };
  });
}
