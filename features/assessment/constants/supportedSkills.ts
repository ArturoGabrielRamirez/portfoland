/**
 * Assessment Supported Skills
 *
 * Single source of truth for which skill slugs are eligible for
 * AI-powered skill assessments. All feature code checks eligibility
 * against this array rather than duplicating the list inline.
 */

// =============================================================================
// Supported Skill Slugs
// =============================================================================

/**
 * Skill slugs that can be assessed through the AI assessment flow.
 * Must match the `slug` field on the `Skill` Prisma model exactly.
 */
export const ASSESSMENT_SUPPORTED_SKILL_SLUGS: string[] = [
  'react',
  'javascript',
  'typescript',
  'python',
  'nodejs',
];
