/**
 * Get User AI Config
 *
 * Retrieves user's AI configuration from meta.
 */

import { prisma } from '@/lib/prisma';
import type { UserAIConfig } from '../types/quota';

/**
 * Get user's AI configuration
 *
 * @param userId - The user ID
 * @returns User AI config or default values
 */
export async function getUserAIConfigData(userId: string): Promise<UserAIConfig> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user?.meta) {
    return {
      remainingLives: 3,
      lastResetDate: new Date().toISOString().split('T')[0],
    };
  }

  return user.meta as unknown as UserAIConfig;
}
