/**
 * Update Portfolio Mode Data
 *
 * Pure Prisma update for the user's portfolioMode field.
 */

import { prisma } from '@/lib/prisma';

/**
 * Update the portfolioMode field on the User model
 *
 * @param userId - The user's ID
 * @param mode - The new portfolio mode value
 * @returns Updated user record
 */
export async function updatePortfolioModeData(
  userId: string,
  mode: string,
  sectionOrder: string[],
  sectionVisibility: Record<string, boolean>
) {
  return await prisma.user.update({
    where: { id: userId },
    data: { portfolioMode: mode, sectionOrder, sectionVisibility },
  });
}
