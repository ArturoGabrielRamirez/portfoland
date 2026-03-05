/**
 * Assessment Token Service
 *
 * Business logic for managing the daily assessment token allowance.
 * Uses the same two-step atomic $runCommandRaw findAndModify pattern as
 * the ai-quota service to prevent race conditions when multiple tabs or
 * requests attempt to consume a token simultaneously.
 */

import { prisma } from '@/lib/prisma';
import { DEFAULT_ASSESSMENT_TOKENS } from '@/features/assessment/constants/tokens';
import { ASSESSMENT_MESSAGES } from '@/features/assessment/constants/messages';
import type { AssessmentTokenInfo } from '@/features/assessment/types/assessment';

// =============================================================================
// Types
// =============================================================================

interface ConsumeTokenResult {
  hasTokens: boolean;
  remaining: number;
  error?: string;
}

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Atomically consume one assessment token for a user.
 *
 * Pro users bypass token consumption entirely — returns infinite remaining.
 *
 * Two-step MongoDB findAndModify sequence mirrors features/ai-quota/services/quota.service.ts:
 *   Step 1: If lastResetDate !== today, reset remaining to DEFAULT_ASSESSMENT_TOKENS.
 *   Step 2: If remaining > 0, decrement by 1 and return the updated document.
 *           If no document is matched (remaining was 0), return no-tokens error.
 *
 * @param userId - The user ID
 * @returns Result indicating whether tokens were available and how many remain
 */
export async function consumeAssessmentToken(userId: string): Promise<ConsumeTokenResult> {
  // --- Pro bypass ---
  // Pro users are not subject to token limits; skip both findAndModify calls.
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { meta: true },
  });

  const rawMeta = userRecord?.meta as { isPro?: boolean } | null;

  if (rawMeta?.isPro === true) {
    return { hasTokens: true, remaining: Infinity };
  }

  const today = new Date().toISOString().split('T')[0];

  // Step 1: Atomic daily reset — only fires if lastResetDate !== today
  await prisma.$runCommandRaw({
    findAndModify: 'users',
    query: {
      _id: userId,
      'meta.assessmentTokens.lastResetDate': { $ne: today },
    },
    update: {
      $set: {
        'meta.assessmentTokens.remaining': DEFAULT_ASSESSMENT_TOKENS,
        'meta.assessmentTokens.lastResetDate': today,
      },
    },
    new: false,
  });

  // Step 2: Atomic decrement — only fires if remaining > 0
  const decrementResult = await prisma.$runCommandRaw({
    findAndModify: 'users',
    query: {
      _id: userId,
      'meta.assessmentTokens.remaining': { $gt: 0 },
    },
    update: {
      $inc: { 'meta.assessmentTokens.remaining': -1 },
    },
    new: true,
  });

  const updatedDoc = (
    decrementResult as { value?: { meta?: { assessmentTokens?: AssessmentTokenInfo } } }
  ).value;

  if (!updatedDoc) {
    return {
      hasTokens: false,
      remaining: 0,
      error: ASSESSMENT_MESSAGES.NO_TOKENS,
    };
  }

  const remaining = updatedDoc.meta?.assessmentTokens?.remaining ?? 0;
  return { hasTokens: true, remaining };
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

  const meta = user.meta as {
    isPro?: boolean;
    assessmentTokens?: AssessmentTokenInfo;
  };

  // Pro users always have access
  if (meta.isPro === true) {
    return true;
  }

  const today = new Date().toISOString().split('T')[0];
  const tokenInfo = meta.assessmentTokens;

  // If no token record exists yet, or if the date differs (reset due), treat as full
  if (!tokenInfo || tokenInfo.lastResetDate !== today) {
    return true;
  }

  return tokenInfo.remaining > 0;
}
