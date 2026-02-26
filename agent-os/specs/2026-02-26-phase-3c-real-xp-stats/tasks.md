# Task Breakdown: Phase 3C — Real XP & Stats

## Overview

Replace all hardcoded mock stats in the Tech Mode dashboard with real computed values derived from the user's experiences, projects, and AI-validated skills stored in the database. This requires a Prisma schema change, a new data function, a new streak utility, modifications to 6 existing action files, and a single dashboard page wiring update.

Total Task Groups: 4
No tests are written for this spec (consistent with existing codebase pattern for dashboard and page-level features).

---

## Task List

### Task Group 1: Prisma Schema — New Fields

**Dependencies:** None

- [x] 1.0 Add new scalar fields to `prisma/schema.prisma` and regenerate the Prisma client
  - [x] 1.1 Open `prisma/schema.prisma` and locate the `User` model (currently at line 23)
    - Add `lastStreakDate   DateTime?` as a new field inside the `User` model, after the `updatedAt` field and before the relations block
    - Add `currentStreak   Int      @default(0)` directly below `lastStreakDate`
    - Do not add indexes or change any other field
  - [x] 1.2 Locate the `UserSkill` model in `prisma/schema.prisma` (currently at line 218)
    - Add `aiValidated   Boolean  @default(false)` after the `level` field and before `createdAt`
    - Do not add indexes or change any other field
  - [x] 1.3 Run `npx prisma generate` from the project root to regenerate the Prisma client
    - Note: this is a MongoDB (schemaless) project — no migration file is created; `prisma db push` is not required unless explicitly instructed by the team; `prisma generate` is sufficient to update the TypeScript client
    - Verify the command exits without errors
  - [x] 1.4 Confirm the three new fields appear in the generated Prisma client types by checking that TypeScript does not error on `user.currentStreak`, `user.lastStreakDate`, and `userSkill.aiValidated` in any file that already imports from `@prisma/client` or `@/app/generated/prisma`

**Acceptance Criteria:**
- `prisma/schema.prisma` has `lastStreakDate DateTime?` and `currentStreak Int @default(0)` inside the `User` model
- `prisma/schema.prisma` has `aiValidated Boolean @default(false)` inside the `UserSkill` model
- `npx prisma generate` completes without errors
- No other models, indexes, or relations are modified

---

### Task Group 2: Data Layer — New Files

**Dependencies:** Task Group 1 (Prisma client must have the new fields generated)

These two sub-tasks (2A and 2B) are independent of each other and can be implemented in any order.

#### 2A: `DashboardStats` type

- [ ] 2A.0 Add the `DashboardStats` interface to the existing types file
  - [ ] 2A.1 Open `features/dashboard/types/dashboard.ts`
    - Append the following interface at the end of the file, after the `ActivityItem` interface
    - Preserve all existing interfaces (`DashboardUser`, `DashboardHeaderProps`, `UserMenuProps`, `ProtectedLayoutProps`, `DashboardPageProps`, `UserStats`, `Achievement`, `ActivityItem`) unchanged
    - The new interface:
      ```ts
      /**
       * Computed real stats for the Tech Mode dashboard.
       * Returned by getUserDashboardStats and passed to DashboardRow1 and HexStatGrid.
       */
      export interface DashboardStats {
        totalXP: number
        level: number
        xpToNextLevel: number
        currentLevelXP: number
        nextLevelXP: number
        experiencesCount: number
        achievements: { current: number; total: number }
        currentStreak: number
      }
      ```

**Acceptance Criteria:**
- `DashboardStats` is exported from `features/dashboard/types/dashboard.ts`
- All pre-existing interfaces in the file remain unchanged

#### 2B: `getUserDashboardStats` data function

- [ ] 2B.0 Create the directory `features/dashboard/data/` and create the file `features/dashboard/data/getUserDashboardStats.data.ts`
  - [ ] 2B.1 Add the file header comment block following the existing pattern in `features/timeline/data/getExperiences.data.ts`
  - [ ] 2B.2 Add imports at the top of the file:
    - `import { prisma } from '@/lib/prisma';`
    - `import { unstable_cache } from 'next/cache';`
    - `import { calculateMonthsDuration } from '@/features/skills/constants/xp';`
    - `import type { DashboardStats } from '@/features/dashboard/types/dashboard';`
  - [ ] 2B.3 Define the following local constants inside the file (module-level, before the function):
    ```ts
    const PROJECT_XP = {
      COMPLETED: 300,
      IN_PROGRESS: 100,
      ARCHIVED: 50,
    } as const;
    ```
  - [ ] 2B.4 Implement the inner async function `fetchDashboardStats(userId: string): Promise<DashboardStats>` with the following logic:
    - Fetch user data via a single `prisma.user.findUniqueOrThrow` call using `where: { id: userId }`
    - Use `select` to retrieve: `bio`, `image`, `username`, `currentStreak`, `experiences` (include all, select `startDate` and `endDate` only), `projects` (include all, select `status` only), `userSkills` (filtered via `where: { aiValidated: true }`, select `totalXP` only)
    - Check AI Survivor achievement via `_count: { select: { conversations: true } }` on the same `prisma.user.findUniqueOrThrow` call (use `include` or nest `_count` inside `select` — whichever Prisma supports for the field; `conversations` is a relation already on the `User` model)
    - Compute XP values:
      - `experienceXPs`: for each experience, `Math.max(1, calculateMonthsDuration(exp.startDate, exp.endDate ?? null)) * 10`
      - `projectXPs`: for each project, look up `PROJECT_XP[project.status]` (default `0` if status is unrecognised)
      - `skillXPs`: for each AI-validated skill, use `skill.totalXP` directly
      - `totalXP = sum of all three arrays`
    - Compute level values:
      - `level = Math.floor(Math.sqrt(totalXP / 100))`
      - `currentLevelXP = level * level * 100`
      - `nextLevelXP = (level + 1) * (level + 1) * 100`
      - `xpToNextLevel = nextLevelXP - totalXP`
    - Compute achievements:
      - `check1 = user.bio != null && user.image != null && user.username != null`
      - `check2 = user.userSkills.length > 0` (the query already filters to `aiValidated: true`, so any result here means at least one validated skill)
      - `check3 = user._count.conversations > 0`
      - `achievementsCurrent = [check1, check2, check3].filter(Boolean).length`
    - Return object of type `DashboardStats` with all fields populated
  - [ ] 2B.5 Wrap `fetchDashboardStats` with `unstable_cache` and export the wrapped function as `getUserDashboardStats`:
    ```ts
    export const getUserDashboardStats = (userId: string): Promise<DashboardStats> =>
      unstable_cache(
        fetchDashboardStats,
        ['user-dashboard-stats', userId],
        { tags: [`user-stats-${userId}`] }
      )(userId);
    ```
    - Do NOT set a `revalidate` number — rely solely on tag-based invalidation

**Acceptance Criteria:**
- `features/dashboard/data/getUserDashboardStats.data.ts` exists and exports `getUserDashboardStats`
- The function accepts a `userId: string` and returns `Promise<DashboardStats>`
- A single Prisma call fetches experiences, projects, AI-validated skills, and conversation count
- `calculateMonthsDuration` from `features/skills/constants/xp` is used for experience XP — `calculateDurationXP` is NOT used
- The stored `experience.xp` field is NOT used in any XP computation
- Cache is tagged with `` `user-stats-${userId}` `` and has no time-based revalidation

#### 2C: `updateStreak` utility

- [ ] 2C.0 Create the directory `features/dashboard/utils/` and create the file `features/dashboard/utils/updateStreak.ts`
  - [ ] 2C.1 Add imports:
    - `import { prisma } from '@/lib/prisma';`
    - `import { revalidateTag } from 'next/cache';`
  - [ ] 2C.2 Implement and export `async function updateStreak(userId: string): Promise<void>` with the following logic:
    - Fetch `user.lastStreakDate` and `user.currentStreak` via `prisma.user.findUnique({ where: { id: userId }, select: { lastStreakDate: true, currentStreak: true } })`
    - If the user is not found, return early without throwing
    - Compute `today`: `new Date()` with hours, minutes, seconds, and milliseconds zeroed to midnight UTC — use `new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')`
    - Compute `yesterday`: subtract 1 day from `today` — use `new Date(today.getTime() - 86400000)`
    - Determine new streak value:
      - If `lastStreakDate` is `null` OR `lastStreakDate` is before `yesterday` (i.e., older than yesterday): `newStreak = 1`
      - If `lastStreakDate` is exactly equal to `yesterday` (same UTC date): `newStreak = user.currentStreak + 1`
      - If `lastStreakDate` is `today` or in the future: return early (idempotent — no update needed)
    - Compare dates by their UTC date string (`.toISOString().split('T')[0]`) to avoid time-of-day mismatches
    - Update via `prisma.user.update({ where: { id: userId }, data: { currentStreak: newStreak, lastStreakDate: today } })`
    - After the update, call `revalidateTag(\`user-stats-${userId}\`)`

**Acceptance Criteria:**
- `features/dashboard/utils/updateStreak.ts` exists and exports `updateStreak`
- Calling it when `lastStreakDate` is null sets `currentStreak` to 1
- Calling it twice in the same UTC day is idempotent (second call returns early)
- Calling it the next calendar day increments `currentStreak` by 1
- Calling it after a gap of 2+ days resets `currentStreak` to 1
- After any DB update, `` revalidateTag(`user-stats-${userId}`) `` is called

---

### Task Group 3: Action Hooks — Cache Invalidation and Streak

**Dependencies:** Task Group 2 (specifically `updateStreak` from 2C and `revalidateTag` availability)

Modify 6 existing server action files. Each modification follows the identical pattern — apply it to each file listed below.

**Pattern to apply to each action file:**

1. Add `revalidateTag` to the existing `next/cache` import:
   - Before: `import { revalidatePath } from 'next/cache';`
   - After: `import { revalidatePath, revalidateTag } from 'next/cache';`
2. Add the `updateStreak` import below the other imports:
   - `import { updateStreak } from '@/features/dashboard/utils/updateStreak';`
3. Inside the `actionWrapper` callback, after the existing `revalidatePath(...)` call(s) and before the `return` statement, add:
   ```ts
   revalidateTag(`user-stats-${session.user.id}`);
   try {
     await updateStreak(session.user.id);
   } catch {
     // Streak update failure must never block the primary action
   }
   ```
   Note: `session.user.id` is already in scope in every target file from the existing `auth.api.getSession` call.

**Files to modify:**

- [ ] 3.1 Apply the pattern to `features/timeline/actions/createExperience.ts`
- [ ] 3.2 Apply the pattern to `features/timeline/actions/updateExperience.ts`
- [ ] 3.3 Apply the pattern to `features/projects/actions/createProject.ts`
- [ ] 3.4 Apply the pattern to `features/projects/actions/updateProject.ts`
- [ ] 3.5 Apply the pattern to `features/skills/actions/createSkill.ts`
- [ ] 3.6 Apply the pattern to `features/skills/actions/updateSkill.ts`

**Acceptance Criteria:**
- All 6 action files import both `revalidatePath` and `revalidateTag` from `'next/cache'`
- All 6 action files import `updateStreak` from `'@/features/dashboard/utils/updateStreak'`
- `revalidateTag` is called with `` `user-stats-${session.user.id}` `` in each action
- `updateStreak` is called inside a `try/catch` that silently discards errors in each action
- The primary action return value is unaffected if `updateStreak` throws
- No other logic in any of the 6 files is changed

---

### Task Group 4: Dashboard Page Wiring

**Dependencies:** Task Group 2 (specifically `getUserDashboardStats` from 2B and `DashboardStats` type from 2A)

- [ ] 4.0 Replace mock stats with real data in `app/[locale]/(protected)/dashboard/page.tsx`
  - [ ] 4.1 Add the import for `getUserDashboardStats` near the top of the file, after the existing feature imports:
    ```ts
    import { getUserDashboardStats } from '@/features/dashboard/data/getUserDashboardStats.data';
    ```
  - [ ] 4.2 In the `DashboardPage` function body, after the `dbUser` query and after `userData`/`displayName`/`initials` are resolved, replace the mock `userStats` block entirely:
    - Remove the entire `const userStats = { currentXP: 1900, maxXP: 2450, ... }` block (lines 83–91 in the current file)
    - Replace it with:
      ```ts
      const stats = await getUserDashboardStats(user.id);
      ```
  - [ ] 4.3 Update the `DashboardRow1` props to use `stats` instead of `userStats`:
    - `level={stats.level}`
    - `currentXP={stats.totalXP}`
    - `maxXP={stats.nextLevelXP}`
    - `streakDays={stats.currentStreak}`
  - [ ] 4.4 Update the `streak` translation call inside `DashboardRow1`'s `translations` prop:
    - Before: `streak: tWelcome('streak', { count: userStats.streakDays })`
    - After: `streak: tWelcome('streak', { count: stats.currentStreak })`
  - [ ] 4.5 Update the `xpToLevel` translation call inside `DashboardRow1`'s `translations` prop:
    - Before: `xpToLevel: tWelcome('xpToLevel', { xp: userStats.maxXP - userStats.currentXP, level: userStats.level + 1 })`
    - After: `xpToLevel: tWelcome('xpToLevel', { xp: stats.xpToNextLevel, level: stats.level + 1 })`
  - [ ] 4.6 Update the `HexStatGrid` props to use `stats`:
    - `stats.xp.current={stats.totalXP}`
    - `stats.xp.max={stats.nextLevelXP}`
    - `stats.level={stats.level}`
    - `stats.experiences={stats.experiencesCount}`
    - `stats.achievements={ current: stats.achievements.current, total: stats.achievements.total }`
    - `streakDays={stats.currentStreak}`
  - [ ] 4.7 Verify the existing `prisma.user.findUnique` call (for `portfolioMode`, `name`, `email`, `image`) remains unchanged — do NOT merge it into `getUserDashboardStats`
  - [ ] 4.8 Verify no import of `userStats` or any mock stat constant remains in the file

**Acceptance Criteria:**
- The `userStats` mock object is fully removed from `app/[locale]/(protected)/dashboard/page.tsx`
- `getUserDashboardStats(user.id)` is called and its return value (`stats`) is used throughout the page
- `DashboardRow1` receives level, XP, and streak from `stats`
- `HexStatGrid` receives level, XP, experiences count, achievements, and streak from `stats`
- The `xpToLevel` translation receives `stats.xpToNextLevel` (not `maxXP - currentXP`)
- No visual or layout changes are made to the page
- `ActiveMissionsPanel`, `SYS_LOG`, `SkillRadarPanel`, `TopRunnersPanel`, `QuickActionsBar`, and `ActivityHeatmap` are NOT touched
- `WelcomeCard`, `HexStatGrid`, and `DashboardRow1` component files are NOT modified — only their prop values in the page change

---

## Execution Order

The groups must be implemented in this sequence due to dependencies:

1. **Task Group 1** — Prisma schema fields + `prisma generate`
2. **Task Group 2** — Data layer files (2A type, 2B data function, 2C streak utility); all three sub-groups can be worked concurrently once TG1 is done
3. **Task Group 3** — Action hooks (depends on 2C being done)
4. **Task Group 4** — Dashboard page wiring (depends on 2A and 2B being done)

## Key Implementation Notes for the Implementer

- Import `prisma` from `'@/lib/prisma'` (not `@prisma/client` directly and not `@/features/core`)
- Do NOT use `calculateDurationXP` from `features/skills/constants/xp` — use `calculateMonthsDuration` and multiply by 10 manually
- Do NOT use the stored `experience.xp` field for global XP totals
- The `aiValidated` filter on `userSkills` is applied inside the Prisma query (`where: { aiValidated: true }`) — do not filter in JavaScript after fetching all skills
- `unstable_cache` wraps the inner function; the exported function calls the cached version passing `userId` as argument
- `updateStreak` errors must be silently swallowed in every action — streak failure must never surface to the user
- No tests are required for this spec
