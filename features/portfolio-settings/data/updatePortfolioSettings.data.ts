/**
 * Update Portfolio Settings Data
 *
 * Updates existing portfolio settings for a user in the database.
 */

import { prisma } from '@/lib/prisma';
import type { PortfolioSettingsModel, UpdatePortfolioSettingsInput } from '../types/portfolioSettings';

/**
 * Update portfolio settings for a user
 *
 * @param userId - The user ID whose settings to update
 * @param input - The fields to update (all optional)
 * @returns The updated portfolio settings
 */
export async function updatePortfolioSettingsData(
  userId: string,
  input: UpdatePortfolioSettingsInput
): Promise<PortfolioSettingsModel> {
  const settings = await prisma.portfolioSettings.update({
    where: { userId },
    data: input,
  });

  return settings;
}
