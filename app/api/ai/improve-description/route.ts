/**
 * AI Description Improvement API Route
 *
 * POST endpoint to improve project/experience descriptions using AI.
 *
 * Now uses ai-content feature with proper separation:
 * - services/: Business logic and AI generation
 */

import { improveDescription } from '@/features/ai-content';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

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
    const { description, mode, locale, context, additionalNotes } = await req.json();

    if (!description || typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await improveDescription(
      userId,
      description,
      context || 'project',
      locale || 'en',
      additionalNotes
    );

    return new Response(
      JSON.stringify({
        improvedDescription: result.improvedText,
        remainingLives: result.remainingLives,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('IMPROVE_DESCRIPTION_ERROR:', errorMessage);

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
        error: 'Failed to improve description',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
