/**
 * UserMeta — Shared type for User.meta JSON field
 *
 * User.meta is a freeform JSON blob in MongoDB that accumulates data from
 * multiple features. This file is the single source of truth for its shape.
 * All features should import from here instead of doing their own `as { ... }`
 * type casts against User.meta.
 *
 * Fields:
 *   remainingLives / lastResetDate  — AI quota (features/ai-quota)
 *   assessmentTokens                — Skill assessment tokens (features/assessment)
 *   isPro                           — Pro subscription flag
 *   aiNarrative_*                   — Cached AI narratives (features/ai-narrator)
 */

import type { AssessmentTokenInfo } from '@/features/assessment/types/assessment';

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
  aiNarrative_tech_en?: string;
  aiNarrative_tech_es?: string;
  aiNarrative_classic_en?: string;
  aiNarrative_classic_es?: string;
}
