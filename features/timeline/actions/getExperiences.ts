/**
 * Get Experiences Server Action
 *
 * Retrieves experiences for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { TimelineData } from '../types/experience';
import { getExperiencesByUserId } from '../data';
import { EXPERIENCE_MESSAGES } from '../constants/messages';

/**
 * Get all experiences for the current user
 *
 * @returns ActionResponse with timeline data (experiences + stats)
 */
export async function getExperiences() {
  return actionWrapper<TimelineData>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(EXPERIENCE_MESSAGES.LOGIN_REQUIRED);
    }

    // Get experiences and stats
    const timelineData = await getExperiencesByUserId(session.user.id);

    return {
      payload: timelineData,
      message: 'Experiences loaded',
    };
  });
}
