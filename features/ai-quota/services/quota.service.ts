/**
 * AI Quota Service
 *
 * Business logic for managing AI quota/lives.
 */

import { prisma } from '@/lib/prisma';
import { DEFAULT_LIVES, type ConsumeLifeResult } from '../types/quota';

/**
 * Consume a life for a user
 *
 * Atomically checks and consumes an AI life.
 * Uses two sequential MongoDB findAndModify operations:
 * 1. Atomic daily reset: if lastResetDate != today, reset lives to DEFAULT_LIVES
 * 2. Atomic decrement: if remainingLives > 0, decrement by 1 and return updated doc
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

  // Step 1: Atomic daily reset — only fires if lastResetDate != today
  await prisma.$runCommandRaw({
    findAndModify: 'users',
    query: {
      _id: userId,
      'meta.lastResetDate': { $ne: today },
    },
    update: {
      $set: {
        'meta.remainingLives': DEFAULT_LIVES,
        'meta.lastResetDate': today,
      },
    },
    new: false,
  });

  // Step 2: Atomic decrement — only fires if remainingLives > 0
  const decrementResult = await prisma.$runCommandRaw({
    findAndModify: 'users',
    query: {
      _id: userId,
      'meta.remainingLives': { $gt: 0 },
    },
    update: {
      $inc: { 'meta.remainingLives': -1 },
    },
    new: true,
  });

  const updatedDoc = (decrementResult as { value?: { meta?: { remainingLives?: number } } }).value;

  if (!updatedDoc) {
    const error =
      locale === 'es'
        ? 'Lo siento, te has quedado sin "Vidas" por hoy. Vuelve mañana para continuar tu misión.'
        : 'Sorry, you have run out of "Lives" for today. Come back tomorrow to continue your mission.';
    return { hasLives: false, remainingLives: 0, error };
  }

  const remainingLives = updatedDoc.meta?.remainingLives ?? 0;
  return { hasLives: true, remainingLives };
}

/**
 * Check if user has remaining lives without consuming
 *
 * @param userId - The user ID
 * @returns Whether user has lives remaining
 */
export async function hasRemainingLives(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user?.meta) {
    return true;
  }

  const meta = user.meta as { remainingLives?: number };
  return (meta.remainingLives ?? 0) > 0;
}
