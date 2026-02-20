/**
 * Get Portfolio Settings by Username
 *
 * Resolves a username to a userId then delegates to the PortfolioSettings
 * feature data layer (which uses lazy creation via upsert). Returns null
 * if the user does not exist.
 */

import { prisma } from '@/lib/prisma';
import { getPortfolioSettingsData } from '@/features/portfolio-settings/data';
import type { PortfolioSettingsData } from '@/features/portfolio-settings/types/portfolioSettings';

/**
 * Get portfolio settings for a user identified by username
 *
 * Uses lazy creation: settings are automatically created with defaults on
 * first access for an existing user. Returns null for unknown usernames.
 *
 * @param username - The user's public username
 * @returns PortfolioSettingsData or null if user not found
 */
export async function getPortfolioSettingsByUsername(
  username: string
): Promise<PortfolioSettingsData | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return getPortfolioSettingsData(user.id);
}
