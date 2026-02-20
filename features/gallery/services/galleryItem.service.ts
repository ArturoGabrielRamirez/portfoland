/**
 * Gallery Item Service Layer
 *
 * Business logic for gallery item operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { GalleryItemModel } from '../types/galleryItem';
import {
  createGalleryItemData,
  updateGalleryItemData,
  deleteGalleryItemData,
  getGalleryItemByIdData,
  getGalleryItemsByUserIdData,
} from '../data';
import { GALLERY_MESSAGES } from '../constants/messages';
import { MAX_GALLERY_ITEMS_PER_USER } from '../constants/limits';
import { invalidateNarrativeCache } from '@/lib/ai/cache';
import { prisma } from '@/lib/prisma';

/**
 * Input for creating a gallery item via service layer
 */
export interface CreateGalleryItemServiceInput {
  userId: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  category?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Input for updating a gallery item via service layer
 */
export interface UpdateGalleryItemServiceInput {
  id: string;
  userId: string;
  imageUrl?: string;
  caption?: string | null;
  altText?: string | null;
  category?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Create a new gallery item
 *
 * Enforces the MAX_GALLERY_ITEMS_PER_USER limit before creating.
 *
 * @param input - The gallery item data including userId
 * @returns The created gallery item
 * @throws Error if user has reached the gallery item limit
 */
export async function createGalleryItemService(
  input: CreateGalleryItemServiceInput
): Promise<GalleryItemModel> {
  // Enforce per-user gallery item limit
  const currentCount = await prisma.galleryItem.count({
    where: { userId: input.userId },
  });

  if (currentCount >= MAX_GALLERY_ITEMS_PER_USER) {
    throw new Error(
      `You have reached the maximum of ${MAX_GALLERY_ITEMS_PER_USER} gallery items`
    );
  }

  const item = await createGalleryItemData({
    userId: input.userId,
    imageUrl: input.imageUrl,
    caption: input.caption ?? null,
    altText: input.altText ?? null,
    category: input.category ?? null,
    order: input.order ?? 0,
    published: input.published ?? true,
  });

  invalidateNarrativeCache(input.userId).catch(() => {});
  return item;
}

/**
 * Update an existing gallery item
 *
 * Verifies ownership before applying the update.
 *
 * @param input - The update data with userId for ownership validation
 * @returns The updated gallery item
 * @throws Error if not found or not authorized
 */
export async function updateGalleryItemService(
  input: UpdateGalleryItemServiceInput
): Promise<GalleryItemModel> {
  const { id, userId, ...updateFields } = input;

  // Check ownership
  const existing = await getGalleryItemByIdData(id);
  if (!existing) {
    throw new Error(GALLERY_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(GALLERY_MESSAGES.UNAUTHORIZED);
  }

  // Build update data
  const updateData: Record<string, unknown> = { id };
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;
  if (updateFields.caption !== undefined) updateData.caption = updateFields.caption;
  if (updateFields.altText !== undefined) updateData.altText = updateFields.altText;
  if (updateFields.category !== undefined) updateData.category = updateFields.category;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;
  if (updateFields.published !== undefined) updateData.published = updateFields.published;

  const item = await updateGalleryItemData(
    updateData as unknown as Parameters<typeof updateGalleryItemData>[0]
  );

  invalidateNarrativeCache(userId).catch(() => {});
  return item;
}

/**
 * Delete a gallery item
 *
 * Verifies ownership before deleting.
 *
 * @param id - The gallery item ID
 * @param userId - The user ID for ownership validation
 * @returns The deleted gallery item
 * @throws Error if not found or not authorized
 */
export async function deleteGalleryItemService(
  id: string,
  userId: string
): Promise<GalleryItemModel> {
  // Check ownership
  const existing = await getGalleryItemByIdData(id);
  if (!existing) {
    throw new Error(GALLERY_MESSAGES.NOT_FOUND);
  }
  if (existing.userId !== userId) {
    throw new Error(GALLERY_MESSAGES.UNAUTHORIZED);
  }

  const item = await deleteGalleryItemData(id);
  invalidateNarrativeCache(userId).catch(() => {});
  return item;
}

/**
 * Get all gallery items for a user (dashboard view)
 *
 * @param userId - The user ID
 * @returns Array of gallery items
 */
export async function getGalleryItemsService(userId: string): Promise<GalleryItemModel[]> {
  return getGalleryItemsByUserIdData(userId);
}
