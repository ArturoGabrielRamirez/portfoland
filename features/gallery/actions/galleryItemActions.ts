/**
 * Gallery Item Server Actions
 *
 * Server actions for gallery item CRUD operations.
 * Each action validates input, checks auth, calls the service layer, and
 * revalidates the dashboard cache.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import type { GalleryItemModel } from '../types/galleryItem';
import {
  createGalleryItemSchema,
  updateGalleryItemSchema,
  deleteGalleryItemSchema,
} from '../schemas/galleryItem.schema';
import {
  createGalleryItemService,
  updateGalleryItemService,
  deleteGalleryItemService,
} from '../services/galleryItem.service';
import { GALLERY_MESSAGES } from '../constants/messages';

// =============================================================================
// Create Gallery Item Action
// =============================================================================

/**
 * Create a new gallery item for the authenticated user
 *
 * @param formData - Form data or plain object with gallery item fields
 * @returns ActionResponse with created gallery item
 */
export async function createGalleryItemAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<GalleryItemModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(GALLERY_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            imageUrl: formData.get('imageUrl'),
            caption: formData.get('caption') || undefined,
            altText: formData.get('altText') || undefined,
            category: formData.get('category') || undefined,
            order: formData.get('order')
              ? parseInt(formData.get('order') as string, 10)
              : undefined,
            published: formData.has('published')
              ? formData.get('published') === 'true'
              : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await createGalleryItemSchema.validate(rawData);

    // Call service layer
    const item = await createGalleryItemService({
      userId: session.user.id,
      imageUrl: data.imageUrl,
      caption: data.caption ?? null,
      altText: data.altText ?? null,
      category: data.category ?? null,
      order: data.order,
      published: data.published,
    });

    // Revalidate cache
    revalidatePath('/dashboard/gallery');

    return {
      payload: item,
      message: GALLERY_MESSAGES.CREATE_SUCCESS,
    };
  });
}

// =============================================================================
// Update Gallery Item Action
// =============================================================================

/**
 * Update an existing gallery item for the authenticated user
 *
 * @param formData - Form data or plain object with gallery item fields
 * @returns ActionResponse with updated gallery item
 */
export async function updateGalleryItemAction(
  formData: FormData | Record<string, unknown>
) {
  return actionWrapper<GalleryItemModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(GALLERY_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data from FormData or plain object
    const rawData =
      formData instanceof FormData
        ? {
            id: formData.get('id'),
            imageUrl: formData.get('imageUrl') || undefined,
            caption: formData.get('caption') || undefined,
            altText: formData.get('altText') || undefined,
            category: formData.get('category') || undefined,
            order: formData.get('order')
              ? parseInt(formData.get('order') as string, 10)
              : undefined,
            published: formData.has('published')
              ? formData.get('published') === 'true'
              : undefined,
          }
        : formData;

    // Validate with Yup
    const data = await updateGalleryItemSchema.validate(rawData);

    // Call service layer
    const item = await updateGalleryItemService({
      id: data.id,
      userId: session.user.id,
      imageUrl: data.imageUrl,
      caption: data.caption,
      altText: data.altText,
      category: data.category,
      order: data.order,
      published: data.published,
    });

    // Revalidate cache
    revalidatePath('/dashboard/gallery');

    return {
      payload: item,
      message: GALLERY_MESSAGES.UPDATE_SUCCESS,
    };
  });
}

// =============================================================================
// Delete Gallery Item Action
// =============================================================================

/**
 * Delete a gallery item for the authenticated user
 *
 * @param formData - Form data or plain object with gallery item id
 * @returns ActionResponse with deleted gallery item
 */
export async function deleteGalleryItemAction(
  formData: FormData | { id: string }
) {
  return actionWrapper<GalleryItemModel>(async () => {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error(GALLERY_MESSAGES.LOGIN_REQUIRED);
    }

    // Extract data
    const rawData =
      formData instanceof FormData
        ? { id: formData.get('id') }
        : formData;

    // Validate with Yup
    const data = await deleteGalleryItemSchema.validate(rawData);

    // Call service layer
    const item = await deleteGalleryItemService(data.id, session.user.id);

    // Revalidate cache
    revalidatePath('/dashboard/gallery');

    return {
      payload: item,
      message: GALLERY_MESSAGES.DELETE_SUCCESS,
    };
  });
}
