/**
 * Suggest Enhancements Server Action
 *
 * Returns AI-generated skill improvement suggestions:
 * related technologies, learning resources, and next-level guidance.
 */

'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { suggestEnhancementsSchema } from '../schemas/enhancement.schema';
import { suggestEnhancementsService } from '../services/suggestEnhancements.service';
import type { SkillEnhancement } from '../types/enhancement';

/**
 * Get AI-powered skill enhancement suggestions for a specific skill.
 * Costs 1 life.
 */
export async function suggestEnhancementsAction(
  input: Record<string, unknown>
) {
  return actionWrapper<SkillEnhancement>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('You must be logged in to get skill suggestions');
    }

    const data = await suggestEnhancementsSchema.validate(input);

    const result = await suggestEnhancementsService(
      session.user.id,
      data.skillName,
      data.skillLevel,
      data.category,
      data.locale ?? 'en'
    );

    return {
      payload: result,
      message: 'Enhancement suggestions generated',
    };
  });
}
