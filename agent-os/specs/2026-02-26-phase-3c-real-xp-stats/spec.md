# Specification: Phase 3C — Real XP & Stats

## Goal

Replace all hardcoded mock stats in the Tech Mode dashboard with real computed values derived from the user's experiences, projects, and AI-validated skills stored in the database.

## User Stories

- As a Tech Mode user, I want my dashboard XP, level, and streak to reflect my real portfolio activity so that progress feels meaningful and motivating.
- As a Tech Mode user, I want my achievement count to update as I complete real milestones so I can track genuine portfolio completeness.

## Specific Requirements

**Prisma schema: add streak fields to User model**
- Add `lastStreakDate DateTime?` to the `User` model in `prisma/schema.prisma`
- Add `currentStreak Int @default(0)` to the `User` model in `prisma/schema.prisma`
- No new collections or join tables are needed; these are scalar fields on the existing `users` collection
- Run `npx prisma generate` after schema change — no migration file needed (MongoDB is schemaless)

**Prisma schema: add aiValidated field to UserSkill model**
- Add `aiValidated Boolean @default(false)` to the `UserSkill` model in `prisma/schema.prisma`
- This field gates whether a skill's `totalXP` contributes to the global dashboard total
- Default `false` means existing skills contribute 0 XP until AI-validated (intentional design: incentivizes Phase 4 AI assessment)
- Run `npx prisma generate` after schema change

**New data function: `getUserDashboardStats`**
- Create file `features/dashboard/data/getUserDashboardStats.data.ts`
- Function signature: `async function getUserDashboardStats(userId: string): Promise<DashboardStats>`
- Single Prisma call using `prisma.user.findUniqueOrThrow` with `include` for `experiences`, `projects`, and `userSkills` (filtered to `aiValidated: true` only via `where` on the nested include)
- Also select `user.currentStreak`, `user.bio`, `user.image`, `user.username` for achievement computation
- XP per experience: `Math.max(1, months) * 10` where months comes from reusing `calculateMonthsDuration(startDate, endDate)` imported from `features/skills/constants/xp.ts`; use `endDate ?? null` (null means current/ongoing, function handles it by using today)
- XP per project: `COMPLETED = 300`, `IN_PROGRESS = 100`, `ARCHIVED = 50`; define these as local constants inside the file
- XP per skill: only `aiValidated === true` skills; use `userSkill.totalXP` value directly
- `totalXP = sum(experienceXPs) + sum(projectXPs) + sum(skillXPs)`
- `level = Math.floor(Math.sqrt(totalXP / 100))`
- `currentLevelXP = level * level * 100` (XP at start of current level)
- `nextLevelXP = (level + 1) * (level + 1) * 100` (XP at start of next level)
- `xpToNextLevel = nextLevelXP - totalXP`
- Return type `DashboardStats` defined in `features/dashboard/types/dashboard.ts` (add alongside existing types)

**DashboardStats type**
- Add `DashboardStats` interface to `features/dashboard/types/dashboard.ts`:
  - `totalXP: number`
  - `level: number`
  - `xpToNextLevel: number`
  - `currentLevelXP: number`
  - `nextLevelXP: number`
  - `experiencesCount: number`
  - `achievements: { current: number; total: number }`
  - `currentStreak: number`

**Achievement computation (inside `getUserDashboardStats`)**
- Compute 3 boolean milestone checks inline — no DB writes, no new model:
  - Achievement 1 "Profile Complete": `user.bio != null && user.image != null && user.username != null`
  - Achievement 2 "First AI-Validated Skill": `userSkills.some(s => s.aiValidated === true)`
  - Achievement 3 "AI Survivor": at least 1 `Conversation` record exists for the user (check via `prisma.conversation.count({ where: { userId } })` in the same function or via `_count` in the include)
- `achievements.current = [check1, check2, check3].filter(Boolean).length`
- `achievements.total = 3` (fixed constant)

**Caching with `unstable_cache`**
- Wrap the inner Prisma logic of `getUserDashboardStats` with `unstable_cache` from `next/cache`
- Cache key array: `['user-dashboard-stats', userId]`
- Tags array: `[\`user-stats-${userId}\`]`
- Revalidation time: do not set `revalidate` (rely on tag-based invalidation only)
- The exported function calls the cached inner function, passing `userId` as argument

**Streak update utility**
- Create `features/dashboard/utils/updateStreak.ts`
- Export `async function updateStreak(userId: string): Promise<void>`
- Logic: fetch `user.lastStreakDate` and `user.currentStreak` via `prisma.user.findUnique`
- Compute `today` as a date with time zeroed (`new Date()` normalized to midnight UTC)
- If `lastStreakDate` is null or older than yesterday: set `currentStreak = 1`
- If `lastStreakDate` is exactly yesterday: set `currentStreak = currentStreak + 1`
- If `lastStreakDate` is today: no update (idempotent, return early)
- Update via `prisma.user.update({ where: { id: userId }, data: { currentStreak, lastStreakDate: today } })`
- After updating, call `revalidateTag(\`user-stats-${userId}\`)` from `next/cache`

**Revalidate cache tag in content-mutation actions**
- Modify these 4 existing action files to add `revalidateTag(\`user-stats-${userId}\`)` and call `updateStreak(userId)` after the existing `revalidatePath` call:
  - `features/timeline/actions/createExperience.ts`
  - `features/timeline/actions/updateExperience.ts`
  - `features/projects/actions/createProject.ts`
  - `features/projects/actions/updateProject.ts`
- Modify these 2 skill action files similarly:
  - `features/skills/actions/createSkill.ts`
  - `features/skills/actions/updateSkill.ts`
- Import `revalidateTag` from `next/cache` and `updateStreak` from `features/dashboard/utils/updateStreak`
- `userId` is already available in each action from `session.user.id`

**Dashboard page wiring**
- Modify `app/[locale]/(protected)/dashboard/page.tsx`
- Replace the `userStats` mock object with a call to `getUserDashboardStats(user.id)`
- The returned `DashboardStats` maps to component props as follows:
  - `DashboardRow1`: `level={stats.level}`, `currentXP={stats.totalXP}`, `maxXP={stats.nextLevelXP}`, `streakDays={stats.currentStreak}`
  - `HexStatGrid`: `stats.xp.current={stats.totalXP}`, `stats.xp.max={stats.nextLevelXP}`, `stats.level={stats.level}`, `stats.experiences={stats.experiencesCount}`, `stats.achievements={stats.achievements}`, `streakDays={stats.currentStreak}`
  - The `xpToLevel` translation string: pass `xp: stats.xpToNextLevel` and `level: stats.level + 1`
- Remove the import-or-inline `userStats` constant entirely
- The existing `prisma.user.findUnique` call in the page (for `portfolioMode`, `name`, `email`, `image`) remains as-is — it is a different, lightweight query; do not merge it into `getUserDashboardStats`

**No layout or visual changes**
- `WelcomeCard`, `HexStatGrid`, `DashboardRow1` components are NOT modified — only their prop values change
- `ActiveMissionsPanel` and `SYS_LOG` section remain fully hardcoded (out of scope)

## Visual Design

No visual assets provided. Reference the existing `WelcomeCard` and `HexStatGrid` components as the visual baseline — data wiring only, no UI changes.

## Existing Code to Leverage

**`features/skills/constants/xp.ts` — `calculateMonthsDuration`**
- Already handles `endDate = null` as "today", returns month count as integer
- Import and call directly inside `getUserDashboardStats` for experience XP calculation
- Do NOT use `calculateDurationXP` from the same file — that function returns tiered bracket values (100/250/500/750), not the linear 10 XP/month formula required by this spec

**`features/timeline/data/getExperiences.data.ts` — data layer pattern**
- Follow the same structure: `prisma` imported from `@/lib/prisma`, plain async function, typed return value
- `getUserDashboardStats` lives in a new `features/dashboard/data/` folder following this same convention

**`features/core/actions/actionWrapper.ts` — action error handling**
- All content-mutation actions already use `actionWrapper`; the `updateStreak` call and `revalidateTag` call go inside the `actionWrapper` callback, after the service call but before the return statement
- Errors thrown by `updateStreak` should not propagate to the user — wrap the `updateStreak(userId)` call in a `try/catch` that silently discards errors (streak failure must never block the primary action)

**`features/projects/actions/createProject.ts` and `features/timeline/actions/createExperience.ts` — existing action pattern**
- Both already import `revalidatePath` from `next/cache`; add `revalidateTag` as a named import alongside it: `import { revalidatePath, revalidateTag } from 'next/cache'`
- The `userId` is already in scope from `session.user.id`

**`features/dashboard/types/dashboard.ts` — existing types file**
- `DashboardStats` interface is appended to this file; existing interfaces (`DashboardUser`, `DashboardPageProps`, `UserStats`, etc.) are preserved unchanged

## Out of Scope

- XP streak multiplier (1.2x XP bonus from streak) — Phase 4
- AI life recharge acceleration from streak — Phase 4
- Full achievement system with unlock events, badge records, or notifications — Phase 5
- Dynamic AI-powered missions in `ActiveMissionsPanel` — Phase 5
- GitHub activity as XP source — Phase 3A
- XP for testimonials or gallery items — future
- Classic Mode portfolio stats dashboard — separate feature
- Any changes to `ActiveMissionsPanel`, `SYS_LOG`, `SkillRadarPanel`, or `TopRunnersPanel` components
- Displaying `currentLevelXP` or a two-threshold progress bar in `WelcomeCard` — the existing bar uses `currentXP / maxXP`; pass `totalXP` as `currentXP` and `nextLevelXP` as `maxXP` to preserve the existing bar behaviour
