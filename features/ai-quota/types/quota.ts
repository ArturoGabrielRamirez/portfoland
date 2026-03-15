/**
 * AI Quota Types
 *
 * Type definitions for the AI quota/lives feature.
 */

import type { Prisma } from '@/app/generated/prisma/client';

/**
 * User AI configuration stored in meta
 */
export interface UserAIConfig {
  remainingLives: number;
  lastResetDate: string;
}

/**
 * Default number of AI lives per day
 */
export const DEFAULT_LIVES = 10;

/**
 * Result of consuming a life
 */
export interface ConsumeLifeResult {
  hasLives: boolean;
  remainingLives: number;
  error?: string;
}

/**
 * User meta type for AI config
 */
export type UserAIMeta = Prisma.UserGetPayload<{
  select: {
    meta: true;
  };
}>['meta'];
