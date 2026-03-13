# Spec 4E: Quest System — Tasks

**Spec:** `agent-os/product/specs/4E-quest-system/SPEC.md`
**Branch:** `feat/phase4-ai-portfolio-os`

---

## Task Group 1: Types

Define all TypeScript types for the quest system. No logic, no DB, just types.

- [x] **TG1: Create `features/quests/types/quest.ts`**
  - Export `QuestCategory` union: `"portfolio_completion" | "skill_validation" | "content_improvement" | "consistency" | "exploration"`
  - Export `QuestDifficulty` union: `"easy" | "medium" | "hard"`
  - Export `QuestType` union: `"daily" | "weekly" | "one_time"`
  - Export `QuestStatus` union: `"ACTIVE" | "COMPLETED" | "EXPIRED"`
  - Export `QuestTemplate` interface: `{ id, category, title: { en, es }, description: { en, es }, xpReward, difficulty, type, condition }`
  - Export `ActiveQuest` interface: `{ userQuestId, templateId, category, title, description, xpReward, difficulty, type, status, assignedAt, expiresAt, completedAt, conditionMet }` — note `title` and `description` are already locale-resolved strings (not `{ en, es }`)
  - Export `UserPortfolioSnapshot` interface: `{ hasBio, skillCount, projectCount, experienceCount, hasGitHub, hasPassedAssessment, cvCount, currentStreak, githubSyncedAt }`
  - Export `UserQuestRecord` interface: DB shape for `UserQuest` model: `{ id, userId, questId, status, xpAwarded, assignedAt, completedAt, expiresAt }`

**Acceptance:** File compiles with no errors. All types match SPEC.md Section 1 exactly.

---

## Task Group 2: Prisma Schema

Add the `UserQuest` model and wire the relation.

- [x] **TG2-A: Add `QuestStatus` enum and `UserQuest` model to `prisma/schema.prisma`**
  - Add `enum QuestStatus { ACTIVE COMPLETED EXPIRED }` (must be a Prisma enum, not a string)
  - Add `model UserQuest` with fields:
    - `id String @id @default(cuid()) @map("_id")`
    - `userId String`
    - `questId String` — stores the `QuestTemplate.id` string (e.g. `"add_bio"`)
    - `status QuestStatus @default(ACTIVE)`
    - `xpAwarded Int @default(0)`
    - `assignedAt DateTime @default(now())`
    - `completedAt DateTime?`
    - `expiresAt DateTime?` — null for `one_time` quests
    - `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    - `@@index([userId, status])`
    - `@@index([userId, questId])`
    - `@@map("user_quests")`
  - Add `userQuests UserQuest[]` to the `User` model (after `cvDocuments CVDocument[]`)

- [x] **TG2-B: Run Prisma generate**
  - Run `npx prisma generate`
  - Do NOT run `prisma db push` — the user handles database migrations separately
  - Confirm the generated client includes `prisma.userQuest` operations

**Acceptance:** `npx prisma generate` completes with no errors. `prisma.userQuest.findMany` is available in the generated client.

---

## Task Group 3: Quest Pool

Define the static quest templates. This is a constant file — no DB, no async.

- [x] **TG3: Create `features/quests/constants/questPool.ts`**
  - Import `QuestTemplate` from `../types/quest`
  - Export `QUEST_POOL: QuestTemplate[]` — an array of exactly 15 templates:

  | id | type | category | xpReward | difficulty | condition |
  |----|------|----------|----------|------------|-----------|
  | `add_bio` | `one_time` | `portfolio_completion` | 100 | `easy` | `has_bio` |
  | `add_5_skills` | `one_time` | `portfolio_completion` | 150 | `medium` | `has_5_skills` |
  | `add_project` | `one_time` | `portfolio_completion` | 100 | `easy` | `has_project` |
  | `add_3_projects` | `one_time` | `portfolio_completion` | 200 | `medium` | `has_3_projects` |
  | `add_experience` | `one_time` | `portfolio_completion` | 100 | `easy` | `has_experience` |
  | `connect_github` | `one_time` | `skill_validation` | 200 | `medium` | `has_github` |
  | `take_assessment` | `one_time` | `skill_validation` | 300 | `hard` | `has_passed_assessment` |
  | `improve_bio` | `daily` | `content_improvement` | 50 | `easy` | `bio_improved_today` |
  | `improve_project_desc` | `daily` | `content_improvement` | 50 | `easy` | `project_desc_improved_today` |
  | `visit_cv_page` | `daily` | `exploration` | 50 | `easy` | `visited_cv_today` |
  | `generate_cv` | `weekly` | `portfolio_completion` | 200 | `medium` | `generated_cv_this_week` |
  | `github_sync` | `weekly` | `skill_validation` | 150 | `medium` | `synced_github_this_week` |
  | `login_streak_3` | `one_time` | `consistency` | 100 | `easy` | `streak_3` |
  | `login_streak_7` | `one_time` | `consistency` | 200 | `medium` | `streak_7` |
  | `complete_portfolio` | `one_time` | `portfolio_completion` | 300 | `hard` | `portfolio_80_percent` |

  - Include bilingual `title` and `description` for each template. Examples:
    - `add_bio`: title `{ en: "Write your bio", es: "Escribe tu bio" }`, description `{ en: "Add a professional bio to your profile.", es: "Agrega una bio profesional a tu perfil." }`
    - `connect_github`: title `{ en: "Connect GitHub", es: "Conecta GitHub" }`, description `{ en: "Link your GitHub account to validate skills.", es: "Vincula tu cuenta de GitHub para validar skills." }`
    - Use the pattern above for all 15 — write sensible copy for each
  - Export `getTemplateById(id: string): QuestTemplate | undefined` helper
  - Export `DAILY_TEMPLATES: QuestTemplate[]` — filtered subset (type === 'daily')
  - Export `WEEKLY_TEMPLATES: QuestTemplate[]` — filtered subset (type === 'weekly')
  - Export `ONE_TIME_TEMPLATES: QuestTemplate[]` — filtered subset (type === 'one_time')

**Acceptance:** All 15 templates exist. `getTemplateById('add_bio')` returns the correct template. TypeScript compiles without errors.

---

## Task Group 4: Data Layer

Three data functions for DB access. Follow the pattern in `features/dashboard/data/getUserDashboardStats.data.ts` — import `prisma` from `@/lib/prisma`, no caching, plain async functions.

- [x] **TG4-A: Create `features/quests/data/getUserQuests.data.ts`**
  - Import `prisma` from `@/lib/prisma`
  - Import `UserQuestRecord` from `../types/quest`
  - Export `getActiveUserQuests(userId: string): Promise<UserQuestRecord[]>`
    - Query: `prisma.userQuest.findMany({ where: { userId, status: 'ACTIVE' }, orderBy: { assignedAt: 'asc' } })`
  - Export `getRecentCompletedQuests(userId: string, days: number): Promise<UserQuestRecord[]>`
    - Query: completed quests where `completedAt >= new Date(Date.now() - days * 86400000)`
    - Used by the engine to avoid re-assigning recently completed quests
  - Export `bulkExpireQuests(questIds: string[]): Promise<void>`
    - `prisma.userQuest.updateMany({ where: { id: { in: questIds } }, data: { status: 'EXPIRED' } })`
  - Export `createUserQuest(userId, questId, type, expiresAt): Promise<UserQuestRecord>`
    - `prisma.userQuest.create(...)` with the provided fields
  - Export `completeUserQuestById(userQuestId: string, xpAwarded: number): Promise<UserQuestRecord>`
    - `prisma.userQuest.update({ where: { id: userQuestId }, data: { status: 'COMPLETED', completedAt: new Date(), xpAwarded } })`

- [x] **TG4-B: Create `features/quests/data/getPortfolioSnapshot.data.ts`**
  - Import `prisma` from `@/lib/prisma`
  - Import `UserPortfolioSnapshot` from `../types/quest`
  - Export `getPortfolioSnapshot(userId: string): Promise<UserPortfolioSnapshot>`
  - Single Prisma query with `select`:
    ```typescript
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        bio: true,
        currentStreak: true,
        githubSyncedAt: true,
        _count: {
          select: {
            userSkills: true,
            projects: true,
            experiences: true,
            cvDocuments: true,
            accounts: { where: { providerId: 'github' } },
          },
        },
        skillAssessments: {
          where: { status: 'PASSED' },
          select: { id: true },
          take: 1,
        },
      },
    })
    ```
  - Map to `UserPortfolioSnapshot`:
    - `hasBio`: `user.bio != null && user.bio.trim().length > 0`
    - `skillCount`: `user._count.userSkills`
    - `projectCount`: `user._count.projects`
    - `experienceCount`: `user._count.experiences`
    - `hasGitHub`: `user._count.accounts > 0`
    - `hasPassedAssessment`: `user.skillAssessments.length > 0`
    - `cvCount`: `user._count.cvDocuments`
    - `currentStreak`: `user.currentStreak`
    - `githubSyncedAt`: `user.githubSyncedAt ?? null`

**Acceptance:** Both files import cleanly. `getPortfolioSnapshot` returns a correctly typed `UserPortfolioSnapshot` with no TypeScript errors.

---

## Task Group 5: Quest Engine Service

The core logic. No AI, no external calls — pure deterministic computation.

- [x] **TG5: Create `features/quests/services/questEngine.service.ts`**
  - Imports: `prisma` from `@/lib/prisma`, data functions from `../data/getUserQuests.data`, pool constants from `../constants/questPool`, types from `../types/quest`
  - Export `checkCondition(condition: string, snapshot: UserPortfolioSnapshot, recentCompleted: UserQuestRecord[]): boolean`
    - Pure function. Maps condition strings to snapshot checks:
      - `has_bio` → `snapshot.hasBio`
      - `has_5_skills` → `snapshot.skillCount >= 5`
      - `has_project` → `snapshot.projectCount >= 1`
      - `has_3_projects` → `snapshot.projectCount >= 3`
      - `has_experience` → `snapshot.experienceCount >= 1`
      - `has_github` → `snapshot.hasGitHub`
      - `has_passed_assessment` → `snapshot.hasPassedAssessment`
      - `bio_improved_today` → check `recentCompleted` for `questId === 'improve_bio'` with `completedAt` within last 24h
      - `project_desc_improved_today` → same pattern for `questId === 'improve_project_desc'`
      - `visited_cv_today` → same for `questId === 'visit_cv_page'`
      - `generated_cv_this_week` → `snapshot.cvCount >= 1` OR `questId === 'generate_cv'` in `recentCompleted` within 7 days
      - `synced_github_this_week` → `snapshot.githubSyncedAt` within last 7 days OR `questId === 'github_sync'` in `recentCompleted`
      - `streak_3` → `snapshot.currentStreak >= 3`
      - `streak_7` → `snapshot.currentStreak >= 7`
      - `portfolio_80_percent` → compute inline: `hasBio(20) + skillCount>=5(20) + projectCount>=1(20) + experienceCount>=1(20) + hasGitHub(10) + hasPassedAssessment(10) >= 80`
      - Any unknown condition → `false`
  - Export `getNextDailyMidnightUTC(): Date` — helper that returns the next UTC midnight
  - Export `getNextMondayMidnightUTC(): Date` — helper that returns the next Monday at UTC midnight
  - Export `getOrGenerateQuests(userId: string, snapshot: UserPortfolioSnapshot, locale: string): Promise<ActiveQuest[]>`
    - Step 1: Fetch all `ACTIVE` user quests
    - Step 2: Identify expired ones (`expiresAt != null && expiresAt < new Date()`), call `bulkExpireQuests`
    - Step 3: Reload active quests (post-expiry)
    - Step 4: Fetch recent completed quests (last 7 days)
    - Step 5: For each active quest, call `checkCondition` to compute `conditionMet`
    - Step 6: Count daily slots remaining (target 3), weekly slot (target 1)
    - Step 7: Fill daily slots: filter `QUEST_POOL` for templates not already active and not completed in last 24h (for `daily`) or never completed (for `one_time`). Pick those with `conditionMet === false` first. Deterministic shuffle: sort by `md5(userId + today's ISO date string + template.id)` (use a simple string sort as determinism, no crypto needed — just `sort()` on a concatenated key). Take up to `slotsNeeded`.
    - Step 8: Fill weekly slot similarly from `WEEKLY_TEMPLATES`
    - Step 9: `createUserQuest` for each new template, with appropriate `expiresAt`
    - Step 10: Reload and return all active quests as `ActiveQuest[]`, resolving template titles/descriptions by `locale`
  - Helper `toActiveQuest(record: UserQuestRecord, template: QuestTemplate, conditionMet: boolean, locale: string): ActiveQuest` — merges DB record with template data, resolves locale strings

**Acceptance:** Given a user with no portfolio data, `getOrGenerateQuests` assigns 3 daily quests + 1 weekly quest. Given a user who already has a bio, the `add_bio` quest is either not assigned or auto-completes. Daily quests have `expiresAt` set to the next UTC midnight.

---

## Task Group 6: Complete Quest Service

The service that marks a quest done and awards XP.

- [x] **TG6: Create `features/quests/services/completeQuest.service.ts`**
  - Imports: data functions from `../data/getUserQuests.data`, pool helpers from `../constants/questPool`, `revalidateTag` from `next/cache`
  - Export `completeQuestService(userId: string, questId: string): Promise<{ xpAwarded: number } | null>`
    - Find `UserQuest` where `{ userId, questId, status: 'ACTIVE' }`:
      ```typescript
      const record = await prisma.userQuest.findFirst({
        where: { userId, questId, status: 'ACTIVE' },
      })
      ```
    - If not found: return `null` (silent no-op — quest not assigned or already done)
    - Look up template via `getTemplateById(questId)` — if template not found, throw `Error('Unknown quest template')`
    - Call `completeUserQuestById(record.id, template.xpReward)`
    - Call `revalidateTag(`user-stats-${userId}`)` to invalidate the XP cache
    - Return `{ xpAwarded: template.xpReward }`
  - Note: No XP is stored on the `User` model. XP is computed at read time in `getUserDashboardStats`. The `xpAwarded` field on `UserQuest` is summed in TG9.

**Acceptance:** Calling `completeQuestService(userId, 'add_bio')` when the user has an active `add_bio` quest: marks it COMPLETED, sets `xpAwarded = 100`, invalidates stats cache, returns `{ xpAwarded: 100 }`. Calling it again returns `null` (no-op, record is now COMPLETED not ACTIVE).

---

## Task Group 7: Server Actions

Two server actions. Follow the `actionWrapper` pattern from `features/core/actions/actionWrapper.ts`.

- [x] **TG7-A: Create `features/quests/actions/getQuestsAction.ts`**
  - `'use server'`
  - Imports: `auth` from `@/lib/auth`, `headers` from `next/headers`, `actionWrapper` from `@/features/core/actions/actionWrapper`, `getPortfolioSnapshot` from `../data/getPortfolioSnapshot.data`, `getOrGenerateQuests` from `../services/questEngine.service`, `ActiveQuest` from `../types/quest`
  - Export `getQuestsAction(locale?: string): Promise<ActionResponse<ActiveQuest[]>>`
    - Uses `actionWrapper<ActiveQuest[]>`
    - Auth check: `auth.api.getSession({ headers: await headers() })` — if no session, throw `Error('Unauthorized')`
    - Fetch snapshot: `getPortfolioSnapshot(userId)`
    - Call `getOrGenerateQuests(userId, snapshot, locale ?? 'en')`
    - Return `{ payload: quests, message: 'Quests loaded' }`

- [x] **TG7-B: Create `features/quests/actions/completeQuestAction.ts`**
  - `'use server'`
  - Imports: `auth`, `headers`, `actionWrapper`, `completeQuestService`
  - Export `completeQuestAction(questId: string): Promise<ActionResponse<{ xpAwarded: number } | null>>`
    - Uses `actionWrapper`
    - Auth check
    - Call `completeQuestService(userId, questId)`
    - Return `{ payload: result, message: result ? `+${result.xpAwarded} XP earned` : 'Quest already completed' }`
  - Note: This action is intentionally permissive — it does NOT re-verify the condition before completing. Verification is at the UI level (button is only shown when `conditionMet === true`). For triggered completions (e.g., from syncGitHub), the service-level check (ACTIVE record lookup) is the guard.

**Acceptance:** `getQuestsAction()` returns an `ActionResponse<ActiveQuest[]>` with `hasError: false`. `completeQuestAction('add_bio')` returns `{ hasError: false, payload: { xpAwarded: 100 } }` if the quest was active, or `{ hasError: false, payload: null }` if already done.

---

## Task Group 8: XP Integration

Update `getUserDashboardStats` to include quest XP in the total.

- [x] **TG8: Update `features/dashboard/data/getUserDashboardStats.data.ts`**
  - In the `prisma.user.findUniqueOrThrow` query inside `fetchDashboardStats`, add to the `select`:
    ```typescript
    userQuests: {
      where: { status: 'COMPLETED' },
      select: { xpAwarded: true },
    },
    ```
  - After the existing XP computations, add:
    ```typescript
    const questXPs = user.userQuests.reduce((sum, q) => sum + q.xpAwarded, 0)
    ```
  - Add `questXPs` to the `totalXP` sum:
    ```typescript
    const totalXP =
      experienceXPs.reduce(...) +
      projectXPs.reduce(...) +
      skillXPs.reduce(...) +
      questXPs
    ```
  - No other changes to the file — the cache invalidation pattern via `revalidateTag` is already in place

**Acceptance:** After a quest is completed (XP awarded), the dashboard HexStatGrid shows an increased XP value on next page load. `npx tsc --noEmit` passes with no new errors.

---

## Task Group 9: UI Components

Build the three components that replace the existing `ActiveMissionsPanel`. Keep the exact outer visual style of the current hardcoded panel.

- [x] **TG9-A: Create `features/quests/components/QuestCard.tsx`**
  - `"use client"`
  - Props: `quest: ActiveQuest`, `onComplete: (userQuestId: string) => void`, `completing: boolean`
  - Import `cn` from `@/lib/utils`, `ActiveQuest` from `../types/quest`
  - Difficulty color map: `easy → hsl(150,100%,45%)`, `medium → hsl(52,100%,50%)`, `hard → hsl(314,85%,64%)`
  - Status color: `ACTIVE → hsl(174,100%,50%)`, `COMPLETED → hsl(150,100%,45%)`, `EXPIRED → hsl(220,13%,50%)`
  - Layout (matches existing panel mission style):
    - Diamond SVG indicator with status color fill (filled if COMPLETED, outline if ACTIVE)
    - Quest title in `text-[10px] font-mono` — strikethrough if COMPLETED
    - XP badge: `+{xpReward} XP` in status color, `text-[10px] font-bold font-mono`
    - Difficulty dot: `w-1.5 h-1.5 rounded-full` with difficulty color
    - "CLAIM" button (shown only when `status === 'ACTIVE' && conditionMet === true`): `text-[9px] font-mono uppercase px-2 py-0.5 border` with cyan border, calls `onComplete(quest.userQuestId)`, disabled when `completing`
    - Status label: `COMPLETADO` / `EXPIRADO` / `EN PROGRESO` in `text-[8px] font-mono text-muted-foreground/50`
  - No progress bar (conditions are binary)

- [x] **TG9-B: Create `features/quests/components/WeeklyQuestCard.tsx`**
  - Same structure as `QuestCard` but with gold `#EAB308` as the primary accent color
  - Add expiry label: `EXPIRES ${expiresAt?.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}` in `text-[8px] font-mono text-[#EAB308]/50`
  - Slightly more padding: `p-3` instead of `p-2`

- [x] **TG9-C: Create `features/quests/components/ActiveMissionsPanel.tsx`**
  - `"use client"`
  - Imports: `useState`, `useTransition` from React; `cn` from `@/lib/utils`; `QuestCard`; `WeeklyQuestCard`; `completeQuestAction` from `../actions/completeQuestAction`; `getQuestsAction` from `../actions/getQuestsAction`; `toast` from `sonner`; `ActiveQuest` from `../types/quest`
  - Props: `quests: ActiveQuest[]`, `className?: string`, `locale?: string`
  - State: `localQuests` (initialized from props), `isPending` from `useTransition`
  - Handler `handleComplete(userQuestId: string)`:
    - Find quest in `localQuests`, get its `templateId` (= `questId`)
    - Call `completeQuestAction(templateId)` inside `startTransition`
    - On success: `toast.success(`+${result.payload?.xpAwarded} XP earned!`)`, update `localQuests` state to mark that quest as COMPLETED
    - On error: `toast.error('Failed to claim quest')`
  - Handler `handleRefresh()`:
    - Call `getQuestsAction(locale)` inside `startTransition`
    - On success: update `localQuests` state with new quest list
  - Separate `dailyQuests = localQuests.filter(q => q.type !== 'weekly')` and `weeklyQuest = localQuests.find(q => q.type === 'weekly')`
  - Outer styling matches the current hardcoded panel exactly:
    - `border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,6%)] flex flex-col overflow-hidden`
  - Header: identical to current panel — hex SVG icon + `"ACTIVE_MISSIONS"` label + pending count + refresh button (↻ icon, calls `handleRefresh`, disabled when `isPending`)
  - Body: `flex-1 overflow-y-auto p-3 space-y-3` — render up to 3 `QuestCard` components
  - Weekly divider: `text-[8px] font-mono uppercase text-[#EAB308]/50` separator between daily and weekly
  - Weekly quest: `WeeklyQuestCard` (render only if `weeklyQuest` exists)
  - Empty state (all daily quests COMPLETED): `text-[9px] font-mono text-muted-foreground/50 text-center` — "All missions complete for today"
  - Footer: identical to current panel — `> MISSION_TRACKER --live`

**Acceptance:** `ActiveMissionsPanel` renders without errors when given an array of `ActiveQuest`. The "CLAIM" button is visible only for quests where `conditionMet === true && status === 'ACTIVE'`. The refresh button triggers a quest reload. Styling is visually consistent with the existing dashboard panels.

---

## Task Group 10: Barrel Update + Old Component Replacement

Wire the new component into the existing import path so `dashboard/page.tsx` needs no import change.

- [x] **TG10-A: Update `features/tech/index.tsx`**
  - Replace the existing export line:
    ```typescript
    export { ActiveMissionsPanel } from './components/active-missions-panel'
    ```
    with:
    ```typescript
    export { ActiveMissionsPanel } from '@/features/quests/components/ActiveMissionsPanel'
    ```
  - The old file `features/tech/components/active-missions-panel.tsx` can be left in place or deleted — if deleted, confirm no other file imports it directly

- [x] **TG10-B: Update `app/[locale]/(dashboard)/dashboard/page.tsx`**
  - Import `getQuestsAction` from `@/features/quests/actions/getQuestsAction`
  - Add `getQuestsAction` to the parallel `Promise.all` fetch:
    ```typescript
    const [pageData, runners, questsResponse] = await Promise.all([
      getDashboardPageData(user.id),
      getTopRunners(user.id),
      getQuestsAction(locale),
    ])
    ```
  - Pass quests to `ActiveMissionsPanel`:
    ```typescript
    <ActiveMissionsPanel
      quests={questsResponse.hasError ? [] : (questsResponse.payload ?? [])}
      locale={locale}
      className="flex-1 min-h-[140px]"
    />
    ```
  - The `ActiveMissionsPanel` import from `@/features/tech` remains unchanged (barrel handles redirection)

**Acceptance:** The dashboard page compiles and loads. The `ActiveMissionsPanel` receives real quest data. No TypeScript errors.

---

## Task Group 11: XP Stats Integration + GitHub Sync Hook

- [x] **TG11-A: Hook quest completion into `syncGitHub.action.ts`**
  - File: `features/github/actions/syncGitHub.action.ts`
  - After the line `revalidateTag(`user-stats-${userId}`)`, add:
    ```typescript
    // Award quest XP for GitHub sync — fire-and-forget, don't block sync result
    void completeQuestAction('github_sync')
    ```
  - Import `completeQuestAction` from `@/features/quests/actions/completeQuestAction`
  - Use `void` to avoid blocking the sync action response. If the quest wasn't assigned, `completeQuestService` silently returns `null`.
  - Do NOT add `await` — quest completion is a side effect, not a requirement for sync success

- [x] **TG11-B: Update AI page prompt for dashboard**
  - File: `features/ai/constants/pagePrompts.ts`
  - Update the `dashboard` entry `en` value to:
    ```
    "User is on their main dashboard. They have active daily and weekly quests in the Active Missions panel. Reference quests proactively — suggest completing the ones where the condition is already met (e.g., 'You have a quest to add your bio, which you haven't done yet'). Help them understand how to complete each quest and earn XP."
    ```
  - Update the `es` value similarly:
    ```
    "El usuario esta en su dashboard principal. Tiene misiones diarias y semanales activas en el panel de Misiones Activas. Referencia las misiones de forma proactiva — sugiere completar las que ya cumplen la condicion. Ayuda a entender como completar cada mision y ganar XP."
    ```

**Acceptance:** After a successful GitHub sync, the `github_sync` quest (if active) is marked COMPLETED and the stats cache is invalidated. The dashboard AI prompt references quests in its context.

---

## Task Group 12: Translations

- [x] **TG12: Add quest translations to `messages/en.json` and `messages/es.json`**
  - Add a `"quests"` namespace with keys (add to both files):
    ```json
    "quests": {
      "title": "Active Missions",
      "pending": "{count} pending",
      "allComplete": "All missions complete for today!",
      "comeBack": "Check back tomorrow for new quests.",
      "claim": "Claim",
      "claimed": "Claimed",
      "inProgress": "In Progress",
      "completed": "Completed",
      "expired": "Expired",
      "weeklyLabel": "Weekly Quest",
      "expires": "Expires {date}",
      "xpEarned": "+{xp} XP earned!"
    }
    ```
  - Spanish values:
    ```json
    "quests": {
      "title": "Misiones Activas",
      "pending": "{count} pendientes",
      "allComplete": "¡Todas las misiones completadas hoy!",
      "comeBack": "Vuelve mañana para nuevas misiones.",
      "claim": "Reclamar",
      "claimed": "Reclamado",
      "inProgress": "En Progreso",
      "completed": "Completado",
      "expired": "Expirado",
      "weeklyLabel": "Misión Semanal",
      "expires": "Expira {date}",
      "xpEarned": "+{xp} XP ganados!"
    }
    ```
  - Note: The `ActiveMissionsPanel` component uses hardcoded English strings for the tech-mode terminal aesthetics (labels like `MISSION_TRACKER --live` intentionally stay in English as part of the Tech Mode aesthetic). The translation keys above are for any future i18n integration points.

**Acceptance:** Both JSON files parse correctly (valid JSON). Keys are present in both files.

---

## Task Group 13: TypeScript Verification + Manual Testing

- [x] **TG13-A: TypeScript compilation check**
  - Run `npx tsc --noEmit` from the project root
  - Fix any new TypeScript errors introduced by Spec 4E changes
  - Zero new errors is the acceptance criterion (pre-existing errors from other specs are out of scope)

- [ ] **TG13-B: Quest generation — manual verification** *(manual)*
  - Log in as a user with an empty portfolio
  - Navigate to the main dashboard
  - Verify the `ActiveMissionsPanel` shows 3 daily quests + 1 weekly quest (no placeholders)
  - Verify quest titles are real (not "Optimizar perfil SEO")
  - Verify quests have XP badges and difficulty indicators

- [ ] **TG13-C: Quest auto-completion — manual verification** *(manual)*
  - Connect GitHub (or ensure it's already connected)
  - Verify the `connect_github` quest auto-completes on next dashboard load (not shown as active)
  - Add a bio in portfolio settings
  - Verify the `add_bio` quest shows a "Claim" button or auto-completes

- [ ] **TG13-D: Quest XP award — manual verification** *(manual)*
  - Claim a quest by clicking the "Claim" button
  - Verify `toast.success` appears with the XP amount
  - Verify the HexStatGrid XP counter has increased on next navigation
  - Verify the claimed quest shows "COMPLETADO" state

- [ ] **TG13-E: GitHub sync integration — manual verification** *(manual)*
  - Ensure `github_sync` weekly quest is active
  - Trigger a GitHub sync from the skills page
  - Verify the quest is marked completed in the panel on next dashboard visit

---

## Implementation Order

1. **TG1** (Types) — no dependencies, start here
2. **TG2** (Prisma) — no dependencies, run in parallel with TG1
3. **TG3** (Quest Pool) — depends on TG1 (QuestTemplate type)
4. **TG4** (Data Layer) — depends on TG2 (Prisma model)
5. **TG5** (Engine Service) — depends on TG3 + TG4
6. **TG6** (Complete Service) — depends on TG3 + TG4
7. **TG7** (Actions) — depends on TG5 + TG6
8. **TG8** (XP Integration) — depends on TG2 only, can be parallelized with TG5+TG6
9. **TG9** (UI Components) — depends on TG7
10. **TG10** (Barrel + Page wiring) — depends on TG9
11. **TG11** (GitHub hook + AI prompt) — depends on TG7
12. **TG12** (Translations) — no blocking dependencies
13. **TG13** (Verification) — depends on all above

TG1 + TG2 + TG12 can be done in parallel as the first step. TG5 + TG6 can be parallelized after TG3+TG4.
