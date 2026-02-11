/**
 * Delete Project Image Server Action
 *
 * Removes a project cover image from Vercel Blob storage.
 */

'use server';

import { headers } from 'next/headers';
import { del } from '@vercel/blob';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { PROJECT_MESSAGES } from '../constants/messages';

/**
 * Delete a project image from Vercel Blob
 *
 * @param url - The blob URL to delete
 * @returns ActionResponse<void>
 */
export async function deleteProjectImage(url: string) {
  return actionWrapper<void>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PROJECT_MESSAGES.LOGIN_REQUIRED);
    }

    await del(url);

    return {
      payload: undefined as void,
      message: PROJECT_MESSAGES.DELETE_IMAGE_SUCCESS,
    };
  });
}
