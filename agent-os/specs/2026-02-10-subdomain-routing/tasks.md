# Task Breakdown: Subdomain Routing

## Overview
Total Tasks: 30
Feature: Enable `username.portfoland.com` subdomain routing so that users' public portfolios are accessible via personalized subdomains, powered by URL rewriting in `proxy.ts` with no visible locale prefix, while preserving the existing path-based portfolio route.

This is primarily a routing/infrastructure feature with no new UI components. The subdomain-served portfolio inherits the existing design from `app/[locale]/[username]/layout.tsx` and `app/[locale]/[username]/page.tsx`.

## Task List

### Constants & Configuration

#### Task Group 1: Shared Constants and Environment Configuration
**Dependencies:** None

- [x] 1.0 Complete shared constants and environment setup
  - [x] 1.1 Write 3 focused tests for reserved subdomains constant and validation utility
    - Test `RESERVED_SUBDOMAINS` array contains all required entries (`www`, `app`, `api`, `admin`, `mail`, `staging`, `dev`, `test`, `beta`, `status`, `docs`, `help`, `support`, `blog`, `cdn`, `static`, `assets`, `media`)
    - Test `isReservedSubdomain(name)` returns `true` for reserved names (case-insensitive)
    - Test `isReservedSubdomain(name)` returns `false` for a valid non-reserved username like `john`
  - [x] 1.2 Create `features/core/constants/reservedSubdomains.ts`
    - Define `RESERVED_SUBDOMAINS` constant array: `['www', 'app', 'api', 'admin', 'mail', 'staging', 'dev', 'test', 'beta', 'status', 'docs', 'help', 'support', 'blog', 'cdn', 'static', 'assets', 'media']`
    - Export `isReservedSubdomain(name: string): boolean` helper that checks against the array (case-insensitive via `.toLowerCase()`)
    - This shared location allows import by both `proxy.ts` and username validation schemas
  - [x] 1.3 Export from `features/core/index.ts` barrel
    - Add re-export: `export { RESERVED_SUBDOMAINS, isReservedSubdomain } from './constants/reservedSubdomains'`
  - [x] 1.4 Add `NEXT_PUBLIC_APP_DOMAIN` to `.env.example`
    - Add a new section "Domain Configuration" with documentation comments
    - Include: `NEXT_PUBLIC_APP_DOMAIN="localhost"` with comments explaining:
      - Development: set to `localhost` so `john.localhost:3000` is recognized as a subdomain
      - Production: set to `portfoland.com` so `john.portfoland.com` is recognized
      - Used by `proxy.ts` for subdomain extraction
    - Add a comment noting developers should add `/etc/hosts` entries (e.g., `127.0.0.1 john.localhost`) for local subdomain testing
  - [x] 1.5 Ensure constants tests pass
    - Run ONLY the 3 tests written in 1.1
    - Do NOT run the entire test suite at this stage

**Files to create:**
- `C:/Users/user/code/nextjs/portfoland/features/core/constants/reservedSubdomains.ts`

**Files to modify:**
- `C:/Users/user/code/nextjs/portfoland/features/core/index.ts`
- `C:/Users/user/code/nextjs/portfoland/.env.example`

**Acceptance Criteria:**
- The 3 tests from 1.1 pass
- `RESERVED_SUBDOMAINS` array contains all 18 required entries
- `isReservedSubdomain()` is case-insensitive
- Both constant and helper are exported from `features/core/index.ts`
- `.env.example` has `NEXT_PUBLIC_APP_DOMAIN` with clear documentation

---

### Proxy Layer (Subdomain Detection & Rewriting)

#### Task Group 2: Subdomain Detection in proxy.ts
**Dependencies:** Task Group 1

- [x] 2.0 Complete subdomain detection and URL rewriting logic
  - [x] 2.1 Write 8 focused tests for subdomain detection and rewriting
    - Test `extractSubdomain('john.portfoland.com', 'portfoland.com')` returns `'john'`
    - Test `extractSubdomain('john.localhost:3000', 'localhost')` returns `'john'` (strips port)
    - Test `extractSubdomain('www.portfoland.com', 'portfoland.com')` returns `'www'` (reserved, handled downstream)
    - Test `extractSubdomain('portfoland.com', 'portfoland.com')` returns `null` (no subdomain)
    - Test proxy rewrites `john.portfoland.com/` to `/{locale}/john` using `NextResponse.rewrite()`
    - Test proxy rewrites `john.portfoland.com/skills` to `/{locale}/john/skills`
    - Test proxy passes through `www.portfoland.com` to normal routing (reserved subdomain)
    - Test proxy redirects `john.portfoland.com/dashboard` to root domain `portfoland.com/{locale}/dashboard`
  - [x] 2.2 Create `extractSubdomain()` utility function in `proxy.ts`
    - Parse the `Host` header to extract the subdomain portion
    - Compare against `NEXT_PUBLIC_APP_DOMAIN` environment variable (fallback to `'localhost'`)
    - Handle hostname formats: `john.portfoland.com`, `john.localhost:3000`, `john.portfoland.com:3000`
    - Strip port numbers before comparison
    - Return `null` if no subdomain (bare domain or `www`)
    - Return the subdomain string if one is found
    - For `localhost` (no TLD): `john.localhost` has one dot, so extract everything before the first dot and compare the remainder to the base domain
    - For production domains (with TLD): `john.portfoland.com` -- remove the domain suffix to get `john`
  - [x] 2.3 Create `VALID_SUBDOMAIN_PATHS` constant in `proxy.ts`
    - Define an allow-list of paths valid on subdomains: `['/', '/skills']`
    - These correspond to routes under `app/[locale]/[username]/`
    - Any path not in this list triggers a redirect to the root domain
  - [x] 2.4 Add subdomain detection block to the `proxy()` function
    - Insert AFTER the `isPublicApiPath` check and BEFORE the `hasLocalePrefix` check
    - Call `extractSubdomain()` using the `Host` header from `request.headers.get('host')`
    - If subdomain is found AND is in `RESERVED_SUBDOMAINS` list (import from `@/features/core`), treat as root domain -- fall through to existing proxy logic
    - If subdomain is found AND is NOT reserved:
      - Check if the request pathname (after stripping any locale prefix) is in `VALID_SUBDOMAIN_PATHS`
      - If valid subdomain path: proceed to rewrite (step 2.5)
      - If NOT a valid subdomain path (e.g., `/dashboard`, `/login`, `/api/auth`): redirect to root domain with the same path and locale using `NextResponse.redirect()` to `https://{NEXT_PUBLIC_APP_DOMAIN}/{locale}{pathname}`
    - If no subdomain: fall through to existing proxy logic unchanged
  - [x] 2.5 Implement subdomain URL rewriting
    - Use `NextResponse.rewrite()` (NOT `redirect()`) so the browser URL stays as `john.portfoland.com`
    - Resolve locale using the existing `detectLocale(request)` function (cookie -> Accept-Language -> `'en'` default)
    - Construct the internal rewrite URL: `/{locale}/{subdomain}{pathname}`
      - Root: `john.portfoland.com/` -> rewrite to `/{locale}/john`
      - Sub-path: `john.portfoland.com/skills` -> rewrite to `/{locale}/john/skills`
    - Set a custom header `x-subdomain` with the username value on the rewritten response so downstream components can detect subdomain context
    - The rewritten URL includes a valid `[locale]` segment so `app/[locale]/layout.tsx` validation and `next-intl` message loading work correctly
  - [x] 2.6 Ensure proxy tests pass
    - Run ONLY the 8 tests written in 2.1
    - Do NOT run the entire test suite at this stage

**Files to modify:**
- `C:/Users/user/code/nextjs/portfoland/proxy.ts`

**Acceptance Criteria:**
- The 8 tests from 2.1 pass
- `extractSubdomain()` correctly handles all hostname formats: with/without port, localhost, production domain
- Reserved subdomains fall through to normal routing
- Non-portfolio paths on subdomains redirect to root domain
- Valid subdomain paths are rewritten to `/{locale}/{username}{path}` with `NextResponse.rewrite()`
- `x-subdomain` header is set on rewritten requests
- Existing proxy logic (locale redirect, auth checks) is completely unaffected for root domain requests
- No database queries in the proxy

---

### Auth Configuration

#### Task Group 3: Better Auth Cookie Domain for Cross-Subdomain Sessions
**Dependencies:** None (can run in parallel with Task Groups 1-2)

- [x] 3.0 Complete Better Auth cookie domain configuration
  - [x] 3.1 Write 2 focused tests for auth cookie configuration
    - Test that in production (`NEXT_PUBLIC_APP_DOMAIN !== 'localhost'`), the auth config includes `cookies.domain` set to `.portfoland.com` (with leading dot)
    - Test that in development (`NEXT_PUBLIC_APP_DOMAIN === 'localhost'`), no cookie domain is set (browsers handle localhost subdomains differently)
  - [x] 3.2 Update `lib/auth.ts` to configure cookie domain
    - Read `NEXT_PUBLIC_APP_DOMAIN` environment variable
    - Conditionally set the `advanced.cookies` configuration:
      - If domain is NOT `localhost`: set `sessionToken.options.domain` to `.${NEXT_PUBLIC_APP_DOMAIN}` (leading dot enables subdomain inclusion)
      - If domain IS `localhost`: do not set a cookie domain (let the browser default to the exact hostname)
    - This ensures a user authenticated on `portfoland.com` remains authenticated when visiting `john.portfoland.com`
    - Do not modify any other auth configuration (email/password, social providers, user fields remain unchanged)
  - [x] 3.3 Ensure auth cookie tests pass
    - Run ONLY the 2 tests written in 3.1
    - Do NOT run the entire test suite at this stage

**Files to modify:**
- `C:/Users/user/code/nextjs/portfoland/lib/auth.ts`

**Acceptance Criteria:**
- The 2 tests from 3.1 pass
- Production: session cookies set on `.portfoland.com` domain, shared across all subdomains
- Development: no cookie domain set, browser default behavior for localhost
- Existing auth functionality (email/password, Google OAuth, user fields) unchanged

---

### Username Validation

#### Task Group 4: Reserved Subdomain Check in Username Validation
**Dependencies:** Task Group 1

- [x] 4.0 Complete reserved subdomain validation for username registration
  - [x] 4.1 Write 3 focused tests for username validation against reserved subdomains
    - Test username validation rejects `'api'` with a clear error message
    - Test username validation rejects `'Admin'` (case-insensitive check)
    - Test username validation accepts `'johndoe'` (non-reserved name)
  - [x] 4.2 Identify where username is validated/set in the codebase
    - The `register.schema.ts` currently validates name, email, password, confirmPassword but does NOT include a username field
    - Username is set separately (likely via dashboard settings, or a future onboarding flow)
    - If no existing username validation schema exists, create one
    - If an existing username schema is found, add the reserved subdomain check to it
  - [x] 4.3 Create or update username validation schema
    - Create `features/dashboard/schemas/username.schema.ts` (or integrate into existing schema if found)
    - Add Yup `.test()` check that rejects usernames matching any entry in `RESERVED_SUBDOMAINS`
    - Import `isReservedSubdomain` from `@/features/core`
    - Error message: `'This username is reserved and cannot be used'` (or i18n key)
    - Include standard username format validations: lowercase, alphanumeric + hyphens, min 3 / max 30 characters, no leading/trailing hyphens
    - Example schema structure:
      ```
      username: yup.string()
        .required()
        .min(3).max(30)
        .matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/)
        .test('reserved', 'This username is reserved', (val) => !isReservedSubdomain(val))
      ```
  - [x] 4.4 Ensure username validation tests pass
    - Run ONLY the 3 tests written in 4.1
    - Do NOT run the entire test suite at this stage

**Files to create:**
- `C:/Users/user/code/nextjs/portfoland/features/dashboard/schemas/username.schema.ts` (or integrate into existing if found)

**Acceptance Criteria:**
- The 3 tests from 4.1 pass
- Reserved subdomain names are rejected at the username validation level
- Validation is case-insensitive
- Error message is clear and user-friendly
- Standard username format rules enforced (lowercase, alphanumeric + hyphens, length limits)
- `isReservedSubdomain` imported from shared `@/features/core` -- same source as proxy

---

### Portfolio Layout Adjustments

#### Task Group 5: Subdomain-Aware Link Adjustments in Portfolio Layout
**Dependencies:** Task Group 2

- [x] 5.0 Complete subdomain-aware link adjustments in portfolio layout
  - [x] 5.1 Write 4 focused tests for subdomain-aware links
    - Test that when `x-subdomain` header is NOT present, logo links to `/${locale}` (current behavior)
    - Test that when `x-subdomain` header IS present, logo links to `https://${NEXT_PUBLIC_APP_DOMAIN}/${locale}`
    - Test that when `x-subdomain` header is NOT present, CTA links to `/${locale}/register` (current behavior)
    - Test that when `x-subdomain` header IS present, CTA links to `https://${NEXT_PUBLIC_APP_DOMAIN}/${locale}/register`
  - [x] 5.2 Read `x-subdomain` header in `[username]/layout.tsx`
    - Import `headers` from `next/headers`
    - Read the `x-subdomain` header set by the proxy during subdomain rewrites
    - Determine if the page is being served via subdomain context
    - Compute the root domain base URL: `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}` (for production) or relative paths (for non-subdomain)
  - [x] 5.3 Update logo link to be subdomain-aware
    - Current: `<Link href={/${locale}} ...>`
    - When in subdomain context: change `href` to absolute URL pointing to root domain (e.g., `https://portfoland.com/en`)
    - When NOT in subdomain context: keep current relative `/${locale}` behavior
    - Use a conditional: `const homeHref = isSubdomain ? \`https://${appDomain}/${locale}\` : \`/${locale}\``
  - [x] 5.4 Update CTA register link to be subdomain-aware
    - Current: `<Link href={/${locale}/register} ...>`
    - When in subdomain context: change `href` to absolute URL pointing to root domain (e.g., `https://portfoland.com/en/register`)
    - When NOT in subdomain context: keep current relative `/${locale}/register` behavior
    - Use a conditional: `const ctaHref = isSubdomain ? \`https://${appDomain}/${locale}/register\` : \`/${locale}/register\``
  - [x] 5.5 Ensure layout link tests pass
    - Run ONLY the 4 tests written in 5.1
    - Do NOT run the entire test suite at this stage

**Files to modify:**
- `C:/Users/user/code/nextjs/portfoland/app/[locale]/[username]/layout.tsx`

**Acceptance Criteria:**
- The 4 tests from 5.1 pass
- When served via subdomain: logo links to root domain home, CTA links to root domain register
- When served normally (path-based route): all links behave exactly as before (no regression)
- Subdomain context detected via `x-subdomain` header set by proxy
- No changes to visual design, only `href` values change conditionally

---

### Locale Cookie for Subdomain Visitors

#### Task Group 6: Set NEXT_LOCALE Cookie from User's Stored Locale
**Dependencies:** Task Group 2

- [x] 6.0 Complete locale cookie setting for subdomain first-visit accuracy
  - [x] 6.1 Write 2 focused tests for locale cookie behavior
    - Test that the portfolio page server component sets `NEXT_LOCALE` cookie to the portfolio owner's `User.locale` value (e.g., `'es'`) when cookie is not already set
    - Test that the portfolio page does NOT overwrite an existing `NEXT_LOCALE` cookie
  - [x] 6.2 Add locale cookie logic to portfolio page or layout
    - In `app/[locale]/[username]/layout.tsx` or `app/[locale]/[username]/page.tsx` (choose whichever is more appropriate as a server component)
    - After fetching `portfolioData`, read the portfolio owner's `User.locale` value
    - Import `cookies` from `next/headers`
    - Check if `NEXT_LOCALE` cookie already exists
    - If NOT set: call `cookies().set('NEXT_LOCALE', portfolioData.user.locale, { path: '/' })` to set it
    - This ensures that on the FIRST visit via subdomain, the proxy uses Accept-Language fallback, but subsequent visits use the portfolio owner's stored locale preference via the cookie
    - Do NOT perform any DB lookup in the proxy itself -- this is the spec-prescribed alternative
  - [x] 6.3 Ensure locale cookie tests pass
    - Run ONLY the 2 tests written in 6.1
    - Do NOT run the entire test suite at this stage

**Files to modify:**
- `C:/Users/user/code/nextjs/portfoland/app/[locale]/[username]/layout.tsx` (or `page.tsx`)

**Acceptance Criteria:**
- The 2 tests from 6.1 pass
- First subdomain visit: locale resolved via Accept-Language, `NEXT_LOCALE` cookie set to owner's `User.locale`
- Subsequent subdomain visits: proxy reads `NEXT_LOCALE` cookie, serves correct locale
- Existing `NEXT_LOCALE` cookie not overwritten (respects user's explicit language switch)
- No database queries added to `proxy.ts`

---

### Test Review & Gap Analysis

#### Task Group 7: Test Review and Critical Gap Coverage
**Dependencies:** Task Groups 1-6

- [ ] 7.0 Review existing tests and fill critical gaps only
  - [ ] 7.1 Review tests from Task Groups 1-6
    - Review the 3 reserved subdomains constant tests (Task 1.1)
    - Review the 8 proxy subdomain detection/rewriting tests (Task 2.1)
    - Review the 2 auth cookie domain tests (Task 3.1)
    - Review the 3 username validation tests (Task 4.1)
    - Review the 4 layout link adjustment tests (Task 5.1)
    - Review the 2 locale cookie tests (Task 6.1)
    - Total existing tests: approximately 22 tests
  - [ ] 7.2 Analyze test coverage gaps for subdomain routing feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's subdomain routing requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 7.3 Write up to 8 additional strategic tests maximum
    - End-to-end: a request to `john.portfoland.com/` is rewritten and resolved to the portfolio page content (integration of proxy + page)
    - End-to-end: a request to `john.portfoland.com/skills` is rewritten and resolved to the skills page content
    - Edge case: subdomain with a username that does not exist in the database results in 404 (proxy rewrites, page returns `notFound()`)
    - Edge case: `extractSubdomain()` returns `null` for bare domain with no subdomain at all (e.g., `portfoland.com`)
    - Edge case: subdomain URL with locale prefix (e.g., `john.portfoland.com/en`) -- verify it is treated as a non-portfolio path and redirected to root domain OR passes through correctly
    - Integration: `RESERVED_SUBDOMAINS` constant is the same list used by both proxy and username validation (import check)
    - Fill remaining gaps identified in 7.2 (up to 2 more tests)
    - Do NOT write comprehensive coverage for all scenarios
  - [ ] 7.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's subdomain routing feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, and 7.3)
    - Expected total: approximately 26-30 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All subdomain-routing-specific tests pass (approximately 26-30 tests total)
- Critical user workflows for subdomain routing are covered: detection, rewriting, reserved blocking, link adjustment, locale cookie, auth cookie sharing
- No more than 8 additional tests added when filling in gaps
- Testing focused exclusively on this spec's subdomain routing requirements
- Edge cases verified: non-existent username 404, bare domain passthrough, reserved subdomain passthrough

---

## Execution Order

Recommended implementation sequence:

```
Phase 1 - Foundation (can run in parallel):
  [Task Group 1] Constants & Environment Configuration
  [Task Group 3] Better Auth Cookie Domain Configuration

Phase 2 - Core Routing:
  [Task Group 2] Subdomain Detection in proxy.ts (depends on 1)

Phase 3 - Validation & Layout (can run in parallel):
  [Task Group 4] Username Reserved Subdomain Validation (depends on 1)
  [Task Group 5] Portfolio Layout Link Adjustments (depends on 2)
  [Task Group 6] Locale Cookie for Subdomain Visitors (depends on 2)

Phase 4 - Verification:
  [Task Group 7] Test Review & Gap Analysis (depends on 1-6)
```

## Key Technical Notes

- **proxy.ts is the single insertion point**: All subdomain logic goes into `proxy.ts`. No `middleware.ts` file. Subdomain detection is added after the API path bypass and before the locale prefix check.
- **NextResponse.rewrite() not redirect()**: The browser URL must stay as `john.portfoland.com` while the server internally resolves `/{locale}/john`. Use `rewrite()`.
- **No DB queries in proxy**: The proxy must remain lightweight with zero database queries. Locale is resolved via `detectLocale()` (cookie -> Accept-Language -> default). The portfolio page sets the `NEXT_LOCALE` cookie after first visit.
- **x-subdomain header**: The proxy sets this custom header on rewritten requests so the layout can detect subdomain context without re-parsing the hostname.
- **Shared constants location**: `RESERVED_SUBDOMAINS` lives in `features/core/constants/reservedSubdomains.ts`, exported via `features/core/index.ts`. Both `proxy.ts` and username validation import from the same source.
- **Cookie domain with leading dot**: `.portfoland.com` (not `portfoland.com`) enables cookies to be shared across all subdomains including the bare domain.
- **localhost special handling**: Browsers handle `localhost` subdomains differently. No cookie domain is set in development. `john.localhost:3000` requires `/etc/hosts` entries.
- **Existing portfolio pages unchanged**: `app/[locale]/[username]/page.tsx` and its `getPortfolioByUsername()` call work unchanged via rewrite since the internal URL still has `[locale]/[username]` segments. Invalid usernames are handled by the existing `notFound()` call.
- **Feature architecture**: New constants go in `features/core/constants/`. New username schema goes in `features/dashboard/schemas/`. No new feature folder needed.
- **Three-layer architecture**: Not heavily applicable here since this is a routing/infrastructure feature, not a CRUD feature. The only schema addition is the username validation, which follows the existing Yup pattern.
- **No backward compatibility code**: Both `portfoland.com/en/john` and `john.portfoland.com` will work simultaneously. The path-based route is completely unaffected.
