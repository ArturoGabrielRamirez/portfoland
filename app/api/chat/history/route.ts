/**
 * AI Chat History API Route
 *
 * GET endpoint to retrieve conversation history for the current user.
 */

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/chat/history
 *
 * Returns the user's most recent conversation messages.
 *
 * @returns {messages: Array<{role: string, content: string}>}
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

        // Get most recent conversation
        const conversation = await prisma.conversation.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50 // Last 50 messages
                }
            }
        });

        if (!conversation || conversation.messages.length === 0) {
            return new Response(
                JSON.stringify({ messages: [] }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Transform messages to frontend format
        const messages = conversation.messages.map(m => ({
            id: m.id,
            role: m.role, // Already in correct format: 'user', 'assistant', etc.
            content: m.content,
            createdAt: m.createdAt.toISOString()
        }));

        return new Response(
            JSON.stringify({ messages }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('CHAT_HISTORY_ERROR:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to retrieve chat history' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
