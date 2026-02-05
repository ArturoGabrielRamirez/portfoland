# Specification: Portfolio Template System

## Goal
Build a public portfolio page at `/[locale]/[username]` with two visual modes (Professional and Gaming) that integrates existing Timeline and Skill Tree features into a single-viewport, panel-based experience where the portfolio owner controls which mode visitors see.

## User Stories
- As a portfolio owner, I want to choose between a Professional or Gaming visual mode from my dashboard so that I control how visitors perceive my portfolio.
- As a visitor, I want to navigate a user's portfolio through tabbed panels (Hero, About, Timeline, Skills, Projects, Contact, AI) so that I can explore their profile without scrolling on desktop.

## Specific Requirements

**Panel-Based Navigation System**
- Build a client-side tabbed/panel navigation component that shows one section at a time
- Desktop (>=768px): the entire portfolio fits within a single viewport with NO vertical scroll; a sidebar or top tab bar allows switching between 7 sections
- Mobile (<768px): sections stack vertically and scroll is permitted; a sticky bottom tab bar or collapsible nav provides section access
- Use Framer Motion `AnimatePresence` for panel transition animations (fade or slide)
- Active section is tracked via client state (no URL hash or query param needed)
- Navigation labels must be translated via next-intl using the `portfolio` i18n namespace

**Mode System (Professional vs Gaming)**
- Add a `portfolioMode` field (`String`, default `'professional'`) to the User model in `prisma/schema.prisma`
- The field accepts two values: `'professional'` or `'gaming'`
- Visitors see ONLY the mode the owner selected; there is no visitor-facing toggle
- The portfolio page server component reads `portfolioMode` from the user record and passes it as a prop to the client layout
- The layout conditionally renders either the Professional or Gaming variant of each section panel

**Dashboard Header Mode Toggle**
- Add a portfolio mode toggle button to the existing `DashboardHeader` component, placed between the nav links and the right-side controls
- The toggle is a small client component (extracted as `PortfolioModeToggle`) that calls a server action to update the user's `portfolioMode` field
- Use the `useTransition` + server action + toast pattern established in the codebase
- Display the current mode with an icon (briefcase for professional, gamepad for gaming) and allow switching with a single click
- Revalidate the public portfolio path after toggling

**Hero Section**
- Displays user avatar, full name, professional title/role, and social links
- Professional mode: clean white/light-gray card with standard typography, semantic `<header>` and `<h1>`, no glow effects
- Gaming mode: uses `GamingCard` with `variant="featured"`, `GamingAvatar` with `frame="legendary"`, `LevelBadge`, neon glow text for name, and `GamingBadge` components for social links
- Avatar falls back to initials using the same `getInitials` utility from `UserMenu`

**About / Summary Section**
- Renders a brief professional summary stored as a new `bio` field (`String?`) on the User model
- Professional mode: semantic `<section>` with `<h2>`, standard paragraph text, no decorative elements
- Gaming mode: `HUDPanel` wrapper with cyan accent line, summary text with subtle text-glow
- If `bio` is empty, show a contextual empty state (professional: "No summary provided"; gaming: "BIOGRAPHY DATA NOT FOUND" styled as a terminal message)

**Timeline Section**
- Integrates the existing `TimelineMap` component (gaming mode) and a new `ProfessionalTimeline` list component (professional mode)
- Gaming mode: embed `TimelineMap` in read-only mode (`isEditable={false}`) within the panel; reuse `HexagonNode`, `ExperienceCard`, and `TimelineConnections`
- Professional mode: render experiences as a clean chronological list with company, title, dates, description, and skill tags; use semantic HTML (`<ol>`, `<li>`, `<time>`) for ATS friendliness
- Fetch experiences using the existing `getPublicTimelineByUsername` data function

**Skills Section**
- Integrates the existing `SkillTreeView` component (gaming mode) and a new `ProfessionalSkills` grid component (professional mode)
- Gaming mode: embed `SkillTreeView` with `isEditable={false}` within the panel; reuses `GalaxyCanvas` on desktop and `MobileSkillList` on mobile
- Professional mode: render skills grouped by category in a clean grid/list; each skill shows name, level as a simple progress bar (no XP/glow), and category color dot
- Fetch skills using the existing `getPublicSkillsByUsername` data function

**Projects Section**
- Reuses the existing `Experience` model filtered by `type: PROJECT`; no new data model is needed
- Create a new data function `getPublicProjectsByUsername` that queries experiences with `type: 'PROJECT'` for the given username
- Professional mode: card grid with project title, description, date range, and skill tags; uses shadcn `Card` components
- Gaming mode: `GamingCard` with `variant="glow"` for each project, skill tags as `GamingBadge`, and `StatCard` showing project count

**Contact Section**
- Displays contact information (email, optional social links) without a contact form in this phase
- Professional mode: clean card with email link, social icons (GitHub, LinkedIn), and a "Download CV" placeholder button (disabled, labeled "Coming Soon")
- Gaming mode: `HUDPanel` with neon-styled social link buttons using `GamingButton` with `variant="outline"`
- Email is sourced from the public user record; social links will use fields already available or be hardcoded placeholders until a settings page is built

**AI Placeholder Section**
- Visual-only placeholder panel; no AI functionality is implemented in this phase
- Professional mode: a card with "AI-Powered Insights" heading, a brief description of future capabilities, and a "Coming Soon" badge
- Gaming mode: `HUDPanel` with a glowing "AI CORE" title, animated pulsing dot, scanline CSS effect, and "SYSTEM INITIALIZING..." text
- This section must be clearly marked as a placeholder in both modes

**Route Structure and Data Fetching**
- Public portfolio route: `app/[locale]/[username]/page.tsx` (server component)
- Create a new `features/portfolio/` feature folder following the established feature-based architecture with subfolders: `components/`, `types/`, `data/`, `constants/`
- The page server component fetches all portfolio data in parallel (user profile, experiences, skills, projects) and passes serialized data to the client layout
- Create a `getPortfolioByUsername` data function that aggregates user data, `portfolioMode`, experiences, skills, and projects into a single `PortfolioData` type
- Return `notFound()` if the username does not exist or has no `username` set

**Professional Mode Design Standards**
- Color palette: white backgrounds, gray-900 text, gray-100 borders, blue-600 accent links
- Typography: system font stack, proper heading hierarchy (h1 for name, h2 for section titles, h3 for items)
- All critical content in text (not images) for ATS parsing
- Semantic HTML throughout: `<main>`, `<section>`, `<article>`, `<header>`, `<time>`, `<ol>`, `<address>`
- No neon glow, no gaming badges, no XP/level indicators

**i18n Support**
- Add a `portfolio` namespace to both `messages/en.json` and `messages/es.json`
- Include keys for: section navigation labels (hero, about, timeline, skills, projects, contact, ai), empty states, mode names, placeholder text, and common UI labels
- Use `useTranslations('portfolio')` in client components and `getTranslations('portfolio')` in server components
- Add `portfolioMode` toggle labels to the `dashboard` namespace

## Visual Design
No visual mockups were provided. Professional mode follows standard CV/portfolio conventions with clean typography and white/gray palette. Gaming mode reuses the existing cyberpunk aesthetic (dark background `#0A0E1A`, cyan `#00D4FF`, magenta `#D946EF`, neon glow effects) established throughout the dashboard and gaming component library.

## Existing Code to Leverage

**Gaming UI Component Library (`features/gaming/index.tsx`)**
- Contains `GamingCard`, `GamingButton`, `GamingInput`, `GamingAvatar`, `GamingBadge`, `StatCard`, `XPBar`, `HUDPanel`, `LevelBadge`, `CharacterSelect`, and `Spinner`
- Reuse these directly in all Gaming mode section panels; they already implement the cyberpunk color palette and glow effects with CVA variants

**Timeline Feature (`features/timeline/`)**
- `TimelineMap` component with Google Maps + `HexagonNode` overlays for gaming mode timeline
- `getPublicTimelineByUsername` data function already fetches public experiences with stats
- `ExperienceCard` and `MobileTimelineEvent` components for displaying experience details
- Experience types/interfaces in `features/timeline/types/experience.ts` including `PublicTimelineData`

**Skills Feature (`features/skills/`)**
- `SkillTreeView` component with responsive desktop (GalaxyCanvas) and mobile (MobileSkillList) views
- `getPublicSkillsByUsername` data function already fetches public skills with categories and stats
- `SkillDetailCard` for viewing skill details in read-only mode
- Types in `features/skills/types/skill.ts` including `UserSkillWithDetails` and `SkillsByCategory`

**Dashboard Header and User Menu (`features/dashboard/`)**
- `DashboardHeader` is a server component with nav items and right-side controls; the mode toggle slots in between these areas
- `UserMenu` contains the `getInitials` utility and demonstrates the `useTransition` + toast pattern for client-side actions
- `DashboardUser` type in `features/dashboard/types/dashboard.ts` will need the `portfolioMode` field added

**Public Username Route (`app/[locale]/[username]/`)**
- Route structure already exists with a `skills/` sub-route that demonstrates the public page pattern (server component fetching by username, `notFound()` handling, `generateMetadata`)
- The `layout.tsx` at `app/[locale]/[username]/skills/layout.tsx` shows the minimal public header pattern with logo and CTA that should be replicated for the portfolio layout

## Out of Scope
- AI-driven personalization logic (deferred to Phase 4; only a visual placeholder is built)
- Subdomain routing (`username.portfoland.com` - Roadmap item #16)
- Portfolio SEO and Open Graph meta tags (Roadmap item #18)
- PDF/CV export functionality (deferred to Phase 4)
- Contact form with email sending (only static contact info display)
- User settings page for editing bio, social links, or other profile fields
- Visitor-facing mode toggle (visitors always see the owner's chosen mode)
- Analytics or view tracking on the portfolio page
- Custom theme colors or font selection by the portfolio owner
- Authentication or gating on the public portfolio page (fully public, no login required)
