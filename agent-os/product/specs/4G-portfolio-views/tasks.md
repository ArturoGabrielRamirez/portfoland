# Task Breakdown: Spec 4G — Portfolio View Options

## Overview

Total Task Groups: 10
Adds four distinct public portfolio view modes (`sections`, `one_page`, `minimal`, `terminal`), persisted in `PortfolioSettings.viewMode`, with a dashboard selector UI.

---

## Task List

### TG1: DB + Types

**Dependencies:** None

- [ ] TG1-A: Add `viewMode` field to `PortfolioSettings` in `prisma/schema.prisma`
  - Insert `viewMode String @default("sections")` after the `showBranding` field (currently line 446)
  - Valid values at DB level: `"sections"`, `"one_page"`, `"minimal"`, `"terminal"` — no DB-level enum needed (MongoDB)
  - Run `npx prisma db push` to sync schema; no migration file required (MongoDB)

- [ ] TG1-B: Add `PortfolioViewMode` union type to `features/portfolio/types/portfolio.ts`
  - Insert after the `PortfolioMode` type (line 23):
    `export type PortfolioViewMode = 'sections' | 'one_page' | 'minimal' | 'terminal';`

- [ ] TG1-C: Extend `PortfolioSettingsData` Pick in `features/portfolio-settings/types/portfolioSettings.ts`
  - Add `'viewMode'` to the `Pick<PortfolioSettingsModel, ...>` union (currently lines 58–68) so the public data type includes `viewMode`
  - Add `viewMode?: string` to the `UpdatePortfolioSettingsInput` interface (currently lines 41–48)

- [ ] TG1-D: Add `viewMode` field to `updatePortfolioSettingsSchema` in `features/portfolio-settings/schemas/portfolioSettings.schema.ts`
  - Declare `const VALID_VIEW_MODES = ['sections', 'one_page', 'minimal', 'terminal'] as const;` alongside the existing `VALID_LAYOUT_VARIANTS` constant (after line 16)
  - Add to the `updatePortfolioSettingsSchema` object (after the `showBranding` field, before the closing `}`):
    ```
    viewMode: yup.string().oneOf([...VALID_VIEW_MODES], `View mode must be one of: ${VALID_VIEW_MODES.join(', ')}`).optional(),
    ```

- [ ] TG1-E: Add `VALID_VIEW_MODES` constant and guard to `features/portfolio-settings/services/portfolioSettings.service.ts`
  - Declare `const VALID_VIEW_MODES = ['sections', 'one_page', 'minimal', 'terminal'] as const;` alongside the existing `VALID_LAYOUT_VARIANTS` constant (after line 18)
  - Add a validation block in `updatePortfolioSettingsService` after the `heroStyle` guard (after line 73):
    ```
    if (input.viewMode !== undefined) {
      if (!(VALID_VIEW_MODES as readonly string[]).includes(input.viewMode)) {
        throw new Error(PORTFOLIO_SETTINGS_MESSAGES.INVALID_VIEW_MODE);
      }
    }
    ```
  - Add `INVALID_VIEW_MODE: 'Invalid view mode. Must be one of: sections, one_page, minimal, terminal.'` to `PORTFOLIO_SETTINGS_MESSAGES` in `features/portfolio-settings/constants/messages.ts`

- [ ] TG1-F: Write 2 focused tests for the schema and service validation
  - Test file: `features/portfolio-settings/__tests__/viewMode.test.ts` (new file)
  - Test 1: `updatePortfolioSettingsSchema` rejects an invalid `viewMode` value (e.g., `"grid"`)
  - Test 2: `updatePortfolioSettingsService` throws `INVALID_VIEW_MODE` message when passed an invalid `viewMode`
  - Run only these 2 tests to verify TG1 is correct before proceeding

**Acceptance Criteria:**
- `prisma db push` succeeds with the new `viewMode` field
- `PortfolioViewMode` type is exported from `features/portfolio/types/portfolio.ts`
- `PortfolioSettingsData` includes `viewMode`
- Schema rejects unknown view mode values; service throws on invalid input
- The 2 tests in TG1-F pass

---

### TG2: Server Action

**Dependencies:** TG1

- [ ] TG2-A: Append `updatePortfolioViewModeAction` to `features/portfolio-settings/actions/portfolioSettingsActions.ts`
  - Do NOT create a new file — append after the closing brace of `updatePortfolioSettingsAction` (currently line 76)
  - Function signature: `export async function updatePortfolioViewModeAction(viewMode: string)`
  - Pattern: `actionWrapper<PortfolioSettingsModel>` → `auth.api.getSession({ headers: await headers() })` → session guard → validate `{ viewMode }` against `updatePortfolioSettingsSchema` → call `updatePortfolioSettingsService(session.user.id, { viewMode: data.viewMode })` → `revalidatePath('/dashboard/portfolio')` → return `{ payload: settings, message: PORTFOLIO_SETTINGS_MESSAGES.UPDATE_SUCCESS }`
  - Import `revalidatePath` is already imported at line 11; no new imports needed beyond those already present

- [ ] TG2-B: Write 2 focused tests for the new action
  - Test file: `features/portfolio-settings/__tests__/portfolioSettingsActions.test.ts` (new or append)
  - Test 1: `updatePortfolioViewModeAction('one_page')` returns a success payload when session exists (mock `auth.api.getSession` and `updatePortfolioSettingsService`)
  - Test 2: `updatePortfolioViewModeAction('invalid')` returns an error response (no throws — `actionWrapper` catches and formats)
  - Run only these 2 tests

**Acceptance Criteria:**
- `updatePortfolioViewModeAction` is exported from the actions file
- Calling it with `'one_page'` invokes `updatePortfolioSettingsService` with `{ viewMode: 'one_page' }` and revalidates `/dashboard/portfolio`
- Calling it with an invalid value returns an error response (not a thrown exception)
- The 2 tests in TG2-B pass

---

### TG3: SectionsTemplate

**Dependencies:** TG1

- [ ] TG3-A: Create the `features/portfolio/components/templates/` directory (new)

- [ ] TG3-B: Create `features/portfolio/components/templates/SectionsTemplate.tsx`
  - This file contains the render logic currently inside `PortfolioLayout` — no behavior change, just extraction
  - Props interface: `SectionsTemplateProps` with `data: PortfolioData` and `mode: PortfolioMode`
  - Copy into this file:
    - All imports from `PortfolioLayout.tsx` (lines 12–32 of the current file) that are needed for section rendering
    - The `classicSections` and `techSections` maps (lines 47–68)
    - The `panelVariants`, `panelTransition`, `sectionEntranceVariants`, `sectionEntranceTransition` animation constants (lines 74–93)
    - The component body: `useState(activeSection)`, `useState(isBooting)`, `useRef(sectionRefs)`, the boot `useEffect`, `handleSectionChange`, and the full JSX returned from `PortfolioLayout` (lines 99–304 of the original)
  - The component is exported as `export function SectionsTemplate({ data, mode }: SectionsTemplateProps)`
  - Import `THEME_PRESETS` from `@/features/portfolio-settings/constants/themes` (already in original)
  - Import `PanelNavigation`, `DEFAULT_SECTION`, `PORTFOLIO_SECTIONS`, and all Classic/Tech section components exactly as they appear in the original

- [ ] TG3-C: Write 1 focused test for SectionsTemplate
  - Test: renders `data-testid="portfolio-layout"` root element given minimal `PortfolioData` in `'classic'` mode
  - Run only this test

**Acceptance Criteria:**
- `SectionsTemplate` renders identically to the current `PortfolioLayout` render output for both `classic` and `tech` mode
- No behavior or visual change for existing `sections` view mode users
- The 1 test in TG3-C passes

---

### TG4: OnePageTemplate

**Dependencies:** TG3 (shares section maps pattern)

- [ ] TG4-A: Create `features/portfolio/components/templates/OnePageTemplate.tsx`
  - Props: `{ data: PortfolioData; mode: PortfolioMode }`
  - Import `classicSections` and `techSections` maps — define them locally in this file (same pattern as `SectionsTemplate`; do not import from `SectionsTemplate` to avoid coupling)
  - Import `PORTFOLIO_SECTIONS` from `../constants/sections` and `THEME_PRESETS` from `@/features/portfolio-settings/constants/themes`
  - No `PanelNavigation`, no `activeSection` state, no `isBooting` state
  - Section ordering logic: copy the `orderMap`, `userOrder`, `isVisible`, and `fullOrder` logic verbatim from `PortfolioLayout` mobile render path (lines 246–271 of `PortfolioLayout.tsx`)
  - Root element: `<div>` with same background classes as `PortfolioLayout` root — `isClassic ? 'bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]' : 'bg-[#0A0E1A] text-white'` — and same `style` CSS variables for Classic Mode themes
  - CRT overlay: copy lines 146–152 of `PortfolioLayout.tsx` (the `pointer-events-none absolute inset-0 z-50` div with `crt-lines` and `crt-scanner`) — render only when `!isClassic`
  - Map over `fullOrder`, render each visible section as:
    ```tsx
    <section key={internalKey} id={`section-${internalKey}`} className="scroll-mt-20 p-4 md:p-6">
      <SectionComponent data={data} />
    </section>
    ```
  - No `motion.div` animation wrappers on sections (keep it simple for one-page scroll)
  - No bottom padding for sticky nav (`pb-16`) — use `pb-8` instead

- [ ] TG4-B: Write 1 focused test
  - Test: all sections from `PORTFOLIO_SECTIONS` with `isVisible = true` render their `id="section-{key}"` elements
  - Run only this test

**Acceptance Criteria:**
- All visible sections render sequentially in one scroll
- No `PanelNavigation` or tab switching rendered
- Classic Mode theme CSS variables applied correctly
- CRT overlay rendered for Tech Mode, not for Classic Mode
- The 1 test in TG4-B passes

---

### TG5: MinimalTemplate

**Dependencies:** TG1 (uses `PortfolioViewMode` type)

- [ ] TG5-A: Create `features/portfolio/components/templates/MinimalTemplate.tsx`
  - Props: `{ data: PortfolioData; mode: PortfolioMode }`
  - No section component imports — fully self-contained
  - Skills: `data.skills?.skills`, sorted descending by `level`, sliced to first 5
  - Contact links: from `data.user.contactLinks` — render `email`, `github`, `linkedin`, and any `custom` entries
  - Avatar: if `data.user.image` exists, render `<img>` with `rounded-full w-20 h-20 object-cover`; otherwise render initials in a `<div>` using the first letter of `data.user.name`
  - Layout root: `<div className="min-h-screen flex items-start justify-center py-16 px-4 {bg class}">` wrapping a `<div className="w-full max-w-lg mx-auto flex flex-col gap-6">`
  - Classic mode styling:
    - Root bg: `bg-white`
    - Card: `bg-white border border-gray-200 rounded-xl p-8 shadow-sm`
    - Name: `text-2xl font-bold text-gray-900`
    - Bio: `text-gray-600 text-sm line-clamp-3`
    - Skill badge: `inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full`
    - Contact links: `<a>` tags with `text-blue-600 hover:underline text-sm flex items-center gap-1.5`
  - Tech mode styling:
    - Root bg: `bg-[#0A0E1A]`
    - Card: `bg-[#0D1421] border border-[#00D4FF]/30 rounded-sm p-8 font-mono`
    - Name: `text-2xl font-mono font-bold text-[#00D4FF]`
    - Bio: `text-gray-400 text-sm line-clamp-3 font-mono`
    - Skill badge: `inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-mono border border-[#00D4FF]/20`
    - Contact links: render as `<a>` tags with `text-[#00D4FF] hover:text-white text-sm font-mono flex items-center gap-1.5`
  - CRT overlay: same markup as `OnePageTemplate` — only for Tech Mode

- [ ] TG5-B: Write 1 focused test
  - Test: renders `data.user.name` and top 5 skills from `data.skills.skills` sorted by level descending
  - Run only this test

**Acceptance Criteria:**
- Avatar, name, bio (3-line clamp), top 5 skills by level, and contact links render
- Classic and Tech mode have distinct styling
- No section component imports in this file
- The 1 test in TG5-B passes

---

### TG6: TerminalTemplate

**Dependencies:** TG3 (reuses CRT overlay and boot screen patterns)

- [ ] TG6-A: Create `features/portfolio/components/templates/TerminalTemplate.tsx`
  - Props: `{ data: PortfolioData; mode: PortfolioMode }` — component is only ever rendered when `mode === 'tech'` (guard enforced in `PortfolioLayout`, not here)
  - Import `CRTMonitor` from `@/features/tech/components/crt-monitor`
  - Import `AnimatePresence` and `motion` from `framer-motion`; `useState` and `useEffect` from `react`
  - Boot screen: copy the `isBooting` state, the `useEffect` timer (2000ms), and the `AnimatePresence` boot overlay markup verbatim from `PortfolioLayout.tsx` lines 101–175
  - CRT overlay: copy lines 146–152 of `PortfolioLayout.tsx` verbatim
  - Root element: `<div className="min-h-screen bg-[#0A0E1A] text-white font-mono overflow-x-hidden relative">` with the CRT overlay and boot screen as first children
  - Main content: `<div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">` containing 5 `CRTMonitor` panels, each with `children` prop (not `lines`):
    - **IDENT panel** (`title="IDENT"`): display `data.user.name`, `data.user.username`, `data.user.bio` as terminal text lines using `<p className="text-[#00D4FF] text-sm">` for name/username and `<p className="text-gray-400 text-xs mt-1">` for bio
    - **SKILL_TREE panel** (`title="SKILL_TREE"`): group `data.skills?.skills` by `category`; for each category render a `<div>` with category header in `text-[#D946EF]` and each skill as `<div className="flex items-center gap-2 text-xs">` with skill name in `text-gray-300` and level as a bar of `█` characters repeated `Math.round(skill.level / 10)` times in `text-[#00D4FF]`
    - **PROJECTS panel** (`title="PROJECTS"`): map `data.projects` (max 10); each project as a `<div className="mb-3">` with title in `text-[#00D4FF] text-sm font-bold`, tech stack tags in `text-gray-400 text-xs`, and GitHub/live links as `<a>` in `text-[#D946EF] text-xs hover:underline`
    - **TIMELINE panel** (`title="TIMELINE"`): map `data.experiences?.experiences` (or similar shape from `PublicTimelineData`); each entry as a terminal log line: `<p className="text-xs text-gray-300">` with format `[{startYear}–{endYear}] {company} — {role}`
    - **CONTACT panel** (`title="CONTACT"`): render `data.user.contactLinks` entries (email, github, linkedin, custom) as `<p className="text-xs">` lines with label in `text-[#D946EF]` and value as `<a className="text-[#00D4FF] hover:underline">`
  - Do NOT include Gallery, Services, or Testimonials panels (out of scope per spec)

- [ ] TG6-B: Write 1 focused test
  - Test: renders 5 `CRTMonitor` sections with correct `title` props (`IDENT`, `SKILL_TREE`, `PROJECTS`, `TIMELINE`, `CONTACT`)
  - Run only this test

**Acceptance Criteria:**
- Boot screen appears for 2 seconds then fades out
- CRT overlay lines rendered
- All 5 panels render using `CRTMonitor` with `children` (not `lines`)
- No Classic section components imported
- Gallery, Services, Testimonials panels absent
- The 1 test in TG6-B passes

---

### TG7: PortfolioLayout Routing

**Dependencies:** TG3, TG4, TG5, TG6

- [ ] TG7-A: Import the four template components in `features/portfolio/components/PortfolioLayout.tsx`
  - Add at the top of the import block:
    ```ts
    import { SectionsTemplate } from './templates/SectionsTemplate';
    import { OnePageTemplate } from './templates/OnePageTemplate';
    import { MinimalTemplate } from './templates/MinimalTemplate';
    import { TerminalTemplate } from './templates/TerminalTemplate';
    import type { PortfolioViewMode } from '../types/portfolio';
    ```

- [ ] TG7-B: Replace the entire component body of `PortfolioLayout` with a routing switch
  - Remove all existing state, effects, and JSX from lines 99–305 (the current component body)
  - New body:
    ```tsx
    export function PortfolioLayout({ data, mode }: PortfolioLayoutProps) {
      const rawViewMode = (data.settings?.viewMode ?? 'sections') as PortfolioViewMode;
      // Terminal is only valid for Tech Mode; fall back to sections for Classic users
      const viewMode: PortfolioViewMode =
        rawViewMode === 'terminal' && mode !== 'tech' ? 'sections' : rawViewMode;

      if (viewMode === 'one_page') return <OnePageTemplate data={data} mode={mode} />;
      if (viewMode === 'minimal') return <MinimalTemplate data={data} mode={mode} />;
      if (viewMode === 'terminal') return <TerminalTemplate data={data} mode={mode} />;
      return <SectionsTemplate data={data} mode={mode} />;
    }
    ```
  - Remove all imports that are no longer needed in this file after extraction (animation variants, `useState`, `useEffect`, `useRef`, `useCallback`, `PanelNavigation`, all Classic/Tech section components, `THEME_PRESETS`, `PORTFOLIO_SECTIONS`, `DEFAULT_SECTION`) — only keep `cn` if used, the template imports, and the type imports

- [ ] TG7-C: Write 2 focused tests for routing logic
  - Test 1: when `data.settings.viewMode === 'terminal'` and `mode === 'classic'`, `PortfolioLayout` renders `SectionsTemplate` (not `TerminalTemplate`)
  - Test 2: when `data.settings.viewMode === 'one_page'`, `PortfolioLayout` renders `OnePageTemplate`
  - Run only these 2 tests

**Acceptance Criteria:**
- `PortfolioLayout` is now a thin router of ~15 lines
- Classic Mode users with `viewMode === 'terminal'` always see `SectionsTemplate`
- Correct template rendered for each valid `viewMode` value
- No section component imports remain in `PortfolioLayout.tsx` directly
- The 2 tests in TG7-C pass

---

### TG8: PortfolioViewSelector Component

**Dependencies:** TG2, TG1

- [ ] TG8-A: Create `features/portfolio-settings/components/` directory (new — does not currently exist)

- [ ] TG8-B: Create `features/portfolio-settings/components/PortfolioViewSelector.tsx`
  - `'use client'` directive at top
  - Props:
    ```ts
    interface PortfolioViewSelectorProps {
      currentViewMode: PortfolioViewMode;
      portfolioMode: PortfolioMode;
    }
    ```
  - Import: `useTransition` from `react`; `toast` from `sonner`; `updatePortfolioViewModeAction` from `../actions/portfolioSettingsActions`; `PortfolioViewMode` from `@/features/portfolio/types/portfolio`; `PortfolioMode` from `@/features/portfolio/types/portfolio`; `HUDPanel` from `@/features/dashboard/components/HUDPanel`; `cn` from `@/lib/utils`; icons from `lucide-react`: `Layers`, `FileText`, `Minimize2`, `Terminal`
  - State: `const [isPending, startTransition] = useTransition()`; `const [activeMode, setActiveMode] = useState(currentViewMode)`
  - Handler:
    ```ts
    function handleSelect(viewMode: PortfolioViewMode) {
      if (viewMode === 'terminal' && portfolioMode !== 'tech') return;
      setActiveMode(viewMode);
      startTransition(async () => {
        const result = await updatePortfolioViewModeAction(viewMode);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('View mode updated');
        }
      });
    }
    ```
  - Card definitions array (defined inside the component):
    ```ts
    const VIEW_MODE_CARDS = [
      { id: 'sections' as PortfolioViewMode, label: 'Sections', description: 'Tabbed panel navigation', icon: <Layers className="w-5 h-5" /> },
      { id: 'one_page' as PortfolioViewMode, label: 'One Page', description: 'Single scroll page', icon: <FileText className="w-5 h-5" /> },
      { id: 'minimal' as PortfolioViewMode, label: 'Minimal', description: 'Name, bio, links only', icon: <Minimize2 className="w-5 h-5" /> },
      { id: 'terminal' as PortfolioViewMode, label: 'Terminal', description: 'Full CRT experience', icon: <Terminal className="w-5 h-5" /> },
    ];
    ```
  - JSX: `<HUDPanel title="View Mode" icon={<Terminal className="w-4 h-4" />}>` wrapping a `<div className="grid grid-cols-2 md:grid-cols-4 gap-3">`
  - Each card is a `<button>` with:
    - `disabled={isPending}` always
    - `onClick={() => handleSelect(card.id)}`
    - `title={isTerminalDisabled ? 'Tech Mode only' : undefined}` where `isTerminalDisabled = card.id === 'terminal' && portfolioMode !== 'tech'`
    - Active border: `border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]` when `activeMode === card.id`
    - Inactive border: `border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]`
    - Terminal-disabled state: add `opacity-40 cursor-not-allowed` via `cn()` when `isTerminalDisabled`
    - Card inner layout: `flex flex-col gap-2 p-3 text-left` with icon row, label in `text-xs font-mono text-gray-200`, description in `text-[10px] font-mono text-gray-400`
    - Active indicator badge: same `Active` badge pattern from theme picker (lines 541–544 of `DashboardPortfolioView.tsx`) — `text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase`

- [ ] TG8-C: Write 2 focused tests
  - Test 1: renders 4 cards; the `terminal` card has `opacity-40 cursor-not-allowed` class when `portfolioMode === 'classic'`
  - Test 2: clicking a non-terminal card calls `updatePortfolioViewModeAction` with the correct `viewMode` value
  - Run only these 2 tests

**Acceptance Criteria:**
- 4 view mode cards render in a `grid-cols-2 md:grid-cols-4` grid
- `terminal` card is visually disabled for Classic Mode users; click does nothing
- Clicking an active card calls the action and shows a success toast on resolve
- Active card shows the correct active border and `Active` badge
- Uses `HUDPanel` as wrapper matching the theme picker pattern
- The 2 tests in TG8-C pass

---

### TG9: Wire Selector into Dashboard Settings Page

**Dependencies:** TG8

- [ ] TG9-A: Import `PortfolioViewSelector` in `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`
  - Add to the import block: `import { PortfolioViewSelector } from '@/features/portfolio-settings/components/PortfolioViewSelector';`
  - Add to the existing lucide-react import: `Terminal` (if not already imported — check line 27–41)
  - Add to the existing type imports: `PortfolioViewMode` from `@/features/portfolio/types/portfolio`

- [ ] TG9-B: Render `PortfolioViewSelector` below the Classic Mode theme picker block
  - Locate the closing `</HUDPanel>` of the Classic Mode theme picker block (currently line 552) and the `{/* Floating Action Button */}` comment (line 555)
  - Insert after line 552, before line 555:
    ```tsx
    {/* View Mode Selector */}
    <PortfolioViewSelector
      currentViewMode={(portfolioSettings?.viewMode ?? 'sections') as PortfolioViewMode}
      portfolioMode={user.portfolioMode}
    />
    ```
  - This block is NOT conditionally wrapped in `user.portfolioMode === 'classic'` — it renders for both modes (Classic users see 3 active cards; Tech users see all 4)

**Acceptance Criteria:**
- `PortfolioViewSelector` renders in the dashboard portfolio settings page for both Classic and Tech Mode users
- `currentViewMode` falls back to `'sections'` when `portfolioSettings?.viewMode` is null/undefined
- `portfolioMode` correctly passed from `user.portfolioMode`
- No regression to the theme picker or other existing UI above it

---

### TG10: QA Checklist (Manual)

**Dependencies:** TG1–TG9

- [ ] TG10-A: Verify DB + default behavior
  - Create a new test user (or use existing); confirm `portfolioSettings.viewMode` defaults to `"sections"` in MongoDB
  - Confirm existing users without `viewMode` in DB get `"sections"` via the Prisma `@default` and the `?? 'sections'` fallback in `PortfolioLayout`

- [ ] TG10-B: Test each view mode end-to-end
  - In the dashboard, select **Sections** → visit public portfolio → confirm `PanelNavigation` and tab switching render correctly (no regression)
  - Select **One Page** → visit public portfolio → confirm all visible sections render sequentially in one scroll, no nav
  - Select **Minimal** → visit public portfolio → confirm avatar, name, bio (3-line clamp), top 5 skills, and contact links render; no section components visible
  - Select **Terminal** → visit public portfolio as a **Tech Mode** user → confirm boot screen (2s), CRT overlay, and all 5 panels (IDENT, SKILL_TREE, PROJECTS, TIMELINE, CONTACT) render

- [ ] TG10-C: Test Classic Mode guard for Terminal
  - Set a Classic Mode user's `viewMode` to `"terminal"` directly in the DB → visit public portfolio → confirm `SectionsTemplate` renders (fallback)
  - In the dashboard selector, confirm the `terminal` card is `opacity-40 cursor-not-allowed` and clicking it does nothing

- [ ] TG10-D: Test theme preset CSS variables in non-sections views
  - With a Classic Mode user on a non-default theme (e.g. `warm`), switch to **One Page** view → confirm the `--portfolio-bg`, `--portfolio-accent` CSS variables are applied and the custom color scheme is visible

- [ ] TG10-E: Confirm no regressions in existing pages
  - Dashboard portfolio settings page loads without errors for both modes
  - Existing theme picker above `PortfolioViewSelector` still functions
  - Tech Mode public portfolio (`sections` view) still shows boot screen and CRT overlay

**Acceptance Criteria:**
- All 4 view modes render correctly for their target audiences
- No console errors on any view mode
- Classic Mode users cannot access Terminal view (fallback enforced at both UI and layout levels)
- Theme CSS variables propagate correctly into `OnePageTemplate`
- Existing `sections` behavior is entirely unchanged

---

## Execution Order

```
TG1 (DB + Types)
  └── TG2 (Server Action)
  └── TG3 (SectionsTemplate)  ──┐
  └── TG5 (MinimalTemplate)     ├── TG7 (PortfolioLayout Routing)
      TG4 (OnePageTemplate) ───┤
      TG6 (TerminalTemplate) ──┘
  └── TG8 (PortfolioViewSelector)
        └── TG9 (Wire into Dashboard)
              └── TG10 (QA)
```

TG3, TG4, TG5, TG6 can be implemented in parallel after TG1 is complete.
TG7 requires all four templates to exist.
TG8 requires TG2 (action) and TG1 (types).
TG9 requires TG8.
TG10 requires TG1–TG9.
