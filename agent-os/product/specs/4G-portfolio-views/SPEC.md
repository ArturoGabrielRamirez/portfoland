# Specification: Portfolio View Options (Spec 4G)

## Goal

Add four distinct view modes for public portfolios (`sections`, `one_page`, `minimal`, `terminal`), persisted in `PortfolioSettings.viewMode`, with a dashboard UI for the user to select and save their preferred mode.

## User Stories

- As a portfolio owner, I want to choose how visitors see my portfolio (tabbed sections, single scrollable page, minimal card, or terminal) so that the presentation matches my personal brand.
- As a Tech Mode user, I want a full CRT/terminal view of my portfolio so that my portfolio feels immersive and on-brand with my dashboard aesthetic.

## Specific Requirements

**DB Migration — add `viewMode` to `PortfolioSettings`**
- Add `viewMode String @default("sections")` to `PortfolioSettings` in `prisma/schema.prisma` (after `showBranding`)
- Valid values: `"sections"`, `"one_page"`, `"minimal"`, `"terminal"`
- `"terminal"` is only meaningful for Tech Mode users; if a Classic Mode user somehow has `viewMode = "terminal"`, fall back to `"sections"` in `PortfolioLayout`
- Run `prisma db push` (MongoDB — no migration file needed)

**Type Updates**
- Add `export type PortfolioViewMode = 'sections' | 'one_page' | 'minimal' | 'terminal'` to `features/portfolio/types/portfolio.ts`
- Add `viewMode: PortfolioViewMode` to `PortfolioSettingsData` Pick in `features/portfolio-settings/types/portfolioSettings.ts`
- Add `viewMode?: string` to `UpdatePortfolioSettingsInput` in the same file
- Extend `updatePortfolioSettingsSchema` in `features/portfolio-settings/schemas/portfolioSettings.schema.ts` with a `viewMode` field using `.oneOf(['sections', 'one_page', 'minimal', 'terminal'])`
- Extend service validation in `portfolioSettings.service.ts` with a `VALID_VIEW_MODES` constant and guard

**Server Action — `updatePortfolioViewMode`**
- Add a dedicated `updatePortfolioViewModeAction(viewMode: string)` server action to `features/portfolio-settings/actions/portfolioSettingsActions.ts`
- Follows the existing `actionWrapper` + `auth.api.getSession` pattern
- Validates `viewMode` against the Yup schema, calls `updatePortfolioSettingsService`, then calls `revalidatePath('/dashboard/portfolio')`
- Do NOT create a separate file; append to the existing actions file

**`PortfolioLayout` routing on `viewMode`**
- `PortfolioLayout` receives `viewMode` via `data.settings?.viewMode` (already passed through `PortfolioData`)
- Before the existing `sections` render logic, resolve the effective view mode: if `viewMode === 'terminal'` and `mode !== 'tech'`, fall back to `'sections'`
- Render the correct template component: `SectionsTemplate` (existing layout logic extracted), `OnePageTemplate`, `MinimalTemplate`, or `TerminalTemplate`
- The existing `PortfolioLayout` render logic becomes `SectionsTemplate` — extract it into `features/portfolio/components/templates/SectionsTemplate.tsx` and import it back so no behavior changes for the default mode
- All four template components live in `features/portfolio/components/templates/`

**`OnePageTemplate`**
- File: `features/portfolio/components/templates/OnePageTemplate.tsx`
- Renders all visible sections sequentially in a single vertically scrollable page — no `PanelNavigation`, no tab switching
- Reuses the existing Classic or Tech section component maps (same `classicSections` / `techSections` maps from the existing layout)
- Determines section order and visibility using the same `fullOrder` + `isVisible` logic from the existing mobile render path in `PortfolioLayout`
- Applies the same `THEME_PRESETS` CSS variables for Classic Mode and the same `bg-[#0A0E1A]` + CRT overlay for Tech Mode
- Each section wrapped in a `<section>` element with `id="section-{key}"` and a subtle `scroll-mt-20` for anchor linking
- No boot screen — skip `isBooting` state entirely

**`MinimalTemplate`**
- File: `features/portfolio/components/templates/MinimalTemplate.tsx`
- Works for both `classic` and `tech` mode; adapts styling based on `mode` prop
- Layout: centered card, max-width `max-w-lg mx-auto`, vertical stack with `gap-6`
- Shows: avatar/initials, full name, bio (truncated at 3 lines), top 5 skills by level (skill name + level badge only — no progress bars), contact links (email, GitHub, LinkedIn, custom)
- Classic mode styling: white card, gray-900 text, blue-600 accents — matches `ClassicHero` colors
- Tech mode styling: `bg-[#0D1421]` card with cyan border, font-mono text, `TechBadge` for contact links, `LevelBadge` for top skills
- Skills sourced from `data.skills?.skills`, sorted descending by `level`, sliced to 5
- No section components imported — this template is fully self-contained

**`TerminalTemplate`**
- File: `features/portfolio/components/templates/TerminalTemplate.tsx`
- Tech Mode only — receives `data` and `mode`; must be guarded at the `PortfolioLayout` level (never rendered for Classic Mode)
- Full-page terminal aesthetic: `bg-[#0A0E1A]`, font-mono throughout, CRT overlay (`crt-lines`, `crt-scanner` divs), same as `PortfolioLayout`'s existing CRT overlay markup
- Includes the boot screen (same `isBooting` + `AnimatePresence` pattern from `PortfolioLayout`)
- Layout: scrollable single page divided into labeled terminal panels using the `CRTMonitor` component from `features/tech/components/crt-monitor.tsx`
- Panels to render: `IDENT` (name, username, bio), `SKILL_TREE` (all skills grouped by category, level displayed as bar of `█` characters), `PROJECTS` (title, tech stack, GitHub/live link), `TIMELINE` (jobs/positions as terminal log lines), `CONTACT` (email, socials as terminal output lines)
- Each panel uses `CRTMonitor` with a distinct `title` prop and passes content via the `children` prop (not the `lines` prop) so it bypasses the typing animation and renders immediately

**`PortfolioViewSelector` dashboard component**
- File: `features/portfolio-settings/components/PortfolioViewSelector.tsx`
- Client component using `useTransition` + `updatePortfolioViewModeAction` + `toast` (sonner) pattern
- Props: `currentViewMode: PortfolioViewMode`, `portfolioMode: PortfolioMode`
- Renders 4 option cards in a `grid grid-cols-2 md:grid-cols-4 gap-3` layout matching the existing theme picker in `DashboardPortfolioView`
- Each card has: a small icon (from lucide-react), a label, a one-line description, and an active state border (`border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]`)
- The `terminal` card is visually disabled (`opacity-40 cursor-not-allowed`) and shows a tooltip "Tech Mode only" when `portfolioMode !== 'tech'`; clicking it while in Classic Mode does nothing
- Uses `HUDPanel` as its wrapper (same pattern as theme picker)
- Integrated into `DashboardPortfolioView` in the "Preferences" section, below the existing theme picker, only rendered when `user.portfolioMode` is relevant (always shown — Classic sees 3 active options, Tech sees all 4)

**`DashboardPortfolioView` integration**
- Import and render `PortfolioViewSelector` in `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`
- Pass `currentViewMode={portfolioSettings?.viewMode ?? 'sections'}` and `portfolioMode={user.portfolioMode}`
- Place it inside a new `HUDPanel` titled "View Mode" after the Classic Mode Theme picker block

## Existing Code to Leverage

**`features/portfolio/components/PortfolioLayout.tsx` — sections render logic**
- The mobile "all sections stacked" render path (lines 241–301) is the direct model for `OnePageTemplate`; extract and reuse the same `fullOrder`, `isVisible`, `orderMap` logic verbatim
- The CRT overlay markup (lines 146–152) and boot screen (lines 155–175) are copied directly into `TerminalTemplate`

**`features/portfolio-settings/actions/portfolioSettingsActions.ts` — action pattern**
- New `updatePortfolioViewModeAction` follows the exact same shape: `actionWrapper` → `auth.api.getSession` → validate → call service → `revalidatePath`
- The existing `updatePortfolioSettingsService` already accepts `UpdatePortfolioSettingsInput`; extend input type and service validation, then reuse the service as-is

**`features/portfolio-settings/components/` — theme picker pattern in `DashboardPortfolioView`**
- The Classic Mode theme picker (lines 517–552 in `DashboardPortfolioView.tsx`) is the exact UI pattern for `PortfolioViewSelector`: `HUDPanel` wrapper, `grid grid-cols-2 md:grid-cols-4`, button cards with active border, `handleThemeSelect`-style `startTransition` handler

**`features/tech/components/crt-monitor.tsx` — `CRTMonitor` component**
- `TerminalTemplate` uses `CRTMonitor` with the `children` prop to render each data panel
- Import as `import { CRTMonitor } from '@/features/tech/components/crt-monitor'`
- The `colorClasses` pattern (cyan/green/yellow/magenta/white) inside CRTMonitor should guide terminal text color choices in each panel

**`features/portfolio/components/classic/ClassicHero.tsx` — contact links pattern**
- `MinimalTemplate` replicates the contact links render (email, GitHub, LinkedIn, custom) from `ClassicHero` for Classic mode styling
- For Tech mode, replaces `<a>` tags with `TechBadge` components as done in `TechHero`

## Out of Scope

- Animated transitions between view modes
- Per-section drag-and-drop ordering within any view mode
- A preview of view modes inside the dashboard (no iframe preview)
- Applying `viewMode` to the Tech Mode existing `sections` layout (it already works; no change needed)
- Custom `viewMode` values outside the four defined options
- Localization of new UI strings in `PortfolioViewSelector` (use English hardcoded labels for now)
- Gallery, Services, and Testimonials sections in `TerminalTemplate` (include only IDENT, SKILL_TREE, PROJECTS, TIMELINE, CONTACT panels)
- Any changes to `PanelNavigation` component
