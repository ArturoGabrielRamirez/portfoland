# Spec 5E: Portfolio Analytics

**Branch:** feat/phase5-growth
**Status:** Implemented

## Objective
Track anonymous page views on the public portfolio and show the owner a simple analytics panel: total views (7d/30d), unique visitors, top referrers. Privacy-safe — only SHA-256 hashes of IP+UA stored.

## DB Model
`PortfolioView`: userId, visitorHash (SHA-256), referrer (domain), viewedAt. Deduplicated: same hash+userId within 1 hour = skip.

## Components
- `POST /api/portfolio/view` — fire-and-forget tracker, no auth required
- `getPortfolioAnalyticsData(userId)` — aggregates 7d/30d views, unique visitors, top 5 referrers
- `PortfolioViewTracker` — client component rendered on public portfolio page, fires on mount
- `AnalyticsPanel` — dashboard panel showing stats, Tech/Classic adaptive styling

## Wiring
- Public portfolio page: renders `<PortfolioViewTracker username={username} />`
- Dashboard portfolio page: fetches analytics in parallel, passes to `DashboardPortfolioView`
- `DashboardPortfolioView`: renders `<AnalyticsPanel>` below View Mode Selector
