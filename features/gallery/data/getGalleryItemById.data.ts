/**
 * Get Gallery Item by ID
 *
 * Retrieves a single gallery item by its ID.
 */

import { prisma } from '@/lib/prisma';
import type { GalleryItemModel } from '../types/galleryItem';

/**
 * Get a single gallery item by ID
 *
 * @param id - The gallery item ID
 * @returns The gallery item or null if not found
 */
export async function getGalleryItemByIdData(id: string): Promise<GalleryItemModel | null> {
  const item = await prisma.galleryItem.findUnique({
    where: { id },
  });

  return item;
}
