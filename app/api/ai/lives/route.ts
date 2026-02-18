/**
 * AI Lives API Route
 *
 * GET endpoint to retrieve current user's AI interaction lives (3/day limit).
 */

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getUserAIConfig } from '@/lib/ai/lives';

export const runtime = 'nodejs';

/**
 * GET /api/ai/lives
 *
 * Returns the user's current AI lives count and last reset date.
 *
 * @returns {remainingLives: number, lastResetDate: string}
 */
export async function GET() {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const userId = session.user.id;

        // Get user's AI config (with automatic reset if needed)
        const config = await getUserAIConfig(userId);

        // Check if reset is needed (if lastResetDate is not today)
        const today = new Date().toISOString().split('T')[0];
        const needsReset = config.lastResetDate !== today;

        const remainingLives = needsReset ? 3 : config.remainingLives;

        return new Response(
            JSON.stringify({
                remainingLives,
                lastResetDate: config.lastResetDate,
                needsReset,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error: any) {
        console.error('AI_LIVES_ROUTE_ERROR:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to retrieve AI lives' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
