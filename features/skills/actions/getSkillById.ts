/**
 * Get Skill By ID Server Action
 *
 * Retrieves a single skill with full details for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { UserSkillWithDetails } from '../types/skill';
import { getSkillByIdData, getSkillByIdForUserData } from '../data';
import { SKILL_MESSAGES_EN } from '../constants/messages';

/**
 * Get a single skill by ID for the current user
 *
 * Fetches the skill with all sources and linked experiences.
 *
 * @param userSkillId - The user skill ID
 * @returns ActionResponse with the skill details
 */
export async function getSkillById(userSkillId: string) {
  return actionWrapper<UserSkillWithDetails>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to view skill details');
    }

    // Get skill with ownership validation
    const skill = await getSkillByIdForUserData(userSkillId, session.user.id);

    if (!skill) {
      throw new Error(SKILL_MESSAGES_EN.skillNotFound);
    }

    return {
      payload: skill,
      message: 'Skill loaded',
    };
  });
}

/**
 * Get a skill by ID for public viewing (no ownership check)
 *
 * Used for viewing other users' skills on their public profile.
 *
 * @param userSkillId - The user skill ID
 * @returns ActionResponse with the skill details
 */
export async function getPublicSkillById(userSkillId: string) {
  return actionWrapper<UserSkillWithDetails>(async () => {
    const skill = await getSkillByIdData(userSkillId);

    if (!skill) {
      throw new Error(SKILL_MESSAGES_EN.skillNotFound);
    }

    return {
      payload: skill,
      message: 'Skill loaded',
    };
  });
}
