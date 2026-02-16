# Spec Requirements: Subdomain Routing

## Initial Description

Enable `username.portfoland.com` subdomain routing with Next.js middleware. Users' public portfolios will be accessible via their own subdomain (e.g., `john.portfoland.com`) in addition to the existing path-based route (`/[locale]/[username]`).

This is roadmap item #16, sized Medium (M), part of Phase 3: Skill Tree & Portfolio (v0.3.0).

## Requirements Discussion

### First Round Questions

**Q1:** Next.js 16 uses `proxy.ts` instead of `middleware.ts` for request interception. I assume the subdomain detection logic should be added to the existing `proxy.ts` file rather than creating a separate `middleware.ts`. When a request comes in on `username.portfoland.com`, the proxy would detect the subdomain, extract the username, and rewrite the request internally to `/[locale]/[username]`. Is that the correct approach?
**Answer:** Yes, handle subdomain detection in `proxy.ts`, rewriting internally `username.portfoland.com` to `/[locale]/[username]`.

**Q2:** Currently all routes use `localePrefix: 'always'` (e.g., `/en/dashboard`). For subdomain portfolio URLs, should we default to the user's stored locale preference and NOT require a locale prefix in the URL? So `john.portfoland.com` serves the portfolio in John's preferred language, and `john.portfoland.com/es` could optionally override it?
**Answer:** Use the user's default locale (fallback: Accept-Language then `en`). Avoid `john.portfoland.com/en` format -- no locale prefix on subdomains.

**Q3:** Should subdomain routing ONLY serve the public portfolio pages (the `[username]/` route and its sub-routes like `[username]/skills`)? The main app (dashboard, login, register, landing page) should remain exclusively on the root domain (`portfoland.com`)?
**Answer:** Yes, subdomains serve ONLY the public portfolio. Dashboard, auth, and landing stay on the root domain.

**Q4:** Should the existing path-based route (`portfoland.com/en/john`) continue to work alongside the subdomain route (`john.portfoland.com`)? Should one be the canonical URL for SEO purposes?
**Answer:** Keep both working for now (`portfoland.com/en/john` and `john.portfoland.com`). Defer canonical/SEO decision to roadmap item #18 (Portfolio SEO & Meta Tags).

**Q5:** Certain subdomains need to be blocked (e.g., `www`, `app`, `api`, `admin`). Should this validation be enforced only in the proxy, or also at the database/username-creation level?
**Answer:** Block both at username registration AND in the proxy. Reserved list includes: www, app, api, admin, mail, staging, dev, etc.

**Q6:** Subdomain routing doesn't work on `localhost`. Should we support `/etc/hosts` entries (e.g., `john.localhost`) or an environment variable like `NEXT_PUBLIC_APP_DOMAIN`?
**Answer:** Use `/etc/hosts` (e.g., `john.localhost`) + `NEXT_PUBLIC_APP_DOMAIN` env var for consistency between environments.

**Q7:** Better Auth session cookies need to be shared across subdomains. Should the cookie domain be set to `.portfoland.com`?
**Answer:** Yes, configure cookies with domain `.portfoland.com` to share sessions between root and subdomains.

**Q8:** Is there anything explicitly out of scope?
**Answer:** Out of scope: custom domains (e.g., `johndoe.com`), per-subdomain analytics, and subdomain-specific SEO (deferred to roadmap item #18).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Proxy/route interception - Path: `C:/Users/user/code/nextjs/portfoland/proxy.ts` -- This is the primary file where subdomain detection logic will be added. Contains locale detection, auth checks, route matching utilities, and the `config` matcher.
- Feature: Portfolio page route - Path: `C:/Users/user/code/nextjs/portfoland/app/[locale]/[username]/page.tsx` -- The target render page that subdomains should internally rewrite to. Uses `getPortfolioByUsername(username)`.
- Feature: Portfolio layout - Path: `C:/Users/user/code/nextjs/portfoland/app/[locale]/[username]/layout.tsx` -- Contains the minimal header with Portfoland logo, CTA button, and mode-based theming (professional vs gaming). Links currently use `/${locale}` prefixes that may need adjustment for subdomain context.
- Feature: Portfolio skills sub-route - Path: `C:/Users/user/code/nextjs/portfoland/app/[locale]/[username]/skills/` -- Nested route under portfolio that must also work via subdomain (e.g., `john.portfoland.com/skills`).
- Feature: Portfolio data aggregation - Path: `C:/Users/user/code/nextjs/portfoland/features/portfolio/data/getPortfolio.data.ts` -- The `getPortfolioByUsername()` function that fetches user + experiences + skills + projects. Already works by username lookup.
- Feature: i18n configuration - Path: `C:/Users/user/code/nextjs/portfoland/i18n/config.ts` -- Defines `localePrefix: 'always'` routing. Subdomain requests will need special handling to bypass locale prefix requirement.
- Feature: Locale layout - Path: `C:/Users/user/code/nextjs/portfoland/app/[locale]/layout.tsx` -- Validates locale, sets request locale, loads messages, wraps with `NextIntlClientProvider`. Subdomain rewrites must provide a valid locale for this layout to function.
- Feature: Prisma User model - Path: `C:/Users/user/code/nextjs/portfoland/prisma/schema.prisma` -- `username` is `String? @unique` on User model with a `locale` field (`String @default("en")`). The username field is already uniquely indexed.
- Feature: Root layout - Path: `C:/Users/user/code/nextjs/portfoland/app/layout.tsx` -- HTML `lang` attribute is intentionally omitted and deferred to `[locale]/layout.tsx`.
- Feature: Next.js config - Path: `C:/Users/user/code/nextjs/portfoland/next.config.ts` -- Uses `withNextIntl` plugin wrapper.
- Feature: Navigation helpers - Path: `C:/Users/user/code/nextjs/portfoland/i18n/navigation.ts` -- Exports locale-aware `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from next-intl.
- Feature: Environment config - Path: `C:/Users/user/code/nextjs/portfoland/.env.example` -- Contains `BETTER_AUTH_URL` which may need updating for subdomain cookie config.

### Follow-up Questions

No follow-up questions were needed. All answers were clear and comprehensive.

## Visual Assets

### Files Provided:
(Located in `C:/Users/user/code/nextjs/portfoland/agent-os/specs/2026-02-10-subdomain-routing/planning/visuals/visuals/`)

- `dashboard-v1.png`: Gaming mode dashboard with dark cyberpunk theme (#0A0E1A background). Shows "Welcome back, Gabriel!" header, XP stats (2,450 total XP), experience count, hexagonal achievement badges, progress bars with cyan/magenta accents, current goals section, recent activity feed, and quick action cards. Top nav has Login/Dashboard/Timeline/Skill Tree tabs.
- `dashboard-v2.png`: Refined version of dashboard-v1 with similar layout but cleaner spacing. Same dark theme with cyan (#00D4FF) and magenta accents. Hexagonal badges appear more polished, stat cards are more compact.
- `login-v1.png`: Full-screen login page with dark cyberpunk theme. Left side: "START YOUR ADVENTURE" headline with cyan accent on "ADVENTURE", bullet points (Interactive Timeline, Achievement System, AI-Powered CV). Right side: Sign In/Sign Up toggle, email/password fields, "START GAME" CTA button in cyan, Google OAuth button. Portfoland logo top-left.
- `login-v2.png`: Smaller/refined version of login-v1, same layout and elements but more compact. Identical visual language.
- `skilltree-v1.png`: Skill tree visualization with dark background. Shows hexagonal skill nodes with letter abbreviations (T, R, C, H, N, J, M), connected by dashed lines. Categories labeled "CORE / FUNDAMENTALS" and "BACKEND" in colored text. Stats bar: 9 Total Skills, 6,150 Total XP, 1 Mastered, 2 Categories. "View Public" link top-right.
- `skilltree-v2.png`: Refined skill tree with cleaner hex nodes and connection lines. Shows 12 skills, 6,100 XP, 3 categories. Added "FRONTEND" category. Zoom controls on right side. More organized spatial layout.
- `timeline-v1.png`: Timeline page with left sidebar listing experiences (Senior Full Stack Developer, RWS Solutions Architect, Computer Science Degree, etc.) with XP badges. Right side shows a dark map with connected hexagonal nodes representing geographic locations. "View Public" link and "Add Experience" button.
- `timeline-v2.png`: Refined timeline with same dual-panel layout. Cleaner hex nodes on map, dashed connection lines between locations. Experience list with XP indicators on left.

### Visual Insights:
- **Design language:** Two distinct modes are clearly established -- Gaming (cyberpunk dark theme with cyan/magenta) and Professional (clean white, mentioned in code but not shown in these visuals).
- **Navigation pattern:** Top navigation bar with View/Login/Dashboard/Timeline/Skill Tree tabs is consistent across all pages. The public portfolio uses a minimal header (Portfoland logo + CTA).
- **Hexagonal motif:** Hexagons are a core design element used in badges, skill nodes, and map markers. This motif should be preserved on subdomain portfolio pages.
- **URL bar context:** These visuals are general app concepts (dashboard, login, timeline, skill tree) rather than subdomain-specific designs. They show the overall design system that the subdomain-served portfolio will inherit.
- **Public view exists:** Both skill tree and timeline pages have "View Public" links, confirming the public portfolio flow is already designed.
- **Fidelity level:** High-fidelity mockups. These are polished concept designs showing final visual treatment, not wireframes.
- **Subdomain relevance:** No subdomain-specific UI is shown. The portfolio page itself (which subdomains will serve) uses the existing layout in `[username]/layout.tsx` with the minimal header pattern. The subdomain feature is primarily a routing/infrastructure concern, not a visual redesign.

## Requirements Summary

### Functional Requirements
- Detect subdomain from incoming request hostname in `proxy.ts` (e.g., extract `john` from `john.portfoland.com`)
- Internally rewrite subdomain requests to the existing `app/[locale]/[username]/` route tree
- Resolve the user's stored locale from the database `User.locale` field for subdomain requests, with fallback chain: user locale -> Accept-Language header -> `en` default
- Serve subdomain portfolio pages WITHOUT a locale prefix in the URL (e.g., `john.portfoland.com` not `john.portfoland.com/en`)
- Support sub-routes under the portfolio subdomain (e.g., `john.portfoland.com/skills`)
- Maintain the existing path-based portfolio route (`portfoland.com/en/john`) working alongside subdomains
- Block reserved subdomains (www, app, api, admin, mail, staging, dev, etc.) at both the proxy level and username registration/validation level
- Return a proper 404 or not-found page when a subdomain username does not exist
- Redirect any non-portfolio routes accessed via subdomain (e.g., `john.portfoland.com/dashboard`) back to the root domain or show 404
- Configure `NEXT_PUBLIC_APP_DOMAIN` environment variable for domain configuration across environments
- Configure Better Auth session cookies with `.portfoland.com` domain for cross-subdomain session sharing
- Support local development via `/etc/hosts` entries (e.g., `john.localhost:3000`) and the configurable domain env var

### Reusability Opportunities
- `proxy.ts` -- extend the existing proxy function with subdomain detection as an early check before locale/auth logic
- `getPortfolioByUsername()` -- already fetches all portfolio data by username; no changes needed
- `[username]/layout.tsx` and `[username]/page.tsx` -- the rendering layer remains unchanged; only the routing/rewrite layer is new
- `i18n/config.ts` locale detection utilities -- the `detectLocale()` function in `proxy.ts` can be reused for subdomain locale fallback
- `User.locale` field in Prisma schema -- already exists and stores user's preferred locale
- `User.username` unique index -- already enforces uniqueness at the database level

### Scope Boundaries

**In Scope:**
- Subdomain detection and URL rewriting in `proxy.ts`
- Locale resolution for subdomain requests (user preference -> Accept-Language -> default)
- Reserved username/subdomain validation (deny-list in proxy + registration validation)
- `NEXT_PUBLIC_APP_DOMAIN` environment variable for domain configuration
- Better Auth cookie domain configuration for cross-subdomain sessions
- Local development support with `/etc/hosts` + env var
- Handling of invalid/non-existent subdomain usernames (404)
- Subdomain sub-route support (e.g., `/skills`)
- Ensuring non-portfolio routes on subdomains are handled gracefully

**Out of Scope:**
- Custom domains (e.g., `johndoe.com` pointing to a portfolio)
- Per-subdomain analytics or view tracking
- Subdomain-specific SEO meta tags, Open Graph, or canonical URL configuration (deferred to roadmap item #18)
- Vercel wildcard DNS configuration (infrastructure/DevOps task, separate from code)
- Changes to the portfolio page UI or layout for subdomain context
- Username registration/onboarding flow changes (beyond adding reserved name validation)

### Technical Considerations
- **Next.js 16 proxy.ts:** The app uses `proxy.ts` (not `middleware.ts`) for request interception. All subdomain logic lives here.
- **next-intl `localePrefix: 'always'`:** The current config requires locale prefixes on all routes. The subdomain rewrite must inject the locale into the internal URL path so next-intl's `[locale]` segment is satisfied, even though the external subdomain URL has no locale prefix.
- **User locale lookup in proxy:** The proxy currently does NOT query the database. To resolve a user's stored locale for subdomain requests, the proxy may need to either: (a) perform a lightweight DB lookup for the user's locale by username, (b) use a cached/cookie-based approach, or (c) rely on Accept-Language with a secondary client-side locale switch. This is an architectural decision for the spec writer.
- **Cookie domain for Better Auth:** The `BETTER_AUTH_URL` env var and cookie configuration must be updated to set cookies on `.portfoland.com` rather than the bare domain. This affects `proxy.ts` session checks and the Better Auth configuration.
- **Vercel deployment:** Vercel natively supports wildcard subdomains. A wildcard domain (`*.portfoland.com`) must be configured in the Vercel project settings. No `vercel.json` currently exists.
- **Portfolio layout links:** The `[username]/layout.tsx` currently constructs links with `/${locale}` prefix (e.g., `/${locale}` for home, `/${locale}/register` for CTA). On subdomain context, these should ideally point to the root domain (`portfoland.com/en` or `portfoland.com/en/register`). This may require the layout to detect whether it's being served via subdomain.
- **URL rewriting vs redirecting:** The proxy should use `NextResponse.rewrite()` (not `redirect()`) so the user sees `john.portfoland.com` in their browser while the server internally resolves `[locale]/john`.
- **Hostname parsing:** Subdomain extraction must handle various formats: `john.portfoland.com`, `john.localhost:3000`, `john.portfoland.com:3000` (dev with port).
- **Reserved subdomain list:** Should be maintained as a constant array, shared between proxy validation and any username registration logic. Consider placing in a shared constants file.
- **Existing `username` field:** The Prisma `User.username` is `String?` (nullable). Users without a username set should not have a subdomain. The proxy must handle requests to subdomains that correspond to users who exist but have no username.
