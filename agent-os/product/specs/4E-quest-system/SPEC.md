# Spec 4E: Quest System

**Status:** Ready for implementation
**Branch:** `feat/phase4-ai-portfolio-os`
**Dependencies:** Spec 4A (completed), Spec 4B (completed)
**Estimated effort:** 7-10 days

---

## Problem

The `ActiveMissionsPanel` on the main dashboard (`features/tech/components/active-missions-panel.tsx`) shows three hardcoded placeholder quests with fake progress values. There is no real quest engine, no persistence, no XP awards, and no connection to the user's actual portfolio state. The panel is purely cosmetic.

The result is a missed retention loop. Users have no system guiding them toward portfolio completion, no incremental rewards for improving their data, and no sense of daily progression. A quest system turns the dashboard from a stats viewer into an action-oriented interface.

---

## Solution

Replace the hardcoded `ActiveMissionsPanel` with a real quest engine that:

1. Reads the user's portfolio state deterministically (no AI calls)
2. Assigns 3 daily quests + 1 weekly quest from a static pool of ~15 templates
3. Auto-detects completion when the underlying condition is already met
4. Awards XP by invalidating the `user-stats-${userId}` cache tag (same pattern used everywhere)
5. Rotates quests on expiry (daily at UTC midnight, weekly on Monday UTC midnight)
6. Exposes a `completeQuestAction` that can be called from other actions (e.g., after bio improvement)

---

## Architecture

### New feature directory

```
features/quests/
  constants/
    questPool.ts              — static pool of ~15 quest templates (bilingual)
  data/
    getUserQuests.data.ts     — fetch active UserQuest records for a user
  services/
    questEngine.service.ts    — assign quests: check gaps, rotate expired, fill slots
    completeQuest.service.ts  — verify condition, award XP, mark COMPLETED
  actions/
    getQuestsAction.ts        — server action: load or generate quests, return enriched list
    completeQuestAction.ts    — server action: complete a quest by questId
  components/
    ActiveMissionsPanel.tsx   — replaces features/tech/components/active-missions-panel.tsx
    QuestCard.tsx             — individual quest card (daily)
    WeeklyQuestCard.tsx       — weekly quest card (gold accent, larger)
  types/
    quest.ts                  — Quest, QuestTemplate, QuestCondition types
```

### Modified files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `UserQuest` model + `QuestStatus` enum + relation on `User` |
| `features/tech/components/active-missions-panel.tsx` | Replaced by `features/quests/components/ActiveMissionsPanel.tsx` |
| `features/tech/index.tsx` | Re-export `ActiveMissionsPanel` from new location |
| `app/[locale]/(dashboard)/dashboard/page.tsx` | Call `getQuestsAction` server-side, pass quests to `ActiveMissionsPanel` |
| `features/github/actions/syncGitHub.action.ts` | After success: call `completeQuestAction('github_sync')` |
| `features/ai/constants/pagePrompts.ts` | Update `dashboard` prompt to mention active quests |
| `messages/en.json` + `messages/es.json` | Add quest translations |

---

## Detailed Design

### 1. Types

**File:** `features/quests/types/quest.ts`

```typescript
export type QuestCategory =
  | "portfolio_completion"
  | "skill_validation"
  | "content_improvement"
  | "consistency"
  | "exploration"

export type QuestDifficulty = "easy" | "medium" | "hard"
export type QuestType = "daily" | "weekly" | "one_time"
export type QuestStatus = "ACTIVE" | "COMPLETED" | "EXPIRED"

export interface QuestTemplate {
  id: string                  // stable identifier, e.g. "add_bio"
  category: QuestCategory
  title: { en: string; es: string }
  description: { en: string; es: string }
  xpReward: number            // 50 | 100 | 150 | 200 | 300
  difficulty: QuestDifficulty
  type: QuestType
  condition: string           // matches a key in CONDITION_CHECKERS map
}

// Enriched quest returned to the UI (template merged with DB record)
export interface ActiveQuest {
  userQuestId: string
  templateId: string
  category: QuestCategory
  title: string               // already locale-resolved
  description: string
  xpReward: number
  difficulty: QuestDifficulty
  type: QuestType
  status: QuestStatus
  assignedAt: Date
  expiresAt: Date | null
  completedAt: Date | null
  conditionMet: boolean       // computed on-the-fly during load
}

// Snapshot of user portfolio state used for condition checking
export interface UserPortfolioSnapshot {
  hasBio: boolean
  skillCount: number
  projectCount: number
  experienceCount: number
  hasGitHub: boolean
  hasPassedAssessment: boolean
  cvCount: number
  currentStreak: number
  githubSyncedAt: Date | null
}
```

### 2. Prisma Model

Add to `prisma/schema.prisma`:

```prisma
enum QuestStatus {
  ACTIVE
  COMPLETED
  EXPIRED
}

model UserQuest {
  id          String      @id @default(cuid()) @map("_id")
  userId      String
  questId     String      // references QuestTemplate.id from questPool.ts
  status      QuestStatus @default(ACTIVE)
  xpAwarded   Int         @default(0)
  assignedAt  DateTime    @default(now())
  completedAt DateTime?
  expiresAt   DateTime?   // null for one_time quests

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([userId, questId])
  @@map("user_quests")
}
```

Add `userQuests UserQuest[]` to the `User` model.

### 3. Quest Pool

**File:** `features/quests/constants/questPool.ts`

A static array of `QuestTemplate` objects. The quest pool is NOT in the database — it is a hardcoded constant. The `questId` in `UserQuest` is a string reference to `QuestTemplate.id`.

**15 quest templates:**

| id | type | category | xpReward | difficulty |
|----|------|----------|----------|------------|
| `add_bio` | one_time | portfolio_completion | 100 | easy |
| `add_5_skills` | one_time | portfolio_completion | 150 | medium |
| `add_project` | one_time | portfolio_completion | 100 | easy |
| `add_3_projects` | one_time | portfolio_completion | 200 | medium |
| `add_experience` | one_time | portfolio_completion | 100 | easy |
| `connect_github` | one_time | skill_validation | 200 | medium |
| `take_assessment` | one_time | skill_validation | 300 | hard |
| `improve_bio` | daily | content_improvement | 50 | easy |
| `improve_project_desc` | daily | content_improvement | 50 | easy |
| `visit_cv_page` | daily | exploration | 50 | easy |
| `generate_cv` | weekly | portfolio_completion | 200 | medium |
| `github_sync` | weekly | skill_validation | 150 | medium |
| `login_streak_3` | one_time | consistency | 100 | easy |
| `login_streak_7` | one_time | consistency | 200 | medium |
| `complete_portfolio` | one_time | portfolio_completion | 300 | hard |

**Condition identifiers** (matched by `questEngine.service.ts`):

| condition string | Check logic |
|-----------------|-------------|
| `has_bio` | `user.bio != null && user.bio.length > 0` |
| `has_5_skills` | `skillCount >= 5` |
| `has_project` | `projectCount >= 1` |
| `has_3_projects` | `projectCount >= 3` |
| `has_experience` | `experienceCount >= 1` |
| `has_github` | `hasGitHub === true` |
| `has_passed_assessment` | `hasPassedAssessment === true` |
| `bio_improved_today` | Checked via `UserQuest.completedAt` within last 24h |
| `project_desc_improved_today` | Checked via `UserQuest.completedAt` within last 24h |
| `visited_cv_today` | Checked via `UserQuest.completedAt` within last 24h |
| `generated_cv_this_week` | `cvCount >= 1` OR `UserQuest.completedAt` this week |
| `synced_github_this_week` | `githubSyncedAt` within last 7 days |
| `streak_3` | `currentStreak >= 3` |
| `streak_7` | `currentStreak >= 7` |
| `portfolio_80_percent` | Computed health score >= 80 |

### 4. Quest Engine Service

**File:** `features/quests/services/questEngine.service.ts`

```typescript
export async function getOrGenerateQuests(
  userId: string,
  snapshot: UserPortfolioSnapshot
): Promise<ActiveQuest[]>
```

**Algorithm:**

1. Fetch all `UserQuest` records for the user (any status) from the last 30 days
2. Expire stale records:
   - `daily` quests where `expiresAt < now()` and `status === ACTIVE` → bulk update to `EXPIRED`
   - `weekly` quests where `expiresAt < now()` and `status === ACTIVE` → bulk update to `EXPIRED`
3. Load current `ACTIVE` quests
4. Compute `conditionMet` for each active quest using `checkCondition(template.condition, snapshot)`
5. Auto-complete quests where `conditionMet === true` by calling `completeQuestService`
6. Count remaining daily slots (target: 3), weekly slot (target: 1)
7. Fill empty slots from the pool:
   - Filter pool by: not already `COMPLETED` in last 7 days (by `completedAt`), not currently `ACTIVE`
   - For `one_time` quests: exclude if ever `COMPLETED`
   - Priority: prefer quests whose `conditionMet === false` (i.e., user actually needs to do work)
   - For daily slots: pick from `daily` + `one_time` templates whose conditions are not met
   - For weekly slot: pick from `weekly` templates
   - Shuffle deterministically (seed: `userId + today's date string`) to vary across days
8. Insert new `UserQuest` records with appropriate `expiresAt`:
   - `daily`: next UTC midnight
   - `weekly`: next Monday UTC midnight
   - `one_time`: `null`
9. Return enriched `ActiveQuest[]` (merge template data + DB record + `conditionMet`)

**`checkCondition(condition, snapshot)` → `boolean`:**

A pure function mapping condition strings to snapshot fields. No DB calls inside this function.

**Portfolio health score** (for `portfolio_80_percent` condition):

```typescript
function computePortfolioHealth(snapshot: UserPortfolioSnapshot): number {
  let score = 0
  if (snapshot.hasBio) score += 20
  if (snapshot.skillCount >= 5) score += 20
  if (snapshot.projectCount >= 1) score += 20
  if (snapshot.experienceCount >= 1) score += 20
  if (snapshot.hasGitHub) score += 10
  if (snapshot.hasPassedAssessment) score += 10
  return score  // max 100
}
```

### 5. Complete Quest Service

**File:** `features/quests/services/completeQuest.service.ts`

```typescript
export async function completeQuestService(
  userId: string,
  questId: string  // QuestTemplate.id, e.g. "improve_bio"
): Promise<{ xpAwarded: number } | null>
```

**Steps:**

1. Find the `UserQuest` record where `{ userId, questId, status: ACTIVE }`
2. If not found: return `null` (quest not assigned or already done — silent no-op)
3. Look up the `QuestTemplate` from `questPool.ts` to get `xpReward`
4. Update `UserQuest`: `status = COMPLETED`, `completedAt = now()`, `xpAwarded = xpReward`
5. Award XP by invalidating `revalidateTag(`user-stats-${userId}`)` — XP is computed at read time from DB data; for quests, we need to actually store the XP somewhere. **Decision:** Create a `UserQuestXP` field approach — no, simpler: the `xpAwarded` field on `UserQuest` is summed into total XP in `getUserDashboardStats.data.ts`.
6. Return `{ xpAwarded }`

**XP integration note:** The `getUserDashboardStats` function must be updated to include quest XP in the total XP computation. Add a query for `SUM(xpAwarded)` across all `COMPLETED` `UserQuest` records for the user.

### 6. Server Actions

**`features/quests/actions/getQuestsAction.ts`**

```typescript
'use server'
export async function getQuestsAction(): Promise<ActionResponse<ActiveQuest[]>>
```

- Auth check via `auth.api.getSession`
- Fetch `UserPortfolioSnapshot` (single efficient query)
- Call `getOrGenerateQuests(userId, snapshot)`
- Return enriched quest list

**`features/quests/actions/completeQuestAction.ts`**

```typescript
'use server'
export async function completeQuestAction(
  questId: string  // QuestTemplate.id
): Promise<ActionResponse<{ xpAwarded: number }>>
```

- Auth check
- Call `completeQuestService(userId, questId)`
- `revalidateTag(`user-stats-${userId}`)` to refresh XP display
- Return `{ xpAwarded }`

This action is called from:
- `ActiveMissionsPanel` (manual "Claim" button for quests the user completed by doing actions in other parts of the app)
- `features/github/actions/syncGitHub.action.ts` (after sync succeeds: `completeQuestAction('github_sync')`)
- After `improve_bio` AI action succeeds: `completeQuestAction('improve_bio')`

### 7. Data Layer

**File:** `features/quests/data/getUserQuests.data.ts`

```typescript
export async function getActiveUserQuests(userId: string): Promise<UserQuestRecord[]>
// Fetches UserQuest records with status = ACTIVE, ordered by assignedAt asc

export async function getRecentCompletedQuests(userId: string, days: number): Promise<UserQuestRecord[]>
// Fetches COMPLETED quests in the last N days — used by engine to avoid repeating

export async function bulkExpireQuests(questIds: string[]): Promise<void>
// Updates status = EXPIRED for given UserQuest IDs
```

### 8. UI Components

#### `ActiveMissionsPanel` (replacement)

**File:** `features/quests/components/ActiveMissionsPanel.tsx`

```typescript
interface ActiveMissionsPanelProps {
  quests: ActiveQuest[]
  className?: string
}
```

- `"use client"` component
- Receives pre-fetched `quests` from the page server component
- Renders 3 daily `QuestCard` components + 1 `WeeklyQuestCard`
- "Refresh" icon button in header: calls `getQuestsAction()` via `useTransition`
- On complete: calls `completeQuestAction(questId)` → `toast.success('+{xp} XP')`
- Empty state: "All quests complete for today! Come back tomorrow."
- Preserves exact same outer styling as the current component (dark bg, cyan border, hex icon header)

**Layout:**
```
┌─────────────────────────────────┐
│ ⬡ ACTIVE_MISSIONS  [↻]  2 pend │
├─────────────────────────────────┤
│ [daily] QuestCard               │
│ [daily] QuestCard               │
│ [daily] QuestCard               │
├ ─ ─ ─ WEEKLY ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ [weekly] WeeklyQuestCard (gold) │
├─────────────────────────────────┤
│ > MISSION_TRACKER --live        │
└─────────────────────────────────┘
```

#### `QuestCard`

**File:** `features/quests/components/QuestCard.tsx`

Props: `quest: ActiveQuest`, `onComplete: (questId: string) => void`, `completing: boolean`

- Diamond indicator (matches current panel style)
- Quest title in `font-mono text-[10px]`
- XP reward badge: `+{xp} XP` in cyan
- Difficulty dot: easy=green, medium=yellow, hard=magenta
- If `conditionMet && status === ACTIVE`: show "Claim" button (calls `onComplete`)
- If `status === COMPLETED`: strikethrough title + "COMPLETADO" text
- If `status === EXPIRED`: grayed out + "EXPIRADO"
- No progress bar (conditions are binary, not percentage-based)

#### `WeeklyQuestCard`

**File:** `features/quests/components/WeeklyQuestCard.tsx`

Same as `QuestCard` but with gold (`#EAB308`) accent color and slightly larger padding. Shows expiry date ("Expires Monday").

### 9. Dashboard Page Integration

**File:** `app/[locale]/(dashboard)/dashboard/page.tsx`

Add quest fetch alongside existing data fetches:

```typescript
const [pageData, runners, quests] = await Promise.all([
  getDashboardPageData(user.id),
  getTopRunners(user.id),
  getQuestsAction(),  // new
])

// Pass to ActiveMissionsPanel:
<ActiveMissionsPanel
  quests={quests.hasError ? [] : (quests.payload ?? [])}
  className="flex-1 min-h-[140px]"
/>
```

The old `ActiveMissionsPanel` import from `@/features/tech` continues to work because `features/tech/index.tsx` is updated to re-export from the new location.

### 10. XP Computation Update

**File:** `features/dashboard/data/getUserDashboardStats.data.ts`

Add to the single Prisma query:

```typescript
userQuests: {
  where: { status: 'COMPLETED' },
  select: { xpAwarded: true },
},
```

Add to XP totals:

```typescript
const questXPs = user.userQuests.reduce((sum, q) => sum + q.xpAwarded, 0)
const totalXP = experienceXPs... + projectXPs... + skillXPs... + questXPs
```

### 11. CRT AI Integration

**File:** `features/ai/constants/pagePrompts.ts`

Update the `dashboard` entry to mention quests:

```
en: "User is on their main dashboard. They have active daily quests visible in the Active Missions panel.
     Reference their quests proactively. Help them complete portfolio improvements, highlight what's missing,
     or encourage them to claim completed quest rewards."
```

No new AI tool is needed. Quest awareness is achieved through the page prompt augmentation alone. The AI does not generate quests — it only references them in conversation.

---

## Quest Slot Rules (Summary)

| Slot | Count | Reset | Pool source | Repeat rule |
|------|-------|-------|-------------|-------------|
| Daily | 3 | UTC midnight | `daily` + `one_time` (if condition unmet) | Not if completed in last 24h |
| Weekly | 1 | Monday UTC | `weekly` only | Not if completed in last 7 days |
| One-time | permanent | Never resets | Only shown once ever | Removed from pool after COMPLETED |

---

## Performance Considerations

1. **Quest fetch**: Single Prisma query + bulk operations. No AI calls.
2. **Condition check**: Pure functions against `UserPortfolioSnapshot` (one efficient DB query).
3. **XP integration**: Adds one relation to the existing `getUserDashboardStats` query (already cached).
4. **Auto-complete on load**: At most ~5 quests to check per load. Bulk update if needed.
5. **Cache**: Quest data is NOT cached via `unstable_cache` — it must be fresh on every load. The server action is `'use server'` but not wrapped in `unstable_cache`.

---

## Acceptance Criteria

1. Main dashboard `ActiveMissionsPanel` shows real quest data (3 daily + 1 weekly), not hardcoded placeholders
2. Quests auto-complete when their condition is already met (e.g., user already has a bio → `add_bio` completes on next load)
3. Completing a quest awards XP: the HexStatGrid XP counter updates after `revalidateTag`
4. `completeQuestAction('github_sync')` is called from `syncGitHub.action.ts` after a successful sync
5. Daily quests expire at UTC midnight; weekly quests expire on Monday UTC midnight
6. One-time quests (e.g., `connect_github`) never recur once completed
7. Quest XP is included in the total XP displayed on the dashboard
8. TypeScript: `npx tsc --noEmit` passes with zero new errors
9. The `features/tech/index.tsx` barrel export of `ActiveMissionsPanel` continues to work (no import changes needed in `dashboard/page.tsx` beyond the added `quests` prop)

---

## Out of Scope

- AI-generated quest descriptions (all quests are from the static pool)
- Quest streaks or combo bonuses
- Quest history page or completed quests archive
- Push notifications for quest resets
- Quest sharing or social features
- Freemium gating on quest rewards
- Quest categories filter UI in the panel
- CRT tool for claiming quests (conversation-based — prompt augmentation is sufficient)
