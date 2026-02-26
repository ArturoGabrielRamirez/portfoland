/**
 * AI Portfolio Narrator API Route
 *
 * GET endpoint to generate AI narrative of user's professional story.
 * Cached for 24h to reduce costs.
 *
 * Now uses the ai-narrator feature with proper separation:
 * - data/: Pure database queries
 * - services/: Business logic and AI generation
 */

import { getNarrative } from '@/features/ai-narrator';
import { getLocaleFromRequest } from '@/features/i18n/utils/detectLocale';
import type { Locale } from '@/i18n/config';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const mode = searchParams.get('mode') || 'tech';
    const locale = searchParams.get('locale') as Locale || await getLocaleFromRequest(req);

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await getNarrative(username, mode, locale);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('NARRATE_PORTFOLIO_ERROR:', errorMessage);

    if (errorMessage === 'User not found' || errorMessage === 'User data not found') {
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to generate narrative',
        details: errorMessage
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
