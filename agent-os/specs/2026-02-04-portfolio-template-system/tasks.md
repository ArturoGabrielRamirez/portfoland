# Task Breakdown: Portfolio Template System

## Overview
Total Tasks: 53
Feature: Public portfolio page at `/[locale]/[username]` with two visual modes (Professional and Gaming), panel-based navigation, and integration with existing Timeline and Skill Tree features.

## Task List

### Data Layer & Schema

#### Task Group 1: Prisma Schema Updates and Data Functions
**Dependencies:** None

- [x] 1.0 Complete data layer for portfolio system
  - [x] 1.1 Write 4 focused tests for data layer
    - Test `getPortfolioByUsername` returns aggregated data for a valid username
    - Test `getPortfolioByUsername` returns `null` for a non-existent username
    - Test `getPublicProjectsByUsername` returns only experiences with `type: 'PROJECT'`
    - Test `updatePortfolioMode` correctly updates the `portfolioMode` field on the User model
  - [x] 1.2 Add `portfolioMode` and `bio` fields to User model in `prisma/schema.prisma`
    - Add `portfolioMode String @default("professional")` to the User model
    - Add `bio String?` to the User model
    - Run `bunx prisma generate` after schema change (ask user before running `prisma migrate dev`)
  - [x] 1.3 Add `portfolioMode` to the `DashboardUser` type in `features/dashboard/types/dashboard.ts`
    - Add `portfolioMode: string` field to the `DashboardUser` interface
    - Ensure the dashboard layout query includes `portfolioMode` when fetching user data
  - [x] 1.4 Create `features/portfolio/` feature folder with standard structure
    - Create directories: `components/`, `types/`, `data/`, `constants/`
    - Create `features/portfolio/index.ts` barrel export
  - [x] 1.5 Define portfolio types in `features/portfolio/types/portfolio.ts`
    - Create `PortfolioMode` type (`'professional' | 'gaming'`)
    - Create `PortfolioData` type aggregating user profile, `portfolioMode`, experiences, skills, projects
    - Create `PortfolioUser` type (id, name, username, email, image, bio, portfolioMode)
    - Define component prop interfaces: `PortfolioLayoutProps`, `PortfolioSectionProps`, `PanelNavigationProps`
    - Use Prisma types as foundation; extend with `Pick`/`Omit` utilities per standards
  - [x] 1.6 Create `features/portfolio/data/getPortfolio.data.ts`
    - Implement `getPortfolioByUsername(username: string): Promise<PortfolioData | null>`
    - Fetch user profile (with `portfolioMode` and `bio`), experiences, skills, and projects in parallel using `Promise.all`
    - Reuse `getPublicTimelineByUsername` for experiences data
    - Reuse `getPublicSkillsByUsername` for skills data
    - Return `null` if user not found or has no `username` set
    - Import `prisma` from `@/features/core` (or `@/lib/prisma` matching existing pattern)
  - [x] 1.7 Create `features/portfolio/data/getPublicProjects.data.ts`
    - Implement `getPublicProjectsByUsername(username: string): Promise<ProjectData[] | null>`
    - Query experiences with `type: 'PROJECT'` for the given username, ordered by `startDate desc`
    - Pure data function with no business logic per standards
  - [x] 1.8 Create `features/portfolio/data/updatePortfolioMode.data.ts`
    - Implement `updatePortfolioModeData(userId: string, mode: string): Promise<User>`
    - Pure Prisma update on the User model's `portfolioMode` field
  - [x] 1.9 Create Yup validation schema in `features/portfolio/schemas/portfolio.schema.ts`
    - Define `updatePortfolioModeSchema` validating mode is one of `'professional'` or `'gaming'`
    - Export inferred type `UpdatePortfolioModeInput`
  - [x] 1.10 Create portfolio constants in `features/portfolio/constants/messages.ts`
    - Define `PORTFOLIO_MESSAGES` with success/error messages for mode toggle
    - Define `PORTFOLIO_MODES` constant object with `PROFESSIONAL` and `GAMING` values
  - [x] 1.11 Ensure data layer tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify schema generates correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4 tests from 1.1 pass
- `portfolioMode` and `bio` fields added to User model and Prisma types regenerated
- `PortfolioData` type correctly aggregates user, experiences, skills, and projects
- `getPortfolioByUsername` fetches all data in parallel and returns aggregated result
- `getPublicProjectsByUsername` correctly filters by `type: 'PROJECT'`
- `DashboardUser` type includes `portfolioMode`
- All data functions import `prisma` from the centralized singleton

---

### Server Action & Service Layer

#### Task Group 2: Portfolio Mode Toggle Server Action
**Dependencies:** Task Group 1

- [x] 2.0 Complete server action for portfolio mode toggling
  - [x] 2.1 Write 3 focused tests for the mode toggle action
    - Test `togglePortfolioMode` server action successfully updates mode from `professional` to `gaming`
    - Test `togglePortfolioMode` rejects invalid mode values
    - Test `togglePortfolioMode` requires authentication (returns error for unauthenticated request)
  - [x] 2.2 Create `features/portfolio/services/portfolio.service.ts`
    - Implement `updatePortfolioModeService(userId: string, mode: string)` with business logic
    - Validate that the mode value is valid (`professional` or `gaming`)
    - Call `updatePortfolioModeData` from the data layer
    - Follow three-layer architecture: action -> service -> data
  - [x] 2.3 Create `features/portfolio/actions/togglePortfolioMode.ts`
    - Implement `togglePortfolioMode` server action with `'use server'` directive
    - Validate input with Yup schema from 1.9
    - Wrap with `actionWrapper` for consistent error handling per standards
    - Authenticate user via session check
    - Call `updatePortfolioModeService`
    - Revalidate the public portfolio path (`/[locale]/[username]`) after toggling
    - Return `ActionResponse` with success/error message from constants
  - [x] 2.4 Ensure server action tests pass
    - Run ONLY the 3 tests written in 2.1
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3 tests from 2.1 pass
- Server action validates input, authenticates, and updates the mode
- Cache revalidation occurs after successful mode change
- Error handling follows `actionWrapper` pattern consistently

---

### Internationalization

#### Task Group 3: i18n Translations
**Dependencies:** None (can run in parallel with Task Groups 1-2)

- [x] 3.0 Complete i18n support for portfolio feature
  - [x] 3.1 Add `portfolio` namespace to `messages/en.json`
    - Navigation labels: `hero`, `about`, `timeline`, `skills`, `projects`, `contact`, `ai`
    - Section titles for both modes
    - Empty states: professional ("No summary provided", "No projects yet", etc.) and gaming ("BIOGRAPHY DATA NOT FOUND", "NO MISSIONS LOGGED", etc.)
    - Mode names: `professional`, `gaming`
    - Placeholder text for AI section: "AI-Powered Insights", "Coming Soon", "SYSTEM INITIALIZING..."
    - Common UI labels: "Download CV", "Coming Soon", "Contact", social link labels
  - [x] 3.2 Add `portfolio` namespace to `messages/es.json`
    - Spanish translations for all keys added in 3.1
    - Maintain same key structure as English
  - [x] 3.3 Add mode toggle labels to the `dashboard` namespace in both `en.json` and `es.json`
    - Keys: `modeToggle.professional`, `modeToggle.gaming`, `modeToggle.label`, `modeToggle.success`
  - [x] 3.4 Verify i18n keys load without errors
    - Manually verify keys are valid JSON and accessible

**Acceptance Criteria:**
- `portfolio` namespace exists in both `messages/en.json` and `messages/es.json`
- All 7 section navigation labels are translated
- Empty states, mode names, and placeholder text are translated in both languages
- Dashboard namespace includes mode toggle labels
- No JSON syntax errors in either locale file

---

### Dashboard Integration

#### Task Group 4: Portfolio Mode Toggle in Dashboard Header
**Dependencies:** Task Groups 1, 2, 3

- [ ] 4.0 Complete dashboard mode toggle integration
  - [ ] 4.1 Write 3 focused tests for the toggle component
    - Test `PortfolioModeToggle` renders correct icon for current mode (briefcase for professional, gamepad for gaming)
    - Test clicking the toggle calls `togglePortfolioMode` server action
    - Test toggle shows loading state during transition
  - [ ] 4.2 Create `features/portfolio/components/PortfolioModeToggle.tsx`
    - Client component (`'use client'`) extracted as a small, focused toggle
    - Display current mode with icon: briefcase (lucide `Briefcase`) for professional, gamepad (lucide `Gamepad2`) for gaming
    - Single click switches mode
    - Use `useTransition` + `togglePortfolioMode` server action + `toast` pattern from `UserMenu`
    - Use `useTranslations('dashboard')` for toggle labels
    - Style: small button fitting the dark dashboard header aesthetic, with subtle cyan/magenta accent matching current mode
  - [ ] 4.3 Integrate `PortfolioModeToggle` into `DashboardHeader`
    - Place between the nav links area and the right-side controls (language switcher + user menu)
    - Pass `portfolioMode` from the `user` prop (now available via updated `DashboardUser` type)
    - Ensure the header query/fetch includes `portfolioMode` from the user record
  - [ ] 4.4 Ensure dashboard toggle tests pass
    - Run ONLY the 3 tests written in 4.1
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3 tests from 4.1 pass
- Toggle appears in dashboard header between nav and right-side controls
- Icon correctly reflects current mode (briefcase/gamepad)
- Clicking toggles mode with loading state, toast feedback, and path revalidation
- Follows `useTransition` + server action + toast pattern established in `UserMenu`

---

### Portfolio Route & Layout

#### Task Group 5: Public Portfolio Route and Panel Navigation
**Dependencies:** Task Groups 1, 3

- [ ] 5.0 Complete portfolio route structure and panel-based navigation
  - [ ] 5.1 Write 5 focused tests for route and navigation
    - Test portfolio page server component returns `notFound()` for non-existent username
    - Test portfolio page fetches and passes correct `portfolioMode` to client layout
    - Test `PanelNavigation` renders all 7 section tabs with translated labels
    - Test `PanelNavigation` switches active panel on tab click with Framer Motion animation
    - Test mobile layout renders sticky bottom tab bar at `<768px` viewport
  - [ ] 5.2 Create `app/[locale]/[username]/page.tsx` (server component)
    - Fetch all portfolio data via `getPortfolioByUsername`
    - Return `notFound()` if username does not exist
    - Pass serialized `PortfolioData` to the client layout component
    - Use parallel data fetching pattern with `Promise.all`
  - [ ] 5.3 Create `app/[locale]/[username]/layout.tsx`
    - Minimal public layout similar to existing `skills/layout.tsx` pattern
    - Include logo linking to home and a CTA button
    - Professional mode: white/light background, clean header
    - Gaming mode: dark `#0A0E1A` background, cyberpunk header with gradient logo
    - Conditionally style based on `portfolioMode` (passed via context or read from page data)
    - Use `setRequestLocale` for static rendering per existing pattern
  - [ ] 5.4 Create `features/portfolio/components/PanelNavigation.tsx` (client component)
    - Tabbed navigation showing 7 sections: Hero, About, Timeline, Skills, Projects, Contact, AI
    - Desktop (`>=768px`): sidebar or top tab bar; one section visible at a time; entire portfolio fits single viewport with NO vertical scroll
    - Mobile (`<768px`): sticky bottom tab bar; sections stack vertically with scroll permitted
    - Active section tracked via `useState` (no URL hash or query params)
    - Navigation labels translated via `useTranslations('portfolio')`
    - Use Framer Motion `AnimatePresence` for panel transition animations (fade or slide)
    - Icons for each section tab using lucide-react
  - [ ] 5.5 Create `features/portfolio/components/PortfolioLayout.tsx` (client component)
    - Master layout component that receives `PortfolioData` and `portfolioMode`
    - Renders `PanelNavigation` and the active section panel
    - Conditionally renders Professional or Gaming variant of each section based on mode
    - Desktop: `h-screen` with `overflow-hidden` to enforce no-scroll constraint
    - Mobile: natural document flow with scroll
    - Uses `cn()` for conditional class application
  - [ ] 5.6 Ensure route and navigation tests pass
    - Run ONLY the 5 tests written in 5.1
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 5 tests from 5.1 pass
- Portfolio page at `/[locale]/[username]` loads with correct data
- `notFound()` returned for invalid usernames
- Panel navigation renders 7 translated tabs
- Desktop: single viewport, no scroll, sidebar/top nav switching panels
- Mobile: stacked layout with sticky bottom nav, scroll permitted
- Framer Motion `AnimatePresence` animates panel transitions
- Layout conditionally applies Professional or Gaming visual theme

---

### Portfolio Section Panels -- Professional Mode

#### Task Group 6: Professional Mode Section Components
**Dependencies:** Task Group 5

- [ ] 6.0 Complete all Professional mode section panels
  - [ ] 6.1 Write 5 focused tests for Professional mode components
    - Test `ProfessionalHero` renders user name in `<h1>`, title, avatar with initials fallback
    - Test `ProfessionalTimeline` renders experiences as semantic ordered list (`<ol>`, `<li>`, `<time>`)
    - Test `ProfessionalSkills` renders skills grouped by category with progress bars
    - Test `ProfessionalProjects` renders project cards using shadcn `Card` component
    - Test `ProfessionalAbout` shows empty state message when `bio` is empty
  - [ ] 6.2 Create `features/portfolio/components/professional/ProfessionalHero.tsx`
    - Semantic `<header>` with `<h1>` for user name
    - User avatar with initials fallback (reuse `getInitials` pattern from `UserMenu`)
    - Professional title/role display
    - Social links as text links
    - Styling: white/light-gray card, standard typography, no glow effects
    - Color palette: white backgrounds, `gray-900` text, `gray-100` borders, `blue-600` accent links
  - [ ] 6.3 Create `features/portfolio/components/professional/ProfessionalAbout.tsx`
    - Semantic `<section>` with `<h2>` title
    - Render `bio` field as standard paragraph text
    - Empty state: "No summary provided" (translated) with no decorative elements
    - No gaming visual elements
  - [ ] 6.4 Create `features/portfolio/components/professional/ProfessionalTimeline.tsx`
    - Render experiences as a clean chronological list
    - Each item: company, title, dates (using `<time>` element), description, skill tags
    - Semantic HTML: `<ol>`, `<li>`, `<time>` for ATS friendliness
    - Proper heading hierarchy (`<h3>` for item titles)
    - Use data from existing `getPublicTimelineByUsername` function
  - [ ] 6.5 Create `features/portfolio/components/professional/ProfessionalSkills.tsx`
    - Skills grouped by category in a clean grid/list layout
    - Each skill: name, level as a simple progress bar (no XP/glow), category color dot
    - Use `SkillsByCategory` data structure from existing skills feature
    - Standard Tailwind styling with `gray` palette
  - [ ] 6.6 Create `features/portfolio/components/professional/ProfessionalProjects.tsx`
    - Card grid using shadcn `Card`, `CardHeader`, `CardTitle`, `CardContent` components
    - Each card: project title, description, date range, skill tags
    - Empty state when no projects exist (translated)
  - [ ] 6.7 Create `features/portfolio/components/professional/ProfessionalContact.tsx`
    - Clean card with email link, social icons (GitHub, LinkedIn)
    - "Download CV" placeholder button (disabled, labeled "Coming Soon")
    - Use semantic `<address>` element
    - Social links use placeholder values until settings page is built
  - [ ] 6.8 Create `features/portfolio/components/professional/ProfessionalAI.tsx`
    - Placeholder card with "AI-Powered Insights" heading (`<h2>`)
    - Brief description of future capabilities
    - "Coming Soon" badge using shadcn `Badge` component
    - Clearly marked as placeholder in both visual and code
  - [ ] 6.9 Ensure Professional mode tests pass
    - Run ONLY the 5 tests written in 6.1
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 5 tests from 6.1 pass
- All 7 Professional sections render with clean, ATS-friendly HTML
- Semantic elements used throughout: `<header>`, `<section>`, `<article>`, `<time>`, `<ol>`, `<address>`, `<main>`
- Proper heading hierarchy: `<h1>` for name, `<h2>` for sections, `<h3>` for items
- Color palette: white backgrounds, `gray-900` text, `gray-100` borders, `blue-600` accents
- No neon glow, no gaming badges, no XP/level indicators in Professional mode
- Empty states display translated messages
- All components use shadcn/ui primitives where applicable

---

### Portfolio Section Panels -- Gaming Mode

#### Task Group 7: Gaming Mode Section Components
**Dependencies:** Task Group 5

- [ ] 7.0 Complete all Gaming mode section panels
  - [ ] 7.1 Write 5 focused tests for Gaming mode components
    - Test `GamingHero` renders `GamingCard` with `variant="featured"` and `GamingAvatar` with `frame="legendary"`
    - Test `GamingTimeline` embeds `TimelineMap` with `isEditable={false}`
    - Test `GamingSkills` embeds `SkillTreeView` with `isEditable={false}`
    - Test `GamingProjects` renders `GamingCard` with `variant="glow"` for each project
    - Test `GamingAI` renders pulsing dot animation and "SYSTEM INITIALIZING..." text
  - [ ] 7.2 Create `features/portfolio/components/gaming/GamingHero.tsx`
    - Use `GamingCard` with `variant="featured"` wrapper
    - `GamingAvatar` with `frame="legendary"` for user avatar
    - `LevelBadge` component for user level
    - Neon glow text for user name (cyan `#00D4FF` text-shadow)
    - `GamingBadge` components for social links
    - Import all gaming components from `features/gaming`
  - [ ] 7.3 Create `features/portfolio/components/gaming/GamingAbout.tsx`
    - `HUDPanel` wrapper with cyan accent line
    - Summary text with subtle text-glow effect
    - Empty state: "BIOGRAPHY DATA NOT FOUND" styled as terminal message with monospace font
  - [ ] 7.4 Create `features/portfolio/components/gaming/GamingTimeline.tsx`
    - Embed existing `TimelineMap` component in read-only mode (`isEditable={false}`)
    - Reuse `HexagonNode`, `ExperienceCard`, and `TimelineConnections`
    - Contained within the panel dimensions (no overflow on desktop)
    - Pass experiences data from `PortfolioData`
  - [ ] 7.5 Create `features/portfolio/components/gaming/GamingSkills.tsx`
    - Embed existing `SkillTreeView` with `isEditable={false}`
    - Reuses `GalaxyCanvas` on desktop and `MobileSkillList` on mobile
    - Pass skills data from `PortfolioData`
    - Contained within panel dimensions
  - [ ] 7.6 Create `features/portfolio/components/gaming/GamingProjects.tsx`
    - `GamingCard` with `variant="glow"` for each project
    - Skill tags as `GamingBadge` components
    - `StatCard` showing total project count
    - Empty state styled with gaming terminal aesthetic
  - [ ] 7.7 Create `features/portfolio/components/gaming/GamingContact.tsx`
    - `HUDPanel` wrapper for the contact section
    - Social link buttons using `GamingButton` with `variant="outline"`
    - Neon-styled layout matching cyberpunk palette (`#0A0E1A` bg, `#00D4FF` cyan, `#D946EF` magenta)
  - [ ] 7.8 Create `features/portfolio/components/gaming/GamingAI.tsx`
    - `HUDPanel` with glowing "AI CORE" title (neon text-shadow)
    - Animated pulsing dot using Tailwind `animate-pulse` or Framer Motion
    - Scanline CSS effect (custom CSS in `globals.css` is acceptable for complex animations per standards)
    - "SYSTEM INITIALIZING..." text in monospace font
    - Clearly marked as placeholder
  - [ ] 7.9 Ensure Gaming mode tests pass
    - Run ONLY the 5 tests written in 7.1
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 5 tests from 7.1 pass
- All 7 Gaming sections render with full cyberpunk aesthetic
- Existing components reused: `GamingCard`, `GamingButton`, `GamingAvatar`, `GamingBadge`, `HUDPanel`, `LevelBadge`, `StatCard`
- `TimelineMap` and `SkillTreeView` embedded in read-only mode
- Dark background `#0A0E1A`, cyan `#00D4FF`, magenta `#D946EF`, neon glow effects throughout
- Pulsing dot and scanline effects on AI placeholder section
- Components fit within single-viewport panel constraint on desktop

---

### Responsive Design & Polish

#### Task Group 8: Responsive Layout and Cross-Mode Integration
**Dependencies:** Task Groups 5, 6, 7

- [ ] 8.0 Complete responsive design and mode integration
  - [ ] 8.1 Write 3 focused tests for responsive behavior
    - Test desktop viewport (`>=768px`) renders portfolio in single viewport with no vertical scrollbar
    - Test mobile viewport (`<768px`) renders stacked sections with sticky bottom navigation
    - Test `PortfolioLayout` correctly switches between Professional and Gaming component sets based on `portfolioMode` prop
  - [ ] 8.2 Apply desktop layout constraints
    - Ensure `h-screen overflow-hidden` on desktop wrapper
    - Panel content areas use `overflow-y-auto` only within individual panels if content exceeds panel height
    - Sidebar navigation takes fixed width; main panel area fills remaining space
    - Test with all 7 sections to verify no viewport overflow
  - [ ] 8.3 Apply mobile layout
    - Sections stack vertically in natural document flow
    - Sticky bottom tab bar (`position: sticky; bottom: 0`) with section icons
    - Touch-friendly tab targets (minimum 44x44px per accessibility standards)
    - Scroll-to-section behavior on tab tap
    - Breakpoint at `768px` using Tailwind `md:` prefix (mobile-first approach)
  - [ ] 8.4 Add Framer Motion transitions polish
    - `AnimatePresence` wrapping active panel with `mode="wait"`
    - Fade or slide-in animation on panel switch (desktop)
    - Subtle entrance animations for section content
    - Keep animations performant (transform/opacity only, no layout triggers)
  - [ ] 8.5 Add scanline CSS effect for Gaming AI section
    - Add keyframe animation in `app/globals.css` (acceptable per CSS standards for complex animations)
    - Apply only within Gaming mode AI placeholder panel
  - [ ] 8.6 Ensure responsive tests pass
    - Run ONLY the 3 tests written in 8.1
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3 tests from 8.1 pass
- Desktop: entire portfolio in single viewport, no scroll, panel navigation works
- Mobile: stacked layout, sticky bottom nav, scroll works naturally
- Framer Motion transitions are smooth and performant
- Mode switching renders the correct component set without visual artifacts
- Scanline CSS effect applied to Gaming AI section

---

### Test Review & Gap Analysis

#### Task Group 9: Test Review and Critical Gap Coverage
**Dependencies:** Task Groups 1-8

- [ ] 9.0 Review existing tests and fill critical gaps only
  - [ ] 9.1 Review tests from Task Groups 1-8
    - Review the 4 data layer tests (Task 1.1)
    - Review the 3 server action tests (Task 2.1)
    - Review the 3 dashboard toggle tests (Task 4.1)
    - Review the 5 route/navigation tests (Task 5.1)
    - Review the 5 Professional mode tests (Task 6.1)
    - Review the 5 Gaming mode tests (Task 7.1)
    - Review the 3 responsive layout tests (Task 8.1)
    - Total existing tests: approximately 28 tests
  - [ ] 9.2 Analyze test coverage gaps for portfolio feature only
    - Identify critical user workflows lacking coverage
    - Focus ONLY on gaps related to portfolio feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows: visiting a portfolio URL -> seeing correct mode -> navigating panels
  - [ ] 9.3 Write up to 10 additional strategic tests maximum
    - End-to-end: full portfolio page load for a user with `portfolioMode: 'professional'` renders only Professional components
    - End-to-end: full portfolio page load for a user with `portfolioMode: 'gaming'` renders only Gaming components
    - Integration: toggling mode in dashboard header reflects on next visit to public portfolio page
    - Integration: portfolio page renders correctly for a user with no experiences, skills, or projects (all empty states)
    - i18n: portfolio page renders correct translations when locale is `es`
    - Fill remaining gaps identified in 9.2 (up to 5 more tests)
    - Do NOT write comprehensive coverage for all scenarios
  - [ ] 9.4 Run feature-specific tests only
    - Run ONLY tests related to the portfolio feature (tests from 1.1, 2.1, 4.1, 5.1, 6.1, 7.1, 8.1, and 9.3)
    - Expected total: approximately 33-38 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All portfolio-specific tests pass (approximately 33-38 tests total)
- Critical user workflows covered: page load, mode rendering, panel navigation, mode toggle
- No more than 10 additional tests added
- Testing focused exclusively on portfolio feature requirements
- Empty state rendering verified for both modes

---

## Execution Order

Recommended implementation sequence:

```
Phase 1 - Foundation (can run in parallel):
  [Task Group 1] Data Layer & Schema
  [Task Group 3] i18n Translations

Phase 2 - Backend Logic:
  [Task Group 2] Server Action & Service Layer (depends on 1)

Phase 3 - Dashboard Integration:
  [Task Group 4] Dashboard Mode Toggle (depends on 1, 2, 3)

Phase 4 - Core UI:
  [Task Group 5] Route & Panel Navigation (depends on 1, 3)

Phase 5 - Section Panels (can run in parallel):
  [Task Group 6] Professional Mode Sections (depends on 5)
  [Task Group 7] Gaming Mode Sections (depends on 5)

Phase 6 - Polish:
  [Task Group 8] Responsive Design & Integration (depends on 5, 6, 7)

Phase 7 - Verification:
  [Task Group 9] Test Review & Gap Analysis (depends on 1-8)
```

## Key Technical Notes

- **Prisma singleton**: Import `prisma` from `@/lib/prisma` (matches existing codebase pattern in `getPublicTimelineByUsername` and `getPublicSkillsByUsername`)
- **Feature architecture**: All new code goes in `features/portfolio/` following established patterns from `features/timeline/` and `features/skills/`
- **Props in /types**: All component prop interfaces defined in `features/portfolio/types/portfolio.ts`, not in component files
- **Server actions**: Follow three-layer pattern (action -> service -> data) with `actionWrapper` and Yup validation
- **Gaming components**: Import from `features/gaming/index.tsx` (single barrel export)
- **Existing data functions**: Reuse `getPublicTimelineByUsername` and `getPublicSkillsByUsername` directly; do not duplicate
- **No backward compatibility code needed** per coding style standards
- **Tailwind utility-first**: Use `cn()` for conditional classes, CVA for complex variant systems; custom CSS only for scanline animation
- **Mobile-first responsive**: Use Tailwind `md:` prefix for desktop overrides; base styles target mobile
