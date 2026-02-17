import { prisma } from '@/lib/prisma';

export interface UserAIConfig {
    remainingLives: number;
    lastResetDate: string;
}

const DEFAULT_LIVES = 3;

/**
 * Checks if a user has enough lives to perform an AI interaction.
 * Resets lives if 24h have passed since last reset.
 * 
 * @param userId - The user ID to check
 * @returns Object with hasLives (boolean) and remainingLives (number)
 */
export async function checkAndConsumLives(userId: string): Promise<{
    hasLives: boolean;
    remainingLives: number;
    error?: string;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { meta: true },
    });

    if (!user) throw new Error('User not found');

    let meta = (user.meta as unknown as UserAIConfig) || {
        remainingLives: DEFAULT_LIVES,
        lastResetDate: new Date().toISOString().split('T')[0],
    };

    const today = new Date().toISOString().split('T')[0];

    // Reset lives if today is different from last reset date
    if (meta.lastResetDate !== today) {
        meta.remainingLives = DEFAULT_LIVES;
        meta.lastResetDate = today;
    }

    if (meta.remainingLives <= 0) {
        return {
            hasLives: false,
            remainingLives: 0,
            error: 'Lo siento, te has quedado sin "Vidas" por hoy. Vuelve mañana para continuar tu misión.',
        };
    }

    // Consume a life
    meta.remainingLives -= 1;

    await prisma.user.update({
        where: { id: userId },
        data: { meta: meta as any },
    });

    return {
        hasLives: true,
        remainingLives: meta.remainingLives,
    };
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
