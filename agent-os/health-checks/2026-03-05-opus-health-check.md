# Portfoland Health Check -- 2026-03-05

**Reviewed by:** Opus 4.6
**Codebase state:** Branch `feat/phase3-solidify-tech-mode`, post Phase 3A + Phase 4 Assessment
**Next.js:** 16.1.1 | **Prisma:** 6.19 | **DB:** MongoDB

---

## Executive Summary

The codebase is in reasonable shape for a project built incrementally over several weeks with Sonnet doing most of the implementation. The feature-based architecture is mostly respected. The two most recent features (GitHub validation, AI Assessment) are the best-structured code in the repo. The main problems are: incomplete rebrand cleanup, dead/debug files in the tree, two duplicate route groups, inconsistent i18n in client components, and a growing `User.meta` JSON blob that is becoming a shadow schema.

---

## 1. Duplication / Components That Should Be Unified

### P1: `ImproveBioButton` and `ImproveDescriptionButton` are 90% identical

**Files:**
- `features/ai/components/ImproveBioButton.tsx`
- `features/ai/components/ImproveDescriptionButton.tsx`

These two components have identical structure: useState for loading/notes, fetch to an API route, toast on success/error, show/hide notes textarea, same styling logic. The only differences are:
- The API endpoint (`/api/ai/improve-bio` vs `/api/ai/improve-description`)
- The field name (`bio` vs `description`)
- `ImproveDescriptionButton` has `context` prop and is i18n-aware; `ImproveBioButton` is not

**Recommendation:** Extract a shared `ImproveWithAIButton` component parameterized by endpoint, field name, context, and labels. One component, no duplication.

### P1: `ImproveBioButton` lacks i18n; `ImproveDescriptionButton` has inline i18n

`ImproveBioButton` hardcodes English strings ("Please write a bio first", "Improving...", "Improve with AI", etc.) while `ImproveDescriptionButton` does inline ternaries for `es`/`en`. Neither uses `next-intl` / `useTranslations()`. This is inconsistent with the rest of the app which uses `next-intl`.

### P2: `features/ai-quota` and `features/assessment` token systems are structurally duplicated

Both implement the exact same pattern:
- Atomic daily reset via `$runCommandRaw` findAndModify
- Atomic decrement with `$gt: 0` guard
- Pro user bypass
- Read-only check function

**Files:**
- `features/ai-quota/services/quota.service.ts` (lives)
- `features/assessment/services/assessmentToken.service.ts` (tokens)

The assessment token service even acknowledges this in a comment: "Uses the same two-step atomic $runCommandRaw findAndModify pattern as the ai-quota service". Consider extracting a generic `DailyTokenManager` utility parameterized by the meta field path and default count.

### P2: API routes `improve-bio/route.ts` and `improve-description/route.ts` are nearly identical

Both routes follow the same pattern: auth check -> parse body -> call service -> return JSON -> error handling with "No AI energy" detection. Could be a shared route handler factory or a single parameterized route.

### P2: Duplicate filter logic in `syncGitHub.service.ts` lines 112-119

The same filter + map chain runs twice (once for `matchingUserSkillIds`, once for `matchingSlugs`). Should be a single pass.

---

## 2. Architecture Inconsistencies

### P1: Two parallel route groups for the dashboard: `(protected)` and `(dashboard)`

**Problem:** The app has two route group directories that both serve dashboard pages:
- `app/[locale]/(protected)/dashboard/page.tsx` -- the main dashboard (Tech Mode hex layout)
- `app/[locale]/(dashboard)/dashboard/` -- skills, projects, timeline, gallery, etc.

The `(protected)` layout does auth checking and wraps in dark theme. The `(dashboard)` group has NO layout file, meaning its child pages have no auth guard from the layout level -- each page does its own `auth.api.getSession()` check individually.

This is confusing and fragile. If someone adds a new page under `(dashboard)` and forgets to add auth, it will be unprotected.

**Recommendation:** Merge into a single `(dashboard)` group with a shared authenticated layout.

### P1: `User.meta` is becoming a shadow schema

The `meta` JSON field on User now holds:
- `remainingLives` + `lastResetDate` (AI quota)
- `assessmentTokens.remaining` + `assessmentTokens.lastResetDate` (assessment tokens)
- `isPro` (pro user flag)
- `aiNarrative_gaming_en`, `aiNarrative_gaming_es`, `aiNarrative_professional_en`, `aiNarrative_professional_es` (narrative cache)

This is a growing untyped blob accessed via raw `$runCommandRaw` commands with string paths like `'meta.assessmentTokens.remaining'`. There is no validation, no migration path, and any typo in a key name is a silent bug. Every service that reads `meta` does its own `as { ... }` type cast.

**Recommendation:** At minimum, create a shared `UserMeta` TypeScript interface used across all features. Better: extract `isPro`, AI quota, and assessment tokens into proper Prisma models or at least document the schema in one place.

### P2: AI features use API routes; non-AI features use server actions

The AI content improvement (`improve-bio`, `improve-description`) and chat features go through `app/api/` route handlers, while skills, projects, timeline, assessment, etc. all use server actions with `actionWrapper`. The assessment feature correctly uses server actions.

The API routes for AI content don't use `actionWrapper`, have their own error handling patterns, and return raw `new Response(JSON.stringify(...))` instead of `NextResponse.json()`.

This is not necessarily wrong (streaming may require API routes), but the inconsistency means two separate error handling patterns to maintain.

### P2: `updateUserLocale` action does NOT use `actionWrapper`

`features/i18n/actions/updateUserLocale.ts` is a server action that returns its own `{ success, message }` shape instead of the standard `ActionResponse<T>`. Every other action uses `actionWrapper`.

### P3: `features/ai-narrator` uses a different data-fetching pattern

The `getNarrative.ts` action calls `auth.api.getSession` inside a server action (same as others), but returns a completely different shape. Not wrapped in `actionWrapper` -- returns a raw string or null.

---

## 3. Features Incompletos or Abandoned

### P0: `app/api/dev-cleanup/route.ts` -- debug route in production code

**File:** `app/api/dev-cleanup/route.ts`

This route lists all GitHub accounts and lets you delete orphan records. It has a `process.env.NODE_ENV === 'production'` guard, but it:
- Is tracked in git on the feature branch
- Should NOT ship. The MEMORY.md explicitly says "DELETE before production deploy"
- Has scripts (`scripts/cleanup-github-accounts.mjs`, `scripts/cleanup-github-accounts.ts`) that are also debug artifacts

### P1: Stale files in project root

These files are development artifacts that should not be in the repo:
- `DASHBOARD_POLISH_PLAN.md` -- planning doc left in root
- `dev.log` -- development log file
- `recordatorio.md` -- reminder notes in Spanish
- `test-auth-api.ts` -- test file in project root
- `seed-categories.js` -- migration script in root (should be in `scripts/`)

### P1: Scripts directory has accumulated debug scripts

`scripts/` contains 10+ files including `debug-user.ts`, `check-user-data.ts`, `check_user.ts`, `test-ai.ts`, `test-db-connection.ts`, `fix-user-image.ts`, `reset-oauth-image.ts`. Most of these are one-time debug tools. They should be cleaned up or moved to a `scripts/debug/` subdirectory with a note that they are not production code.

### P2: `[username]` route still exists despite subdomain-only strategy

**File:** `app/[locale]/[username]/page.tsx`

The roadmap says Phase 1 converted these to redirects, and the code does redirect when not accessed via subdomain. However, the route still exists as a catch-all, which means any random path like `/en/foo` will hit this page, do a DB lookup, and 404. This is a SEO and performance concern -- it should be explicitly handled or removed.

### P2: `features/tech/index.tsx` still uses "gaming" naming internally

The barrel file has `gamingButtonVariants`, `gamingCardVariants`, and comments like "// GAMING BUTTON", "// GAMING INPUT", "// GAMING CARD", "// GAMING AVATAR", "// GAMING BADGE". External exports are correctly named (`TechButton`, `TechCard`, etc.) but internal naming is inconsistent with the rebrand.

### P2: Narrative cache keys still reference "gaming" and "professional"

**File:** `features/ai-narrator/services/cache.service.ts`

```typescript
const NARRATIVE_CACHE_KEYS = [
  'meta.aiNarrative_gaming_en',
  'meta.aiNarrative_gaming_es',
  'meta.aiNarrative_professional_en',
  'meta.aiNarrative_professional_es',
];
```

These should be `tech` and `classic`. Any narratives cached under the old keys will never be invalidated. Any narratives cached under the new mode names won't be covered by the invalidation logic.

### P3: Test files with TODO placeholders

Three test files contain `// TODO: Replace with actual imports once components are implemented`:
- `features/timeline/__tests__/experience-model.test.ts`
- `features/auth/__tests__/auth-pages.test.tsx`
- `features/pages/__tests__/pages.test.tsx`

These were likely scaffold tests that were never updated.

---

## 4. Phase 4 (Assessment) Technical Debt

### Overall Assessment: Solid

The assessment feature is the best-structured code in the codebase. It follows action -> service -> data correctly, has proper type definitions, guard ordering is well-documented, and the token system is atomic. Specific issues:

### P1: `revalidateTag` called with second argument `{}`

**File:** `features/assessment/actions/submitAnswers.action.ts:134`

```typescript
revalidateTag(`user-stats-${userId}`, {});
```

The `revalidateTag` function in Next.js does NOT accept a second argument. This pattern is used in 10+ files across the codebase (timeline, skills, projects, dashboard, assessment, github). It appears to be a systematic misunderstanding. In Next.js 16, `revalidateTag` accepts only a single string argument. The second `{}` argument is silently ignored but is technically incorrect and could cause issues in future versions.

### P2: `scoreAssessmentService` hardcodes XP reward value

**File:** `features/assessment/services/scoreAssessment.service.ts:143`

```typescript
xpAwarded: passed ? 200 : 0,
```

The `200` is hardcoded here, while in `applyAssessmentRewards.service.ts` the same value is defined as `const ASSESSMENT_XP_REWARD = 200`. The `scoreAssessmentService` should reference `ASSESSMENT_XP_REWARD` from the rewards service (or from a shared constants file) to avoid drift.

### P2: Assessment modal has no timeout

If the AI generation takes > 30s (Gemini API is slow or down), the user sees an infinite loading spinner. There is no client-side timeout or abort controller. `generateQuestionsService` sets `maxRetries: 1` but no timeout.

### P2: `generateQuestionsService` uses `generateText` without `generateObject`

The service generates JSON by asking Gemini to "Return ONLY valid JSON" in the prompt, then manually parses and validates. The AI SDK has a `generateObject` function with Zod schema validation that would be more robust and eliminate the manual parsing code.

### P3: Assessment test coverage is minimal

Only `tokens.test.ts` exists, which tests that constants equal specific numbers. There are no tests for:
- `scoreAssessmentService` logic
- `applyAssessmentRewardsService` transaction
- `consumeAssessmentToken` atomic behavior
- Action guard ordering

### P3: `getAssessmentTokensData` does not account for daily reset in read

The function reads `assessmentTokens.remaining` from `User.meta` but does NOT check if `lastResetDate` differs from today. If tokens were consumed yesterday and the user checks today before any consumption, `getAssessmentTokensData` will return yesterday's remaining count (e.g., 0) instead of the reset count (3). The consumption path handles this correctly via the atomic reset, but the read-only path will show stale data until the first consumption triggers the reset.

This affects the `AssessmentWidget` display: a user who used all tokens yesterday will see "0 / 3" tokens on the dashboard until they actually try to start an assessment.

---

## 5. Alignment with ROADMAP_V2

### Phase 2B (Classic Mode Template) -- NOT started

No Classic Mode template components exist anywhere. `features/portfolio/components/PortfolioLayout.tsx` appears to handle both modes but classic mode rendering is likely minimal or placeholder. This is marked as a **must-have** for launch in the roadmap.

### Phase 3B (Visual Polish) -- NOT started

No Gridcn or Glitchcn integration. The tech components still use the "gaming" internal naming. No evidence of visual refinement work.

### Phase 3C (Real XP & Stats) -- NOT started

The dashboard still uses hardcoded mock data in several places. The `HexStatGrid`, `ActiveMissionsPanel`, `SkillRadarPanel` all appear to receive data from props but the actual calculations may use placeholder logic.

### Phase 4 was built before its prerequisites

The roadmap explicitly states Phase 4 prerequisites: "Phase 0 complete (rate limiting, lives fixes)" and "Al menos 20-30 usuarios activos que validen demanda". Phase 4 was built anyway. This is fine for development purposes but means the feature is sitting unused and adding code surface area.

### Misalignment: Dashboard is Tech Mode only

The main dashboard (`(protected)/dashboard/page.tsx`) renders exclusively in Tech Mode aesthetic (hex diamond, CRT, particle field, sys log panel, etc.) regardless of user's `portfolioMode`. A Classic Mode user would see the cyberpunk dashboard. This contradicts the two-mode strategy.

---

## 6. Things That Can Be Eliminated

### P0: Delete before production

| File/Directory | Reason |
|---|---|
| `app/api/dev-cleanup/route.ts` | Debug route, explicitly flagged for deletion in MEMORY.md |
| `scripts/cleanup-github-accounts.mjs` | Debug script |
| `scripts/cleanup-github-accounts.ts` | Debug script |

### P1: Clean up from project root

| File | Reason |
|---|---|
| `DASHBOARD_POLISH_PLAN.md` | Planning doc, move to agent-os/ or delete |
| `dev.log` | Development log, should be gitignored |
| `recordatorio.md` | Personal reminder, not project code |
| `test-auth-api.ts` | Debug test file, move to scripts/ or delete |
| `seed-categories.js` | Migration script in root, move to scripts/ |

### P2: Debug scripts to clean up or organize

| File | Reason |
|---|---|
| `scripts/debug-user.ts` | One-time debug |
| `scripts/check-user-data.ts` | One-time debug |
| `scripts/check_user.ts` | Duplicate of above? |
| `scripts/test-ai.ts` | One-time test |
| `scripts/test-db-connection.ts` | One-time test |
| `scripts/fix-user-image.ts` | One-time fix |
| `scripts/reset-oauth-image.ts` | One-time fix |

### P2: Dead `console.log` statements

**File:** `features/github/services/syncGitHub.service.ts` lines 121-123

Three `console.log` debug statements left in production service code:
```typescript
console.log('[GitHub Sync] validatedSlugs:', validatedSlugs)
console.log('[GitHub Sync] userSkillSlugs in DB:', ...)
console.log('[GitHub Sync] matchingUserSkillIds:', matchingUserSkillIds)
```

These leak potentially sensitive user data (skill slugs, DB IDs) to server logs.

---

## 7. Priority Recommendations for Next Phases

### Recommended order: Phase 2B first, then cleanup, then 3B/3C

**Rationale:**

1. **Phase 2B (Classic Mode Template)** is the only remaining **must-have** for launch per the roadmap. Without it, the app is unusable for non-tech users. This should be the top priority.

2. **Technical cleanup sprint** (1-2 days) before 3B/3C:
   - Delete debug files (P0)
   - Fix narrative cache keys (`gaming`/`professional` -> `tech`/`classic`)
   - Merge `(protected)` and `(dashboard)` route groups
   - Extract shared `ImproveWithAIButton` component
   - Fix `revalidateTag` second argument across all files
   - Fix `getAssessmentTokensData` daily reset logic

3. **Phase 3B (Visual Polish)** depends on having the Classic Mode template done, since both modes need to look polished.

4. **Phase 3C (Real XP & Stats)** is a nice-to-have that can be parallelized with 3B.

### Prerequisites / Blockers

- **Phase 2B is blocked by nothing.** The data layer (Phase 2A) is complete. Schema, services, and tests for Service, Testimonial, GalleryItem, and PortfolioSettings all exist.
- **Phase 3B needs decision:** Whether to adopt Gridcn/Glitchcn components or polish existing ones. Evaluate first, then spec.
- **Phase 3C needs a Classic Mode dashboard** -- can't show real XP stats in a tech-only dashboard for classic users.
- **The dashboard needs to be mode-aware** before shipping. This is an implicit blocker for launch even if not explicitly called out in the roadmap.

---

## Summary Table

| Priority | Issue | Effort |
|---|---|---|
| **P0** | Delete `app/api/dev-cleanup/` before production | 5 min |
| **P0** | Clean root-level debug files | 10 min |
| **P1** | Fix narrative cache keys (gaming/professional -> tech/classic) | 15 min |
| **P1** | Merge `(protected)` + `(dashboard)` route groups | 1-2 hours |
| **P1** | Duplicate `ImproveBioButton` / `ImproveDescriptionButton` | 1 hour |
| **P1** | User.meta is untyped shadow schema | 2-3 hours (type it) |
| **P1** | Fix `revalidateTag` second argument in 10+ files | 30 min |
| **P1** | Assessment `getAssessmentTokensData` daily reset bug | 30 min |
| **P2** | Remove `console.log` from syncGitHub service | 5 min |
| **P2** | Internal "gaming" naming in tech/index.tsx | 30 min |
| **P2** | Dashboard is Tech Mode only (no Classic Mode dashboard) | Blocked by Phase 2B |
| **P2** | Extract shared daily token manager | 1-2 hours |
| **P2** | Assessment scoreService XP hardcode | 10 min |
| **P2** | `[username]` catch-all route performance | 30 min |
| **P2** | Duplicate API route handlers | 1 hour |
| **P3** | Assessment test coverage | 2-3 hours |
| **P3** | updateUserLocale not using actionWrapper | 30 min |
| **P3** | TODO placeholders in test files | 30 min |
| **P3** | Use generateObject instead of manual JSON parse | 1 hour |
| **P3** | Debug scripts organization | 30 min |

---

*Next action: Create spec for Phase 2B (Classic Mode Template) and schedule a 1-day cleanup sprint for all P0 + P1 items.*
