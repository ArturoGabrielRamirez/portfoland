# Specification: Phase 0 - Critical Bug Fixes

## Goal
Fix 6 critical bugs and 3 required nice-to-fix issues in the AI features layer that affect data integrity (lives race condition, double-decrement), stale content (cache invalidation), security (rate limiting), localization (hardcoded Spanish), code quality (typo, console spam, missing abort controllers, duplicated components).

## User Stories
- As a user, I want my AI lives to decrement correctly even under concurrent requests so that I never lose more lives than intended or bypass the daily limit.
- As a user, I want my AI-generated portfolio narrative to update when I change my bio, skills, or projects so that visitors always see accurate content.

## Specific Requirements

**Bug 1: Atomic lives decrement in `checkAndConsumeLives`**
- Replace the read-modify-write pattern in `C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts` (lines 22-56) with a single MongoDB atomic operation
- Use Prisma's `$runCommandRaw` to execute a `findAndModify` command on the `User` collection with `$inc: { "meta.remainingLives": -1 }` and query condition `"meta.remainingLives": { $gt: 0 }`
- Handle daily reset: if `meta.lastResetDate !== today`, first run an atomic `$set` to reset `meta.remainingLives` to `DEFAULT_LIVES` (3) and `meta.lastResetDate` to today, then run the decrement
- The two operations (reset check + decrement) can be a single `findAndModify` using `$set` with condition `"meta.lastResetDate": { $ne: today }` first, followed by a second `findAndModify` for the decrement -- two sequential atomic ops, not a transaction
- Return `{ hasLives, remainingLives, error? }` matching the current interface
- Must preserve all other keys in the `meta` JSON field (lives keys coexist with `aiNarrative_*` cache keys)
- Accept a new `locale` parameter (see Bug 5)

**Bug 2: Narrative cache invalidation**
- Create a utility function `invalidateNarrativeCache(userId: string)` in `C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts` (or a new `C:\Users\user\code\nextjs\portfoland\lib\ai\cache.ts` file)
- This function must use `$unset` via Prisma `$runCommandRaw` to remove the four keys: `meta.aiNarrative_gaming_en`, `meta.aiNarrative_gaming_es`, `meta.aiNarrative_professional_en`, `meta.aiNarrative_professional_es`
- Using `$unset` is safer than re-writing the entire `meta` object, as it avoids overwriting concurrent changes to other meta keys
- Call `invalidateNarrativeCache(userId)` at the end of these service functions (after the main operation succeeds): `updateProfileService` in `C:\Users\user\code\nextjs\portfoland\features\portfolio\services\portfolio.service.ts`, `createExperienceService` / `updateExperienceService` / `deleteExperienceService` in `C:\Users\user\code\nextjs\portfoland\features\timeline\services\experience.service.ts`, `createSkillService` / `updateSkillService` / `deleteSkillService` in `C:\Users\user\code\nextjs\portfoland\features\skills\services\skill.service.ts`, `createProjectService` / `updateProjectService` / `deleteProjectService` in `C:\Users\user\code\nextjs\portfoland\features\projects\services\project.service.ts`
- Cache invalidation failures must be caught and logged but never fail the parent operation

**Bug 3: Double-decrement reporting fix**
- In `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-bio\route.ts` line 234: change `remainingLives: remainingLives - 1` to `remainingLives: remainingLives` -- the value returned by `checkAndConsumeLives` is already decremented
- In `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-description\route.ts` line 172: same fix, change `remainingLives: remainingLives - 1` to `remainingLives: remainingLives`
- No change needed in `C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts` (line 93 already correct)

**Bug 4: Rate limiting via Upstash Redis**
- Install `@upstash/ratelimit` and `@upstash/redis` as dependencies
- Create `C:\Users\user\code\nextjs\portfoland\middleware.ts` (file does not currently exist)
- Middleware must match paths `/api/ai/:path*` and `/api/chat` only
- Use `Ratelimit.slidingWindow(10, "1 h")` from `@upstash/ratelimit` with `@upstash/redis` client
- Identify users by reading the Better Auth session cookie (`better-auth.session_token`) and looking up the session -- or use a simpler approach: extract the user identifier from the cookie value directly as the rate limit key; if no session cookie, use IP address
- Return 429 with JSON body `{ error: "Rate limit exceeded", retryAfter }` when limit is hit
- Graceful degradation: wrap the entire rate limit check in a try-catch; if `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are not set, skip rate limiting and allow the request through with a `console.warn` on first request only
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `C:\Users\user\code\nextjs\portfoland\.env.example` with comments
- Export a `config` with `matcher` array so the middleware only runs on AI routes, not on all requests

**Bug 5: Locale-aware error message in lives function**
- Add `locale: string = 'en'` parameter to the renamed `checkAndConsumeLives` function
- Replace the hardcoded Spanish string on line 46-47 with an inline conditional: `locale === 'es' ? 'Lo siento, te has quedado sin "Vidas" por hoy. Vuelve manana para continuar tu mision.' : 'Sorry, you have run out of "Lives" for today. Come back tomorrow to continue your mission.'`
- Update all three callers to pass locale: `app/api/chat/route.ts` (extract `locale` from `req.json()` before calling), `app/api/ai/improve-bio/route.ts`, `app/api/ai/improve-description/route.ts`
- In `chat/route.ts`, the locale is parsed from `req.json()` after the lives check -- restructure to parse the body first, then call the lives function with locale

**Bug 6: Rename `checkAndConsumLives` to `checkAndConsumeLives`**
- Rename the exported function in `C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts`
- Update imports in `C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts`, `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-bio\route.ts`, `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-description\route.ts`
- Do a global search for `checkAndConsumLives` to ensure no other references exist

**Nice-to-fix 1: AbortController in GamingAI and ProfessionalAI**
- In `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\gaming\GamingAI.tsx` and `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\professional\ProfessionalAI.tsx`, wrap the `useEffect` fetch with an `AbortController`
- Pass `{ signal: controller.signal }` to the `fetch` call
- Return a cleanup function: `return () => controller.abort()`
- In the catch block, check `if (err.name === 'AbortError') return` before setting error state

**Nice-to-fix 2: Extract shared `usePortfolioNarrative` hook**
- Create `C:\Users\user\code\nextjs\portfoland\features\portfolio\hooks\usePortfolioNarrative.ts`
- Extract the duplicated logic from GamingAI and ProfessionalAI into this hook: `narrative`/`isLoading`/`error` state, `loadNarrative` fetch with AbortController, `stats` useMemo, `featuredProjects` useMemo, `contactLinks` derivation
- The hook accepts `{ data: PortfolioData, mode: 'gaming' | 'professional' }` and returns `{ narrative, isLoading, error, stats, featuredProjects, contactLinks }`
- Refactor both GamingAI and ProfessionalAI to use this hook, keeping only their unique JSX/styling
- The `PortfolioSectionProps` interface remains unchanged

**Nice-to-fix 3: Replace console.log spam in chat route**
- Create a minimal logger utility at `C:\Users\user\code\nextjs\portfoland\lib\logger.ts`
- The logger should check `process.env.NODE_ENV`: in production, only `error` and `warn` methods emit output; in development, `debug` and `info` also emit
- Replace the ~15+ `console.log` calls in `C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts` with `logger.debug()` or `logger.info()` as appropriate
- Keep existing `console.error` calls as `logger.error()` -- these must always emit
- The logger does not need to be fancy: a simple object with `debug`, `info`, `warn`, `error` methods that conditionally call `console.*` is sufficient

**Unit tests for `checkAndConsumeLives`**
- Create `C:\Users\user\code\nextjs\portfoland\lib\ai\__tests__\lives.test.ts` using Vitest
- Mock Prisma's `$runCommandRaw` (or whichever Prisma method the atomic implementation uses)
- Test cases: successful decrement returns correct remaining count, returns `hasLives: false` when lives are 0, resets lives when `lastResetDate` is yesterday, returns locale-appropriate error messages for `'en'` and `'es'`
- Mock external dependencies (Prisma); do not connect to a real database

## Visual Design
No visual assets provided. This is a bug-fix spec with no UI design changes.

## Existing Code to Leverage

**`C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts` -- Lives system**
- Contains `checkAndConsumLives` and `getUserAIConfig`, the core functions being fixed
- `DEFAULT_LIVES = 3` constant is already defined and should be reused
- `UserAIConfig` interface defines the shape of the lives data in `User.meta`
- The atomic rewrite replaces lines 22-56 but keeps the same return type

**`C:\Users\user\code\nextjs\portfoland\features\portfolio\services\portfolio.service.ts` -- Profile update service**
- `updateProfileService` is where bio changes flow through; cache invalidation call goes here
- Already follows the three-layer pattern (action -> service -> data); invalidation should be a post-operation side effect

**`C:\Users\user\code\nextjs\portfoland\features\portfolio\components\gaming\GamingAI.tsx` and `ProfessionalAI.tsx` -- Duplicated AI components**
- Both share identical logic: state management (lines 14-16), `loadNarrative` useEffect (lines 18-45), `stats` useMemo (lines 47-86), `featuredProjects` useMemo (lines 88-93), `contactLinks` derivation (line 96)
- Only the JSX wrapper differs: GamingAI uses `HUDPanel` with cyberpunk colors (`#00D4FF`), ProfessionalAI uses `<section>` with professional colors (`blue-600`, `gray-*`)
- After extraction, each component should be ~30-40 lines of JSX only

**`C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts` -- Chat route with console spam**
- Contains ~15 `console.log` calls (lines 66, 89, 103, 118, 120, 124, 144, 176, 196, 241, 244, 249, 277-279, 292, 294)
- `console.error` calls on lines 69, 184, 234, 297, 304 should remain as error-level logging
- The `locale` is currently parsed from `req.json()` on line 123, after the lives check on line 86 -- needs restructuring to parse body first

## Out of Scope
- Structural refactors beyond what is needed for these specific bug fixes
- UI/visual design changes to any component
- New features or feature enhancements
- Testing beyond the `checkAndConsumeLives` unit tests
- Setting up actual Upstash Redis instances (only document the ENV vars)
- Changing the lives system behavior (number of lives, reset period, etc.)
- Adding rate limiting to non-AI endpoints
- Migrating existing `console.log` calls in files other than `chat/route.ts`
- Implementing a full logging framework (winston, pino, etc.) -- keep it minimal
- Changing the `PortfolioSectionProps` interface or the portfolio data fetching pattern
