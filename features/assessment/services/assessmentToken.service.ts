/**
 * Assessment Token Service
 *
 * Business logic for managing the daily assessment token allowance.
 * Uses Prisma's standard API (not raw commands) to avoid JSON encoding issues
 * with MongoDB dot-notation on Prisma Json fields.
 *
 * Flow for consumeAssessmentToken:
 *   1. Read current meta
 *   2. If lastResetDate !== today → reset to DEFAULT_ASSESSMENT_TOKENS
 *   3. If remaining <= 0 → return hasTokens: false
 *   4. Decrement and persist
 */

import { prisma } from '@/lib/prisma';
import { DEFAULT_ASSESSMENT_TOKENS } from '@/features/assessment/constants/tokens';
import { ASSESSMENT_MESSAGES } from '@/features/assessment/constants/messages';
import { parseUserMeta } from '@/lib/user-meta';

// =============================================================================
// Types
// =============================================================================

interface ConsumeTokenResult {
  hasTokens: boolean;
  remaining: number;
  error?: string;
}

interface AssessmentTokensMeta {
  remaining: number;
  lastResetDate: string;
}

interface ExtendedMeta {
  isPro?: boolean;
  assessmentTokens?: AssessmentTokensMeta;
  [key: string]: unknown;
}

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Consume one assessment token for a user.
 *
 * Pro users bypass token consumption entirely — returns infinite remaining.
 *
 * @param userId - The user ID
 * @returns Result indicating whether tokens were available and how many remain
 */
export async function consumeAssessmentToken(userId: string): Promise<ConsumeTokenResult> {
  const today = new Date().toISOString().split('T')[0];

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  const rawMeta = parseUserMeta(userRecord?.meta) as ExtendedMeta | null;

  // Pro users are not subject to token limits
  if (rawMeta?.isPro === true) {
    return { hasTokens: true, remaining: Infinity };
  }

  const meta = (rawMeta ?? {}) as ExtendedMeta;
  const tokens = meta.assessmentTokens;

  // Determine current remaining, resetting if date changed
  let remaining = tokens?.remaining ?? DEFAULT_ASSESSMENT_TOKENS;
  if (!tokens || tokens.lastResetDate !== today) {
    remaining = DEFAULT_ASSESSMENT_TOKENS;
  }

  if (remaining <= 0) {
    return {
      hasTokens: false,
      remaining: 0,
      error: ASSESSMENT_MESSAGES.NO_TOKENS,
    };
  }

  const newRemaining = remaining - 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      meta: {
        ...meta,
        assessmentTokens: {
          remaining: newRemaining,
          lastResetDate: today,
        },
      },
    },
  });

  return { hasTokens: true, remaining: newRemaining };
}

/**
 * Check whether a user has assessment tokens remaining without consuming one.
 *
 * Returns true if remaining > 0 or if user.meta.isPro is true.
 * Does NOT reset tokens or write to the database.
 *
 * @param userId - The user ID
 * @returns true when the user can start an assessment
 */
export async function hasAssessmentTokens(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  if (!user?.meta) {
    // No meta written yet — user has the full default allowance
    return true;
  }

  const meta = parseUserMeta(user.meta) as ExtendedMeta;

  // Pro users always have access
  if (meta?.isPro === true) {
    return true;
  }

  const today = new Date().toISOString().split('T')[0];
  const tokenInfo = meta?.assessmentTokens;

  // If no token record exists yet, or if the date differs (reset due), treat as full
  if (!tokenInfo || tokenInfo.lastResetDate !== today) {
    return true;
  }

  return tokenInfo.remaining > 0;
}

/**
 * Refund one assessment token back to the user.
 *
 * Called when a token was consumed but the downstream operation (AI question
 * generation, DB persist) failed — so the user is not charged for a broken attempt.
 *
 * No-ops for pro users. Caps at DEFAULT_ASSESSMENT_TOKENS to prevent over-refund.
 *
 * @param userId - The user ID
 */
export async function refundAssessmentToken(userId: string): Promise<void> {
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  const rawMeta = parseUserMeta(userRecord?.meta) as ExtendedMeta | null;
  if (rawMeta?.isPro === true) return;

  const meta = (rawMeta ?? {}) as ExtendedMeta;
  const tokens = meta.assessmentTokens;
  const today = new Date().toISOString().split('T')[0];

  // If no token record, nothing to refund (user still has full daily allowance)
  if (!tokens) return;

  // Cap at DEFAULT_ASSESSMENT_TOKENS
  const current = tokens.remaining ?? 0;
  if (current >= DEFAULT_ASSESSMENT_TOKENS) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      meta: {
        ...meta,
        assessmentTokens: {
          remaining: current + 1,
          lastResetDate: tokens.lastResetDate ?? today,
        },
      },
    },
  });
}
