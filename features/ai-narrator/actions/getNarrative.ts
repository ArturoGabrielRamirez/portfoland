/**
 * Get Narrative Server Action
 *
 * Generates an AI narrative for a user's portfolio.
 * This is a public endpoint (no auth required) for viewing portfolios.
 */

import { generateNarrative } from '../services';
import type { NarrativeResult } from '../types/narrative';

/**
 * Get narrative for a portfolio
 *
 * @param username - The username to get narrative for
 * @param mode - Narrative mode (default: 'tech')
 * @param locale - Locale code (default: 'en')
 * @returns Narrative result with text and cache status
 */
export async function getNarrative(
  username: string,
  mode?: string,
  locale?: string
): Promise<NarrativeResult> {
  if (!username) {
    throw new Error('Username is required');
  }

  const effectiveMode = mode || 'tech';
  const effectiveLocale = locale || 'en';

  return generateNarrative(username, effectiveMode, effectiveLocale);
}
