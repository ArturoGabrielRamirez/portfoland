/**
 * Get Public Gallery by Username
 *
 * Resolves a username to a userId then delegates to the Gallery feature
 * data layer. Returns only the items array (not the grouped PublicGalleryData)
 * for use in the PortfolioData aggregation. Returns an empty array if the
 * user does not exist.
 */

import { prisma } from '@/lib/prisma';
import { getPublicGalleryData } from '@/features/gallery/data';
import type { GalleryItemModel } from '@/features/gallery/types/galleryItem';

/**
 * Get published gallery items for a user identified by username
 *
 * @param username - The user's public username
 * @returns Array of published gallery items ordered by order asc, or [] if user not found
 */
export async function getPublicGalleryByUsername(
  username: string
): Promise<GalleryItemModel[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  const { items } = await getPublicGalleryData(user.id);
  return items;
}
