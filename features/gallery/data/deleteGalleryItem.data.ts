/**
 * Delete Gallery Item
 *
 * Deletes a gallery item by ID.
 */

import { prisma } from '@/lib/prisma';
import type { GalleryItemModel } from '../types/galleryItem';

/**
 * Delete a gallery item by ID
 *
 * @param id - The gallery item ID to delete
 * @returns The deleted gallery item
 */
export async function deleteGalleryItemData(id: string): Promise<GalleryItemModel> {
  const item = await prisma.galleryItem.delete({
    where: { id },
  });

  return item;
}
