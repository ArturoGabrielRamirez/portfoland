# Spec Requirements: Phase 0 - Critical Bug Fixes

## Initial Description
Fix 6 critical bugs and 3 nice-to-fix issues in the AI features layer of Portfoland. These bugs were identified during an Opus audit and documented in ROADMAP_V2.md Phase 0. The bugs affect the lives/energy system, cache invalidation, rate limiting, error localization, and code quality across multiple AI API routes and portfolio components.

## Requirements Discussion

### First Round Questions

**Q1:** The ROADMAP suggests using MongoDB's `$inc` atomic operation or `findOneAndUpdate` with condition `remainingLives > 0`. Since Prisma does not natively support `$inc` in a conditional atomic way, should we use `$runCommandRaw` or the MongoDB client directly, or a different approach like optimistic locking?
**Answer:** Use `$runCommandRaw` or native MongoDB client. `$inc` is atomic at the database level, no need for manual retries. Prisma supports running native commands easily.

**Q2:** For cache invalidation in narrate-portfolio, should we clear `aiNarrative_*` keys inside existing service/action functions or use middleware? Should we invalidate ALL locale/mode variants or only specific ones?
**Answer:** Inside services/actions (not middleware -- too global, hard to track side effects). Invalidate ALL variants (`aiNarrative_gaming_en`, `aiNarrative_gaming_es`, `aiNarrative_professional_en`, `aiNarrative_professional_es`). If the user changed their bio, all narratives are stale.

**Q3:** For rate limiting with Upstash Redis at 10 req/hour/user for AI endpoints, should it be per-route or middleware? Are Upstash keys ready?
**Answer:** Next.js Middleware -- cleaner, protects server before heavy logic, centralizes config. Just document the ENV vars in .env.example. Don't assume staging/prod is ready.

**Q4:** For the hardcoded Spanish error in `lives.ts` line 47, should we add a `locale` parameter with inline conditionals or integrate with next-intl server-side translations?
**Answer:** Add `locale` parameter + inline conditionals. Keep it simple, consistent with how prompts already work. Don't pull next-intl into a pure logic file.

**Q5:** For renaming `checkAndConsumLives` to `checkAndConsumeLives`, what is the full scope of files that import it?
**Answer:** Do it globally. Use search-and-replace across all files. Confirmed files: `lib/ai/lives.ts` (definition), `app/api/chat/route.ts`, `app/api/ai/improve-bio/route.ts`, `app/api/ai/improve-description/route.ts`.

**Q6:** Should the 3 nice-to-fix items (abort controller, shared AI component, console.log cleanup) be treated as required or optional?
**Answer:** Treat ALL 3 as required. Abort controller prevents memory leaks, shared component prevents visual inconsistencies, console.log cleanup is basic production hygiene.

**Q7:** Should the spec include writing tests for the fixes?
**Answer:** Only for the core -- write Vitest tests for `checkAndConsumeLives`. It's the logic that manages the user's "wallet"; if it fails, you lose money or break the experience. No need to test all UI.

**Q8:** Is there anything that should explicitly be excluded from this phase?
**Answer:** Minor cleanup acceptable if you're already touching the area. But no structural refactors beyond what's needed for stability.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Lives system - Path: `C:\Users\user\code\nextjs\portfoland\lib\ai\lives.ts`
- Feature: Chat route (imports lives, has console.log spam) - Path: `C:\Users\user\code\nextjs\portfoland\app\api\chat\route.ts`
- Feature: Improve bio route (has remainingLives bug) - Path: `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-bio\route.ts`
- Feature: Improve description route (has remainingLives bug) - Path: `C:\Users\user\code\nextjs\portfoland\app\api\ai\improve-description\route.ts`
- Feature: Narrate portfolio route (has cache issue) - Path: `C:\Users\user\code\nextjs\portfoland\app\api\ai\narrate-portfolio\route.ts`
- Feature: Gaming AI component (needs abort controller + shared extraction) - Path: `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\gaming\GamingAI.tsx`
- Feature: Professional AI component (needs abort controller + shared extraction) - Path: `C:\Users\user\code\nextjs\portfoland\features\portfolio\components\professional\ProfessionalAI.tsx`

No existing atomic MongoDB operations, rate limiting logic, or locale-aware error utilities were found in the codebase to reference.

### Follow-up Questions
No follow-up questions were needed. All decisions were clear from the first round.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
Not applicable -- this is a bug-fix spec with no UI design changes.

## Requirements Summary

### Functional Requirements

**Bug 1: Race condition in `checkAndConsumLives` (`lib/ai/lives.ts`)**
- Replace the current read-modify-write pattern (lines 22-56) with an atomic MongoDB `findOneAndUpdate` using `$inc: { "meta.remainingLives": -1 }` with condition `"meta.remainingLives": { $gt: 0 }`
- Must also handle the daily reset (if `lastResetDate !== today`, reset to DEFAULT_LIVES before decrementing)
- Use Prisma's `$runCommandRaw` or native MongoDB client
- The function signature will change to accept a `locale` parameter (see Bug 5)

**Bug 2: Cache invalidation in narrate-portfolio (`app/api/ai/narrate-portfolio/route.ts`)**
- When a user edits bio, skills, projects, or experiences, invalidate ALL `aiNarrative_*` keys from `User.meta`
- Keys to clear: `aiNarrative_gaming_en`, `aiNarrative_gaming_es`, `aiNarrative_professional_en`, `aiNarrative_professional_es`
- Implementation: Add cache invalidation calls inside the existing service/action functions that handle these entity updates
- Create a reusable utility function (e.g., `invalidateNarrativeCache(userId)`) to avoid duplicating the clearing logic

**Bug 3: `remainingLives` double-decrement reporting bug**
- In `app/api/ai/improve-bio/route.ts` line 234: `remainingLives: remainingLives - 1` should be `remainingLives: remainingLives` (value already decremented by `checkAndConsumeLives`)
- Same bug exists in `app/api/ai/improve-description/route.ts` line 172: `remainingLives: remainingLives - 1` should be `remainingLives: remainingLives`
- `app/api/chat/route.ts` correctly uses `remainingLives` without subtracting (line 93) -- no fix needed there

**Bug 4: Rate limiting for AI endpoints**
- Add `@upstash/ratelimit` and `@upstash/redis` as dependencies
- Implement rate limiting in Next.js Middleware for all AI endpoint paths (`/api/ai/*` and `/api/chat`)
- Limit: 10 requests per hour per authenticated user
- Document required ENV vars (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) in `.env.example`
- Graceful degradation: if Upstash is not configured, log a warning but allow requests through (don't break dev environments)

**Bug 5: Hardcoded Spanish error message in `lives.ts` line 47**
- Add `locale` parameter to `checkAndConsumeLives` (after rename)
- Return locale-appropriate error message using inline conditional (`locale === 'es' ? spanishMsg : englishMsg`)
- Update all callers to pass the locale parameter

**Bug 6: Typo rename `checkAndConsumLives` to `checkAndConsumeLives`**
- Rename the function in `lib/ai/lives.ts`
- Update all imports and calls in: `app/api/chat/route.ts`, `app/api/ai/improve-bio/route.ts`, `app/api/ai/improve-description/route.ts`
- Search globally for any other references

**Nice-to-fix 1: Abort controller in GamingAI.tsx / ProfessionalAI.tsx**
- Add `AbortController` to the `useEffect` fetch calls in both components
- Return cleanup function that calls `controller.abort()` on unmount
- Handle `AbortError` gracefully (do not set error state on abort)

**Nice-to-fix 2: Extract shared `AISection` component from GamingAI + ProfessionalAI**
- The two components share ~90% identical logic: state management, fetch logic, stats calculation, featured projects calculation, contact links rendering
- Extract a shared base component or custom hook that encapsulates the common logic
- Each mode-specific component should only define its unique styling/wrapper (HUDPanel vs plain section, cyberpunk colors vs professional colors)
- Shared logic includes: `loadNarrative` fetch, `stats` useMemo, `featuredProjects` useMemo, `contactLinks` derivation

**Nice-to-fix 3: Reduce console.log spam in `chat/route.ts`**
- Replace extensive `console.log` calls (approximately 15+ occurrences) with a structured logger with levels
- Production should only log errors and critical events
- Development can log verbose debug information
- Keep error logging (`console.error`) as-is for actual errors

### Reusability Opportunities
- The `invalidateNarrativeCache(userId)` utility can be reused whenever new cache keys are added to `User.meta`
- The shared `AISection` component/hook extraction will reduce duplication and ensure visual consistency between gaming and professional modes
- The rate limiting middleware pattern can be extended to protect other future endpoints
- The structured logger (replacing console.log spam) can be adopted across all API routes

### Scope Boundaries
**In Scope:**
- All 6 must-fix bugs
- All 3 nice-to-fix items (treated as required)
- Vitest tests for `checkAndConsumeLives` function
- Minor cleanup in files being touched
- Documenting new ENV vars in `.env.example`

**Out of Scope:**
- Structural refactors beyond what stability requires
- UI/visual design changes
- New features or feature enhancements
- Testing beyond the `checkAndConsumeLives` unit tests
- Setting up actual Upstash Redis instances (just document the vars)
- Changing the lives system behavior (e.g., number of lives, reset period)

### Technical Considerations
- MongoDB atomic operations via Prisma `$runCommandRaw` -- must work with MongoDB Atlas
- Prisma ORM is used throughout; the atomic operation in Bug 1 is the only exception where raw MongoDB commands are needed
- The `User.meta` field is a JSON/object field in MongoDB storing both lives config and narrative cache; operations must not overwrite unrelated keys
- Rate limiting middleware must identify authenticated users (via Better Auth session) to apply per-user limits
- The `locale` parameter is already available in all AI route handlers from the request body/query params
- Next.js App Router patterns: middleware runs at `middleware.ts` in project root
- Dependencies to add: `@upstash/ratelimit`, `@upstash/redis`
- The shared AI component extraction should maintain the existing `PortfolioSectionProps` interface
