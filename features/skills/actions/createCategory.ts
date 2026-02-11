/**
 * Create Category Server Action
 *
 * Creates a new custom skill category for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { SkillCategory } from '../types/skill';
import { createCategorySchema } from '../schemas/skill.schema';
import { createCategoryService } from '../services/category.service';
import { SKILL_MESSAGES_EN } from '../constants/messages';

/**
 * Create a new custom category
 *
 * @param formData - Form data or plain object with category fields
 * @returns ActionResponse with created category
 */
export async function createCategory(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<SkillCategory>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('Please sign in to create categories');
    }

    // Extract data from FormData or object
    const rawData =
      formData instanceof FormData
        ? {
            name: formData.get('name'),
            color: formData.get('color'),
          }
        : formData;

    // Validate with Yup
    const data = await createCategorySchema.validate(rawData);

    // Call service
    const category = await createCategoryService({
      userId: session.user.id,
      name: data.name,
      color: data.color,
    });

    // Revalidate cache
    revalidatePath('/dashboard/skills');

    return {
      payload: category,
      message: SKILL_MESSAGES_EN.categoryCreated,
    };
  });
}
