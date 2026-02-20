/**
 * Get Public Services by Username
 *
 * Resolves a username to a userId then delegates to the Services feature
 * data layer. Returns an empty array if the user does not exist.
 */

import { prisma } from '@/lib/prisma';
import { getPublicServicesData } from '@/features/services/data';
import type { ServiceModel } from '@/features/services/types/service';

/**
 * Get published services for a user identified by username
 *
 * @param username - The user's public username
 * @returns Array of published services ordered by order asc, or [] if user not found
 */
export async function getPublicServicesByUsername(
  username: string
): Promise<ServiceModel[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  return getPublicServicesData(user.id);
}
