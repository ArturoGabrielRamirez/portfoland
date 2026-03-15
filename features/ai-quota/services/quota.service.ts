/**
 * AI Quota Service
 *
 * Business logic for managing AI quota/lives.
 */

import { prisma } from '@/lib/prisma';
import { DEFAULT_LIVES, type ConsumeLifeResult } from '../types/quota';

interface AIMeta {
  remainingLives?: number;
  lastResetDate?: string;
}

/**
 * Consume a life for a user.
 *
 * Uses Prisma's standard API (not raw commands) to avoid JSON encoding issues
 * with MongoDB dot-notation on Prisma Json fields.
 *
 * Flow:
 *   1. Read current meta
 *   2. If lastResetDate != today → reset to DEFAULT_LIVES
 *   3. If remainingLives <= 0 → return hasLives: false
 *   4. Decrement and persist
 *
 * @param userId - The user ID
 * @param locale - Locale for error messages ('en' | 'es')
 * @returns Result with hasLives and remainingLives
 */
export async function consumeLifeService(
  userId: string,
  locale: string = 'en'
): Promise<ConsumeLifeResult> {
  const today = new Date().toISOString().split('T')[0];

  // Read the current user meta
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user) {
    return { hasLives: false, remainingLives: 0, error: 'User not found' };
  }

  const meta = (user.meta ?? {}) as AIMeta;

  // Reset daily lives if we haven't reset today yet
  let remainingLives = meta.remainingLives ?? DEFAULT_LIVES;
  if (meta.lastResetDate !== today) {
    remainingLives = DEFAULT_LIVES;
  }

  if (remainingLives <= 0) {
    const error =
      locale === 'es'
        ? 'Lo siento, te has quedado sin "Vidas" por hoy. Vuelve mañana para continuar tu misión.'
        : 'Sorry, you have run out of "Lives" for today. Come back tomorrow to continue your mission.';
    return { hasLives: false, remainingLives: 0, error };
  }

  const newRemaining = remainingLives - 1;

  // Persist updated meta
  await prisma.user.update({
    where: { id: userId },
    data: {
      meta: {
        ...meta,
        remainingLives: newRemaining,
        lastResetDate: today,
      },
    },
  });

  return { hasLives: true, remainingLives: newRemaining };
}

/**
 * Check if user has remaining lives without consuming
 *
 * @param userId - The user ID
 * @returns Whether user has lives remaining
 */
export async function hasRemainingLives(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user?.meta) {
    return true;
  }

  const meta = user.meta as AIMeta;

  // If not reset today, user effectively has full lives
  if (meta.lastResetDate !== today) {
    return true;
  }

  return (meta.remainingLives ?? DEFAULT_LIVES) > 0;
}
