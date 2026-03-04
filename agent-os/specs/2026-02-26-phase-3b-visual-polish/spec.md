# Specification: Phase 3B — Visual Polish (Tech Mode)

## Goal

Polish and wire the Tech Mode dashboard, skill tree, timeline, and public portfolio to achieve a "tech-futurista profesional" aesthetic — modern terminal-grade UI with all remaining mock data replaced by real DB sources, without rebuilding any component from scratch.

## User Stories

- As a logged-in user, I want my dashboard to show real-time data from my profile so that every panel reflects my actual progress without placeholder values.
- As a public portfolio visitor, I want to see the user's Global Level and visually differentiated AI-validated skills so that the credibility of the profile is immediately clear.
- As a logged-in user, I want the timeline to have a chronological sidebar so that I can navigate experiences without relying solely on the map.

## Specific Requirements

**TG1-A — AIEye: New Reactive States**
- Add two new values to the `AIState` union in `features/tech/components/crt-with-ai.tsx`: `"xp_gain"` and `"life_loss"`
- `"xp_gain"`: iris color changes to green (`hsl(150,100%,45%)`), fast double-blink (2 rapid blinks at 80ms each), auto-returns to previous state after 1.2s
- `"life_loss"`: iris color changes to red (`hsl(0,80%,55%)`), a single slow, heavy blink (300ms close, 400ms hold closed, 300ms open), outer hex border pulses red once, auto-returns to previous state after 2s
- Both states must be triggerable via two new optional callback props on `CRTWithAIProps`: `onXPGain?: () => void` and `onLifeLoss?: () => void` — the parent (`DashboardRow1`) calls these; the eye reacts internally
- `DashboardRow1` must expose `onXPGain` and `onLifeLoss` as pass-through props to wire up from `dashboard/page.tsx` if needed; new prop types go in `features/tech/types/dashboard.ts`
- The `mainColor` switch block in `AIEye` must handle the two new states before the default cyan fallback

**TG1-B — AIEye: Dynamic Idle Sequence Fix**
- The current `resetInactivity` fires after `INACTIVITY_RETURN_MS` (5s) and transitions to `"drowsy"` then `"sleeping"` after 4s — this sequence is correct and must be preserved
- Fix the drowsy animation: replace the current `drowsyBlinkInterval` recursive-timeout loop (which produces erratic multi-blink behavior) with a single Framer Motion `animate` on the iris ellipse that mirrors the wake-up `irisRY` spring in reverse — iris smoothly closes from `ry=13` to `ry=10` to `ry=4` over 3s, using `type: "tween", duration: 3, ease: "easeInOut"` driven by `isDrowsy` state, no recursive `setTimeout` chains
- Remove the `drowsyBlinkInterval` ref entirely; replace with a Framer Motion `animate` prop variant on the existing iris ellipse
- The drowsy half-lid `motion.rect` overlay stays but remove its `animate` pulse — make it a static `opacity: 0.4` at `y=37, height=8` as a fixed drooping lid

**TG1-C — WelcomeCard SYS_MONITOR: Real Data**
- `SystemStatusPanel` in `features/tech/components/welcome-card.tsx` currently renders 4 hardcoded `StatusBar` values; replace with real data
- Read browser metrics on mount inside a `useEffect` using optional chaining: `(navigator as any).connection?.downlink` for NET (map Mbps to 0–100%), `(performance as any).memory?.usedJSHeapSize` and `totalJSHeapSize` for RAM, wrap in `try/catch` — if unavailable, use decorative fallback values (NET: 88, CPU: 24, RAM: 61, GPU: 18)
- CPU: use a simple load estimator — schedule 10 `performance.now()` delta measurements at 100ms intervals on mount and compute utilization as `Math.min(99, Math.round((avgDelta - 100) / 2))`, fallback 24 if negative
- GPU: always decorative (WebGL heap is unavailable without canvas); show a static 18 with a `// decorative` comment
- The "skills: 24 active" readout at the bottom must receive an `activeSkillsCount: number` prop and display the real value; `WelcomeCardProps` in `features/tech/types/dashboard.ts` gains `activeSkillsCount?: number`
- "uptime" readout replaces with `streak: {streakDays}d` using the already-passed `streakDays` prop

**TG2-A — SYS_LOG: Real DB Events**
- Extract the current inline SYS_LOG block from `app/[locale]/(protected)/dashboard/page.tsx` (lines 124–153) into a new server component: `features/tech/components/sys-log-panel.tsx`
- Create `features/dashboard/data/getRecentUserActivity.data.ts` — a lightweight Prisma query that fetches the 5 most recent user activity events across: `experiences` (select `title`, `type`, `createdAt`, `updatedAt`), `projects` (select `title`, `status`, `createdAt`, `updatedAt`), `userSkills` (select `skill.name`, `aiValidated`, `createdAt`, `updatedAt`)
- Merge and sort all events by timestamp descending, take the top 5, return typed `ActivityEvent[]`
- Format: `"{title} +{xp} XP {timeAgo}"` — XP amounts: experience created = 200 XP, project completed = 300 XP, skill AI-validated = 150 XP, skill manual = 50 XP, experience updated = 50 XP
- `timeAgo` is a pure utility `formatTimeAgo(date: Date): string` in `lib/utils/format.ts` — returns "hace X minutos", "hace X horas", "AYER", "hace X días"
- Dot color per event type: experience = green `hsl(150,100%,45%)`, project = cyan `hsl(174,100%,50%)`, skill AI-validated = magenta `hsl(330,100%,65%)`, skill manual = yellow `hsl(52,100%,50%)`
- `SysLogPanel` is a server component; it calls `getRecentUserActivity(userId)` directly and renders the list; receives `userId: string` prop from `dashboard/page.tsx`

**TG2-B — ActivityHeatmap: Real Streak Data**
- `ActivityHeatmap` in `features/tech/components/activity-heatmap.tsx` currently generates random data; add props: `currentStreak: number` and `lastStreakDate: Date | null`
- Build a 30-day real activity array: for each of the past 30 days, set intensity `4` if the day falls within `[lastStreakDate - currentStreak days, lastStreakDate]`, else `0`; pass `streakDays={stats.currentStreak}` and `lastStreakDate={stats.lastStreakDate}` from `dashboard/page.tsx`
- `getUserDashboardStats` already selects `currentStreak`; add `lastStreakDate` to the existing select in `fetchDashboardStats` and to the `DashboardStats` type in `features/dashboard/types/dashboard.ts`
- Remove the random `Math.random()` generation entirely

**TG2-C — TopRunners: Real XP Ranking**
- `TopRunnersPanel` in `features/tech/components/top-runners-panel.tsx` currently uses `defaultRunners` hardcoded data
- Create `features/dashboard/data/getTopRunners.data.ts` — queries all users, selects `id`, `name`, `username`, `image`, computes total XP using the same formula as `getUserDashboardStats` (experience months + project XP + AI-validated skill XP), sorts descending, returns top 5
- Adds `currentUserId: string` param to mark the current user row; `isCurrentUser` is `true` when `user.id === currentUserId`
- `TopRunnersPanel` adds `runners?: Runner[]` prop (already exists in the component); `dashboard/page.tsx` fetches runners server-side and passes them; remove the `defaultRunners` fallback import
- Cache with `unstable_cache` tagged `"top-runners"`, revalidated in the same mutation hooks as `user-stats-${userId}`

**TG3-A — GalaxyCanvas: AI-Validated Node Glow**
- In `features/skills/components/SkillHexagonNode.tsx`, check `userSkill.aiValidated: boolean` (already on the `UserSkill` Prisma model)
- When `aiValidated === true`: apply an SVG `filter` with `feGaussianBlur stdDeviation="3"` and a `feColorMatrix` tinted magenta/cyan alternating — implement as a CSS `drop-shadow` on the hex polygon: `filter: drop-shadow(0 0 10px #D946EF) drop-shadow(0 0 5px #00D4FF)`
- When `aiValidated === false`: keep the existing category-color glow unchanged (current `LEVEL_GLOW_FILTERS`)
- Add a small AI indicator mark — a `★` or `✦` character rendered in the SVG at `x=72, y=28, fontSize=14, fill=#D946EF` with `opacity=0.9` — only when `aiValidated === true`
- `SkillHexagonNodeProps` in `features/skills/types/skill.ts` already includes `userSkill.aiValidated` through the Prisma type; no new fields needed

**TG3-B — GalaxyCanvas: Honeycomb Growth for Large Clusters**
- In `features/skills/components/CategoryCluster.tsx`, the existing `calculateHexagonPositions` already handles a second ring (12 positions) when `skillCount >= 7`, but the ring2 radius `spacing * 1.9` causes crowding
- Change ring2 radius to `spacing * 2.1` and offset rows by applying the honeycomb stagger: even-indexed ring2 positions use `angle + 15deg` offset (already done via `i * 30 + 15`), odd-indexed use `angle - 15deg` — this creates the beehive row stagger
- Add a third ring for `skillCount >= 19`: use `spacing * 3.3` radius with 18 positions at `i * 20` degree increments
- Ensure `SkillConnections` cable lines in `features/skills/components/SkillConnections.tsx` use the existing position data — they already reference cluster center positions, so cable endpoints update automatically when ring positions change
- Visual target from `planning/visuals/visuals/FireShot Capture 035 - My Skill Tree - Portfoland - [localhost].png`: clusters should never overlap labels even at default zoom

**TG4 — Timeline: Chronological Sidebar**
- In `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`, add a `TimelineSidebar` sub-component (defined in the same file or extracted to `features/timeline/components/TimelineSidebar.tsx`)
- Layout: place the sidebar as a fixed-width right column (`w-[280px]`) or bottom bar (`h-[160px]`) — default to a **collapsible right sidebar** toggled by a button; on small screens degrade to a bottom drawer
- Sidebar content: list all filtered experiences ordered by `startDate` descending; each entry shows: colored dot (by `type`), title, date range as `MMM YYYY`, XP badge using `TechBadge` from `features/tech/index.tsx`
- Clicking a sidebar entry: calls `setSelectedExperience(exp)` (state already exists) and pans the `TimelineMap` to that pin — `TimelineMap` must expose an `onFocusExperience?: (exp: Experience) => void` prop or accept a `focusedExperienceId?: string` prop to pan/highlight internally
- Sidebar scrolls independently (overflow-y-auto); supports left-right gesture scroll on touch if rendered as a bottom bar
- Highlighted entry in the sidebar: matching `selectedExperience?.id` gets `border-l-2 border-[hsl(174,100%,50%)]` and `bg-[hsl(174,100%,50%,0.06)]` — same treatment as the current `isCurrentUser` row in `TopRunnersPanel`

**TG5-A — Public Portfolio Hero: Global Level & Cursor**
- In `features/portfolio/components/tech/TechHero.tsx`, the `LevelBadge` currently hardcodes `level={1}`; replace with the real formula: `const globalLevel = Math.floor(Math.sqrt((data.stats?.totalXP ?? 0) / 100))`
- Extract the formula as `calculateGlobalLevel(totalXP: number): number` in `lib/utils/xp.ts` (create this file); both `getUserDashboardStats.data.ts` and `TechHero` import from it — `getUserDashboardStats` currently uses `Math.floor(Math.sqrt(totalXP / 100))` inline; replace with the shared utility
- Add a mandatory terminal cursor element directly after the username `<p>` tag: a `<span>` with `className="font-mono text-[hsl(174,100%,50%)] animate-pulse ml-0.5"` containing `|` — this satisfies the hard cursor requirement
- Reduce the `glitch-text` CSS animation intensity on the `<h1>` to 50% of current values — in the relevant CSS/Tailwind config file (likely `app/globals.css` or a `tailwind.config.ts` keyframe), halve the translate/skew values of `@keyframes glitch` while keeping the keyframe structure
- Reduce `animate-digital-flicker` opacity range from current min to `min: 0.5, max: 1.0` (currently likely 0–1); halve the flicker speed by doubling the animation duration

**TG5-B — Public Portfolio Skills: AI-Validated Badge**
- `TechSkills` in `features/portfolio/components/tech/TechSkills.tsx` renders `SkillTreeView` with `isEditable={false}` — AI-validated glow from TG3-A automatically applies here since it's the same `SkillHexagonNode`
- Additionally, add an AI-validated filter/legend to `TechSkills`: above the `SkillTreeView`, render a small legend row using `TechBadge color="magenta"` with label `"AI Verified"` and `TechBadge color="gray"` with label `"Self-Assessed"` — only render if `userSkills.some(s => s.aiValidated)`
- No additional component changes needed for skills — the visual differentiation is delivered by TG3-A propagating through `SkillHexagonNode`

## Visual Design

**`planning/visuals/visuals/PortfolandNext-GenHUD.png`** (PRIMARY TARGET — dashboard)
- WelcomeCard left section: avatar hex with `Lv.18` badge below, XP bar `1,900 / 2,450 XP`, streak badge `11 días de racha` — all must show real data from props
- SYS_MONITOR top-right panel: compact terminal box showing `session_stats: active`, skills count, next level goal — replace mock lines with real stats computed from props
- Center hex cluster: 4 overlapping hexagons (XP TOTAL in cyan large, EXPERIENCIAS/LOGROS/NIVEL ACTUAL in smaller hexes) — already wired, no layout changes
- SYS_LOG bottom-left: 3–5 events with green/cyan/yellow dots, relative timestamps, XP amounts in color — must match this exact format after TG2-A
- TOP_RUNNERS right column: 3 entries with XP amounts, current user highlighted — must match real data after TG2-C
- ACTIVITY_HEATMAP: 30-day grid with varying green intensity dots — must reflect real streak data after TG2-B

**`planning/visuals/visuals/FreshCyberpunkDashboard.png`** (SYS_LOG format reference)
- ACTIVIDAD RECIENTE section shows exact event format: `"Added Senior Developer experience +200 XP hace 2 horas"` — implement this exact string template in `formatActivityEvent(event: ActivityEvent): string`
- Header bar shows CPU/MEM/NET compact readouts — these map to the SYS_MONITOR StatusBar refactor in TG1-C
- IDENTIFICATION_MATRIX left panel shows `XP_Total`, `Current_Level`, `Skills`, `Achievements`, `Incoming_Transmissions` as terminal lines — use this as reference for the boot lines in `CRTWithAI`'s `BOOT_LINES` constant, replacing hardcoded values with real stats props passed to `CRTWithAI`

**`planning/visuals/visuals/FireShot Capture 034 - Portfoland - [localhost].png`** (current ground truth)
- Layout is correct and must be preserved: WelcomeCard left + CRT right (Row 1), Missions+SysLog left / HexDiamond center / Skills+Runners right (Row 2)
- Panels visible: `STATUS: SLEEPING` in CRT header — this status label must update to new states `XP_GAIN` and `LIFE_LOSS` after TG1-A
- SYS_MONITOR bars (NET 94%, CPU 37%, RAM 62%, GPU 18%) are the aesthetic target — real API values should visually match this range

**`planning/visuals/visuals/FireShot Capture 035 - My Skill Tree - Portfoland - [localhost].png`** (skill tree ground truth)
- FRONTEND cluster (top-left, cyan) and SOFT SKILLS cluster (bottom-right, yellow) show ring layout — this is the baseline before honeycomb changes
- Long glowing cable connections between clusters must remain intact after TG3-B position adjustments
- AI-validated glow must layer on top of the existing category color without replacing it — magenta/cyan drop-shadow is additive

**`planning/visuals/visuals/FireShot Capture 036 - My Timeline - Portfoland - [localhost].png`** (timeline ground truth)
- Current state: Google Maps view fills the entire content area, no sidebar exists — the chronological sidebar from TG4 must be added alongside the map without reducing map size below 70% of viewport width
- Filter tabs (All / Work / Education / Project / Certification) remain at top, unchanged
- Stats bar (XP total, milestones, experiences, achievements) remains at top, unchanged

## Existing Code to Leverage

**`features/tech/components/crt-with-ai.tsx` — AIEye state machine**
- `AIState` union and `mainColor` switch are the extension points for TG1-A new states; follow the exact same pattern as the existing `isSuccess` / `isReady` branches
- The `drowsyBlinkInterval` ref pattern for TG1-B must be removed; the existing `irisRY` / `motion.ellipse` spring animation on the iris is the correct hook for the drowsy close animation
- `onAIStateChange` callback pattern is the established way for `DashboardRow1` to react to state changes — mirror this for `onXPGain` / `onLifeLoss` in reverse direction (parent signals child)

**`features/tech/components/dashboard-row1.tsx` — sibling state coordinator**
- `AI_ACTIVE_STATES` array and `handleAIStateChange` callback are the established pattern; extend `DashboardRow1Props` to accept `onXPGain?` and `onLifeLoss?` and forward them to `CRTWithAI`
- All new prop types for `DashboardRow1` and `CRTWithAI` extensions go in `features/tech/types/dashboard.ts`

**`features/dashboard/data/getUserDashboardStats.data.ts` — primary data source**
- Level formula `Math.floor(Math.sqrt(totalXP / 100))` at line 82 must be extracted to `lib/utils/xp.ts` as `calculateGlobalLevel` and imported back here — no logic change, only extraction
- Add `lastStreakDate` to the existing Prisma `select` at line 36 and to the return object at line 102; add to `DashboardStats` type in `features/dashboard/types/dashboard.ts`

**`features/skills/components/CategoryCluster.tsx` — ring layout engine**
- `calculateHexagonPositions` is the single function to modify for TG3-B honeycomb growth; the function signature stays unchanged — only the ring2 radius and the addition of ring3 change inside it
- `SkillConnections` in `features/skills/components/SkillConnections.tsx` uses cluster-center-level positions (not individual node positions) for inter-cluster cables — these are unaffected by intra-cluster position changes

**`features/tech/index.tsx` — barrel file**
- `TechBadge`, `LevelBadge`, `HUDPanel`, `XPBar` from this file are the correct components to use for any new UI elements in TG4 (sidebar entries) and TG5-B (portfolio legend) — do not create new badge or panel components

## Out of Scope

- `CRTMonitor` component (`features/tech/components/crt-monitor.tsx`) — do not reference, polish, or import; it is superseded by `CRTWithAI`
- Database schema changes — `aiValidated`, `currentStreak`, `lastStreakDate`, `experiences`, `projects`, `userSkills` already exist; no `prisma migrate` or new model fields
- `DashboardNav` — no changes to navigation component
- Login and auth pages — no changes
- Portfolio loader redesign — referenced in requirements as future work, not in this spec
- The Gridcn / Glitchcn npm package installation — do not add new npm dependencies for UI libraries
- AI Skill Assessment Game (Phase 4 feature)
- Mobile-specific layout work beyond what naturally emerges from the sidebar toggle (TG4) and the existing responsive grid
- `ACTIVE_MISSIONS` panel data wiring — missions remain server-side static content; not in this spec
- `SKILL_MATRIX` (radar chart) data — `SkillRadarPanel` is not wired in this spec
- Removing or replacing the `glitch-text` / `animate-digital-flicker` CSS classes entirely — only reduce intensity, never remove
