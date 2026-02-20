/**
 * Delete Profile Image Server Action
 *
 * Deletes a profile image from Vercel Blob storage.
 * Only deletes if the URL is from Vercel Blob (not external URLs or OAuth images).
 */

'use server';

import { headers } from 'next/headers';
import { del } from '@vercel/blob';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { PORTFOLIO_MESSAGES } from '../constants/messages';

/**
 * Delete a profile image from Vercel Blob
 *
 * @param imageUrl - The URL of the image to delete
 * @returns ActionResponse
 */
export async function deleteProfileImage(imageUrl: string) {
  return actionWrapper(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PORTFOLIO_MESSAGES.LOGIN_REQUIRED);
    }

    // Only delete if it's a Vercel Blob URL
    if (!imageUrl.includes('vercel-storage.com') && !imageUrl.includes('public.blob.vercel-storage.com')) {
      return {
        payload: null,
        message: 'Image removed (external URL, not deleted from storage)',
      };
    }

    // Delete from Vercel Blob
    await del(imageUrl);

    return {
      payload: null,
      message: 'Profile image deleted successfully',
    };
  });
}
