/**
 * Portfolio View Tracking API
 *
 * POST /api/portfolio/view — records an anonymous portfolio view.
 * Privacy-safe: only stores SHA-256(ip + userAgent), never raw personal data.
 */

import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyPortfolioViews } from '@/features/notifications/services/notification.service';

export const runtime = 'nodejs';

const ONE_HOUR_MS = 60 * 60 * 1000;

function extractDomain(referrer: string | null): string | null {
    if (!referrer) return null;
    try {
        const url = new URL(referrer);
        return url.hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username } = body as { username?: string };
        if (!username) return NextResponse.json({ ok: false }, { status: 400 });

        // Resolve userId from username
        const user = await prisma.user.findFirst({
            where: { username },
            select: { id: true },
        });
        if (!user) return NextResponse.json({ ok: false }, { status: 404 });

        // Build privacy-safe visitor hash
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') ?? '0.0.0.0');
        const ua = request.headers.get('user-agent') ?? '';
        const visitorHash = createHash('sha256').update(ip + ua).digest('hex');

        const referrer = extractDomain(request.headers.get('referer'));

        // Deduplicate: skip if same visitor viewed same portfolio in last hour
        const recentView = await prisma.portfolioView.findFirst({
            where: {
                userId: user.id,
                visitorHash,
                viewedAt: { gte: new Date(Date.now() - ONE_HOUR_MS) },
            },
            select: { id: true },
        });
        if (recentView) return NextResponse.json({ ok: true, deduplicated: true });

        await prisma.portfolioView.create({
            data: { userId: user.id, visitorHash, referrer },
        });

        // Fire-and-forget notification (non-blocking)
        notifyPortfolioViews(user.id, 1).catch(() => {});

        return NextResponse.json({ ok: true });
    } catch (error) {
        // Never surface errors to portfolio visitors
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
