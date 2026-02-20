/**
 * Get Public Gallery
 *
 * Retrieves only published gallery items for a user, ordered by order asc.
 * Returns items grouped with a distinct categories list.
 * Used for the public portfolio view.
 */

import { prisma } from '@/lib/prisma';
import type { PublicGalleryData } from '../types/galleryItem';

/**
 * Get published gallery items for a user (public portfolio view)
 *
 * @param userId - The user's ID
 * @returns PublicGalleryData with published items ordered by order asc and distinct categories
 */
export async function getPublicGalleryData(userId: string): Promise<PublicGalleryData> {
  const items = await prisma.galleryItem.findMany({
    where: { userId, published: true },
    orderBy: [{ order: 'asc' }],
  });

  // Extract distinct non-null category values from the returned items
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[];

  return { items, categories };
}
