/**
 * Toggle Portfolio Mode Server Action
 *
 * Updates the authenticated user's portfolio mode (professional or gaming).
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { updatePortfolioModeSchema } from '../schemas/portfolio.schema';
import { updatePortfolioModeService } from '../services/portfolio.service';
import { PORTFOLIO_MESSAGES } from '../constants/messages';

/**
 * Toggle the user's portfolio mode between professional and gaming
 *
 * @param input - Object with mode field
 * @returns ActionResponse with updated user data
 */
export async function togglePortfolioMode(
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
    const data = await updatePortfolioModeSchema.validate(input);

    // Call service layer
    const updatedUser = await updatePortfolioModeService(
      session.user.id,
      data.mode
    );

    // Revalidate the public portfolio path for all locales
    if (session.user.username) {
      revalidatePath(`/en/${session.user.username}`);
      revalidatePath(`/es/${session.user.username}`);
    }

    return {
      payload: updatedUser,
      message: PORTFOLIO_MESSAGES.MODE_UPDATE_SUCCESS,
    };
  });
}
