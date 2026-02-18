# Task Breakdown: Phase 0 - Critical Bug Fixes

## Overview
Total Tasks: 30 (across 5 task groups)

This spec addresses 6 critical bugs and 3 required nice-to-fix items in the AI features layer. The fixes touch the lives system, cache invalidation, rate limiting, error localization, API routes, and duplicated UI components.

## Task List

### Core Library Layer

#### Task Group 1: Lives System Atomic Rewrite + Typo Fix + Locale Support
**Dependencies:** None

- [ ] 1.0 Complete lives system rewrite
  - [ ] 1.1 Write 5 focused Vitest tests for `checkAndConsumeLives` in `C:\Users\user\code\nextjs\portfoland\lib\ai\__tests__\lives.test.ts`
    - Mock Prisma's `$runCommandRaw` (do NOT connect to a real database)
    - Test 1: Successful decrement returns `{ hasLives: true, remainingLives: 2 }` when user has 3 lives
    - Test 2: Returns `{ hasLives: false, remainingLives: 0 }` when lives are already 0
    - Test 3: Resets lives when `lastResetDate` is yesterday, then decrements
    - Test 4: Returns English error message when `locale` is `'en'` and lives are 0
    - Test 5: Returns Spanish error message when `locale` is `'es'` and lives are 0
  - [ ] 1.2 Rename `checkAndConsumLives` to `checkAndConsumeLives` in `C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts` (Bug 6)
    - Rename the exported function definition on line 17
    - Do a global search for `checkAndConsumLives` to confirm all references (expected: `lib/ai/lives.ts`, `app/api/chat/route.ts`, `app/api/ai/improve-bio/route.ts`, `app/api/ai/improve-description/route.ts`)
    - Update all import statements in those three route files to use `checkAndConsumeLives`
  - [ ] 1.3 Add `locale` parameter to `checkAndConsumeLives` (Bug 5)
    - Change signature to `checkAndConsumeLives(userId: string, locale: string = 'en')`
    - Replace the hardcoded Spanish string (current line 46) with: `locale === 'es' ? 'Lo siento, te has quedado sin "Vidas" por hoy. Vuelve manana para continuar tu mision.' : 'Sorry, you have run out of "Lives" for today. Come back tomorrow to continue your mission.'`
  - [ ] 1.4 Rewrite `checkAndConsumeLives` to use atomic MongoDB operations (Bug 1)
    - Replace the read-modify-write pattern (lines 22-56) with Prisma `$runCommandRaw`
    - Step 1: Atomic daily reset -- use `findAndModify` on the `User` collection with query `{ _id: ObjectId(userId), "meta.lastResetDate": { $ne: today } }` and update `{ $set: { "meta.remainingLives": DEFAULT_LIVES, "meta.lastResetDate": today } }`. If no document matched, the reset was not needed (already today)
    - Step 2: Atomic decrement -- use `findAndModify` with query `{ _id: ObjectId(userId), "meta.remainingLives": { $gt: 0 } }` and update `{ $inc: { "meta.remainingLives": -1 } }`, with `new: true` to get the updated document
    - If Step 2 returns no match, user has 0 lives -- return `{ hasLives: false, remainingLives: 0, error: <locale-appropriate message> }`
    - If Step 2 succeeds, extract `remainingLives` from the returned document and return `{ hasLives: true, remainingLives }`
    - Preserve all other keys in the `meta` JSON field (the `$set` and `$inc` operators only touch specified keys)
    - Keep the `getUserAIConfig` function unchanged
  - [ ] 1.5 Ensure lives system tests pass
    - Run ONLY `C:\Users\user\code\nextjs\portfoland\lib\ai\__tests__\lives.test.ts`
    - Command: `npx vitest run lib/ai/__tests__/lives.test.ts`
    - All 5 tests must pass

**Acceptance Criteria:**
- All 5 tests pass in `lib/ai/__tests__/lives.test.ts`
- Function renamed from `checkAndConsumLives` to `checkAndConsumeLives` everywhere
- Locale parameter works for both `'en'` and `'es'`
- Atomic operations prevent race conditions (no read-modify-write pattern)
- `getUserAIConfig` still works as before
- No references to old `checkAndConsumLives` name remain anywhere in codebase

---

#### Task Group 2: Logger Utility + Cache Invalidation Utility
**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 2.0 Complete utility creation
  - [x] 2.1 Create logger utility at `C:\Users\user\code\nextjs\portfoland\lib\logger.ts`
    - Export an object with `debug`, `info`, `warn`, `error` methods
    - In production (`process.env.NODE_ENV === 'production'`): only `error` and `warn` emit output via `console.error` and `console.warn`
    - In development: all four methods emit via their respective `console.*` calls
    - Keep it minimal -- no external dependencies, no fancy formatting
  - [x] 2.2 Create cache invalidation utility at `C:\Users\user\code\nextjs\portfoland\lib\ai\cache.ts`
    - Export `invalidateNarrativeCache(userId: string): Promise<void>`
    - Use Prisma `$runCommandRaw` with MongoDB `$unset` to remove keys: `meta.aiNarrative_gaming_en`, `meta.aiNarrative_gaming_es`, `meta.aiNarrative_professional_en`, `meta.aiNarrative_professional_es`
    - Single atomic operation: `findAndModify` with `{ $unset: { "meta.aiNarrative_gaming_en": "", "meta.aiNarrative_gaming_es": "", "meta.aiNarrative_professional_en": "", "meta.aiNarrative_professional_es": "" } }`
    - Wrap the entire operation in try-catch; on failure, log with `console.error` (or the logger from 2.1) but never throw
  - [x] 2.3 Add cache invalidation calls to portfolio service
    - In `C:\Users\user\code\nextjs\portfoland\features\portfolio\services\portfolio.service.ts`: call `invalidateNarrativeCache(userId)` after `updateProfileService` succeeds
    - Import from `@/lib/ai/cache`
    - Use fire-and-forget pattern: `invalidateNarrativeCache(userId).catch(() => {})` or wrap in try-catch
  - [x] 2.4 Add cache invalidation calls to experience services
    - In `C:\Users\user\code\nextjs\portfoland\features\timeline\services\experience.service.ts`: call `invalidateNarrativeCache(userId)` after `createExperienceService`, `updateExperienceService`, and `deleteExperienceService` each succeed
    - Same fire-and-forget pattern as 2.3
  - [x] 2.5 Add cache invalidation calls to skill services
    - In `C:\Users\user\code\nextjs\portfoland\features\skills\services\skill.service.ts`: call `invalidateNarrativeCache(userId)` after `createSkillService`, `updateSkillService`, and `deleteSkillService` each succeed
    - Same fire-and-forget pattern
  - [x] 2.6 Add cache invalidation calls to project services
    - In `C:\Users\user\code\nextjs\portfoland\features\projects\services\project.service.ts`: call `invalidateNarrativeCache(userId)` after `createProjectService`, `updateProjectService`, and `deleteProjectService` each succeed
    - Same fire-and-forget pattern

**Acceptance Criteria:**
- Logger utility exists and conditionally emits based on `NODE_ENV`
- `invalidateNarrativeCache` removes all 4 narrative cache keys atomically
- Cache invalidation never causes parent service operations to fail
- All 10 service functions (1 profile + 3 experience + 3 skill + 3 project) call cache invalidation after success

---

### API Route Layer

#### Task Group 3: API Route Fixes + Rate Limiting
**Dependencies:** Task Group 1 (needs renamed function + locale param), Task Group 2 (needs logger)

- [ ] 3.0 Complete API route fixes
  - [ ] 3.1 Fix double-decrement in improve-bio route (Bug 3)
    - In `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-bio\route.ts` line ~234: change `remainingLives: remainingLives - 1` to `remainingLives: remainingLives`
    - Verify import uses the new name `checkAndConsumeLives` (should already be done in 1.2)
    - Pass `locale` parameter to `checkAndConsumeLives` call
  - [ ] 3.2 Fix double-decrement in improve-description route (Bug 3)
    - In `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-description\route.ts` line ~172: change `remainingLives: remainingLives - 1` to `remainingLives: remainingLives`
    - Verify import uses the new name `checkAndConsumeLives`
    - Pass `locale` parameter to `checkAndConsumeLives` call
  - [ ] 3.3 Fix chat route: restructure body parsing + locale + logger (Bug 5 + Nice-to-fix 3)
    - In `C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts`:
    - Restructure to parse `req.json()` BEFORE calling `checkAndConsumeLives`, so `locale` is available
    - Pass `locale` to `checkAndConsumeLives` call
    - Replace all ~15 `console.log` calls with `logger.debug()` or `logger.info()` as appropriate (import from `@/lib/logger`)
    - Replace existing `console.error` calls with `logger.error()`
    - Verify the route already uses `remainingLives` correctly (no double-decrement here -- just confirm)
  - [ ] 3.4 Install rate limiting dependencies
    - Run `npm install @upstash/ratelimit @upstash/redis`
  - [ ] 3.5 Create rate limiting middleware at `C:\Users\user\code\nextjs\portfoland\middleware.ts`
    - Export `config` with `matcher: ['/api/ai/:path*', '/api/chat']` so middleware only runs on AI routes
    - Create an Upstash Redis client using `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars
    - Use `Ratelimit.slidingWindow(10, "1 h")` from `@upstash/ratelimit`
    - Identify user: read `better-auth.session_token` cookie value as rate limit key; if absent, fall back to IP from `request.headers.get('x-forwarded-for')` or `request.ip`
    - On rate limit exceeded: return `NextResponse.json({ error: "Rate limit exceeded", retryAfter }, { status: 429 })`
    - Graceful degradation: wrap entire rate limit logic in try-catch; if env vars are missing or Redis is unreachable, log `console.warn` (once, use a module-level flag) and allow request through via `NextResponse.next()`
  - [ ] 3.6 Add Upstash env vars to `.env.example`
    - Add to `C:\Users\user\code\nextjs\portfoland\.env.example`:
    ```
    # -----------------------------------------------------------------------------
    # Upstash Redis (Rate Limiting)
    # -----------------------------------------------------------------------------
    # Required for AI endpoint rate limiting (10 req/hour/user)
    # Get these from: https://console.upstash.com/ -> Create Database -> REST API
    # If not configured, rate limiting is disabled (requests pass through)
    UPSTASH_REDIS_REST_URL="https://xxxxxxxx.upstash.io"
    UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```

**Acceptance Criteria:**
- `remainingLives` no longer double-decremented in improve-bio and improve-description routes
- All 3 AI route callers pass `locale` to `checkAndConsumeLives`
- Chat route parses body before lives check so locale is available
- All `console.log` calls in chat route replaced with logger calls
- Middleware only matches AI routes (`/api/ai/*` and `/api/chat`)
- Rate limiting works when Upstash is configured, degrades gracefully when not
- `.env.example` documents the two new Upstash env vars

---

### Frontend Component Layer

#### Task Group 4: Shared Hook Extraction + AbortController
**Dependencies:** None (can run in parallel with Task Groups 1-3)

- [ ] 4.0 Complete frontend component refactor
  - [ ] 4.1 Create shared `usePortfolioNarrative` hook at `C:\Users\user\code\nextjs\portfoland\features\portfolio\hooks\usePortfolioNarrative.ts`
    - Accept `{ data: PortfolioData, mode: 'gaming' | 'professional' }` as parameters
    - Import `PortfolioData` type from existing types (check `C:\Users\user\code\nextjs\portfoland\features\portfolio\types\portfolio.ts`)
    - Extract into hook: `narrative`/`isLoading`/`error` state, `loadNarrative` `useEffect` with `AbortController` (Nice-to-fix 1 built-in), `stats` `useMemo`, `featuredProjects` `useMemo`, `contactLinks` derivation
    - The `useEffect` fetch must include `AbortController`:
      - Create `const controller = new AbortController()` inside the effect
      - Pass `{ signal: controller.signal }` to the `fetch` call
      - Return cleanup: `return () => controller.abort()`
      - In catch: check `if (err.name === 'AbortError') return` before setting error state
    - Return `{ narrative, isLoading, error, stats, featuredProjects, contactLinks }`
    - Use `useLocale()` from `next-intl` inside the hook
  - [ ] 4.2 Refactor `GamingAI` to use `usePortfolioNarrative` hook
    - In `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\gaming\GamingAI.tsx`:
    - Remove all duplicated state, useEffect, useMemo, and contactLinks logic (lines 14-96)
    - Replace with: `const { narrative, isLoading, error, stats, featuredProjects, contactLinks } = usePortfolioNarrative({ data, mode: 'gaming' })`
    - Keep the `useTranslations('portfolio')` call for translations
    - Keep the `useLocale()` call only if needed for inline locale checks in JSX (for section-specific text like "Stats Rapidas" vs "Quick Stats")
    - Keep all JSX/styling unchanged (HUDPanel wrapper, cyberpunk colors, scanline overlay)
    - The component should be ~170 lines of JSX only (down from 278)
  - [ ] 4.3 Refactor `ProfessionalAI` to use `usePortfolioNarrative` hook
    - In `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\professional\ProfessionalAI.tsx`:
    - Same extraction as 4.2 -- remove duplicated logic, use the hook
    - Replace with: `const { narrative, isLoading, error, stats, featuredProjects, contactLinks } = usePortfolioNarrative({ data, mode: 'professional' })`
    - Keep all JSX/styling unchanged (plain section wrapper, professional colors, no scanline)
    - The component should be ~170 lines of JSX only (down from 270)
  - [ ] 4.4 Verify both components still render correctly
    - Run dev server: `npm run dev`
    - Manually confirm no TypeScript compilation errors
    - Run `npx tsc --noEmit` to verify type-checking passes for the changed files

**Acceptance Criteria:**
- Shared `usePortfolioNarrative` hook encapsulates all duplicated logic
- Both `GamingAI` and `ProfessionalAI` use the hook and contain only JSX/styling
- AbortController is built into the hook (fetch aborts on unmount)
- `AbortError` is handled gracefully (does not set error state)
- `PortfolioSectionProps` interface remains unchanged
- No TypeScript errors

---

### Verification Layer

#### Task Group 5: Final Verification
**Dependencies:** Task Groups 1-4

- [ ] 5.0 Complete final verification
  - [ ] 5.1 Run lives system tests
    - Command: `npx vitest run lib/ai/__tests__/lives.test.ts`
    - All 5 tests must pass
  - [ ] 5.2 Run TypeScript type-check across entire project
    - Command: `npx tsc --noEmit`
    - No type errors allowed
  - [ ] 5.3 Verify no remaining references to old function name
    - Search globally for `checkAndConsumLives` (without the "e") -- should return 0 results
  - [ ] 5.4 Verify all modified files have correct imports
    - Confirm `checkAndConsumeLives` import in: `app/api/chat/route.ts`, `app/api/ai/improve-bio/route.ts`, `app/api/ai/improve-description/route.ts`
    - Confirm `invalidateNarrativeCache` import in: `features/portfolio/services/portfolio.service.ts`, `features/timeline/services/experience.service.ts`, `features/skills/services/skill.service.ts`, `features/projects/services/project.service.ts`
    - Confirm `logger` import in: `app/api/chat/route.ts`
  - [ ] 5.5 Verify middleware configuration
    - Confirm `middleware.ts` exists at project root
    - Confirm `config.matcher` only targets AI routes
    - Confirm graceful degradation when Upstash env vars are absent

**Acceptance Criteria:**
- All 5 Vitest tests pass
- Zero TypeScript errors project-wide
- No stale references to the old typo function name
- All imports verified across modified files
- Middleware properly scoped to AI routes only

---

## Execution Order

Recommended implementation sequence:

```
Phase A (parallel):
  - Task Group 1: Lives System Atomic Rewrite (core logic)
  - Task Group 2: Logger + Cache Invalidation Utilities (new files, no deps)
  - Task Group 4: Shared Hook + AbortController (frontend, no deps on backend)

Phase B (after Phase A):
  - Task Group 3: API Route Fixes + Rate Limiting (depends on TG1 rename + TG2 logger)

Phase C (after Phase B):
  - Task Group 5: Final Verification (depends on all groups)
```

## Files Created (New)
| File | Task |
|------|------|
| `C:\Users\user\code\nextjs\portfoland\lib\ai\__tests__\lives.test.ts` | 1.1 |
| `C:\Users\user\code\nextjs\portfoland\lib\logger.ts` | 2.1 |
| `C:\Users\user\code\nextjs\portfoland\lib\ai\cache.ts` | 2.2 |
| `C:\Users\user\code\nextjs\portfoland\features\portfolio\hooks\usePortfolioNarrative.ts` | 4.1 |
| `C:\Users\user\code\nextjs\portfoland\middleware.ts` | 3.5 |

## Files Modified (Existing)
| File | Tasks |
|------|-------|
| `C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts` | 1.2, 1.3, 1.4 |
| `C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts` | 1.2, 3.3 |
| `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-bio\route.ts` | 1.2, 3.1 |
| `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-description\route.ts` | 1.2, 3.2 |
| `C:\Users\user\code\nextjs\portfoland\features\portfolio\services\portfolio.service.ts` | 2.3 |
| `C:\Users\user\code\nextjs\portfoland\features\timeline\services\experience.service.ts` | 2.4 |
| `C:\Users\user\code\nextjs\portfoland\features\skills\services\skill.service.ts` | 2.5 |
| `C:\Users\user\code\nextjs\portfoland\features\projects\services\project.service.ts` | 2.6 |
| `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\gaming\GamingAI.tsx` | 4.2 |
| `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\professional\ProfessionalAI.tsx` | 4.3 |
| `C:\Users\user\code\nextjs\portfoland\.env.example` | 3.6 |
