# Task Breakdown: Phase 3B — Visual Polish (Tech Mode)

## Overview

Total Task Groups: 5
Priority order: TG1 (AIEye & HUD) → TG2 (Real Data Wiring) → TG3 (GalaxyCanvas) → TG4 (Timeline) → TG5 (Public Portfolio)

Visual target: `planning/visuals/visuals/PortfolandNext-GenHUD.png` (primary dashboard reference)
Current ground truth: `planning/visuals/visuals/FireShot Capture 034 - Portfoland - [localhost].png`

No tests are written during this spec (consistent with the dashboard component pattern — UI polish specs
in this codebase do not have test coverage tasks; tests would be added in a dedicated testing phase).

---

## Task List

---

### TG1 — AIEye and HUD Polish

**Dependencies:** None (starting point)

---

#### Task Group 1-A: New AIEye Reactive States (`xp_gain`, `life_loss`)

**File:** `features/tech/components/crt-with-ai.tsx`
**Supporting file (types):** `features/tech/types/dashboard.ts`

- [x] 1-A.1 Extend the `AIState` union type at the top of `crt-with-ai.tsx`
  - Current: `"sleeping" | "waking" | "drowsy" | "awake" | "listening" | "thinking" | "ready" | "success"`
  - New: add `"xp_gain"` and `"life_loss"` to the union
  - The exported `AIState` type at line 14 automatically covers the new values — no additional export needed

- [x] 1-A.2 Add `mainColor` switch cases for the two new states inside the `AIEye` sub-component
  - Insert before the existing `isSuccess` check (highest specificity first):
    - `"xp_gain"` → `"hsl(150,100%,45%)"` (green — same as success but triggered differently)
    - `"life_loss"` → `"hsl(0,80%,55%)"` (red — same as sleeping/drowsy color but in a distinct state)
  - Pattern to follow: match the existing `isSuccess`/`isReady`/`isThinking`/`isListening` branches

- [x] 1-A.3 Implement `xp_gain` visual behavior in `AIEye`
  - `isXPGain = state === "xp_gain"` — add to the boolean flags at the top of `AIEye`
  - Iris: open full (`ry=13`), green fill via `mainColor` already handled in 1-A.2
  - Blink sequence: a double-blink at 80ms each — implement as a `useEffect` inside `AIEye` on `isXPGain`
    that calls `setIsBlinking(true)` at t=0ms, `setIsBlinking(false)` at t=80ms, `setIsBlinking(true)` at
    t=200ms, `setIsBlinking(false)` at t=280ms — use `setTimeout` chain scoped to this `useEffect`
  - The outer glow ring `animate` prop: add `isXPGain ? [0.4, 0.9, 0.4] : ...` branch for opacity pulse

- [x] 1-A.4 Implement `life_loss` visual behavior in `AIEye`
  - `isLifeLoss = state === "life_loss"` — add to the boolean flags
  - Single slow blink: `useEffect` on `isLifeLoss` — close iris over 300ms, hold 400ms, open over 300ms
    — implement by transitioning `isBlinking` with the three `setTimeout` calls; total 1000ms
  - Outer hex border pulse: the existing `motion.path` for the hex border already reads `mainColor`
    (which is now red when `isLifeLoss`); add an additional `animate` branch: when `isLifeLoss`,
    animate `strokeWidth` from `2` to `4` to `2` over `1s` with `repeat: 0` — a single pulse

- [x] 1-A.5 Add the auto-return timer for both new states in the main `CRTWithAI` component
  - In the main component body, add a `useEffect` that watches `aiState`:
    - When `aiState === "xp_gain"`: after 1200ms call `setAIState(previousState)` — capture previous
      state in a `useRef<AIState>` named `prevStateRef` and update it on every non-transient state change
    - When `aiState === "life_loss"`: after 2000ms call `setAIState(previousState)`
  - "Transient states" that do not update `prevStateRef`: `"xp_gain"`, `"life_loss"` themselves
  - Default `prevStateRef` value: `"awake"`

- [x] 1-A.6 Add `onXPGain` and `onLifeLoss` optional callback props to `CRTWithAIProps`
  - In the `interface CRTWithAIProps` block inside `crt-with-ai.tsx`:
    ```
    onXPGain?: () => void
    onLifeLoss?: () => void
    ```
  - In the component body, expose two functions that parent can call via forwarded refs OR — simpler
    pattern: add the props to `CRTWithAIProps` and, when the parent calls them (the parent invokes
    `triggerXPGain()` / `triggerLifeLoss()` via `useImperativeHandle` or more simply: accept them as
    trigger signals — implement as `useEffect` hooks that watch for a prop signal):
    - Recommended approach: change `onXPGain` and `onLifeLoss` to boolean trigger props
      `xpGainTrigger?: number` and `lifeLossTrigger?: number` (incrementing counter pattern) — when the
      value changes, the effect fires. This avoids `useImperativeHandle` complexity.
    - `useEffect(() => { if (xpGainTrigger) { setAIState("xp_gain") } }, [xpGainTrigger])`
    - `useEffect(() => { if (lifeLossTrigger) { setAIState("life_loss") } }, [lifeLossTrigger])`

- [x] 1-A.7 Add new props and types to `features/tech/types/dashboard.ts`
  - Add to `DashboardRow1Props` interface (currently defined inline in `dashboard-row1.tsx` — move the
    full interface into `features/tech/types/dashboard.ts` and import it back):
    ```typescript
    export interface DashboardRow1Props {
      userName: string
      userInitial: string
      userImage?: string | null
      level: number
      currentXP: number
      maxXP: number
      streakDays: number
      activeSkillsCount?: number
      translations: { ... } // keep existing shape
      onXPGain?: () => void
      onLifeLoss?: () => void
    }
    ```
  - Add to `CRTWithAIProps` (keep the interface in `crt-with-ai.tsx`, add a re-export via the types
    file or leave it local — follow existing pattern where `AIState` is exported from the component file)
  - `WelcomeCardProps` in `features/tech/types/dashboard.ts` gains `activeSkillsCount?: number`

- [x] 1-A.8 Wire `onXPGain` and `onLifeLoss` through `DashboardRow1`
  - In `features/tech/components/dashboard-row1.tsx`:
    - Accept `onXPGain?` and `onLifeLoss?` from `DashboardRow1Props`
    - Add local state: `const [xpGainTrigger, setXPGainTrigger] = useState(0)`
    - Add local state: `const [lifeLossTrigger, setLifeLossTrigger] = useState(0)`
    - Wire `onXPGain` prop on `DashboardRow1` to call `() => setXPGainTrigger(n => n + 1)` and also
      call the passed-through `props.onXPGain?.()`
    - Pass `xpGainTrigger` and `lifeLossTrigger` down to `CRTWithAI`
  - In `app/[locale]/(protected)/dashboard/page.tsx`: `DashboardRow1` already receives `stats` — no
    wiring needed at the page level yet; the props are optional pass-throughs for future use

**Acceptance Criteria:**
- `AIState` union includes `"xp_gain"` and `"life_loss"` with correct iris colors
- Setting state to `"xp_gain"` triggers double-blink and auto-returns after 1.2s
- Setting state to `"life_loss"` triggers slow single blink, red hex border pulse, auto-returns after 2s
- `DashboardRow1Props` and `WelcomeCardProps` are defined in `features/tech/types/dashboard.ts`
- `DashboardRow1` exposes `onXPGain` and `onLifeLoss` pass-through props

---

#### Task Group 1-B: Drowsy Animation Fix

**File:** `features/tech/components/crt-with-ai.tsx`

- [x] 1-B.1 Remove the `drowsyBlinkInterval` recursive timeout loop
  - Delete the entire `useEffect` block at lines 456–468 (the one checking `if (aiState === "drowsy")`)
  - Delete `drowsyBlinkInterval` from the `useRef` declarations (line 396)
  - Do NOT delete `isBlinking` state — it is still used by standard blinks and the new state blinks
    from TG1-A

- [x] 1-B.2 Replace with Framer Motion `animate` prop on the existing iris `motion.ellipse`
  - The iris `motion.ellipse` at lines 297–305 currently has:
    ```
    animate={{ ry: irisRY, opacity: irisStrokeOpacity }}
    transition={{ type: "spring", stiffness: 80, damping: 15 }}
    ```
  - Change the transition when `isDrowsy` is true to use a tween instead of the spring:
    ```typescript
    transition={isDrowsy
      ? { type: "tween", duration: 3, ease: "easeInOut" }
      : { type: "spring", stiffness: 80, damping: 15 }
    }
    ```
  - The `irisRY` value for `isDrowsy` is already set to `10` at line 184; change it to animate from the
    current value smoothly toward `4` over the 3s tween — change `isDrowsy ? 10 : 13` to `isDrowsy ? 4 : 13`
    so Framer Motion drives the iris closed from wherever it currently is to `ry=4` using the tween

- [x] 1-B.3 Make the drowsy half-lid overlay a static opacity
  - The `motion.rect` at lines 308–316 currently has an `animate={{ opacity: [0.3, 0.5, 0.3], height: [6, 10, 6] }}`
    pulse animation — remove the `animate` prop entirely and replace with a static `opacity={0.4}` and
    fixed `y={37}` `height={8}`, consistent with the spec requirement of a fixed drooping lid
  - Keep the `motion.rect` as a `motion` element (for future extensibility) but remove the `transition`
    prop as well since there is nothing to transition

**Acceptance Criteria:**
- `drowsyBlinkInterval` ref is gone; no recursive `setTimeout` chains exist for the drowsy state
- When AI transitions to `"drowsy"`, the iris smoothly closes from its current `ry` value toward `ry=4`
  over 3 seconds using a tween easing
- The half-lid overlay is a static grey bar at `opacity=0.4`, no pulse animation

---

#### Task Group 1-C: WelcomeCard SYS_MONITOR Real Data

**File:** `features/tech/components/welcome-card.tsx`
**Supporting file (types):** `features/tech/types/dashboard.ts`
**Also touches:** `app/[locale]/(protected)/dashboard/page.tsx` (to pass new props)

- [x] 1-C.1 Add browser performance metric reads inside `SystemStatusPanel` `useEffect`
  - `SystemStatusPanel` is currently a standalone function inside `welcome-card.tsx` with no props
  - Add a new `useEffect` on mount inside `SystemStatusPanel` that reads:
    - NET: `(navigator as any).connection?.downlink` — value is Mbps; map to 0–100% with
      `Math.min(100, Math.round(((navigator as any).connection?.downlink ?? 0) * 10))`. Cap at 100.
    - RAM: `(performance as any).memory?.usedJSHeapSize / (performance as any).memory?.totalJSHeapSize * 100`
      rounded to nearest integer. Falls back to 61 if `performance.memory` is undefined.
    - Wrap all reads in a single `try/catch` block — on any error, use fallback values for all metrics:
      `{ net: 88, cpu: 24, ram: 61, gpu: 18 }`
  - Add state: `const [metrics, setMetrics] = useState({ net: 88, cpu: 24, ram: 61, gpu: 18 })`
  - On mount, run the reads and call `setMetrics(...)` with real or fallback values

- [x] 1-C.2 Add CPU load estimator inside the same `useEffect`
  - After the network/memory reads, schedule 10 `performance.now()` delta measurements at 100ms intervals:
    ```typescript
    const deltas: number[] = []
    let last = performance.now()
    const cpuInterval = setInterval(() => {
      const now = performance.now()
      deltas.push(now - last)
      last = now
      if (deltas.length >= 10) {
        clearInterval(cpuInterval)
        const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length
        const cpu = Math.max(0, Math.min(99, Math.round((avg - 100) / 2)))
        setMetrics(m => ({ ...m, cpu: cpu > 0 ? cpu : 24 }))
      }
    }, 100)
    ```
  - Return the `clearInterval(cpuInterval)` in the `useEffect` cleanup

- [x] 1-C.3 Replace hardcoded `StatusBar` values with `metrics` state
  - Replace lines 82–85 in `welcome-card.tsx`:
    - `<StatusBar label="NET" value={94} ...>` → `<StatusBar label="NET" value={metrics.net} ...>`
    - `<StatusBar label="CPU" value={37} ...>` → `<StatusBar label="CPU" value={metrics.cpu} ...>`
    - `<StatusBar label="RAM" value={62} ...>` → `<StatusBar label="RAM" value={metrics.ram} ...>`
    - `<StatusBar label="GPU" value={18} ...>` → `<StatusBar label="GPU" value={metrics.gpu} ...>`
      with a `{/* decorative */}` comment on the GPU line since WebGL heap is unavailable

- [x] 1-C.4 Add `activeSkillsCount` prop to `SystemStatusPanel` and wire the data readout
  - Change `SystemStatusPanel` from a no-prop function to accept `{ activeSkillsCount: number; streakDays: number }`:
    ```typescript
    function SystemStatusPanel({ activeSkillsCount, streakDays }: { activeSkillsCount: number; streakDays: number })
    ```
  - Replace the hardcoded readout line at line 90:
    - `skills: 24 active` → `skills: {activeSkillsCount} active`
    - `uptime: 12d 4h 32m` → `streak: {streakDays}d`
    - Keep `pid: 0x4F2A` as decorative

- [x] 1-C.5 Thread `activeSkillsCount` and `streakDays` from `WelcomeCard` down to `SystemStatusPanel`
  - `WelcomeCard` already receives `streakDays` as a prop (line 136 of `welcome-card.tsx`)
  - `WelcomeCard` now also receives `activeSkillsCount?: number` (added to `WelcomeCardProps` in 1-A.7)
  - In `WelcomeCard`'s JSX, pass both props to `SystemStatusPanel`:
    ```tsx
    <SystemStatusPanel activeSkillsCount={activeSkillsCount ?? 0} streakDays={streakDays} />
    ```

- [x] 1-C.6 Pass `activeSkillsCount` from `dashboard/page.tsx` down the component tree
  - In `features/dashboard/data/getUserDashboardStats.data.ts`, the query already selects `userSkills`
    count — confirm the field name (likely `skillsCount` or derived); if not already in the returned
    stats object, add `userSkillsCount` by adding `_count: { select: { userSkills: true } }` to the
    existing Prisma `select` and computing `activeSkillsCount = user._count.userSkills`
  - Add `activeSkillsCount: number` to the `DashboardStats` type in
    `features/dashboard/types/dashboard.ts`
  - In `dashboard/page.tsx`, pass `activeSkillsCount={stats.activeSkillsCount ?? 0}` to `DashboardRow1`
  - `DashboardRow1` passes it through to `WelcomeCard`

**Acceptance Criteria:**
- SYS_MONITOR bars read from browser APIs on mount (or use decorative fallbacks if unavailable)
- GPU bar always shows 18 with a `// decorative` comment in source
- "skills: X active" shows the real count from `getUserDashboardStats`
- "streak: Xd" uses the `streakDays` prop already passed to `WelcomeCard`
- No hardcoded 24, 94, 62, 37 values remain in `SystemStatusPanel` for NET/CPU/RAM

---

### TG2 — Real Data Wiring

**Dependencies:** TG1 (specifically TG1-C adds `lastStreakDate` to `DashboardStats`; TG2-B depends on it)

---

#### Task Group 2-A: SYS_LOG Extraction and Real DB Events

**New files:**
- `features/dashboard/data/getRecentUserActivity.data.ts`
- `features/tech/components/sys-log-panel.tsx`
- `lib/utils/format.ts` (add `formatTimeAgo` if file does not exist; append if it does)

**Also modifies:** `app/[locale]/(protected)/dashboard/page.tsx`

- [x] 2-A.1 Create `lib/utils/format.ts` with `formatTimeAgo(date: Date): string`
  - Pure utility function, no imports beyond standard JS `Date`
  - Logic:
    - Difference in minutes: `< 60` → `"hace X minutos"`
    - Difference in hours: `< 24` → `"hace X horas"`
    - Difference in days: `=== 1` → `"AYER"`
    - Else → `"hace X días"`
  - Export as named export: `export function formatTimeAgo(date: Date): string`

- [x] 2-A.2 Define the `ActivityEvent` type
  - Add to `features/dashboard/types/dashboard.ts`:
    ```typescript
    export type ActivityEventType = "experience" | "project_completed" | "skill_ai" | "skill_manual" | "experience_updated"

    export interface ActivityEvent {
      id: string
      title: string
      xp: number
      type: ActivityEventType
      timestamp: Date
    }
    ```

- [x] 2-A.3 Create `features/dashboard/data/getRecentUserActivity.data.ts`
  - Server-side Prisma query — imports `prisma` from `@/lib/prisma`
  - Query structure:
    ```typescript
    export async function getRecentUserActivity(userId: string): Promise<ActivityEvent[]>
    ```
  - Fetch in parallel with `Promise.all`:
    - `prisma.experience.findMany({ where: { userId }, select: { id, title, type, createdAt, updatedAt }, orderBy: { updatedAt: "desc" }, take: 10 })`
    - `prisma.project.findMany({ where: { userId }, select: { id, title, status, createdAt, updatedAt }, orderBy: { updatedAt: "desc" }, take: 10 })`
    - `prisma.userSkill.findMany({ where: { userId }, select: { id, skill: { select: { name: true } }, aiValidated, createdAt, updatedAt }, orderBy: { updatedAt: "desc" }, take: 10 })`
  - Map each to `ActivityEvent`:
    - `experience.createdAt === experience.updatedAt` (within 1s) → type `"experience"`, xp `200`
    - `experience` where `updatedAt > createdAt` by > 1s → type `"experience_updated"`, xp `50`
    - `project.status === "COMPLETED"` → type `"project_completed"`, xp `300`; else skip
    - `userSkill.aiValidated === true` → type `"skill_ai"`, xp `150`, title = `skill.name`
    - `userSkill.aiValidated === false` → type `"skill_manual"`, xp `50`, title = `skill.name`
  - Merge all mapped events, sort by `timestamp` descending, return top 5
  - Use `import { formatTimeAgo } from '@/lib/utils/format'` — note: `formatTimeAgo` is computed at render
    time in the component, not in the data layer; the data function returns raw `ActivityEvent[]` with
    `timestamp: Date`

- [x] 2-A.4 Create `features/tech/components/sys-log-panel.tsx` as a server component
  - No `"use client"` directive — this is a React Server Component
  - Props: `{ userId: string; className?: string }`
  - Calls `getRecentUserActivity(userId)` directly (async server component)
  - Renders the same structure as the current inline SYS_LOG block in `dashboard/page.tsx` but with
    real data
  - Dot color map per event type (inline style or Tailwind arbitrary values):
    - `"experience"` / `"experience_updated"` → `hsl(150,100%,45%)` (green)
    - `"project_completed"` → `hsl(174,100%,50%)` (cyan)
    - `"skill_ai"` → `hsl(330,100%,65%)` (magenta)
    - `"skill_manual"` → `hsl(52,100%,50%)` (yellow)
  - Event text format: `"{event.title} +{event.xp} XP {formatTimeAgo(event.timestamp)}"` — split across
    two `<p>` tags to match the existing visual layout (title+xp on top line, timeAgo below)
  - Export: `export async function SysLogPanel({ userId, className }: SysLogPanelProps)`
  - Props type goes in `features/tech/types/dashboard.ts` as `SysLogPanelProps`

- [x] 2-A.5 Replace the inline SYS_LOG block in `dashboard/page.tsx` with `<SysLogPanel>`
  - Remove lines 124–152 (the entire hardcoded `<div>` block containing the 3 mock events)
  - Import and render: `<SysLogPanel userId={user.id} className="flex-1 min-h-[120px]" />`
  - Add `SysLogPanel` to the exports in `features/tech/index.tsx` or import directly from the component
    path — prefer direct import since it is a server component used only in `dashboard/page.tsx`

**Acceptance Criteria:**
- `formatTimeAgo` is a pure function in `lib/utils/format.ts`
- `SysLogPanel` is a server component that fetches and renders the 5 most recent real activity events
- Dot colors match the event type map from the spec
- Event format matches: `"{title} +{xp} XP {timeAgo}"` with two-line layout
- The hardcoded mock SYS_LOG block is removed from `dashboard/page.tsx`

---

#### Task Group 2-B: ActivityHeatmap Real Streak Data

**File:** `features/tech/components/activity-heatmap.tsx`
**Also modifies:**
- `features/dashboard/data/getUserDashboardStats.data.ts`
- `features/dashboard/types/dashboard.ts`
- `app/[locale]/(protected)/dashboard/page.tsx`

- [x] 2-B.1 Add `lastStreakDate` to `getUserDashboardStats`
  - In `features/dashboard/data/getUserDashboardStats.data.ts`, add `lastStreakDate` to the Prisma
    `select` for the `user` query (the field exists on the `User` model from Phase 3C):
    ```
    select: { ..., currentStreak: true, lastStreakDate: true }
    ```
  - In the return object, include `lastStreakDate: user.lastStreakDate` (type: `Date | null`)

- [x] 2-B.2 Add `lastStreakDate` to the `DashboardStats` type
  - In `features/dashboard/types/dashboard.ts`, add to the `DashboardStats` interface:
    ```typescript
    lastStreakDate: Date | null
    ```

- [x] 2-B.3 Add `currentStreak` and `lastStreakDate` props to `ActivityHeatmap`
  - The component currently generates random data — add these props:
    ```typescript
    interface ActivityHeatmapProps {
      currentStreak: number
      lastStreakDate: Date | null
      className?: string
    }
    ```
  - Move the props type to `features/tech/types/dashboard.ts` as `ActivityHeatmapProps`
  - Remove the `Math.random()` generation block entirely

- [x] 2-B.4 Build the 30-day real activity array from streak props
  - Inside `ActivityHeatmap`, compute the 30-day array:
    ```typescript
    const today = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(today)
      day.setDate(today.getDate() - (29 - i))
      return day
    })
    const streakEnd = lastStreakDate ? new Date(lastStreakDate) : null
    const streakStart = streakEnd
      ? new Date(new Date(streakEnd).setDate(streakEnd.getDate() - currentStreak + 1))
      : null
    const data = days.map(day => {
      if (!streakStart || !streakEnd) return { date: day, intensity: 0 }
      const inStreak = day >= streakStart && day <= streakEnd
      return { date: day, intensity: inStreak ? 4 : 0 }
    })
    ```
  - Pass `data` into the existing heatmap dot renderer — no change to the visual dot layout

- [x] 2-B.5 Pass `currentStreak` and `lastStreakDate` from `dashboard/page.tsx`
  - In `dashboard/page.tsx`, `stats` now includes `lastStreakDate` (added in 2-B.1)
  - Change `<ActivityHeatmap />` to:
    ```tsx
    <ActivityHeatmap currentStreak={stats.currentStreak} lastStreakDate={stats.lastStreakDate} />
    ```

**Acceptance Criteria:**
- `getUserDashboardStats` returns `lastStreakDate: Date | null`
- `DashboardStats` type includes `lastStreakDate`
- `ActivityHeatmap` takes `currentStreak` and `lastStreakDate` props and removes all `Math.random()` calls
- The 30-day grid shows intensity 4 for days within the streak window and 0 for days outside

---

#### Task Group 2-C: TopRunners Real XP Ranking

**New file:** `features/dashboard/data/getTopRunners.data.ts`
**Also modifies:**
- `features/tech/components/top-runners-panel.tsx`
- `app/[locale]/(protected)/dashboard/page.tsx`
- `features/tech/types/dashboard.ts` (for `Runner` type if not already exported)

- [x] 2-C.1 Create `features/dashboard/data/getTopRunners.data.ts`
  - Imports: `prisma` from `@/lib/prisma`, `unstable_cache` from `next/cache`
  - Define the return type `TopRunner`:
    ```typescript
    export interface TopRunner {
      id: string
      name: string
      username: string | null
      image: string | null
      totalXP: number
      isCurrentUser: boolean
    }
    ```
  - Core query — fetch all users with their XP-bearing relations:
    ```typescript
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        experiences: { select: { startDate: true, endDate: true } },
        projects: { select: { status: true } },
        userSkills: { select: { aiValidated: true } },
      }
    })
    ```
  - Compute `totalXP` per user using the same formula as `getUserDashboardStats`:
    - Experience XP: for each experience, months × 50 (use `startDate`/`endDate`, default to 1 month if
      `endDate` is null); cap per experience at a reasonable max
    - Project XP: `status === "COMPLETED"` → 300 XP each
    - AI-validated skill XP: 150 per `aiValidated === true` userSkill
    - Manual skill XP: 50 per `aiValidated === false` userSkill
  - Sort descending by `totalXP`, take top 5
  - Mark `isCurrentUser: user.id === currentUserId`
  - Wrap with `unstable_cache`:
    ```typescript
    export const getTopRunners = unstable_cache(
      async (currentUserId: string): Promise<TopRunner[]> => { ... },
      ["top-runners"],
      { tags: ["top-runners"], revalidate: 300 }
    )
    ```

- [x] 2-C.2 Update `TopRunnersPanel` to accept real `runners` prop
  - In `features/tech/components/top-runners-panel.tsx`:
    - The component currently uses `defaultRunners` hardcoded data — remove the `defaultRunners` import/const
    - The existing `runners?: Runner[]` prop (if it already exists in the component) now becomes required
      for real data; if not present, add it
    - Use `runners` directly for rendering without a fallback to `defaultRunners`
    - The `isCurrentUser` flag on each runner drives the highlight treatment: `border-l-2 border-[hsl(174,100%,50%)]`
      and `bg-[hsl(174,100%,50%,0.06)]` on the matching row (consistent with the spec)
  - Move the `Runner` type definition (if inline) to `features/tech/types/dashboard.ts` and import it back

- [x] 2-C.3 Pass `runners` from `dashboard/page.tsx`
  - In `dashboard/page.tsx`, after `stats` is fetched, add:
    ```typescript
    const runners = await getTopRunners(user.id)
    ```
  - Import `getTopRunners` from `@/features/dashboard/data/getTopRunners.data`
  - Pass to `<TopRunnersPanel runners={runners} className="flex-1 min-h-[160px]" />`

**Acceptance Criteria:**
- `getTopRunners` queries real users, computes XP with the same formula as `getUserDashboardStats`, returns top 5
- `TopRunnersPanel` no longer imports or uses any hardcoded `defaultRunners` data
- Current user row is visually highlighted with left border and faint background
- The query is wrapped in `unstable_cache` tagged `"top-runners"` with 5-minute revalidation

---

### TG3 — GalaxyCanvas / Skill Tree Polish

**Dependencies:** TG1 and TG2 are complete; TG3 is independent of their output but should run after
to avoid merge conflicts on types files.

---

#### Task Group 3-A: AI-Validated Node Glow

**File:** `features/skills/components/SkillHexagonNode.tsx`

- [ ] 3-A.1 Read `userSkill.aiValidated` inside `SkillHexagonNode`
  - The `userSkill` object is already passed via props through the Prisma type — confirm the prop path:
    likely `props.userSkill.aiValidated` or `props.skill.aiValidated` depending on component structure
  - Add: `const isAIValidated = userSkill?.aiValidated === true`

- [ ] 3-A.2 Apply additive CSS `drop-shadow` filter for AI-validated nodes
  - On the hex polygon element (the primary `<polygon>` or `<path>` that renders the hexagon shape):
    ```tsx
    style={{
      filter: isAIValidated
        ? "drop-shadow(0 0 10px #D946EF) drop-shadow(0 0 5px #00D4FF)"
        : existingFilter  // keep the existing LEVEL_GLOW_FILTERS value
    }}
    ```
  - The magenta/cyan double drop-shadow is additive — it layers on top of the existing category-color
    glow without replacing it. Inspect the current `filter` prop to ensure the non-validated path still
    receives the original `LEVEL_GLOW_FILTERS` value.

- [ ] 3-A.3 Add AI indicator mark `★` to the SVG
  - Inside the `<svg>` element of `SkillHexagonNode`, add conditionally after the hex polygon:
    ```tsx
    {isAIValidated && (
      <text
        x="72" y="28"
        fontSize="14"
        fill="#D946EF"
        opacity="0.9"
        fontFamily="monospace"
        textAnchor="middle"
      >
        ★
      </text>
    )}
    ```
  - Position `x=72, y=28` places the star in the top-right area of the node SVG viewBox without
    overlapping the skill name label or level indicator

**Acceptance Criteria:**
- AI-validated nodes show both the standard category color glow AND the magenta/cyan double drop-shadow
- Non-validated nodes are visually unchanged from the current state (only `LEVEL_GLOW_FILTERS`)
- The `★` mark at `x=72, y=28` is visible on AI-validated nodes only, at `opacity=0.9`

---

#### Task Group 3-B: Honeycomb Growth for Large Clusters

**File:** `features/skills/components/CategoryCluster.tsx`

- [ ] 3-B.1 Update ring2 radius in `calculateHexagonPositions`
  - Locate the `calculateHexagonPositions` function (or equivalent) inside `CategoryCluster.tsx`
  - Change the ring2 radius from `spacing * 1.9` to `spacing * 2.1`
  - The even/odd honeycomb stagger (`angle + 15deg` for even, `angle - 15deg` for odd) — verify it is
    already applied via `i * 30 + 15` offsets; if the existing ring2 loop uses `i * 30` flat, add the
    stagger: `const angle = i * 30 + (i % 2 === 0 ? 15 : -15)` for a beehive row offset

- [ ] 3-B.2 Add ring3 for 19+ skills
  - After the ring2 block, add a ring3 block inside `calculateHexagonPositions`:
    ```typescript
    // Ring 3: 18 positions at spacing * 3.3, triggered when skillCount >= 19
    if (skillCount >= 19) {
      for (let i = 0; i < 18; i++) {
        const angle = (i * 20) * (Math.PI / 180)
        positions.push({
          x: center.x + Math.cos(angle) * spacing * 3.3,
          y: center.y + Math.sin(angle) * spacing * 3.3,
        })
      }
    }
    ```
  - The function signature stays unchanged — only the internal position array grows

- [ ] 3-B.3 Verify cable connections are unaffected
  - Open `features/skills/components/SkillConnections.tsx` and confirm it draws cables between
    cluster-center positions (not individual node positions within a cluster)
  - If `SkillConnections` uses per-node positions from `calculateHexagonPositions`, verify the first
    position in the array (center/hub node) is still index 0 — ring changes only append to the end of
    the array, so cable source/destination indices remain valid
  - No code changes to `SkillConnections.tsx` should be needed; this is a verification step only

**Acceptance Criteria:**
- Ring2 clusters use `spacing * 2.1` radius — nodes are less crowded than at `spacing * 1.9`
- Clusters with 19+ skills use a third ring at `spacing * 3.3` with 18 positions
- Cable connections between clusters are visually intact after the position change
- Labels remain readable (do not overlap neighbor nodes) at default zoom on the current skill tree view

---

### TG4 — Timeline: Chronological Sidebar

**Dependencies:** None (independent of TG1–TG3; can be parallelized but run after to avoid conflicts)

**Files:**
- `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx` (primary)
- New: `features/timeline/components/TimelineSidebar.tsx` (or inline in `DashboardTimelineView.tsx`)

---

#### Task Group 4: Timeline Sidebar Implementation

- [ ] 4.1 Add `focusedExperienceId` prop support to `TimelineMap`
  - In the `TimelineMap` component (locate file in `features/timeline/` or within the timeline route):
    - Add optional prop `focusedExperienceId?: string`
    - When `focusedExperienceId` changes, pan the Google Maps instance to the corresponding pin using
      `map.panTo(pin.position)` or `map.setCenter(pin.position)` — use the existing pin data structure
      to look up the experience by id
    - Highlight the matching pin: increase its z-index and apply a brief scale animation or color change
      to distinguish it as "focused"

- [ ] 4.2 Add sidebar state to `DashboardTimelineView`
  - In `DashboardTimelineView.tsx`:
    - Add state: `const [sidebarOpen, setSidebarOpen] = useState(true)`
    - The existing `selectedExperience` state is already present — wire sidebar clicks to it

- [ ] 4.3 Create `TimelineSidebar` component
  - Create `features/timeline/components/TimelineSidebar.tsx` as a client component (`"use client"`)
  - Props type (add to `features/timeline/types/` or to `features/tech/types/dashboard.ts`):
    ```typescript
    export interface TimelineSidebarProps {
      experiences: Experience[]            // sorted by startDate descending — sort in the parent
      selectedExperienceId?: string
      onSelect: (exp: Experience) => void
      isOpen: boolean
      onToggle: () => void
    }
    ```
  - Layout structure:
    - Outer: `<div className="w-[280px] flex-shrink-0 flex flex-col border-l border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,6%)] h-full overflow-hidden relative">`
    - Toggle button: absolute-positioned `<button>` on the left edge of the sidebar that calls `onToggle`
      — shows `<` when open, `>` when closed. When closed, the sidebar collapses to a thin `w-8` strip.
      Use `transition-all duration-300` for the width animation.
    - When open, render the scrollable entry list inside `<div className="flex-1 overflow-y-auto">`:
      - Each entry: `<button onClick={() => onSelect(exp)}>` with:
        - Colored dot `<span>` using the experience type color map (Work=cyan, Education=yellow,
          Project=magenta, Certification=green — use the same color map as the existing filter tabs)
        - Title in `font-mono text-[11px]`
        - Date range: `MMM YYYY` format using `new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' })`
          — show `startDate` and `endDate ?? "Presente"`
        - XP badge: `<TechBadge color="cyan">+{xp} XP</TechBadge>` imported from `@/features/tech`
      - Highlighted entry (matching `selectedExperienceId`): add `border-l-2 border-[hsl(174,100%,50%)]`
        and `bg-[hsl(174,100%,50%,0.06)]` to the entry's className
  - The sidebar scrolls independently with `overflow-y-auto`

- [ ] 4.4 Wire `TimelineSidebar` into `DashboardTimelineView`
  - In `DashboardTimelineView.tsx`:
    - Change the main layout from a single-column `TimelineMap` to a flex row:
      ```tsx
      <div className="flex flex-1 min-h-0">
        <div className={cn("flex-1 min-h-0", sidebarOpen ? "mr-0" : "")}>
          <TimelineMap
            ...existingProps
            focusedExperienceId={selectedExperience?.id}
          />
        </div>
        <TimelineSidebar
          experiences={[...experiences].sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )}
          selectedExperienceId={selectedExperience?.id}
          onSelect={(exp) => setSelectedExperience(exp)}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />
      </div>
      ```
    - When `sidebarOpen` is false, the map fills the full width naturally (sidebar collapses to `w-8`)
    - Ensure the map container still occupies at least 70% of viewport width when sidebar is open:
      the `flex-1` on the map container guarantees this when the sidebar is fixed at `w-[280px]`

**Acceptance Criteria:**
- A collapsible right sidebar (`w-[280px]`) appears alongside the Google Maps timeline view
- Experiences in the sidebar are ordered by `startDate` descending
- Clicking a sidebar entry: sets `selectedExperience` and pans the map to that pin via `focusedExperienceId`
- The selected entry has a left cyan border and faint background highlight
- The sidebar can be collapsed to a thin strip via a toggle button, with `transition-all duration-300`
- Map container stays at full `flex-1` width when sidebar is collapsed; layout does not break

---

### TG5 — Public Portfolio Hero and Skills Polish

**Dependencies:** TG3-A must be complete (AI-validated glow propagates automatically to public skills)

**New file:** `lib/utils/xp.ts`

---

#### Task Group 5-A: Public Portfolio Hero — Global Level and Cursor

**Files:**
- `lib/utils/xp.ts` (new)
- `features/portfolio/components/tech/TechHero.tsx`
- `features/dashboard/data/getUserDashboardStats.data.ts`
- `app/globals.css` or the relevant CSS file containing `@keyframes glitch` and `animate-digital-flicker`

- [ ] 5-A.1 Create `lib/utils/xp.ts` with `calculateGlobalLevel`
  - New file with a single exported pure function:
    ```typescript
    /**
     * Calculates the global user level from total XP.
     * Formula: floor(sqrt(totalXP / 100))
     */
    export function calculateGlobalLevel(totalXP: number): number {
      return Math.floor(Math.sqrt(totalXP / 100))
    }
    ```

- [ ] 5-A.2 Replace the inline formula in `getUserDashboardStats.data.ts`
  - Locate the line (approximately line 82): `Math.floor(Math.sqrt(totalXP / 100))`
  - Replace with: `import { calculateGlobalLevel } from '@/lib/utils/xp'` at the top of the file, and
    `calculateGlobalLevel(totalXP)` at the computation site
  - No logic change — pure extraction

- [ ] 5-A.3 Fix the `LevelBadge` in `TechHero.tsx` to use real Global Level
  - In `features/portfolio/components/tech/TechHero.tsx`:
    - Import `calculateGlobalLevel` from `@/lib/utils/xp`
    - Locate the hardcoded `level={1}` on `<LevelBadge>`
    - Replace with: `const globalLevel = calculateGlobalLevel(data.stats?.totalXP ?? 0)`
    - Change to: `<LevelBadge level={globalLevel} />`

- [ ] 5-A.4 Add the mandatory terminal cursor after the username `<p>` tag in `TechHero.tsx`
  - Locate the username `<p>` element in `TechHero.tsx`
  - Immediately after it, add:
    ```tsx
    <span className="font-mono text-[hsl(174,100%,50%)] animate-pulse ml-0.5">|</span>
    ```
  - The `animate-pulse` Tailwind class handles the blinking without additional JS — this satisfies the
    "mandatory blinking cursor" hard requirement

- [ ] 5-A.5 Reduce `glitch-text` CSS animation intensity to 50% of current values
  - Locate `@keyframes glitch` (or equivalent) in `app/globals.css` or `tailwind.config.ts`
  - Halve all `translate` and `skew` values in the keyframe stops:
    - Example: `transform: translate(-4px, 2px) skew(0.5deg)` → `transform: translate(-2px, 1px) skew(0.25deg)`
  - Apply the same 50% reduction to all `translate`/`skew` values across all keyframe stops — do not
    change timing, easing, or the keyframe structure

- [ ] 5-A.6 Reduce `animate-digital-flicker` to 50% opacity floor and doubled duration
  - Locate the `animate-digital-flicker` keyframe definition in the same CSS/config file
  - Change opacity range from `[0, 1]` (or whatever current min is) to `[0.5, 1.0]`
  - Double the animation duration (if currently `0.8s`, change to `1.6s`; if `1s`, change to `2s`)
  - Do NOT remove the animation class or keyframe — only modify the keyframe opacity and animation
    duration property

**Acceptance Criteria:**
- `lib/utils/xp.ts` exports `calculateGlobalLevel(totalXP: number): number` with the floor/sqrt formula
- `getUserDashboardStats` uses `calculateGlobalLevel` from the shared utility (no inline formula)
- `TechHero` `LevelBadge` shows the real computed level from `data.stats.totalXP`
- A blinking `|` cursor appears immediately after the username element in `TechHero`
- `glitch-text` animation translate/skew values are halved; animation structure unchanged
- `animate-digital-flicker` opacity floor is 0.5 and animation duration is doubled

---

#### Task Group 5-B: Public Portfolio Skills — AI-Validated Badge Legend

**File:** `features/portfolio/components/tech/TechSkills.tsx`

- [ ] 5-B.1 Confirm AI-validated glow propagates automatically
  - The `TechSkills` component renders `SkillTreeView` with `isEditable={false}`, which renders
    `SkillHexagonNode` — the same component modified in TG3-A
  - Verify by inspection (read the component tree) that `aiValidated` is included in the `userSkills`
    data passed to `TechSkills` from the public portfolio data layer; if it is not selected in the
    Prisma query, add `aiValidated: true` to the select in the public portfolio data function
  - No component code changes needed for the glow itself — it flows through `SkillHexagonNode`

- [ ] 5-B.2 Add AI-validated legend row above the skill tree in `TechSkills`
  - Import `TechBadge` from `@/features/tech`
  - Above the `<SkillTreeView ...>` element, add:
    ```tsx
    {userSkills.some(s => s.aiValidated) && (
      <div className="flex items-center gap-3 mb-4 px-2">
        <TechBadge color="magenta">★ AI Verified</TechBadge>
        <TechBadge color="gray">Self-Assessed</TechBadge>
      </div>
    )}
    ```
  - Only renders if at least one skill in the portfolio is AI-validated
  - Uses `TechBadge` from the existing barrel file — no new components created

**Acceptance Criteria:**
- Public skills page shows AI-validated glow on validated nodes (via TG3-A propagation)
- The legend row (`★ AI Verified` / `Self-Assessed`) appears above the skill tree only when at least
  one AI-validated skill exists in the user's portfolio
- `TechBadge` is imported from `@/features/tech` — no new badge components are created
- `aiValidated` field is confirmed in the public portfolio Prisma query select

---

## Execution Order

The task groups must be implemented in the following sequence due to data dependencies:

1. **TG1-A** (AIEye new states + types) — establishes `DashboardRow1Props` in types file; all subsequent
   TG1 tasks build on this
2. **TG1-B** (Drowsy animation fix) — independent of TG1-A, can run in parallel with TG1-A
3. **TG1-C** (SYS_MONITOR real data) — depends on `WelcomeCardProps.activeSkillsCount` from TG1-A
4. **TG2-A** (SYS_LOG extraction) — independent of TG1 results; only needs `lib/utils/format.ts` created
5. **TG2-B** (ActivityHeatmap) — depends on `lastStreakDate` added to `DashboardStats` (TG1-C step 2-B.1
   touches `getUserDashboardStats`); run after TG1-C is complete
6. **TG2-C** (TopRunners) — independent; can run after TG2-A
7. **TG3-A** (AI-validated node glow) — independent; required before TG5-B verification step
8. **TG3-B** (Honeycomb growth) — independent of all other TGs; can run after TG3-A
9. **TG4** (Timeline sidebar) — fully independent; run last to avoid layout file conflicts
10. **TG5-A** (Public portfolio hero) — independent; creates `lib/utils/xp.ts` first
11. **TG5-B** (Public portfolio skills legend) — depends on TG3-A being done for glow verification

Recommended parallel batches for a single implementer:
- Batch 1: TG1-A, TG1-B (both modify `crt-with-ai.tsx` — do sequentially within the file)
- Batch 2: TG1-C + TG2-A (different files, no conflict)
- Batch 3: TG2-B + TG2-C (different files, no conflict)
- Batch 4: TG3-A + TG3-B (different files within `features/skills/`)
- Batch 5: TG4 (timeline — isolated route)
- Batch 6: TG5-A + TG5-B (public portfolio — isolated feature folder)
