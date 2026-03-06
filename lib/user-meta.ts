/**
 * UserMeta — Shared type for User.meta JSON field
 *
 * User.meta is a freeform JSON blob in MongoDB that accumulates data from
 * multiple features. This file is the single source of truth for its shape.
 *
 * Usage: import { parseUserMeta } from '@/lib/user-meta'
 *        const meta = parseUserMeta(user.meta)
 *        meta.isPro / meta.assessmentTokens / etc.
 */

import type { AssessmentTokenInfo } from '@/features/assessment/types/assessment';

/** Shape of a cached AI narrative entry stored in User.meta */
export interface CachedNarrative {
  narrative: string;
  timestamp: string;
}

export interface UserMeta {
  /** AI chat / content-improvement daily allowance */
  remainingLives?: number;
  /** ISO date string (YYYY-MM-DD) for AI quota daily reset */
  lastResetDate?: string;

  /** Skill assessment daily token allowance */
  assessmentTokens?: AssessmentTokenInfo;

  /** Pro subscription flag — bypasses all token/life limits when true */
  isPro?: boolean;

  /** Cached AI-generated narratives keyed by mode + locale */
  aiNarrative_tech_en?: CachedNarrative;
  aiNarrative_tech_es?: CachedNarrative;
  aiNarrative_classic_en?: CachedNarrative;
  aiNarrative_classic_es?: CachedNarrative;
}

/**
 * Safely cast User.meta (Prisma JSON field) to the typed UserMeta shape.
 * Use this instead of inline `as { ... }` casts across services.
 *
 * @example
 *   const meta = parseUserMeta(user.meta)
 *   if (meta.isPro) { ... }
 */
export function parseUserMeta(meta: unknown): UserMeta {
  return ((meta ?? {}) as UserMeta);
}
