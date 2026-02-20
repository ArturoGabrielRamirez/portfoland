/**
 * Create Gallery Item
 *
 * Creates a new gallery item in the database.
 */

import { prisma } from '@/lib/prisma';
import type { GalleryItemModel } from '../types/galleryItem';

/**
 * Input for creating a gallery item at the data layer
 */
export interface CreateGalleryItemData {
  userId: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  category?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Create a new gallery item
 *
 * @param data - The gallery item data
 * @returns The created gallery item
 */
export async function createGalleryItemData(data: CreateGalleryItemData): Promise<GalleryItemModel> {
  const item = await prisma.galleryItem.create({
    data: {
      userId: data.userId,
      imageUrl: data.imageUrl,
      caption: data.caption ?? null,
      altText: data.altText ?? null,
      category: data.category ?? null,
      order: data.order ?? 0,
      published: data.published ?? true,
    },
  });

  return item;
}
