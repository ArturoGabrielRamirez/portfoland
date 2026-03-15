export interface PortfolioAnalytics {
    totalViews7d: number;
    totalViews30d: number;
    uniqueVisitors7d: number;
    uniqueVisitors30d: number;
    topReferrers: Array<{ domain: string; count: number }>;
}

export interface AnalyticsPanelProps {
    analytics: PortfolioAnalytics;
    portfolioMode: 'tech' | 'classic';
}
