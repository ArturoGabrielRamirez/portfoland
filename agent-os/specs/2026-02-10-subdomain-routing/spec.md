# Specification: Subdomain Routing

## Goal
Enable `username.portfoland.com` subdomain routing so that users' public portfolios are accessible via personalized subdomains, powered by URL rewriting in `proxy.ts` with no visible locale prefix, while preserving the existing path-based portfolio route.

## User Stories
- As a portfolio owner, I want my portfolio accessible at `myname.portfoland.com` so that I have a clean, personal URL to share professionally.
- As a visitor, I want to view a portfolio on a subdomain in the owner's preferred language automatically so that I get the intended experience without needing to select a locale.

## Specific Requirements

**Subdomain detection and extraction in proxy.ts**
- Parse the `Host` header to extract the subdomain by comparing against `NEXT_PUBLIC_APP_DOMAIN` (e.g., `portfoland.com` in production, `localhost` in development)
- Handle hostname formats with and without port numbers: `john.portfoland.com`, `john.localhost:3000`, `john.portfoland.com:3000`
- Treat requests with no subdomain, or with `www` as subdomain, as root domain requests that pass through to existing proxy logic unchanged
- Add subdomain detection as the earliest check in the `proxy()` function, before locale detection and auth logic

**URL rewriting to internal portfolio route**
- Use `NextResponse.rewrite()` (not `redirect()`) so the browser URL stays as `john.portfoland.com` while the server resolves `/{locale}/john`
- For sub-routes like `john.portfoland.com/skills`, rewrite to `/{locale}/john/skills`
- The rewritten URL must include a valid locale in the `[locale]` segment so that the `app/[locale]/layout.tsx` validation and `next-intl` message loading work correctly
- No changes are needed to the portfolio page components, layout, or data layer -- only the routing/rewrite layer is new

**Locale resolution for subdomain requests (no locale prefix in URL)**
- Subdomain URLs must never show a locale prefix (e.g., `john.portfoland.com` not `john.portfoland.com/en`)
- Resolve the locale for the rewrite target using this fallback chain: (1) `NEXT_LOCALE` cookie if present, (2) `Accept-Language` header, (3) `en` default
- Do NOT perform a database lookup for `User.locale` in the proxy; the proxy must remain lightweight with zero DB queries to avoid latency on every request
- Instead, after the portfolio page renders on first visit (using Accept-Language fallback), the server component should set the `NEXT_LOCALE` cookie to the user's stored `User.locale` value so subsequent requests use the correct locale
- Reuse the existing `detectLocale()` function in `proxy.ts` which already implements cookie-then-Accept-Language-then-default logic

**Reserved subdomain deny-list**
- Define a `RESERVED_SUBDOMAINS` constant array containing at minimum: `www`, `app`, `api`, `admin`, `mail`, `staging`, `dev`, `test`, `beta`, `status`, `docs`, `help`, `support`, `blog`, `cdn`, `static`, `assets`, `media`
- Place this constant in a shared location (`features/core/constants/` or `lib/constants/`) so it can be imported by both the proxy and username validation logic
- In the proxy: if the extracted subdomain matches the deny-list, treat the request as a root domain request (pass through to normal routing)
- In username registration/validation: add a Yup `.test()` check that rejects usernames matching any entry in the deny-list, surfacing a clear error message

**Non-portfolio route handling on subdomains**
- When a subdomain request targets a non-portfolio path (e.g., `john.portfoland.com/dashboard`, `john.portfoland.com/login`, `john.portfoland.com/api/auth`), redirect to the equivalent path on the root domain (`portfoland.com/en/dashboard`)
- Define an allow-list of valid subdomain sub-paths: the root `/` and any paths that exist under `app/[locale]/[username]/` (currently `/skills`)
- All other paths on a subdomain trigger a `NextResponse.redirect()` to the root domain with the same path and locale

**NEXT_PUBLIC_APP_DOMAIN environment variable**
- Add `NEXT_PUBLIC_APP_DOMAIN` to `.env.example` with documentation comments explaining its role
- In development: set to `localhost` so that `john.localhost:3000` is recognized as a subdomain
- In production: set to `portfoland.com` so that `john.portfoland.com` is recognized
- The proxy extracts the subdomain by removing the domain suffix and port from the hostname

**Better Auth cookie domain for cross-subdomain sessions**
- Configure the Better Auth `auth` instance in `lib/auth.ts` to set the session cookie domain to `.portfoland.com` in production (note the leading dot for subdomain inclusion)
- Use a conditional based on `NODE_ENV` or the `NEXT_PUBLIC_APP_DOMAIN` value: in development (`localhost`), do not set a cookie domain (browsers handle `localhost` subdomains differently); in production, set `.portfoland.com`
- This ensures a user authenticated on `portfoland.com` remains authenticated when visiting `john.portfoland.com`

**Portfolio layout link adjustments for subdomain context**
- The `[username]/layout.tsx` header currently builds links with `/${locale}` prefix (e.g., home link to `/${locale}`, CTA to `/${locale}/register`)
- When served via subdomain, these links must point to the root domain (e.g., `https://portfoland.com/en` for home, `https://portfoland.com/en/register` for CTA)
- Detect subdomain context by checking a custom request header (e.g., `x-subdomain-username`) set by the proxy during rewrite, or by reading `NEXT_PUBLIC_APP_DOMAIN` and comparing against the current hostname
- The proxy should set an `x-subdomain` header (value: the username) on rewritten requests so downstream components can detect subdomain context without additional hostname parsing

**Invalid subdomain handling (404)**
- When the extracted subdomain is not in the reserved list but does not correspond to an existing user with a username, the rewrite should still target `/{locale}/{subdomain}` and let the existing `notFound()` call in the portfolio page handle the 404
- No additional proxy-level username existence check is needed -- the page-level `getPortfolioByUsername()` already returns null and triggers `notFound()`

**Local development support**
- Document in `.env.example` that developers should add entries to `/etc/hosts` (e.g., `127.0.0.1 john.localhost`) for testing subdomain routing locally
- The proxy's subdomain extraction must work with `localhost` (no TLD) as the base domain, since `john.localhost` has only one dot compared to `john.portfoland.com` which has two

## Visual Design
This is primarily a routing/infrastructure feature with no new UI components. The subdomain-served portfolio inherits the existing design from `app/[locale]/[username]/layout.tsx` and `app/[locale]/[username]/page.tsx`.

**`planning/visuals/visuals/dashboard-v1.png`**
- Shows gaming mode dashboard on root domain -- confirms dashboard is NOT served via subdomain
- Top navigation (Login/Dashboard/Timeline/Skill Tree) remains exclusively on root domain routes

**`planning/visuals/visuals/login-v1.png`**
- Login page lives on root domain only -- subdomain requests to `/login` must redirect to root domain
- Confirms auth flow is scoped to root domain as required

## Existing Code to Leverage

**`proxy.ts` -- Request interception and locale detection**
- Contains `detectLocale()` with cookie-then-Accept-Language-then-default chain, directly reusable for subdomain locale resolution
- Has `parseAcceptLanguage()`, `matchLocale()`, `hasLocalePrefix()`, `stripLocalePrefix()`, and `buildLocalizedUrl()` utilities that can be used in subdomain logic
- The `proxy()` function is the single insertion point: subdomain detection should be added after the API path bypass and before the locale prefix check
- The `config.matcher` pattern already excludes static assets, which also applies to subdomain requests

**`app/[locale]/[username]/page.tsx` and `layout.tsx` -- Portfolio rendering**
- `PortfolioPage` calls `getPortfolioByUsername(username)` and returns `notFound()` if null -- this handles invalid subdomain usernames with no changes needed
- `PublicPortfolioLayout` reads `locale` and `username` from route params, calls `setRequestLocale()`, and applies mode-based theming -- all of this works via rewrite since the internal URL still has `[locale]/[username]` segments
- The header links (`/${locale}` for home, `/${locale}/register` for CTA) are the only elements that need subdomain-aware adjustments

**`lib/auth.ts` -- Better Auth server configuration**
- Currently has no `cookie` or `advanced` configuration for cookie domain -- adding a `cookies` config block with `domain` is straightforward
- The `user.additionalFields` already includes `username` and `locale` fields

**`i18n/config.ts` and `i18n/request.ts` -- Internationalization routing**
- `localePrefix: 'always'` means the rewrite target must include a locale segment; this is satisfied by the proxy inserting the resolved locale into the rewrite URL
- `getRequestConfig` reads `requestLocale` from the URL segment, which will be correct after rewrite

**`features/auth/schemas/register.schema.ts` -- Registration validation**
- Currently validates name, email, password, confirmPassword but does not validate a username field (username is set separately, likely via dashboard/settings)
- The reserved subdomain validation should be added wherever username is validated/set, following the same Yup `.test()` pattern used elsewhere in the codebase

## Out of Scope
- Custom domain mapping (e.g., `johndoe.com` pointing to a portfolio) -- separate roadmap item
- Per-subdomain analytics or view tracking
- SEO meta tags, Open Graph, or canonical URL configuration for subdomains -- deferred to roadmap item #18
- Vercel wildcard DNS configuration (`*.portfoland.com`) -- infrastructure/DevOps task, not application code
- Changes to the portfolio page UI, sections, or visual design for subdomain context
- Username registration/onboarding flow changes beyond adding reserved-name validation to existing username validation
- Database query for user locale inside the proxy -- locale is resolved via cookie/Accept-Language fallback instead
- SSL certificate provisioning for wildcard subdomain
- Subdomain-specific caching or CDN configuration
- Rate limiting or abuse prevention for subdomain requests
