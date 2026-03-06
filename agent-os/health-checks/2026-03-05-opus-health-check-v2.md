# Portfoland Health Check v2 -- 2026-03-05

**Reviewed by:** Opus 4.6
**Purpose:** Verify cleanup fixes, find gaps, assess readiness for Phase 2B

---

## 1. Fix Verification

### P0: Debug files deleted -- PASS

- `app/api/dev-cleanup/` -- gone
- `scripts/cleanup-github-accounts.mjs` -- gone
- `scripts/cleanup-github-accounts.ts` -- gone
- `dev.log`, `recordatorio.md`, `DASHBOARD_POLISH_PLAN.md`, `test-auth-api.ts`, `seed-categories.js` -- all gone from root

### P1: Narrative cache keys -- PASS

`features/ai-narrator/services/cache.service.ts` now uses `aiNarrative_tech_*` / `aiNarrative_classic_*`. Correct.

### P1: getAssessmentTokensData daily reset -- PASS

`features/assessment/data/getAssessmentTokens.data.ts:47` checks `lastResetDate !== today` and returns full allowance. The read path now correctly reflects the reset.

### P2: console.logs removed from syncGitHub.service.ts -- PASS

No `console.log` statements remain in the file.

### P2: gaming -> tech naming in features/tech/index.tsx -- PASS

Internal variable names are now `techButtonVariants`, `techCardVariants`, etc. Comments say "TECH BUTTON", "TECH INPUT", etc. No remaining "gaming" references.

### P1: ImproveWithAIButton extraction -- PASS

- `ImproveWithAIButton` exists as the shared base component with full parameterization
- `ImproveBioButton` is a thin wrapper (38 lines)
- `ImproveDescriptionButton` is a thin wrapper (41 lines) that passes `extraBody={{ context }}`
- Both wrappers expose the same public props as before (`currentBio`/`currentDescription`, `onImproved`, `className`, `mode`, `locale`)

### P1: UserMeta interface -- PARTIAL (see issues below)

`lib/user-meta.ts` exists with the right fields. However:

**Issue 1: Nobody imports it.** Zero files import `UserMeta`. All services still do their own inline casts:
- `assessmentToken.service.ts:50` -- `as { isPro?: boolean } | null`
- `assessmentToken.service.ts:143-146` -- `as { isPro?: boolean; assessmentTokens?: AssessmentTokenInfo }`
- `quota.service.ts:57` -- `as { value?: { meta?: { remainingLives?: number } } }`
- `quota.service.ts:87` -- `as { remainingLives?: number }`
- `getNarrativeData.data.ts:121` -- `as Record<string, unknown>`
- `setNarrativeCache.data.ts:33` -- `as Record<string, unknown> | null`

The type was created but never wired in. It's dead code.

**Issue 2: Type mismatch on narrative fields.** `UserMeta` declares:
```typescript
aiNarrative_tech_en?: string;
```
But the actual data stored by `setNarrativeCache.data.ts:36-41` is:
```typescript
{ narrative: string; timestamp: string }
```
So the type should be `{ narrative: string; timestamp: string } | undefined`, not `string | undefined`.

### P1: Route groups merged -- PASS (with caveats)

`(protected)` directory is gone. `(dashboard)/layout.tsx` has auth guard (session check + redirect to login). All dashboard pages are now under `(dashboard)`.

**Caveat 1: Layout fetches `user` data but doesn't use it.** The layout queries `prisma.user.findUnique` for `name`, `email`, `image`, `portfolioMode`, builds a `user` object, but the return JSX is just `<div className="dark ...">{children}</div>`. The `user` variable is unused -- wasted DB query per request.

**Caveat 2: Every child page re-fetches session.** All 8 dashboard pages still call `auth.api.getSession()` + `prisma.user.findUnique()` individually. The layout guard is additive protection but doesn't reduce redundant work. This is fine for correctness but means 2 session checks + 2 DB queries per page load.

---

## 2. Items from v1 Still Unresolved

| Priority | Item | Status |
|---|---|---|
| **P1** | `revalidateTag` second argument `{}` in 14 call sites | **OPEN** -- User confirmed this is correct in Next.js 16 (2-arg signature). No action needed. |
| **P2** | `[username]` catch-all route still exists | **OPEN** -- `app/[locale]/[username]/page.tsx` still present |
| **P2** | Duplicate filter logic in syncGitHub.service.ts lines 112-119 | **OPEN** -- Two identical `.filter().map()` chains remain (matchingUserSkillIds and matchingSlugs) |
| **P2** | Assessment scoreService XP hardcode (`200` vs `ASSESSMENT_XP_REWARD`) | **OPEN** -- `scoreAssessment.service.ts:143` still hardcodes `200` |
| **P2** | Duplicate API route handlers (improve-bio, improve-description) | **OPEN** |
| **P2** | `updateUserLocale` not using `actionWrapper` | **OPEN** |
| **P2** | `ai-quota` and `assessment` token systems structurally duplicated | **OPEN** |
| **P2** | Debug scripts in `scripts/` (7 files) | **OPEN** -- `debug-user.ts`, `check-user-data.ts`, `check_user.ts`, `test-ai.ts`, `test-db-connection.ts`, `fix-user-image.ts`, `reset-oauth-image.ts` still present |
| **P3** | Assessment test coverage minimal | **OPEN** |
| **P3** | `generateQuestionsService` uses manual JSON parse instead of `generateObject` | **OPEN** |
| **P3** | TODO placeholder test files | **OPEN** |

---

## 3. New Issues Introduced by Refactors

### P1: UserMeta type is dead code

Created but not imported anywhere. The refactor was incomplete -- the type needs to be wired into the 6+ services that cast `User.meta`.

### P2: Dashboard layout has unused DB query

`(dashboard)/layout.tsx` lines 54-63 fetch user data from Prisma, build a `user` object (lines 66-72), but never pass it to `{children}`. Every request to any dashboard page pays for this query with zero benefit. Either:
- Pass user data via context/props to avoid child pages re-fetching, OR
- Remove the Prisma query from the layout (keep only the auth guard)

### P2: Narrative cache key type mismatch in UserMeta

`aiNarrative_*` fields are typed as `string` but actual stored values are `{ narrative: string; timestamp: string }`. If someone uses `UserMeta` for type-safe access, they'll get wrong types.

### P3: setNarrativeCache JSDoc still mentions 'gaming'

`features/ai-narrator/data/setNarrativeCache.data.ts:15` -- JSDoc says `(e.g., 'tech', 'gaming')`. Should be `'tech', 'classic'`.

### P3: Dubious type cast in setNarrativeCache

`setNarrativeCache.data.ts:47` does `meta: newMeta as unknown as undefined` -- double cast through `unknown` to `undefined` to satisfy Prisma's JSON field typing. Works but is fragile. The standard pattern for Prisma JSON fields is `as Prisma.InputJsonValue`.

---

## 4. ImproveBioButton / ImproveDescriptionButton Compatibility

**Consumers are compatible.** Verified both call sites:

- `DashboardPortfolioView.tsx:275` passes `currentBio`, `onImproved`, `mode="tech"`, `locale` -- matches `ImproveBioButtonProps`
- `ProjectForm.tsx:247` passes `currentDescription`, `onImproved`, `mode="tech"`, `locale`, `context="project"` -- matches `ImproveDescriptionButtonProps`

No breaking changes.

---

## 5. Dashboard Layout Auth Guard

**Correct.** `(dashboard)/layout.tsx` does:
1. `auth.api.getSession({ headers: await headers() })`
2. `if (!session?.user) redirect(\`/\${locale}/login\`)`

Every unauthorized request is caught at the layout level before any child page renders. Individual pages still have their own guards as defense-in-depth.

---

## 6. Readiness for Phase 2B

**Ready to proceed.** The cleanup addressed all P0 items and most critical P1 items. The remaining issues are:

**Should fix before Phase 2B:**
- Wire `UserMeta` into actual consumers (otherwise it'll drift as new meta fields are added in Classic Mode)
- Remove the unused Prisma query from `(dashboard)/layout.tsx` (wasted resources, confusing for anyone reading the code)

**Can fix alongside/after Phase 2B:**
- Everything else in the "Still Unresolved" table
- Debug scripts cleanup

**Phase 2B has no blockers.** Data layer (Phase 2A) is complete. The `(dashboard)` layout provides the auth guard needed for new Classic Mode pages.
