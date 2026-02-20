/**
 * Get Portfolio Settings Data
 *
 * Fetches portfolio settings for a user, lazy-creating default settings
 * on first access via upsert.
 */

import { prisma } from '@/lib/prisma';
import type { PortfolioSettingsModel } from '../types/portfolioSettings';

/**
 * Get or lazy-create portfolio settings for a user
 *
 * Uses upsert so that the first access automatically creates the settings record
 * with Prisma @default values. Subsequent calls return the existing record unchanged.
 *
 * @param userId - The user ID whose settings to retrieve
 * @returns The user's portfolio settings (created with defaults if not existing)
 */
export async function getPortfolioSettingsData(userId: string): Promise<PortfolioSettingsModel> {
  const settings = await prisma.portfolioSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  return settings;
}
