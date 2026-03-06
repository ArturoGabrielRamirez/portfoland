/**
 * Assessment Token Constants Tests
 *
 * Focused tests verifying the constant values that drive the token system
 * and the supported-skill gate. These are the values other feature code
 * depends on at runtime; catching a wrong constant here is cheap.
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_ASSESSMENT_TOKENS } from '@/features/assessment/constants/tokens';
import { ASSESSMENT_SUPPORTED_SKILL_SLUGS } from '@/features/assessment/constants/supportedSkills';

// =============================================================================
// Token Constants
// =============================================================================

describe('DEFAULT_ASSESSMENT_TOKENS', () => {
  it('equals 3 — the daily token allowance per user', () => {
    expect(DEFAULT_ASSESSMENT_TOKENS).toBe(3);
  });
});

// =============================================================================
// Supported Skill Slugs
// =============================================================================

describe('ASSESSMENT_SUPPORTED_SKILL_SLUGS', () => {
  it('contains exactly 5 entries and includes typescript', () => {
    expect(ASSESSMENT_SUPPORTED_SKILL_SLUGS).toHaveLength(5);
    expect(ASSESSMENT_SUPPORTED_SKILL_SLUGS).toContain('typescript');
  });
});
