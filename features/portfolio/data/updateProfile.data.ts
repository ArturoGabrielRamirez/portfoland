/**
 * Update Profile Data
 *
 * Pure Prisma update for the user's profile fields.
 */

import { prisma } from '@/lib/prisma';

/**
 * Update user profile fields
 *
 * @param userId - The user's ID
 * @param data - Profile data to update (name, bio, image)
 * @returns Updated user record
 */
export async function updateUserProfileData(
  userId: string,
  data: {
    name: string;
    bio?: string | null;
    image?: string | null;
    sectionOrder?: string[];
    contactLinks?: Record<string, any>;
    sectionVisibility?: Record<string, any>;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}
