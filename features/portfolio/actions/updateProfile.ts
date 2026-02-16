/**
 * Update Profile Server Action
 *
 * Updates the authenticated user's profile information (name, bio, image).
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { updateProfileSchema } from '../schemas/portfolio.schema';
import { updateProfileService } from '../services/portfolio.service';
import { PORTFOLIO_MESSAGES } from '../constants/messages';

/**
 * Update the user's profile information
 *
 * @param input - Object with name, bio, and image fields
 * @returns ActionResponse with updated user data
 */
export async function updateProfile(
  input: Record<string, unknown>
) {
  return actionWrapper(async () => {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PORTFOLIO_MESSAGES.LOGIN_REQUIRED);
    }

    // Validate input with Yup schema
    const data = await updateProfileSchema.validate(input);

    // Call service layer
    const updatedUser = await updateProfileService(
      session.user.id,
      data
    );

    // Revalidate the dashboard portfolio page
    revalidatePath('/dashboard/portfolio');

    // Revalidate the public portfolio path for all locales if username exists
    if (session.user.username) {
      revalidatePath(`/en/${session.user.username}`);
      revalidatePath(`/es/${session.user.username}`);
    }

    return {
      payload: updatedUser,
      message: 'Profile updated successfully',
    };
  });
}
