'use server';

import { prisma } from '@/lib/prisma';

/**
 * Check if a username is available (not taken by another user).
 * Returns { available: boolean }.
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string,
): Promise<{ available: boolean }> {
  if (!username || username.length < 3) return { available: false };

  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: 'insensitive' },
      ...(currentUserId ? { id: { not: currentUserId } } : {}),
    },
    select: { id: true },
  });

  return { available: !existing };
}
