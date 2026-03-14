'use client';

import { cn } from '@/lib/utils';
import type { AnalyticsPanelProps } from '../types/analytics';

export function AnalyticsPanel({ analytics, portfolioMode }: AnalyticsPanelProps) {
    const isTech = portfolioMode === 'tech';

    const statCard = (label: string, value: number, sub: string) => (
        <div className={cn(
            'flex flex-col gap-1 p-3 rounded border',
            isTech
                ? 'border-[hsl(174,100%,50%,0.2)] bg-[hsl(174,100%,50%,0.05)]'
                : 'border-gray-200 bg-white'
        )}>
            <span className={cn('text-2xl font-bold font-mono', isTech ? 'text-[#00D4FF]' : 'text-blue-600')}>
                {value.toLocaleString()}
            </span>
            <span className={cn('text-xs font-medium', isTech ? 'text-white/70' : 'text-gray-700')}>{label}</span>
            <span className={cn('text-[10px]', isTech ? 'text-white/40' : 'text-gray-400')}>{sub}</span>
        </div>
    );

    return (
        <div className={cn(
            'rounded-lg border p-4 space-y-4',
            isTech
                ? 'border-[hsl(174,100%,50%,0.2)] bg-[hsl(220,30%,8%)]'
                : 'border-gray-200 bg-gray-50'
        )}>
            <h3 className={cn('text-xs font-mono font-bold uppercase tracking-widest', isTech ? 'text-[#00D4FF]' : 'text-gray-500')}>
                {isTech ? '> PORTFOLIO_ANALYTICS' : 'Portfolio Analytics'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {statCard('Views (7d)', analytics.totalViews7d, `${analytics.uniqueVisitors7d} unique`)}
                {statCard('Views (30d)', analytics.totalViews30d, `${analytics.uniqueVisitors30d} unique`)}
            </div>

            {analytics.topReferrers.length > 0 && (
                <div className="space-y-1.5">
                    <p className={cn('text-[10px] font-mono uppercase tracking-widest', isTech ? 'text-white/40' : 'text-gray-400')}>
                        Top Referrers
                    </p>
                    {analytics.topReferrers.map(r => (
                        <div key={r.domain} className="flex items-center justify-between">
                            <span className={cn('text-xs truncate max-w-[70%]', isTech ? 'text-white/70' : 'text-gray-600')}>{r.domain}</span>
                            <span className={cn('text-xs font-mono font-bold', isTech ? 'text-[#00D4FF]' : 'text-blue-600')}>{r.count}</span>
                        </div>
                    ))}
                </div>
            )}

            {analytics.totalViews30d === 0 && (
                <p className={cn('text-xs text-center py-2', isTech ? 'text-white/30' : 'text-gray-400')}>
                    No views yet — share your portfolio link!
                </p>
            )}
        </div>
    );
}
