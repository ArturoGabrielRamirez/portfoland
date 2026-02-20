/**
 * Upload Profile Image Server Action
 *
 * Uploads a profile image to Vercel Blob storage.
 * Validates file type (PNG, JPG, WEBP) and size (max 5MB).
 */

'use server';

import { headers } from 'next/headers';
import { put } from '@vercel/blob';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { PORTFOLIO_MESSAGES } from '../constants/messages';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload a profile image to Vercel Blob
 *
 * @param formData - FormData containing a 'file' field with the image
 * @returns ActionResponse with the uploaded image URL
 */
export async function uploadProfileImage(formData: FormData) {
  return actionWrapper<{ url: string }>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(PORTFOLIO_MESSAGES.LOGIN_REQUIRED);
    }

    const file = formData.get('file') as File | null;

    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only PNG, JPG, and WEBP are allowed.');
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Upload to Vercel Blob
    const blob = await put(`profile-${session.user.id}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return {
      payload: { url: blob.url },
      message: 'Profile image uploaded successfully',
    };
  });
}
