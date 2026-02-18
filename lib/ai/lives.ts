import { prisma } from '@/lib/prisma';

export interface UserAIConfig {
  remainingLives: number;
  lastResetDate: string;
}

const DEFAULT_LIVES = 3;

/**
 * Atomically checks and consumes an AI life for a user.
 *
 * Uses two sequential MongoDB findAndModify operations to avoid race conditions:
 * 1. Atomic daily reset: if lastResetDate != today, reset lives to DEFAULT_LIVES
 * 2. Atomic decrement: if remainingLives > 0, decrement by 1 and return updated doc
 *
 * @param userId - The user ID to check
 * @param locale - Locale for error messages ('en' | 'es'), defaults to 'en'
 * @returns Object with hasLives (boolean) and remainingLives (number)
 */
export async function checkAndConsumeLives(
  userId: string,
  locale: string = 'en'
): Promise<{
  hasLives: boolean;
  remainingLives: number;
  error?: string;
}> {
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

  const updatedDoc = (decrementResult as any).value;

  if (!updatedDoc) {
    const error =
      locale === 'es'
        ? 'Lo siento, te has quedado sin "Vidas" por hoy. Vuelve mañana para continuar tu misión.'
        : 'Sorry, you have run out of "Lives" for today. Come back tomorrow to continue your mission.';
    return { hasLives: false, remainingLives: 0, error };
  }

  const remainingLives = (updatedDoc.meta as any)?.remainingLives ?? 0;
  return { hasLives: true, remainingLives };
}

/**
 * Retrieves the current AI configuration for a user.
 */
export async function getUserAIConfig(userId: string): Promise<UserAIConfig> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user?.meta) {
    return {
      remainingLives: DEFAULT_LIVES,
      lastResetDate: new Date().toISOString().split('T')[0],
    };
  }

  return user.meta as unknown as UserAIConfig;
}
