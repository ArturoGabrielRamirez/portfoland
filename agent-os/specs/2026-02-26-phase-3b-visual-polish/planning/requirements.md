# Spec Requirements: Phase 3B — Visual Polish (Tech Mode)

## Initial Description

Refine the dashboard and public portfolio UI of Tech Mode to achieve a "tech-futurista profesional"
aesthetic — like a modern terminal (VS Code, Warp), NOT arcade/Tron/Cyberpunk 2077. Evaluate and
selectively integrate components from The Gridcn and Glitchcn. Refine hexagons, CRT effects, skill
tree, and wire all remaining mock data to real backend sources.

**Branch:** `feature/dashboard-redesign-v2`
**Palette:** bg `#0A0E1A`, cyan `#00D4FF`, magenta `#D946EF`

---

## Requirements Discussion

### First Round Questions

**Q1:** The DASHBOARD_POLISH_PLAN.md already exists on the branch as a solid implementation guide.
Should we adopt it as-is, extend it, or replace it with new priorities?
**Answer:** Solid base. Key additions/changes:
- WelcomeCard HUD panel MUST consume real data from Phase 3C (XP, level, streak, achievements
  already wired via `getUserDashboardStats`)
- AIEye is the central piece — must integrate deeply with the lives system and XP validation points

**Q2:** What is the intended scope — dashboard only, or also public portfolio?
**Answer:** (B) Dashboard + Hero/Skills Public. Keep scope tight to maximize first-impression quality.
- Public Hero must show Global Level using the formula: `floor(sqrt(totalXP / 100))`
- Public Skills must visually differentiate AI-validated skills from manually added ones

**Q3:** For GalaxyCanvas / Skill Tree — refine existing or rebuild?
**Answer:** Refine GalaxyCanvas. Keep Cyberpunk/Galaxy aesthetic.
- AI-validated nodes must have intense magenta/cyan glow vs standard nodes
- Solve the overcrowding problem: when many skills exist in a group, they should grow as a honeycomb
  (larger hex cluster) without hiding data. Connections (glowing cables) must be maintained.
- Reference image was mentioned but not yet uploaded to visuals folder

**Q4:** For AIEye — are the current states sufficient or do new states need to be added?
**Answer:** Expand and fix. Current states: sleeping, waking, observing, mouse/input tracking, drowsy,
searching, processing.

New interactions to add:
- **XP Validation**: Quick blink or iris color change when user gains XP
- **Life Loss Warning**: Visual reaction when user fails a quest / loses a life
- **Dynamic Idle**: User inactivity triggers observe → drowsy → sleep sequence

Fix drowsy state:
- Current drowsy has incorrect timing (too long) or 4 blink variants that don't match existing
  animation style
- FIX: Copy the "wake up" animation but reverse direction / change color for sleep. Maintain
  consistency with existing animation style. Do NOT add 4 new blink variants.

**Q5:** Which dashboard panels still use mock data and should be wired to real DB?
**Answer:** Wire ALL remaining mock data:
- **SYS_LOG**: Show real DB events (e.g. "User gained 300 XP - Project Completed", "Skill TypeScript
  validated")
- **Activity Heatmap**: Connect to real `lastStreakDate` / `currentStreak` from User model
- **Top Runners**: Real XP-based ranking using `getUserDashboardStats` XP totals across users
- **SYS_MONITOR in WelcomeCard**: Use real browser performance APIs (`navigator.connection`,
  `performance.memory` where available). Fallback to decorative values if APIs are unavailable or
  privacy-restricted.

**Q6:** For public portfolio effects — reduce intensity or remove?
**Answer:** Keep `glitch-text` and `animate-digital-flicker` but reduce to 0.4x–0.5x of current
intensity. Terminal cursor element is MANDATORY as a loading/typing indicator on the hero section.
Goal: distinctive but professional — a senior dev would show this to a FAANG recruiter without
embarrassment.

**Q7:** What is the priority order for implementation?
**Answer:**
1. AIEye and HUD Polish — eye states + lives/XP integration + WelcomeCard real data
2. GalaxyCanvas / Skill Tree — node visual polish + honeycomb growth solution
3. Timeline UX improvement — timeline sidebar or bottom bar ordered by time, links/navigates the map
   with left-right scroll. Reference images were mentioned by user but not yet uploaded.
4. Hero/Skills Public — professional-intensity arcade aesthetic + AI-validated skill differentiation

**Q8:** What is explicitly out of scope?
**Answer:**
- Old `CRTMonitor` component: discard definitively
- Database schema changes: only consume existing Phase 3C schema
- DashboardNav, login/auth pages

**Additional context provided:**
- Portfolio loader and login page have designs worth preserving/rescuing as references (not in scope
  for this spec but noted for future use)
- Everything needs UX/UI improvements, not just aesthetics
- The dashboard is the strongest existing design: hexagon cluster, skill tree, and timeline are the
  best achieved designs in the app
- The drowsy fix is simple: reverse the wake-up animation with a different color. No new variants.

---

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Dashboard Page — Path: `app/[locale]/(protected)/dashboard/page.tsx`
  Current server component, already passes real `stats` from `getUserDashboardStats`. Mock data lives
  in child components.

- Feature: WelcomeCard — Path: `features/tech/components/welcome-card.tsx`
  Already receives `level`, `currentXP`, `maxXP`, `streakDays` as props. SYS_MONITOR HUD panel needs
  to consume these instead of mock values.

- Feature: CRTWithAI (AIEye) — Path: `features/tech/components/crt-with-ai.tsx`
  Contains all current AIEye states and animation logic. Drowsy fix and new XP/life states go here.

- Feature: HexStatGrid — Path: `features/tech/components/hex-stat-grid.tsx`
  Already wired to real stats via page.tsx. Reference for hexagonal layout patterns.

- Feature: ActivityHeatmap — Path: `features/tech/components/activity-heatmap.tsx`
  Currently uses mock data. Must wire to `currentStreak` / `lastStreakDate`.

- Feature: TopRunnersPanel — Path: `features/tech/components/top-runners-panel.tsx`
  Currently uses mock data. Must wire to `getUserDashboardStats` XP across all users.

- Feature: DashboardRow1 (client wrapper) — Path: `features/tech/components/dashboard-row1.tsx`
  Coordinates `aiActive` state between WelcomeCard and CRTWithAI as sibling components.

- Feature: Tech Mode UI Library — Path: `features/tech/index.tsx`
  Barrel file. All reusable components: `TechCard`, `HUDPanel`, `XPBar`, `LevelBadge`, `TechBadge`,
  `TechButton`, `TechAvatar`. Use these for any new UI elements.

- Feature: Dashboard data layer — Path: `features/dashboard/data/getUserDashboardStats.data.ts`
  Primary data source for XP, level, streak, achievements, experiencesCount. No schema changes.

- Feature: Lives system — Path: `lib/ai/lives.ts`
  Contains `checkAndConsumeLives` (note typo in current code). AIEye must react to life loss events
  from this system.

- Feature: GalaxyCanvas (Skill Tree) — Path: likely within `features/tech/components/` or
  `features/skills/` — implementer must locate exact path on branch.

- Feature: Public Portfolio Hero/Skills — Path: likely within `features/portfolio/` or
  `app/[locale]/(public)/` — implementer must locate exact path on branch.

- Feature: SYS_LOG panel — Path: `app/[locale]/(protected)/dashboard/page.tsx` (inline, lines
  124–153). Currently hardcoded mock events. Move to a dedicated component and wire to real DB events.

---

### Follow-up Questions

No follow-up questions were needed. All requirements were sufficiently clear from the first round.

---

## Visual Assets

### Files Provided

All 5 visual assets are in:
`agent-os/specs/2026-02-26-phase-3b-visual-polish/planning/visuals/visuals/`

| File | Type | Description |
|---|---|---|
| `FireShot Capture 034 - Portfoland - [localhost].png` | Screenshot | **Current dashboard state** (ground truth) |
| `FireShot Capture 035 - My Skill Tree - Portfoland - [localhost].png` | Screenshot | **Current skill tree state** |
| `FireShot Capture 036 - My Timeline - Portfoland - [localhost].png` | Screenshot | **Current timeline state** |
| `FreshCyberpunkDashboard.png` | Design reference | Polished layout concept v1 |
| `PortfolandNext-GenHUD.png` | Design reference | Polished layout concept v2 (closer to current) |

---

### Visual Insights

#### Screenshot 034 — Current Dashboard (ground truth)

The current dashboard is already structurally close to the target design references. Key observations:

- **WelcomeCard** has the SYS_MONITOR panel with CPU/NET/RAM/GPU bars — currently showing mock values (CPU 54%, NET 94%, RAM 62%, GPU 18%). Real browser API data should replace these.
- **HexStatGrid** center cluster shows XP, level, experiences, achievements — already wired to real data (Phase 3C done).
- **CRT console** (right half of WelcomeCard row) shows boot messages + AI eye. `STATUS: SLEEPING` displayed top right, confirming the sleep state is visible.
- **SKILL MATRIX** (radar/pentagon) is in the top-right area.
- **ACTIVE MISSIONS** panel on the left with hardcoded strings (in Spanish).
- **SYS_LOG** below missions — showing 3 hardcoded events ("Deployed v2.0 to Production", "Completed React Hooks module", "Earned Fast Learner badge").
- **TOP RUNNERS** panel shows placeholder names.
- **ACTIVITY HEATMAP** at bottom center — showing decorative mock dots.

The layout structure is good and must be preserved. Polish, not reinvent.

#### Screenshot 035 — Current Skill Tree (ground truth)

- Multiple hexagonal node clusters (FRONTEND top-left, BACKEND bottom-right, SOFT SKILLS visible) connected by glowing line cables.
- Node clusters are arranged in circular/ring patterns per group.
- **Problem confirmed**: when a group has many skills, nodes start overlapping and their labels/connections crowd. The honeycomb growth solution (requirement #9) is needed for this exact case.
- Connections between groups are long glowing lines across the canvas — these must be preserved.
- Color coding visible: cyan-outlined hexes (FRONTEND group), yellow-outlined (another group), mixed — the AI-validated glow treatment must build on this existing color language without replacing it.

#### Screenshot 036 — Current Timeline (ground truth)

- **Confirmed problem**: the page is ONLY a Google Maps view with experience pins + top filter tabs. There is NO chronological list or sidebar.
- Filter tabs work (All / Work / Education / Project / Certification).
- Stats bar at top shows XP total, milestones, experiences, achievements counts.
- The map pins have experience markers but clicking one doesn't show a time-ordered list.
- **Required addition**: chronological sidebar or bottom bar with all entries listed by date, clickable, that highlights/pans the map to the corresponding pin.

#### FreshCyberpunkDashboard.png — Design Reference v1

A more redesigned layout concept. Useful for component-level inspiration but NOT a full layout redesign target (the current dashboard is already a solid base):

- **Header**: Shows `CPU: 24%`, `MEM: 2.4GB`, `NET: 88%` real-looking readouts — confirms browser performance API approach in WelcomeCard.
- **Left panel (IDENTIFICATION_MATRIX)**: Avatar + `ARTURO_` + `CLASS: FULL_STACK` badge + Level 18 + XP bar (1900/2450) + 12 DAYS ACTIVE STREAK badge — this is essentially an enhanced version of the current WelcomeCard left section.
- **Center (SYS_MONITOR_V2)**: Rich terminal output showing `XP_Total: 2,490`, `Current_Level: 18`, `Skills: 24 active + 12 mastered`, `Achievements: 18/90 unlocked [20%]`, `Incoming_Transmissions: 0 pending`. This is the target for the CRT console panel.
- **Bottom row (ACTIVIDAD RECIENTE)**: Shows real events — "Added Senior Developer experience +200 XP hace 2 horas", "Uploaded My Tech Stack article +150 XP hace 8 horas", "Earned First Certification badge +150 XP AYER", "Completed React Advanced course +120 XP hace 3 días". **This is the exact format for the real SYS_LOG**.
- **Bottom right (MATRIZ DE HABILIDADES)**: Horizontal bar chart per skill category (FRONTEND/UI 89%, BACKEND/API 60%, DEVOPS/CLOUD 45%, AI/AUTOMATION 70%) + CURSOS RECOMENDADOS section.

#### PortfolandNext-GenHUD.png — Design Reference v2 (closest to current layout)

This reference is the most aligned with the current dashboard structure and the primary implementation target:

- **WelcomeCard area**: Left shows avatar + LV.18 badge + XP bar `1,900 / 2,450 XP` + `11 días de racha`. Top right shows compact **SYS_MONITOR** panel: `session_stats: active`, `Skills: 40 active`, `Next goal: 100 XP to lvl 18`. Avatar top-left shows SWAP icon (AI eye swap).
- **Center HexStatGrid**: 4 hexes — XP TOTAL `1,900` (large), EXPERIENCIAS `7`, LOGROS `18/42`, NIVEL ACTUAL `18`. This matches the current implementation exactly.
- **Left column (ACTIVE_MISSIONS)**: 3 missions with XP rewards highlighted in badges (`+124 XP`, `+280 XP`, `+100 XP`).
- **Center-bottom (SYS_LOG)**: Real events with time-ago format: "Deployed v2.0 to Production", "Completed React Hooks module", "Earned Fast Learner badge" — with relative timestamps.
- **Right column**: SKILL_MATRIX (pentagon/radar) on top + TOP_RUNNERS below (3 users shown with XP amounts).
- **Bottom (ACTIVITY_HEATMAP)**: 30-day dot grid with color intensity for activity days.
- **Bottom navigation tabs**: "Línea de Tiempo", "Proyectos", "Habilidades", "Portfolio" — this is inspirational for future navigation UX, not required in this spec.

**Implementation priority: PortfolandNext-GenHUD.png is the primary visual target for the dashboard.**

---

### Design Anti-References

- NOT Tron 1982 / arcade neon explosion
- NOT Cyberpunk 2077 (the color palette and galaxy aesthetic are fine — the EXCESS is the problem)
- NOT overly animated / attention-grabbing effects that distract from content
- Goal: "a senior dev would show this to a FAANG recruiter without embarrassment"

---

## Requirements Summary

### Functional Requirements

**Priority 1 — AIEye and HUD Polish**

1. AIEye must handle two new reactive states:
   - **XP Validation state**: Quick blink or iris color change triggered when the user gains XP.
   - **Life Loss Warning state**: Distinct visual reaction when the user fails a quest / loses a life.
2. AIEye dynamic idle sequence: inactivity triggers observe → drowsy → sleep transition automatically.
3. Drowsy state animation fix: Replace current broken multi-blink implementation with a single
   animation that mirrors the existing wake-up animation in reverse/alternate color. No new blink
   variants. Preserve consistency with all other existing states.
4. WelcomeCard SYS_MONITOR panel must consume real data:
   - XP, level, streak, achievements from props already passed via `getUserDashboardStats`
   - CPU / RAM / network from browser `performance.memory` and `navigator.connection` APIs where
     available, with graceful fallback to decorative placeholder values
5. SYS_LOG must show real DB-sourced events (XP gains, skill validations, completions), not hardcoded
   mock strings.
6. Activity Heatmap must connect to real `lastStreakDate` / `currentStreak` from User model.
7. Top Runners panel must use real XP totals from `getUserDashboardStats` across all users.

**Priority 2 — GalaxyCanvas / Skill Tree**

8. AI-validated skill nodes must have an intense magenta/cyan glow visually distinct from manually
   added skill nodes (which use standard/dim glow).
9. Honeycomb growth: when skills in a group exceed available space, they must cluster into a honeycomb
   pattern rather than overlapping. Each skill's data (label, level, connections) must remain visible.
   Glowing cable connections must be maintained between nodes.
10. No rebuild — refine the existing GalaxyCanvas component. Keep the Cyberpunk/Galaxy aesthetic.

**Priority 3 — Timeline UX**

11. Add a timeline sidebar or bottom bar alongside the interactive map. This bar must:
    - Order all entries chronologically
    - Allow navigation to individual map nodes via clicking/tapping
    - Support left-right scroll for horizontal timelines
    - Visually link/highlight the selected map node
12. This is a UX improvement, not just visual polish — the timeline must become navigable via the
    sidebar/bar in addition to interacting with the map directly.

**Priority 4 — Public Portfolio Hero/Skills**

13. Public Hero section must display the user's Global Level, calculated as:
    `Math.floor(Math.sqrt(totalXP / 100))`
    This level is derived from raw XP and does not require any schema changes.
14. Public Skills section must visually differentiate AI-validated skills from manually added ones.
    Suggested treatment: AI-validated skills use magenta/cyan glow badge or icon indicator.
15. Reduce `glitch-text` and `animate-digital-flicker` effects to approximately 0.4x–0.5x of their
    current intensity. The effects must be retained, only toned down.
16. Terminal cursor element (blinking `|` or `_`) is mandatory in the hero section as a
    loading/typing indicator. This is a hard requirement.

---

### Reusability Opportunities

- `HUDPanel` from `features/tech/index.tsx` — use for any new HUD-style containers
- `TechBadge` from `features/tech/index.tsx` — use for AI-validated skill indicators
- `LevelBadge` from `features/tech/index.tsx` — use for displaying Global Level in public hero
- `XPBar` from `features/tech/index.tsx` — use for any progress representations
- `getUserDashboardStats` from `features/dashboard/data/` — single source of truth for XP, level,
  streak, achievements; no new queries needed for dashboard panels
- Existing `DashboardRow1` client wrapper pattern — extend this pattern for any new client-side state
  coordination between sibling server-rendered components

---

### Scope Boundaries

**In Scope:**
- Dashboard: WelcomeCard SYS_MONITOR (real data), SYS_LOG (real data), ActivityHeatmap (real data),
  TopRunners (real data)
- Dashboard: AIEye new states (XP Validation, Life Loss Warning), dynamic idle sequence, drowsy fix
- Dashboard: GalaxyCanvas node glow differentiation + honeycomb growth solution
- Dashboard: Timeline UX — sidebar/bottom bar for chronological navigation
- Public Portfolio: Global Level display using `floor(sqrt(totalXP/100))` formula
- Public Portfolio: AI-validated vs manual skill visual differentiation
- Public Portfolio: Reduced glitch/flicker effect intensity (0.4x–0.5x)
- Public Portfolio: Mandatory terminal cursor in hero section

**Out of Scope:**
- `CRTMonitor` component — discard definitively, do not polish or reference
- Database schema changes — only consume existing Phase 3C fields
- DashboardNav — no changes
- Login / auth pages — no changes
- Portfolio loader redesign — noted as future reference, not in this spec
- Complete rebuild of any component — refine existing implementations only
- External library integration (The Gridcn, Glitchcn) — evaluate and integrate only if a specific
  component directly solves a defined requirement above; no wholesale adoption
- AI Skill Assessment Game (Phase 4 feature)
- Mobile-specific refinements beyond what naturally emerges from the layout improvements

---

### Technical Considerations

- All new data wiring must use existing `getUserDashboardStats` data function. No new Prisma queries
  unless strictly necessary for SYS_LOG event history (which may need a separate lightweight query
  for recent user activity events).
- Browser performance APIs (`performance.memory`, `navigator.connection`) are non-standard and may
  not be available in all browsers. All SYS_MONITOR browser metric reads must be wrapped in
  try/catch or optional-chaining with fallback decorative values.
- AIEye animation state machine lives entirely in `features/tech/components/crt-with-ai.tsx`.
  New states (XP validation, life loss) must integrate with the existing state machine without
  breaking current states.
- XP/life event communication to the AIEye: the pattern should follow the existing `onAIStateChange`
  callback / `aiActive` prop pattern established in `DashboardRow1`. The lives system in `lib/ai/lives.ts`
  has a known typo (`checkAndConsumLives` → `checkAndConsumeLives`) — do not fix this typo in this
  spec; it belongs to Phase 0 bug fixes.
- Global Level formula for public portfolio: `Math.floor(Math.sqrt(totalXP / 100))`. This must be
  a pure utility function placed in a shared utils location (e.g., `lib/utils/xp.ts` or adjacent
  to the existing stats data layer) so both dashboard and public portfolio can consume it.
- All components follow the Tech Mode palette: bg `#0A0E1A`, surface `#0D1421`, borders `#1E293B`,
  cyan `#00D4FF`, magenta `#D946EF`, yellow `#EAB308`, green `#22C55E`.
- Font: `font-mono` for all data readouts, labels, and terminal-style text (consistent with existing
  dashboard pattern).
- Animation library in use: Framer Motion (`motion` components). All new animations must use Framer
  Motion, consistent with existing AIEye and chat animation implementations.
- Types for new props must be defined in `features/tech/types/dashboard.ts`, not inline in
  component files (per project conventions).
