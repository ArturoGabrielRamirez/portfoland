/**
 * Upload Project Image Server Action
 *
 * Uploads a project cover image to Vercel Blob storage.
 * Validates file type (PNG, JPG, WEBP) and size (max 5MB).
 * Separate from project CRUD -- the form uploads the image first,
 * then stores the resulting URL in the project record.
 */

'use server';

import { headers } from 'next/headers';
import { put } from '@vercel/blob';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { PROJECT_MESSAGES } from '../constants/messages';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload a project image to Vercel Blob
 *
 * @param formData - FormData containing a 'file' field with the image
 * @returns ActionResponse with the uploaded image URL
 */
export async function uploadProjectImage(formData: FormData) {
  return actionWrapper<{ url: string }>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PROJECT_MESSAGES.LOGIN_REQUIRED);
    }

    const file = formData.get('file') as File | null;

    if (!file) {
      throw new Error(PROJECT_MESSAGES.UPLOAD_ERROR);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(PROJECT_MESSAGES.UPLOAD_TYPE_ERROR);
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(PROJECT_MESSAGES.UPLOAD_SIZE_ERROR);
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });

    return {
      payload: { url: blob.url },
      message: PROJECT_MESSAGES.UPLOAD_SUCCESS,
    };
  });
}
