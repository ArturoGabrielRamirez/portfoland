/**
 * Update Streak Utility
 *
 * Maintains the user's daily login streak by comparing the current UTC date
 * against the last recorded streak date. Idempotent within a single UTC day.
 * Revalidates the user-stats cache tag after every successful update.
 */

import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

/**
 * Update the streak counter for a user based on their last activity date.
 *
 * Rules:
 * - Same UTC day as lastStreakDate → return early (idempotent)
 * - lastStreakDate is null OR older than yesterday → reset streak to 1
 * - lastStreakDate is exactly yesterday → increment streak by 1
 *
 * @param userId - The authenticated user's ID
 */
export async function updateStreak(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastStreakDate: true, currentStreak: true },
  });

  if (!user) return;

  // Use midnight UTC strings for timezone-safe date comparison
  const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');
  const yesterday = new Date(today.getTime() - 86400000);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const lastStr = user.lastStreakDate?.toISOString().split('T')[0] ?? null;

  // Already updated today — nothing to do
  if (lastStr === todayStr) return;

  // Determine new streak value
  const newStreak = lastStr === yesterdayStr ? user.currentStreak + 1 : 1;

  await prisma.user.update({
    where: { id: userId },
    data: { currentStreak: newStreak, lastStreakDate: today },
  });

  // Pass empty CacheLifeConfig as second arg — required by this Next.js version's type signature.
  // An empty object means no explicit expiry profile; invalidation is tag-based only.
  revalidateTag(`user-stats-${userId}`, {});
}
