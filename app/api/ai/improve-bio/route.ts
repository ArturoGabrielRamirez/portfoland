/**
 * AI Bio Improvement API Route
 *
 * POST endpoint to improve user bio using AI.
 *
 * Now uses ai-content feature with proper separation:
 * - services/: Business logic and AI generation
 */

import { improveBio } from '@/features/ai-content';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getLocaleFromRequest } from '@/features/i18n/utils/detectLocale';
import type { Locale } from '@/i18n/config';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;
    const { bio, mode, locale: bodyLocale, additionalNotes } = await req.json();

    if (!bio || typeof bio !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Bio text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use body locale or detect from cookie/header
    const locale = bodyLocale || await getLocaleFromRequest(req);

    const result = await improveBio(
      userId,
      bio,
      mode || 'tech',
      locale,
      additionalNotes
    );

    return new Response(
      JSON.stringify({
        improvedBio: result.improvedText,
        remainingLives: result.remainingLives,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('IMPROVE_BIO_ERROR:', errorMessage);

    if (errorMessage.includes('No AI energy')) {
      return new Response(
        JSON.stringify({
          error: errorMessage,
          remainingLives: 0,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to improve bio',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
