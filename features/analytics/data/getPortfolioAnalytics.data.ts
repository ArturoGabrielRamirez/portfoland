import { prisma } from '@/lib/prisma';
import type { PortfolioAnalytics } from '../types/analytics';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getPortfolioAnalyticsData(userId: string): Promise<PortfolioAnalytics> {
    const now = new Date();
    const since7d = new Date(now.getTime() - 7 * DAY_MS);
    const since30d = new Date(now.getTime() - 30 * DAY_MS);

    const [views7d, views30d, referrerGroups] = await Promise.all([
        prisma.portfolioView.findMany({
            where: { userId, viewedAt: { gte: since7d } },
            select: { visitorHash: true },
        }),
        prisma.portfolioView.findMany({
            where: { userId, viewedAt: { gte: since30d } },
            select: { visitorHash: true, referrer: true },
        }),
        prisma.portfolioView.groupBy({
            by: ['referrer'],
            where: { userId, viewedAt: { gte: since30d }, referrer: { not: null } },
            _count: { referrer: true },
            orderBy: { _count: { referrer: 'desc' } },
            take: 5,
        }),
    ]);

    const uniqueVisitors7d = new Set(views7d.map(v => v.visitorHash)).size;
    const uniqueVisitors30d = new Set(views30d.map(v => v.visitorHash)).size;

    const topReferrers = referrerGroups
        .filter(g => g.referrer)
        .map(g => ({ domain: g.referrer as string, count: g._count.referrer }));

    return {
        totalViews7d: views7d.length,
        totalViews30d: views30d.length,
        uniqueVisitors7d,
        uniqueVisitors30d,
        topReferrers,
    };
}
