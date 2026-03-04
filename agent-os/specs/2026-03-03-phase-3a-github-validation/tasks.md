# Task Breakdown: Phase 3A — GitHub Validation

## Overview

Total Task Groups: 10
Feature: Connect GitHub via OAuth, fetch language data, auto-validate skills, apply 1.3x XP multiplier at read time, and surface dual-validation "Gold" hexagon visuals.

## Dependency Graph

```
TG1 (Schema) → TG2 (GitHub API layer) → TG3 (Sync service + action)
TG4 (Constants) ─────────────────────────────────────────↗ (imported by TG3)
TG1 → TG5 (XP multiplier across data layer)
TG1 → TG7 (SkillHexagonNode visuals)
TG1 → TG6 (AIEye searching state)       ─→ TG8 (GitHubSyncPanel)
TG3 + TG6 + TG8 → TG9 (DashboardSkillsView + portfolio integration)
TG8 → TG10 (ReauthModal)
```

Recommended execution order: TG4 → TG1 → TG2 → TG3 → TG5 → TG6 → TG7 → TG8 → TG10 → TG9

---

## Task List

### Constants (no dependencies — create first)

#### Task Group 4: Language Mapping, XP, and Message Constants
**Dependencies:** None — these files are imported by TG3, TG5, and TG8; create them first.

- [x] 4.0 Create the `features/github/constants/` directory and all constant files
  - [x] 4.1 Write 2 focused tests for the constants
    - Test that `GITHUB_LANGUAGE_MAP` contains the required 19 language entries and maps `"Jupyter Notebook"` → `"python"` and `"C++"` → `"cpp"` correctly
    - Test that `GITHUB_XP_MULTIPLIER` equals `1.3` (exact value check as single source of truth)
    - File: `features/github/__tests__/constants.test.ts`
  - [x] 4.2 Create `features/github/constants/github-mappings.ts`
    - Export `GITHUB_LANGUAGE_MAP: Record<string, string>` — static object
    - Required 19 entries (exact keys as returned by GitHub API):
      - `"TypeScript" → "typescript"`
      - `"JavaScript" → "javascript"`
      - `"Python" → "python"`
      - `"Jupyter Notebook" → "python"`
      - `"Shell" → "bash"`
      - `"C++" → "cpp"`
      - `"C" → "c"`
      - `"Go" → "go"`
      - `"Rust" → "rust"`
      - `"Java" → "java"`
      - `"Kotlin" → "kotlin"`
      - `"Swift" → "swift"`
      - `"Ruby" → "ruby"`
      - `"PHP" → "php"`
      - `"CSS" → "css"`
      - `"HTML" → "html"`
      - `"Vue" → "vue"`
      - `"Svelte" → "svelte"`
      - `"Dart" → "dart"`
    - Add JSDoc comment explaining the mapping purpose
  - [x] 4.3 Create `features/github/constants/xp.ts`
    - Export `GITHUB_XP_MULTIPLIER = 1.3` as a named `const`
    - Add JSDoc: "Single source of truth for the GitHub credibility XP boost. Imported wherever GitHub-validated XP is computed at read time."
  - [x] 4.4 Create `features/github/constants/messages.ts`
    - Export `GITHUB_MESSAGES` object with keys: `SYNC_SUCCESS`, `SYNC_ERROR`, `AUTH_ERROR`, `NO_GITHUB_ACCOUNT`
    - Follow exact pattern from `features/skills/constants/messages.ts` (plain string object, no locale variants needed for v1)
    - Example values:
      - `SYNC_SUCCESS: 'GitHub skills synchronized successfully'`
      - `SYNC_ERROR: 'Failed to sync GitHub data. Please try again.'`
      - `AUTH_ERROR: 'GitHub authorization failed. Please reconnect your account.'`
      - `NO_GITHUB_ACCOUNT: 'No GitHub account connected. Please connect GitHub first.'`
  - [x] 4.5 Create `features/github/constants/index.ts` barrel export
    - Re-export from all three constant files
  - [x] 4.6 Run the 2 tests written in 4.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/constants.test.ts --no-coverage`

**Acceptance Criteria:**
- Both tests written in 4.1 pass
- `GITHUB_LANGUAGE_MAP` is a plain `Record<string, string>` with all 19 entries
- `GITHUB_XP_MULTIPLIER` is exactly `1.3` (type `number`)
- `GITHUB_MESSAGES` exports all 4 message constants as plain strings

---

### Database Layer

#### Task Group 1: Prisma Schema Changes
**Dependencies:** None (TG4 can run in parallel)

- [x] 1.0 Extend Prisma schema with GitHub fields and regenerate the client
  - [x] 1.1 Write 3 focused tests for schema behavior (run after `prisma generate` in 1.6)
    - Test that `UserSkill` model accepts `githubValidated: false` as default (create a UserSkill and verify field exists)
    - Test that `User` model accepts `githubSyncedAt: null` and `githubStats: null` as defaults
    - Test that `SourceType` enum includes `GITHUB` variant alongside `EXPERIENCE` and `MANUAL`
    - File: `features/github/__tests__/schema.test.ts`
    - Mock Prisma client for unit-level testing; do not hit the live DB
  - [x] 1.2 Edit `prisma/schema.prisma` — extend the `SourceType` enum (line 182–185)
    - Add `GITHUB` variant:
      ```prisma
      enum SourceType {
        EXPERIENCE
        MANUAL
        GITHUB
      }
      ```
  - [x] 1.3 Edit `prisma/schema.prisma` — add `githubValidated` to the `UserSkill` model (after `aiValidated` on line 228)
    - Add immediately after `aiValidated Boolean @default(false)`:
      ```prisma
      githubValidated Boolean @default(false)
      ```
    - No index needed; this field is read alongside `aiValidated` in existing select queries
  - [x] 1.4 Edit `prisma/schema.prisma` — add three new fields to the `User` model (after `lastStreakDate` on line 35)
    - Add:
      ```prisma
      githubSyncedAt  DateTime?
      githubStats     Json?
      ```
    - `githubStats` stores `{ stars: number; totalCommits: number; validatedSkillsCount: number }` as MongoDB JSON
  - [x] 1.5 Edit `features/skills/types/skill.ts` — update the `hasGitHubValidation` stub (line 140–142)
    - Change the function signature to accept a `userSkill: { githubValidated: boolean }` parameter instead of `sources`
    - Replace stub body `return false` with `return userSkill.githubValidated === true`
    - Update JSDoc to remove "Currently returns false" and add "Reads `githubValidated` from the Prisma model"
    - Note: after `prisma generate`, `UserSkill` will include `githubValidated: boolean`
  - [x] 1.6 Run `npx prisma generate` (no migration needed — MongoDB, nullable fields default to null, booleans default to false)
    - Verify no TypeScript errors in `app/generated/prisma/`
    - Command: `cd C:/Users/user/code/nextjs/portfoland && npx prisma generate`
  - [x] 1.7 Run the 3 tests written in 1.1 and confirm they pass

**Acceptance Criteria:**
- All 3 tests written in 1.1 pass
- `prisma generate` completes without errors
- `UserSkill` in generated Prisma client includes `githubValidated: boolean`
- `User` in generated Prisma client includes `githubSyncedAt: Date | null` and `githubStats: Prisma.JsonValue | null`
- `SourceType` enum in generated client includes `GITHUB`
- `hasGitHubValidation` in `features/skills/types/skill.ts` now reads from `userSkill.githubValidated`

---

### API Layer

#### Task Group 2: GitHub API Data Layer
**Dependencies:** TG1 (needs Prisma `Account` model with `accessToken`)

- [x] 2.0 Create `features/github/api/` and `features/github/data/` directories with all API and data functions
  - [x] 2.1 Write 4 focused tests for the GitHub API layer
    - Test `fetchUserRepos`: mock `fetch`, verify it filters repos where `fork === true` from the result set
    - Test `fetchRepoLanguages`: mock `fetch`, verify it aggregates byte counts across multiple calls (two repos, same language accumulates)
    - Test `fetchCommitCount`: mock `fetch` for GraphQL endpoint, verify it returns `totalCommitContributions` from the response
    - Test that `fetchUserRepos` throws a typed `GitHubAuthError` when the mocked response status is 401
    - File: `features/github/__tests__/github.api.test.ts`
    - All tests mock `fetch` — no real network calls
  - [x] 2.2 Create `features/github/api/github.api.ts`
    - Define and export `GitHubAuthError` class extending `Error`:
      ```typescript
      export class GitHubAuthError extends Error {
        constructor(message = 'GitHub token invalid or expired') {
          super(message);
          this.name = 'GitHubAuthError';
        }
      }
      ```
    - Define shared headers factory:
      ```typescript
      function buildHeaders(accessToken: string): HeadersInit {
        return {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        };
      }
      ```
    - Export `fetchUserRepos(accessToken: string): Promise<GitHubRepo[]>`
      - URL: `https://api.github.com/user/repos?per_page=100&type=owner`
      - On HTTP 401: `throw new GitHubAuthError()`
      - On other non-2xx: `throw new Error('GitHub API error: ' + response.status)`
      - Filter result: `repos.filter(repo => repo.fork === false)`
      - Return type `GitHubRepo[]` where `GitHubRepo = { name: string; owner: { login: string }; fork: boolean; stargazers_count: number }`
    - Export `fetchRepoLanguages(accessToken: string, owner: string, repo: string): Promise<Record<string, number>>`
      - URL: `https://api.github.com/repos/{owner}/{repo}/languages`
      - Returns raw language byte count object (e.g., `{ "TypeScript": 45000, "CSS": 5000 }`)
      - On 401: `throw new GitHubAuthError()`
    - Export `fetchCommitCount(accessToken: string): Promise<number>`
      - URL: `https://api.github.com/graphql` (POST)
      - Body: `{ query: "{ viewer { contributionsCollection { totalCommitContributions } } }" }`
      - Returns `data.viewer.contributionsCollection.totalCommitContributions` as `number`
      - On 401 in response errors array: `throw new GitHubAuthError()`
    - Export `aggregateLanguageBytes(repos: GitHubRepo[], accessToken: string): Promise<Record<string, number>>`
      - Iterates over each non-fork repo, calls `fetchRepoLanguages` for each
      - Aggregates total bytes per language: `{ TypeScript: 90000, Python: 30000 }`
      - Returns the merged aggregate object
  - [x] 2.3 Create `features/github/data/getGitHubToken.data.ts`
    - Single Prisma query:
      ```typescript
      export async function getGitHubToken(userId: string): Promise<string | null> {
        const account = await prisma.account.findFirst({
          where: { userId, providerId: 'github' },
          select: { accessToken: true },
        });
        return account?.accessToken ?? null;
      }
      ```
    - Import `prisma` from `@/lib/prisma`
    - Add JSDoc: "Retrieves the GitHub OAuth access token for the user from the Better Auth Account record. Returns null if no GitHub account is connected."
  - [x] 2.4 Create `features/github/api/index.ts` barrel export
    - Re-export `GitHubAuthError`, `fetchUserRepos`, `fetchRepoLanguages`, `fetchCommitCount`, `aggregateLanguageBytes` from `./github.api`
  - [x] 2.5 Run the 4 tests written in 2.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/github.api.test.ts --no-coverage`

**Acceptance Criteria:**
- All 4 tests written in 2.1 pass
- `GitHubAuthError` is exported and is an instance of `Error` with `name === 'GitHubAuthError'`
- All API functions include `Authorization: Bearer` and `Accept: application/vnd.github+json` headers
- `fetchUserRepos` filters out forks before returning
- `getGitHubToken` returns `null` when no GitHub account is linked

---

#### Task Group 3: GitHub Sync Service and Server Action
**Dependencies:** TG1, TG2, TG4 (all must be complete)

- [x] 3.0 Create the three-layer GitHub sync: service, action, and Yup schema
  - [x] 3.1 Write 4 focused tests for the sync service and action
    - Test `syncGitHubService`: mock `getGitHubToken` returning a token, mock GitHub API functions returning `{ TypeScript: 80000, Python: 10000 }` aggregate (TypeScript is 88.8%, above 60%), mock `prisma.userSkill.findMany` returning a skill with slug `typescript`, verify `prisma.userSkill.update` is called with `{ githubValidated: true }` for that skill
    - Test `syncGitHubService`: mock language aggregate where all languages are below 60% threshold, verify `prisma.userSkill.update` is NOT called
    - Test `syncGitHubService`: mock `getGitHubToken` returning `null`, verify it throws an error with message matching `NO_GITHUB_ACCOUNT`
    - Test `syncGitHubAction`: mock the session returning no user, verify the action returns an error payload (not a thrown exception)
    - File: `features/github/__tests__/syncGitHub.service.test.ts`
  - [x] 3.2 Create `features/github/schemas/syncGitHub.schema.ts`
    - Yup schema for action input validation (input is `{}` — no user input required beyond the session)
    - Export `syncGitHubSchema` using Yup `object().shape({})` — the only validation is session-based
    - Mirror pattern from `features/skills/schemas/skill.schema.ts`
  - [x] 3.3 Create `features/github/services/syncGitHub.service.ts`
    - Export `syncGitHubService(userId: string): Promise<SyncGitHubResult>` where `SyncGitHubResult = { validatedSkillsCount: number; stars: number; totalCommits: number }`
    - Implementation steps (in order):
      1. Call `getGitHubToken(userId)` — if null, throw `new Error(GITHUB_MESSAGES.NO_GITHUB_ACCOUNT)`
      2. Call `fetchUserRepos(token)` — may throw `GitHubAuthError` (let it propagate)
      3. Compute `stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)`
      4. Call `aggregateLanguageBytes(repos, token)` to get `languageBytes: Record<string, number>`
      5. Compute `totalBytes = Object.values(languageBytes).reduce((sum, b) => sum + b, 0)`
      6. Build `dominantLanguages: string[]` — languages where `bytes / totalBytes >= 0.60`
      7. Map each dominant language through `GITHUB_LANGUAGE_MAP` to get candidate slugs (skip unmapped languages)
      8. Call `fetchCommitCount(token)` to get `totalCommits: number`
      9. Load user's `UserSkill` records: `prisma.userSkill.findMany({ where: { userId }, select: { id: true, skill: { select: { slug: true } } } })`
      10. For each `UserSkill` whose `skill.slug` is in the candidate slug set, call `prisma.userSkill.update({ where: { id }, data: { githubValidated: true } })`
      11. Compute `validatedSkillsCount = number of userSkills updated`
      12. Update user: `prisma.user.update({ where: { id: userId }, data: { githubSyncedAt: new Date(), githubStats: { stars, totalCommits, validatedSkillsCount } } })`
      13. Return `{ validatedSkillsCount, stars, totalCommits }`
    - Import `GITHUB_LANGUAGE_MAP` from `features/github/constants/github-mappings`
    - Import `GITHUB_MESSAGES` from `features/github/constants/messages`
    - Import `GitHubAuthError`, `fetchUserRepos`, `aggregateLanguageBytes`, `fetchCommitCount` from `features/github/api`
    - Import `getGitHubToken` from `features/github/data/getGitHubToken.data`
    - Import `prisma` from `@/lib/prisma`
  - [x] 3.4 Create `features/github/types/github.ts`
    - Export `SyncGitHubResult`:
      ```typescript
      export interface SyncGitHubResult {
        validatedSkillsCount: number;
        stars: number;
        totalCommits: number;
      }
      ```
    - Export `SyncGitHubResponse` (the action return payload shape):
      ```typescript
      export interface SyncGitHubResponse {
        validatedSkillsCount: number;
        stars: number;
        totalCommits: number;
      }
      ```
    - Export `GitHubStats` (the JSON shape stored in `User.githubStats`):
      ```typescript
      export interface GitHubStats {
        stars: number;
        totalCommits: number;
        validatedSkillsCount: number;
      }
      ```
    - Export `GitHubSyncPanelProps` (used by TG8):
      ```typescript
      export interface GitHubSyncPanelProps {
        githubSyncedAt: Date | null;
        githubStats: GitHubStats | null;
        onSearchingStateChange?: (active: boolean) => void;
        onXPGainTrigger?: () => void;
        onLifeLossTrigger?: () => void;
      }
      ```
  - [x] 3.5 Create `features/github/actions/syncGitHub.action.ts`
    - `'use server'` directive at top
    - Mirror the exact pattern from `features/skills/actions/syncSkillsFromExperience.ts`:
      ```typescript
      export async function syncGitHubAction(): Promise<ActionResponse<SyncGitHubResponse>> {
        return actionWrapper<SyncGitHubResponse>(async () => {
          const session = await auth.api.getSession({ headers: await headers() });
          if (!session?.user?.id) throw new Error('Please sign in to sync GitHub');

          // Validate that user has a GitHub account linked (fail fast)
          const token = await getGitHubToken(session.user.id);
          if (!token) throw new Error(GITHUB_MESSAGES.NO_GITHUB_ACCOUNT);

          const result = await syncGitHubService(session.user.id);

          revalidatePath('/dashboard/skills');
          revalidateTag(`user-stats-${session.user.id}`);

          return {
            payload: result,
            message: GITHUB_MESSAGES.SYNC_SUCCESS,
          };
        });
      }
      ```
    - Handle `GitHubAuthError` separately before calling the service: catch it and re-throw with `errorType: 'auth'` discriminator embedded in the message so `GitHubSyncPanel` can detect it
    - Import `actionWrapper` from `@/features/core`
    - Import `auth` from `@/lib/auth`
    - Import `headers` from `next/headers`
    - Import `revalidatePath`, `revalidateTag` from `next/cache`
    - Import `syncGitHubService` from `../services/syncGitHub.service`
    - Import `getGitHubToken` from `../data/getGitHubToken.data`
    - Import `GITHUB_MESSAGES` from `../constants/messages`
    - Import `GitHubAuthError` from `../api`
    - Import types from `../types/github`
  - [x] 3.6 Create `features/github/actions/index.ts` and `features/github/index.ts` barrel exports
    - `features/github/actions/index.ts`: export `syncGitHubAction` from `./syncGitHub.action`
    - `features/github/index.ts`: export from `./actions`, `./constants`, `./types`, `./api`
  - [x] 3.7 Run the 4 tests written in 3.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/syncGitHub.service.test.ts --no-coverage`

**Acceptance Criteria:**
- All 4 tests written in 3.1 pass
- `syncGitHubService` applies the 60% threshold correctly (only dominant languages validated)
- `syncGitHubAction` uses `'use server'`, `actionWrapper`, session validation, `revalidatePath`, and `revalidateTag`
- Action response shape matches `{ payload: SyncGitHubResponse; message: string }`
- `GitHubAuthError` propagates through the action in a way the client can detect (`errorType: 'auth'`)

---

### XP Data Layer

#### Task Group 5: XP Read-Time Multiplier Across Data Layer
**Dependencies:** TG1 (schema must be generated), TG4 (needs `GITHUB_XP_MULTIPLIER` constant)

- [x] 5.0 Apply the 1.3x GitHub XP multiplier across all three dashboard data files
  - [x] 5.1 Write 3 focused tests for the multiplier behavior
    - Test `getUserDashboardStats` (mock Prisma): given a userSkill with `totalXP: 100` and `githubValidated: true`, verify the returned `totalXP` includes `Math.round(100 * 1.3) = 130` rather than `100`
    - Test `getTopRunners` (mock Prisma): given a user with one skill `totalXP: 100, githubValidated: true`, verify the runner's `totalXP` reflects the 1.3x boost
    - Test `getRecentUserActivity` (mock Prisma): given a userSkill with `aiValidated: false, githubValidated: true, totalXP: 200`, verify the activity event `xp` is `Math.round(200 * 1.3) = 260` and `type` is `'skill_github'`
    - File: `features/github/__tests__/xpMultiplier.test.ts`
  - [x] 5.2 Edit `features/dashboard/data/getUserDashboardStats.data.ts`
    - Add `import { GITHUB_XP_MULTIPLIER } from '@/features/github/constants/xp'` at the top
    - Change the `userSkills` Prisma select from `{ where: { aiValidated: true }, select: { totalXP: true } }` to:
      ```typescript
      userSkills: {
        where: { aiValidated: true },
        select: { totalXP: true, githubValidated: true },
      },
      ```
    - Update the `skillXPs` mapping (line 77) from `user.userSkills.map((skill) => skill.totalXP)` to:
      ```typescript
      const skillXPs = user.userSkills.map((skill) =>
        skill.githubValidated
          ? Math.round(skill.totalXP * GITHUB_XP_MULTIPLIER)
          : skill.totalXP
      );
      ```
  - [x] 5.3 Edit `features/dashboard/data/getTopRunners.data.ts`
    - Add `import { GITHUB_XP_MULTIPLIER } from '@/features/github/constants/xp'` at the top
    - Change the `userSkills` select from `{ select: { aiValidated: true } }` to:
      ```typescript
      userSkills: {
        select: { aiValidated: true, githubValidated: true, totalXP: true },
      },
      ```
    - Update the `skillXP` reduction (line 81–83) from the heuristic `(userSkill.aiValidated ? 150 : 50)` to:
      ```typescript
      const skillXP = user.userSkills.reduce((sum, userSkill) => {
        const base = userSkill.totalXP > 0 ? userSkill.totalXP : (userSkill.aiValidated ? 150 : 50);
        const effective = userSkill.githubValidated
          ? Math.round(base * GITHUB_XP_MULTIPLIER)
          : base;
        return sum + effective;
      }, 0)
      ```
    - Note: `totalXP` may be `0` for older records — fall back to the heuristic for those to avoid regression
  - [x] 5.4 Edit `features/dashboard/data/getRecentUserActivity.data.ts`
    - Add `import { GITHUB_XP_MULTIPLIER } from '@/features/github/constants/xp'` at the top
    - Extend the `userSkill` select to add `githubValidated: true` and `totalXP: true`:
      ```typescript
      select: {
        id: true,
        skill: { select: { name: true } },
        aiValidated: true,
        githubValidated: true,
        totalXP: true,
        createdAt: true,
        updatedAt: true,
      },
      ```
    - Update the skill events mapping (line 93–98) to:
      ```typescript
      const skillEvents: ActivityEvent[] = userSkills.map((userSkill) => {
        const isGitHub = userSkill.githubValidated;
        const isAI = userSkill.aiValidated;
        const baseXP = userSkill.totalXP > 0 ? userSkill.totalXP : (isAI ? 150 : 50);
        const effectiveXP = isGitHub ? Math.round(baseXP * GITHUB_XP_MULTIPLIER) : baseXP;
        return {
          id: userSkill.id,
          title: userSkill.skill.name,
          xp: effectiveXP,
          type: isGitHub ? 'skill_github' : (isAI ? 'skill_ai' : 'skill_manual'),
          timestamp: userSkill.updatedAt,
        };
      });
      ```
    - Note: `ActivityEvent.type` in `features/dashboard/types/dashboard.ts` must also be updated to include `'skill_github'` — add it to the union type in that file
  - [x] 5.5 Edit `features/dashboard/types/dashboard.ts` — extend the `ActivityEvent` type union
    - Find the `type` field in `ActivityEvent` and add `'skill_github'` to the union alongside `'skill_ai'` and `'skill_manual'`
  - [x] 5.6 Run the 3 tests written in 5.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/xpMultiplier.test.ts --no-coverage`

**Acceptance Criteria:**
- All 3 tests written in 5.1 pass
- All three data files now import `GITHUB_XP_MULTIPLIER` from a single source
- `getUserDashboardStats` applies the multiplier when `githubValidated: true`
- `getTopRunners` applies the multiplier per-skill with a fallback for zero `totalXP`
- `getRecentUserActivity` produces `type: 'skill_github'` events with boosted XP
- `ActivityEvent.type` union includes `'skill_github'`

---

### Frontend Components

#### Task Group 6: New `searching` AIEye State in CRTWithAI
**Dependencies:** None (additive change to existing component — can run in parallel with TG5)

- [x] 6.0 Extend `features/tech/components/crt-with-ai.tsx` with the `searching` AIState
  - [x] 6.1 Write 2 focused tests
    - Test that when `searchingTrigger` prop changes, the component enters the `"searching"` state (use React Testing Library, mock `setAIState`)
    - Test that `"searching"` is NOT in `TRANSIENT_STATES` (verify it does not auto-return after a timer)
    - File: `features/github/__tests__/crtWithAI.searching.test.tsx`
  - [x] 6.2 Add `"searching"` to the `AIState` union type (line 13) in `crt-with-ai.tsx`
    - New union:
      ```typescript
      type AIState =
        | "sleeping" | "waking" | "drowsy" | "awake"
        | "listening" | "thinking" | "ready" | "success"
        | "xp_gain" | "life_loss"
        | "searching"
      ```
    - `"searching"` is NOT added to `TRANSIENT_STATES` — it is sustained and parent-driven
  - [x] 6.3 Add `searchingTrigger?: number` prop to `CRTWithAIProps` interface (after `lifeLossTrigger`)
    - JSDoc: "Increment this counter to trigger the sustained `searching` eye state. The parent component (GitHubSyncPanel) drives the return transition by firing `xpGainTrigger` or `lifeLossTrigger` after the action resolves."
  - [x] 6.4 Add `isSearching` flag in `AIEye` function (alongside `isXPGain`, `isLifeLoss`)
    - `const isSearching = state === "searching"`
  - [x] 6.5 Add `searching` branch to the `mainColor` switch expression in `AIEye` (before the default cyan)
    - Insert after `isLifeLoss` branch:
      ```typescript
      : isSearching
          ? "hsl(38,100%,55%)"   // amber/orange — external data wait
      ```
    - The amber color communicates "waiting for external data" distinct from `thinking`'s magenta
  - [x] 6.6 Add `searching` visual elements to the `AIEye` SVG render
    - Add `isSearching` to the left-right scanning pupil effect: when `isSearching`, set `basePupilX` to animate `Math.sin(Date.now() / 500) * 5` (use a `useEffect` with `setInterval` similar to `listenOrbit` — add `searchOrbit` state)
    - Add a wider dashed orbit ring rendered when `isSearching`:
      ```tsx
      {isSearching && (
        <motion.circle
          cx="50" cy="50" r="38" fill="none" stroke={mainColor} strokeWidth="0.8"
          strokeDasharray="6 12"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50% 50%' }}
        />
      )}
      ```
    - Note: `r=38` is wider than `thinking`'s `r=33` as specified
  - [x] 6.7 Add `"searching"` to all color-switch expressions in the `CRTWithAI` main component body
    - `borderColor` switch: add `aiState === "searching"` to the amber branch (group with no existing state; create a new branch returning `"hsl(38,100%,55%,0.2)"`)
    - Status dot `className` switch (line 705–709): add `aiState === "searching"` → use an amber class `bg-[hsl(38,100%,55%)] shadow-[hsl(38,100%,55%)]`
    - Status label color style (line 827–833): add `aiState === "searching"` → `"hsl(38,100%,55%)"`
  - [x] 6.8 Add `searchingTrigger` `useEffect` to the `CRTWithAI` main component (after the `lifeLossTrigger` effect)
    - Pattern mirrors `xpGainTrigger` effect but does NOT auto-return:
      ```typescript
      useEffect(() => {
        if (!searchingTrigger) return;
        setAIState("searching");
        // No auto-return timer — GitHubSyncPanel drives the return via xpGainTrigger / lifeLossTrigger
      }, [searchingTrigger]);
      ```
  - [x] 6.9 Add `searching` to the `autonomousTimer` exclusion list in the mouse-move handler (line 599)
    - Change `["sleeping", "thinking", "listening", "success", "drowsy"]` to include `"searching"` so the eye does not switch to autonomous scanning during a sync
  - [x] 6.10 Run the 2 tests written in 6.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/crtWithAI.searching.test.tsx --no-coverage`

**Acceptance Criteria:**
- Both tests written in 6.1 pass
- `"searching"` appears in the `AIState` union and is exported
- `searchingTrigger` prop is accepted and wired to `setAIState("searching")`
- Amber color `hsl(38,100%,55%)` is used consistently in all color switches
- The wider `r=38` dashed orbit ring renders only during `searching` state
- `"searching"` state does not auto-return (no timer in the effect)

---

#### Task Group 7: SkillHexagonNode Visual Extensions
**Dependencies:** TG1 (schema must expose `githubValidated` on `UserSkill`)

- [ ] 7.0 Extend `features/skills/components/SkillHexagonNode.tsx` with GitHub and dual-validation visuals
  - [ ] 7.1 Write 3 focused tests
    - Test: given `userSkill.githubValidated = true, userSkill.aiValidated = false`, the rendered SVG has `drop-shadow(0 0 10px #22C55E)` in the `filter` style (render with React Testing Library)
    - Test: given both `aiValidated = true` AND `githubValidated = true`, the rendered SVG has `drop-shadow(0 0 12px #FFD700)` and the gold pulsing ring `motion.div` is present
    - Test: the `aria-label` includes `"AI & GitHub Verified"` when both flags are true
    - File: `features/github/__tests__/SkillHexagonNode.github.test.tsx`
  - [ ] 7.2 Extend the validation state block in `SkillHexagonNodeComponent` (after line 62 — `isAIValidated` declaration)
    - Add:
      ```typescript
      const isGithubValidated = userSkill?.githubValidated === true;
      const isAIOnly = isAIValidated && !isGithubValidated;
      const isGithubOnly = isGithubValidated && !isAIValidated;
      const isBothValidated = isAIValidated && isGithubValidated;
      ```
  - [ ] 7.3 Update the `svgFilter` string (lines 85–87) to handle all three new compound states
    - Replace the current two-branch conditional with a four-branch:
      ```typescript
      const svgFilter = isBothValidated
        ? `drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 6px #FFA500)`   // gold dual-validated
        : isGithubOnly
          ? `drop-shadow(0 0 10px #22C55E) drop-shadow(0 0 5px #16A34A)` // green github-only
          : isAIOnly
            ? `drop-shadow(0 0 10px #D946EF) drop-shadow(0 0 5px #00D4FF)` // magenta/cyan ai-only
            : baseLevelFilter;
      ```
  - [ ] 7.4 Add the GitHub `⬡` mark SVG text element (in the SVG, after the existing AI `★` mark block)
    - Render when `isGithubValidated` is true:
      ```tsx
      {isGithubValidated && (
        <text
          x="8"
          y="10"
          fontSize="8"
          fill={isBothValidated ? "#FFD700" : "#22C55E"}
          opacity="0.9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          ⬡
        </text>
      )}
      ```
    - Position `x="8", y="10"` places it at top-left, distinct from the AI `★` at `x="42", y="10"` (top-right)
    - When `isBothValidated`, the `⬡` renders in gold `#FFD700` to unify the dual-validation aesthetic
  - [ ] 7.5 Add the gold dual-validated pulsing ring `motion.div` (after the existing L4/L5 pulsing ring block, around line 270)
    - Render only when `isBothValidated && !isEmpty`:
      ```tsx
      {isBothValidated && !isEmpty && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '1px solid #FFD700' }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      ```
  - [ ] 7.6 Update the `ariaLabel` string (line 94–96) to reflect the validation state
    - Replace the current two-branch label with:
      ```typescript
      const ariaLabel = isEmpty
        ? `Add ${suggestedSkillName ?? 'new'} skill`
        : isBothValidated
          ? `${skillName} - Level ${level} ${visualStyle.name} - AI & GitHub Verified`
          : isGithubValidated
            ? `${skillName} - Level ${level} ${visualStyle.name} - GitHub Verified`
            : isAIValidated
              ? `${skillName} - Level ${level} ${visualStyle.name} - AI Verified`
              : `${skillName} - Level ${level} ${visualStyle.name}`;
      ```
  - [ ] 7.7 Run the 3 tests written in 7.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/SkillHexagonNode.github.test.tsx --no-coverage`

**Acceptance Criteria:**
- All 3 tests written in 7.1 pass
- GitHub-only state shows green `#22C55E` drop-shadow and `⬡` mark at top-left
- Dual-validated state shows gold `#FFD700` drop-shadow, gold `⬡`, magenta `★`, and gold pulsing ring
- `aria-label` accurately reflects the validation state
- No existing visuals are broken (AI-only state is unchanged from original)

---

#### Task Group 8: GitHubSyncPanel Component
**Dependencies:** TG3 (action), TG6 (searching state props shape), TG4 (messages)

- [ ] 8.0 Create `features/github/components/GitHubSyncPanel.tsx`
  - [ ] 8.1 Write 3 focused tests
    - Test: when `githubSyncedAt` is `null`, the panel renders the "Expansion Module" pre-connection state with `[EXPANSION_MODULE]: github_validator.exe` label visible
    - Test: when `githubSyncedAt` is a `Date` and `githubStats` has data, the panel renders the post-connection "Sync Status Panel" with `SKILLS_VALIDATED: {count}` visible
    - Test: when the "Re-Sync" button is clicked, `onSearchingStateChange(true)` is called immediately (mock the server action)
    - File: `features/github/__tests__/GitHubSyncPanel.test.tsx`
  - [ ] 8.2 Create `features/github/components/GitHubSyncPanel.tsx`
    - `'use client'` directive at top
    - Import `GitHubSyncPanelProps` from `../types/github`
    - Import `syncGitHubAction` from `../actions/syncGitHub.action`
    - Import `useTransition`, `useState` from `react`
    - Import `toast` from `sonner`
    - Import `Button` from `@/features/shadcn/ui/button`
    - Import `GITHUB_MESSAGES` from `../constants/messages`
    - **Pre-connection state** (when `githubSyncedAt === null`):
      ```tsx
      <div className="border border-[hsl(174,100%,50%,0.3)] bg-[hsl(200,30%,8%)] p-4 relative">
        {/* Angular corner accent — top-left */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(174,100%,50%,0.6)]" />
        {/* Angular corner accent — bottom-right */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(174,100%,50%,0.6)]" />
        <div className="text-[9px] font-mono text-[hsl(174,100%,50%,0.6)] uppercase tracking-widest mb-3">
          [EXPANSION_MODULE]: github_validator.exe
        </div>
        <p className="text-xs font-mono text-muted-foreground mb-4">
          Conecta tu cuenta de GitHub para validar tus habilidades con datos reales de repositorios.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnectGitHub}
          className="font-mono text-xs border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)]"
        >
          Conectar GitHub
        </Button>
      </div>
      ```
    - `handleConnectGitHub`: call Better Auth client `connectSocialAccount({ provider: 'github' })` or redirect to the GitHub OAuth URL — check the Better Auth client API in `lib/auth-client.ts` for the correct method. If Better Auth exposes a `signIn.social` method for connecting, use that with a redirect back to `/dashboard/skills`.
    - **Post-connection state** (when `githubSyncedAt` is not null):
      - Display `Last Data Upload:` with `githubSyncedAt.toLocaleString()` in `font-mono text-xs text-[hsl(174,100%,50%)]`
      - Stats row (4 items in a grid):
        - `REPOS_ANALYZED` (display as `N/A` for v1 — not stored), `SKILLS_VALIDATED: {githubStats?.validatedSkillsCount ?? 0}`, `STARS_TOTAL: {githubStats?.stars ?? 0}`, `COMMITS_TOTAL: {githubStats?.totalCommits ?? 0}`
      - Privacy notice:
        ```tsx
        <p className="text-[9px] font-mono text-muted-foreground/50 mt-3">
          [SYS_MESSAGE]: Analizando repositorios privados... Datos procesados de forma anónima. No se almacenarán nombres ni código fuente.
        </p>
        ```
      - Re-Sync button using `useTransition`:
        ```typescript
        const [isPending, startTransition] = useTransition();
        const handleResync = () => {
          onSearchingStateChange?.(true);
          startTransition(async () => {
            const result = await syncGitHubAction();
            onSearchingStateChange?.(false);
            if (result.success) {
              onXPGainTrigger?.();
              toast.success(GITHUB_MESSAGES.SYNC_SUCCESS);
            } else {
              onLifeLossTrigger?.();
              if (result.error?.includes('GITHUB_AUTH_ERROR')) {
                setShowReauthModal(true); // TG10 integration
              } else {
                toast.error(GITHUB_MESSAGES.SYNC_ERROR);
              }
            }
          });
        };
        ```
    - Add `useState<boolean>` for `showReauthModal` (used by TG10 `GitHubReauthModal`)
    - Render `<GitHubReauthModal isOpen={showReauthModal} onClose={() => setShowReauthModal(false)} />` at the bottom (import from TG10 once complete; use a conditional placeholder for now)
  - [ ] 8.3 Create `features/github/components/index.ts` barrel export
    - Export `GitHubSyncPanel` from `./GitHubSyncPanel`
  - [ ] 8.4 Run the 3 tests written in 8.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/GitHubSyncPanel.test.tsx --no-coverage`

**Acceptance Criteria:**
- All 3 tests written in 8.1 pass
- Pre-connection state renders the expansion module with angular Tech Mode borders and a connect CTA
- Post-connection state renders last sync timestamp, stats grid, privacy notice, and Re-Sync button
- Re-Sync button calls `onSearchingStateChange(true)` before the action, and `onSearchingStateChange(false)` after
- On success: fires `onXPGainTrigger()` and shows success toast
- On error: fires `onLifeLossTrigger()` and shows error toast or reauth modal

---

#### Task Group 10: Re-authorization Modal
**Dependencies:** TG8 (GitHubSyncPanel owns modal state), TG6 (life_loss trigger)

- [ ] 10.0 Create `features/github/components/GitHubReauthModal.tsx`
  - [ ] 10.1 Write 2 focused tests
    - Test: when `isOpen` is `true`, the modal renders with the message "Enlace perdido con la base de datos de GitHub. Reautoriza para continuar."
    - Test: when `isOpen` is `false`, the modal is not visible (Dialog is closed)
    - File: `features/github/__tests__/GitHubReauthModal.test.tsx`
  - [ ] 10.2 Create `features/github/components/GitHubReauthModal.tsx`
    - `'use client'` directive
    - Props: `{ isOpen: boolean; onClose: () => void }`
    - Use shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@/features/shadcn/ui/dialog`
    - Import `Button` from `@/features/shadcn/ui/button`
    - Modal content:
      ```tsx
      <DialogContent className="bg-[hsl(200,30%,8%)] border border-[hsl(0,80%,55%,0.4)] font-mono">
        <DialogHeader>
          <DialogTitle className="text-[hsl(0,80%,55%)] text-sm font-mono uppercase tracking-wider">
            [ERROR]: GitHub Auth Failure
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enlace perdido con la base de datos de GitHub. Reautoriza para continuar.
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleReconnect}
            className="flex-1 font-mono text-xs bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] hover:bg-[hsl(174,100%,60%)]"
          >
            Reconectar GitHub
          </Button>
          <Button variant="outline" onClick={onClose} className="font-mono text-xs">
            Cancelar
          </Button>
        </div>
      </DialogContent>
      ```
    - `handleReconnect`: trigger Better Auth GitHub reconnect (same method as `GitHubSyncPanel.handleConnectGitHub`), then call `onClose()`
  - [ ] 10.3 Update `features/github/components/index.ts` to also export `GitHubReauthModal`
  - [ ] 10.4 Update `features/github/components/GitHubSyncPanel.tsx` — replace the placeholder with the real import
    - Add `import { GitHubReauthModal } from './GitHubReauthModal'` and uncomment the render
  - [ ] 10.5 Run the 2 tests written in 10.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/GitHubReauthModal.test.tsx --no-coverage`

**Acceptance Criteria:**
- Both tests written in 10.1 pass
- Modal is visible only when `isOpen === true`
- Modal uses red/error color scheme (`hsl(0,80%,55%)`) for the border and title
- "Reconectar GitHub" button triggers the OAuth reconnect flow and closes the modal
- `GitHubSyncPanel` correctly imports and renders the modal

---

#### Task Group 9: DashboardSkillsView and Portfolio Integration
**Dependencies:** TG3, TG6, TG7, TG8, TG10 (all frontend components must be complete)

- [ ] 9.0 Wire everything together in the dashboard skills page and extend the public portfolio
  - [ ] 9.1 Write 3 focused tests
    - Test: `DashboardSkillsView` renders the `GitHubSyncPanel` when it receives `githubSyncedAt` and `githubStats` props
    - Test: `TechSkills` renders a `⬡ GitHub Verified` badge when at least one `userSkill.githubValidated === true`
    - Test: `TechSkills` renders a `✦ Elite Verified` badge when at least one skill has both `aiValidated` and `githubValidated` true
    - File: `features/github/__tests__/integration.skills.test.tsx`
  - [ ] 9.2 Edit `app/[locale]/(dashboard)/dashboard/skills/page.tsx`
    - Extend the `prisma.user.findUnique` select to include `githubSyncedAt` and `githubStats`:
      ```typescript
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        portfolioMode: true,
        githubSyncedAt: true,
        githubStats: true,
      },
      ```
    - Pass the new fields to `DashboardSkillsView`:
      ```tsx
      <DashboardSkillsView
        ...
        githubSyncedAt={dbUser?.githubSyncedAt ?? null}
        githubStats={(dbUser?.githubStats as GitHubStats | null) ?? null}
      />
      ```
    - Import `GitHubStats` type from `@/features/github/types/github`
  - [ ] 9.3 Edit `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`
    - Extend `DashboardSkillsViewProps` interface to add:
      ```typescript
      githubSyncedAt: Date | null;
      githubStats: GitHubStats | null;
      ```
    - Import `GitHubStats` from `@/features/github/types/github`
    - Import `GitHubSyncPanel` from `@/features/github/components`
    - Import `CRTWithAI` from `@/features/tech`  (check current import path — may already be imported)
    - Add state for the trigger counters and searching state in the component body:
      ```typescript
      const [xpGainTrigger, setXpGainTrigger] = useState(0);
      const [lifeLossTrigger, setLifeLossTrigger] = useState(0);
      const [searchingTrigger, setSearchingTrigger] = useState(0);
      ```
    - Insert `<GitHubSyncPanel>` as a new section between the Legend Row and the `<section>` wrapping `<SkillTreeView>`:
      ```tsx
      {/* GitHub Expansion Module / Sync Status Panel */}
      <div className="px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)]">
        <GitHubSyncPanel
          githubSyncedAt={githubSyncedAt}
          githubStats={githubStats}
          onSearchingStateChange={(active) => {
            if (active) setSearchingTrigger(c => c + 1);
          }}
          onXPGainTrigger={() => setXpGainTrigger(c => c + 1)}
          onLifeLossTrigger={() => setLifeLossTrigger(c => c + 1)}
        />
      </div>
      ```
    - Find the `CRTWithAI` usage in the file (if present in the sidebar or layout) and add the three trigger props:
      - `xpGainTrigger={xpGainTrigger}`
      - `lifeLossTrigger={lifeLossTrigger}`
      - `searchingTrigger={searchingTrigger}`
    - Note: if `CRTWithAI` is not currently rendered in `DashboardSkillsView` but in a parent layout, the trigger state must be lifted to the appropriate level — inspect `app/[locale]/(dashboard)/layout.tsx` and adjust accordingly
  - [ ] 9.4 Edit `features/portfolio/components/tech/TechSkills.tsx`
    - The `userSkills` data must include `githubValidated` — verify the portfolio data query includes it (see 9.5)
    - Replace the current badge legend block with:
      ```tsx
      {(userSkills.some(s => s.aiValidated) || userSkills.some(s => s.githubValidated)) && (
        <div className="flex items-center gap-3 mb-4 px-2 flex-wrap">
          {userSkills.some(s => s.aiValidated) && (
            <TechBadge color="magenta">★ AI Verified</TechBadge>
          )}
          {userSkills.some(s => s.githubValidated) && (
            <TechBadge color="green">⬡ GitHub Verified</TechBadge>
          )}
          {userSkills.some(s => s.aiValidated && s.githubValidated) && (
            <TechBadge color="yellow">✦ Elite Verified</TechBadge>
          )}
          {userSkills.some(s => !s.aiValidated) && (
            <TechBadge color="gray">Self-Assessed</TechBadge>
          )}
        </div>
      )}
      ```
    - Note: `TechBadge` must accept `color="green"` and `color="yellow"` — check `features/tech/components/` for the `TechBadge` component and add those variants if missing
  - [ ] 9.5 Verify the portfolio data query includes `githubValidated` in `userSkills` select
    - Find the data fetching function used by `TechSkills` (search for `PortfolioSectionProps` usage — likely in `features/portfolio/data/` or the portfolio page)
    - Ensure `githubValidated: true` is in the `userSkills` Prisma select so `SkillHexagonNode` and `TechSkills` receive the field
  - [ ] 9.6 Run the 3 tests written in 9.1 and confirm they pass
    - Command: `npx jest features/github/__tests__/integration.skills.test.tsx --no-coverage`

**Acceptance Criteria:**
- All 3 tests written in 9.1 pass
- `page.tsx` selects and passes `githubSyncedAt` and `githubStats` down to `DashboardSkillsView`
- `GitHubSyncPanel` renders in the dashboard between the legend and the skill tree
- `CRTWithAI` receives the three trigger props wired to the panel's callbacks
- `TechSkills` renders the GitHub and Elite Verified badges conditionally based on actual data
- Portfolio data query includes `githubValidated` in the skills select

---

### Testing

#### Task Group 11: Test Review and Gap Analysis
**Dependencies:** TG4, TG1, TG2, TG3, TG5, TG6, TG7, TG8, TG10, TG9 (all task groups complete)

- [ ] 11.0 Review all feature-specific tests and fill critical gaps only
  - [ ] 11.1 Review all tests written across TG4, TG1, TG2, TG3, TG5, TG6, TG7, TG8, TG10, TG9
    - TG4 wrote 2 tests (constants correctness)
    - TG1 wrote 3 tests (schema fields exist)
    - TG2 wrote 4 tests (GitHub API layer)
    - TG3 wrote 4 tests (service skill matching + action auth)
    - TG5 wrote 3 tests (XP multiplier in all three data files)
    - TG6 wrote 2 tests (searching state)
    - TG7 wrote 3 tests (SkillHexagonNode visuals)
    - TG8 wrote 3 tests (GitHubSyncPanel states)
    - TG10 wrote 2 tests (ReauthModal)
    - TG9 wrote 3 tests (integration — DashboardSkillsView + TechSkills)
    - Total existing tests: **29 tests**
  - [ ] 11.2 Identify critical gaps for THIS feature only
    - Primary gap candidate: end-to-end sync flow — the transition from `searching` → `xp_gain` via trigger props (wiring between panel and CRT)
    - Primary gap candidate: the 60% threshold boundary condition (exactly 60% validates, 59.9% does not)
    - Primary gap candidate: `getGitHubToken` returning `null` at the action level (currently tested at service level, add an action-level check)
    - Skip: accessibility, performance, edge cases on all 19 language entries, rate limiting behavior
  - [ ] 11.3 Write up to 5 additional strategic tests maximum to fill the critical gaps
    - Test the 60% threshold boundary: 60% validates, 59% does not (unit test of the service's threshold logic)
    - Test the `onSearchingStateChange → xpGainTrigger` wiring in `DashboardSkillsView` (React Testing Library)
    - Test that `syncGitHubAction` returns `{ success: false }` payload (not a thrown error) when the service throws `GitHubAuthError`
    - File: `features/github/__tests__/integration.critical.test.ts`
    - Maximum 3 additional tests (critical gaps do not warrant the full 5-test allowance)
  - [ ] 11.4 Run all feature-specific tests
    - Command: `npx jest features/github/ --no-coverage`
    - Expected: approximately 32 total tests (29 from TG1–TG9 + 3 gap tests)
    - Do NOT run the entire application test suite
    - All 32 tests must pass

**Acceptance Criteria:**
- All approximately 32 feature-specific tests pass
- The 60% threshold boundary is verified
- The `searchingTrigger → xpGainTrigger` wiring is tested
- `GitHubAuthError` is handled at the action level without an unhandled exception
- No more than 5 additional tests added in this phase

---

## Execution Order

Recommended implementation sequence (dependencies respected):

1. **TG4** — Constants (no dependencies; unblocks TG3, TG5, TG8)
2. **TG1** — Prisma Schema (run in parallel with TG4; run `prisma generate` at end; unblocks TG2, TG5, TG7)
3. **TG2** — GitHub API Layer (depends on TG1 for `Account` Prisma model; unblocks TG3)
4. **TG3** — Sync Service + Action (depends on TG1, TG2, TG4)
5. **TG5** — XP Multiplier in Data Layer (depends on TG1 + TG4; can run in parallel with TG2 and TG3)
6. **TG6** — AIEye `searching` State (depends on nothing new; can run in parallel with TG5)
7. **TG7** — SkillHexagonNode Visuals (depends on TG1 for `githubValidated`; can run in parallel with TG6)
8. **TG8** — GitHubSyncPanel Component (depends on TG3 for the action + TG6 for prop shapes)
9. **TG10** — ReauthModal (depends on TG8 for its parent panel; small task — do immediately after TG8)
10. **TG9** — Dashboard + Portfolio Integration (depends on all prior TGs)
11. **TG11** — Test Review and Gap Analysis (depends on all TGs complete)

## File Map

All new files created by this spec:

```
features/github/
  __tests__/
    constants.test.ts              (TG4)
    schema.test.ts                 (TG1)
    github.api.test.ts             (TG2)
    syncGitHub.service.test.ts     (TG3)
    xpMultiplier.test.ts           (TG5)
    crtWithAI.searching.test.tsx   (TG6)
    SkillHexagonNode.github.test.tsx (TG7)
    GitHubSyncPanel.test.tsx       (TG8)
    GitHubReauthModal.test.tsx     (TG10)
    integration.skills.test.tsx    (TG9)
    integration.critical.test.ts   (TG11)
  api/
    github.api.ts                  (TG2)
    index.ts                       (TG2)
  actions/
    syncGitHub.action.ts           (TG3)
    index.ts                       (TG3)
  components/
    GitHubSyncPanel.tsx            (TG8)
    GitHubReauthModal.tsx          (TG10)
    index.ts                       (TG8 + TG10)
  constants/
    github-mappings.ts             (TG4)
    xp.ts                          (TG4)
    messages.ts                    (TG4)
    index.ts                       (TG4)
  data/
    getGitHubToken.data.ts         (TG2)
  schemas/
    syncGitHub.schema.ts           (TG3)
  services/
    syncGitHub.service.ts          (TG3)
  types/
    github.ts                      (TG3)
  index.ts                         (TG3)
```

All modified files:

```
prisma/schema.prisma                                           (TG1)
features/skills/types/skill.ts                                 (TG1)
features/dashboard/data/getUserDashboardStats.data.ts          (TG5)
features/dashboard/data/getTopRunners.data.ts                  (TG5)
features/dashboard/data/getRecentUserActivity.data.ts          (TG5)
features/dashboard/types/dashboard.ts                          (TG5)
features/tech/components/crt-with-ai.tsx                       (TG6)
features/skills/components/SkillHexagonNode.tsx                (TG7)
app/[locale]/(dashboard)/dashboard/skills/page.tsx             (TG9)
app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx (TG9)
features/portfolio/components/tech/TechSkills.tsx              (TG9)
```
