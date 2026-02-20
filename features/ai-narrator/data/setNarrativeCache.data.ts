/**
 * Set Narrative Cache
 *
 * Stores AI-generated narrative in user meta for caching.
 */

import { prisma } from '@/lib/prisma';
import { NARRATIVE_CACHE_DURATION_MS } from './getNarrativeData.data';

/**
 * Set narrative cache for a user
 *
 * @param userId - The user ID
 * @param narrative - The generated narrative text
 * @param mode - Narrative mode (e.g., 'tech', 'gaming')
 * @param locale - Locale code (e.g., 'en', 'es')
 */
export async function setNarrativeCache(
  userId: string,
  narrative: string,
  mode: string,
  locale: string
): Promise<void> {
  const cacheKey = `aiNarrative_${mode}_${locale}`;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user) return;

  const existingMeta = user.meta as Record<string, unknown> | null;
  const meta = existingMeta || {};

  const newMeta = {
    ...meta,
    [cacheKey]: {
      narrative,
      timestamp: new Date().toISOString(),
    },
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      meta: newMeta as unknown as undefined,
    },
  });
}
