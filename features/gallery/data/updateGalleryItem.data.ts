/**
 * Update Gallery Item
 *
 * Updates an existing gallery item by ID.
 */

import { prisma } from '@/lib/prisma';
import type { GalleryItemModel } from '../types/galleryItem';

/**
 * Input for updating a gallery item at the data layer
 */
export interface UpdateGalleryItemData {
  id: string;
  imageUrl?: string;
  caption?: string | null;
  altText?: string | null;
  category?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Update an existing gallery item
 *
 * @param data - The update data (id is required, other fields optional)
 * @returns The updated gallery item
 */
export async function updateGalleryItemData(data: UpdateGalleryItemData): Promise<GalleryItemModel> {
  const { id, ...updateFields } = data;

  const updateData: Record<string, unknown> = {};

  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;
  if (updateFields.caption !== undefined) updateData.caption = updateFields.caption;
  if (updateFields.altText !== undefined) updateData.altText = updateFields.altText;
  if (updateFields.category !== undefined) updateData.category = updateFields.category;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;
  if (updateFields.published !== undefined) updateData.published = updateFields.published;

  const item = await prisma.galleryItem.update({
    where: { id },
    data: updateData,
  });

  return item;
}
