/**
 * Get Gallery Items by User ID
 *
 * Retrieves all gallery items for a user ordered by order asc.
 * Used for the dashboard view (includes unpublished items).
 */

import { prisma } from '@/lib/prisma';
import type { GalleryItemModel } from '../types/galleryItem';

/**
 * Get all gallery items for a user (dashboard view, includes unpublished)
 *
 * @param userId - The user's ID
 * @returns Array of gallery items ordered by order asc
 */
export async function getGalleryItemsByUserIdData(userId: string): Promise<GalleryItemModel[]> {
  const items = await prisma.galleryItem.findMany({
    where: { userId },
    orderBy: [{ order: 'asc' }],
  });

  return items;
}
