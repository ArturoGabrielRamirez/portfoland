/**
 * Narrative Cache Service
 *
 * Provides cache invalidation for AI-generated portfolio narratives.
 * Stored in User.meta as aiNarrative_<mode>_<locale> keys.
 */

import { prisma } from '@/lib/prisma';

const NARRATIVE_CACHE_KEYS = [
  'meta.aiNarrative_gaming_en',
  'meta.aiNarrative_gaming_es',
  'meta.aiNarrative_professional_en',
  'meta.aiNarrative_professional_es',
];

/**
 * Invalidate all AI narrative cache entries for a user.
 *
 * Uses a single atomic MongoDB $unset to remove all 4 cache keys.
 * Never throws — cache invalidation failure should not affect the parent operation.
 *
 * @param userId - The user ID whose narrative cache should be cleared
 */
export async function invalidateNarrativeCache(userId: string): Promise<void> {
  try {
    const unsetFields = NARRATIVE_CACHE_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: '' }),
      {} as Record<string, string>
    );

    await prisma.$runCommandRaw({
      findAndModify: 'users',
      query: { _id: userId },
      update: { $unset: unsetFields },
      new: false,
    });
  } catch (error) {
    console.error('[cache] Failed to invalidate narrative cache for user:', userId, error);
  }
}
