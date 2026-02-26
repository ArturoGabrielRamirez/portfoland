# Specification: Classic Mode Public Template (Phase 2B)

## Goal

Build the public-facing UI for Classic Mode portfolios by rewiring two existing components, creating three new section components (Gallery, Services, Testimonials), applying the theme preset system to PortfolioLayout, and registering all new sections in the section map — so that non-technical professionals (photographers, barbers, architects) see a clean, polished portfolio with no terminal or tech-flavored UI.

## User Stories

- As a photographer visiting a Classic Mode portfolio, I want to see a gallery grid, services list, and testimonials in a clean white layout so that the portfolio feels appropriate for a creative/service professional rather than a developer.
- As a portfolio owner using the "Warm Cream" theme preset, I want my public portfolio to render with the correct background, text, and accent colors so that my chosen theme is visible to visitors without any extra configuration.

## Specific Requirements

**R1: Rewrite ClassicHero — remove all terminal styling**
- File: `features/portfolio/components/classic/ClassicHero.tsx`
- Remove entirely: the `font-mono` role div (`const ROLE = 'Fullstack Developer'` badge), the `terminal-window` bio section with macOS dots and dark background, and any terminal/code CSS classes
- New layout (centered column): avatar image or initials circle → `<h1>` name → bio paragraph (plain `<p>`, truncated to 3 lines via `line-clamp-3`) → contact links row
- Avatar: `rounded-full`, `border-2 border-gray-100` (or `border-[var(--portfolio-border)]`), `h-24 w-24 object-cover`; initials fallback keeps `data-testid="avatar-initials"` and shows initials computed by the existing `getInitials()` helper
- Bio: plain gray-600 text, `text-sm leading-relaxed line-clamp-3`, no code formatting
- Contact links row: keep existing pattern (Mail, GitHub, LinkedIn, custom links) with `text-blue-600` (or `text-[var(--portfolio-accent)]`) and hover underline
- Section root: `<header>` with `flex flex-col items-center gap-6 py-8`, same as today — only inner markup changes
- No new packages needed; keep `useTranslations('portfolio')`, `cn()`, lucide-react icons, `PortfolioSectionProps`

**R2: Remove tech header from ClassicSkills**
- File: `features/portfolio/components/classic/ClassicSkills.tsx`
- Delete the single `<div>` on lines 30-35 that renders `CPU: 12.4% MEM: 2.1GB/16GB UPTIME: 365d skills.bin` in `font-mono text-gray-400`
- No other changes; the `skills-grid`, `category-dot`, progress bars, `h2`, and empty state remain identical
- All existing `portfolio-classic.test.tsx` tests must continue to pass after this change

**R3: Create ClassicGallery component**
- File: `features/portfolio/components/classic/ClassicGallery.tsx` (new)
- Props: `{ data: PortfolioData, className?: string }` — standard `PortfolioSectionProps`; source data is `data.gallery` (`GalleryItemModel[]`)
- Filter only `published: true` items client-side before rendering (data layer already filters, but guard defensively)
- Category filter bar: if any items have a non-null `category`, render pill buttons (`All` + each distinct category); active pill uses `bg-blue-600 text-white` (or accent token), inactive uses `bg-gray-100 text-gray-600`; clicking filters the grid; default is `All`
- Grid: `data-testid="gallery-grid"`, `grid grid-cols-2 md:grid-cols-3 gap-4`; each cell is an `<img>` (not `next/image`) with `alt={item.altText ?? item.caption ?? ''}`, `className="w-full h-48 object-cover rounded-lg"`; caption below image if `item.caption` is set, rendered as `<p className="mt-1 text-xs text-gray-500 text-center">`
- Empty state: `data-testid="gallery-empty-state"`, text from `t('sections.gallery.classic.emptyState')`
- Section heading: `<h2>` from `t('sections.gallery.classic.title')`
- Section root: `<section className={cn('py-6', className)}>`
- `'use client'` directive; imports `useTranslations` from `next-intl`, `cn` from `@/lib/utils`, `useState` for category filter, `PortfolioSectionProps` from `../../types/portfolio`, `GalleryItemModel` from `@/features/gallery/types/galleryItem`

**R4: Create ClassicServices component**
- File: `features/portfolio/components/classic/ClassicServices.tsx` (new)
- Props: `PortfolioSectionProps`; source data is `data.services` (`ServiceModel[]`); filter `published: true` defensively
- Grid: `grid gap-4 md:grid-cols-2`; each card has `data-testid="service-card"`, `rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm`
- Card content: `<h3 className="font-semibold text-gray-900">` (title) → `<p className="text-sm text-gray-600">` (description, optional) → price display line → duration line
- Price display logic (use a `formatPrice(service)` helper inside the file):
  - `priceType === 'CONTACT'`: render `"Contact us"` string (use i18n key `sections.services.classic.priceContact`)
  - `priceType === 'FIXED'`: render `"${priceMin} {currency}"` e.g. `$50 USD`
  - `priceType === 'RANGE'`: render `"${priceMin} – ${priceMax} {currency}"`
  - `priceType === 'STARTING_FROM'`: render `"From ${priceMin} {currency}"`
- Duration display: if `durationMinutes` is set, format as `"30 min"` for < 60 or `"1h 30min"` for >= 60 (use a `formatDuration(minutes)` helper)
- Empty state: `data-testid="services-empty-state"`, text from `t('sections.services.classic.emptyState')`
- Section heading: `<h2>` from `t('sections.services.classic.title')`
- `'use client'` directive; imports `useTranslations`, `cn`, `PortfolioSectionProps`, `ServiceModel` from `@/features/services/types/service`

**R5: Create ClassicTestimonials component**
- File: `features/portfolio/components/classic/ClassicTestimonials.tsx` (new)
- Props: `PortfolioSectionProps`; source data is `data.testimonials` (`TestimonialModel[]`); filter `published: true` defensively
- Grid: `grid gap-4 md:grid-cols-2`; each card has `data-testid="testimonial-card"`, `rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm`
- Card content top row: star rating — render 5 `<span>` elements, filled (`text-amber-400`) for `1..rating`, unfilled (`text-gray-200`) for `rating+1..5`; use `★` unicode character
- Card content: `<blockquote className="mt-2 text-sm italic text-gray-600">"{content}"</blockquote>` → client name row: `<p className="mt-3 font-semibold text-gray-900">{clientName}</p>` → `<p className="text-xs text-gray-500">{clientTitle}</p>` (render only if `clientTitle` is set)
- Client avatar: if `imageUrl` is set, render `<img src={imageUrl} alt={clientName} className="h-8 w-8 rounded-full object-cover" />`; else render initials circle `<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{initials}</div>`; compute initials using same pattern as ClassicHero's `getInitials()` (first letter of first + last word)
- Empty state: `data-testid="testimonials-empty-state"`, text from `t('sections.testimonials.classic.emptyState')`
- Section heading: `<h2>` from `t('sections.testimonials.classic.title')`
- `'use client'` directive; imports `useTranslations`, `cn`, `PortfolioSectionProps`, `TestimonialModel` from `@/features/testimonials/types/testimonial`

**R6: Apply theme preset as CSS variables in PortfolioLayout**
- File: `features/portfolio/components/PortfolioLayout.tsx`
- Add import: `import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';`
- Inside the component, before the return, resolve the preset: `const preset = THEME_PRESETS[data.settings?.theme ?? 'default'] ?? THEME_PRESETS['default'];`
- Apply CSS variables on the root `<div>` via `style` prop (only in classic mode; tech mode is unchanged):
  ```
  style={isClassic ? {
    '--portfolio-bg': preset.backgroundColor,
    '--portfolio-text': preset.textColor,
    '--portfolio-accent': preset.accentColor,
    '--portfolio-border': preset.borderColor,
    '--portfolio-card-bg': preset.cardBackground,
  } as React.CSSProperties : undefined}
  ```
- Change classic mode className from `bg-white text-gray-900` to `bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]`
- Tech mode className remains `bg-[#0A0E1A] text-white overflow-hidden` — no change
- No other logic in PortfolioLayout changes; `data-testid="portfolio-layout"` is preserved

**R7: Register new sections in classicSections map**
- File: `features/portfolio/components/PortfolioLayout.tsx`
- Add three imports at the top of the Classic mode components import block:
  - `import { ClassicGallery } from './classic/ClassicGallery';`
  - `import { ClassicServices } from './classic/ClassicServices';`
  - `import { ClassicTestimonials } from './classic/ClassicTestimonials';`
- Add three entries to `classicSections`:
  - `gallery: ClassicGallery,`
  - `services: ClassicServices,`
  - `testimonials: ClassicTestimonials,`
- The full `classicSections` map after this change has 10 keys: hero, about, timeline, skills, projects, contact, ai, gallery, services, testimonials

**R8: Tests for new Classic Mode section components**
- File: `features/portfolio/__tests__/portfolio-classic-new-sections.test.tsx` (new)
- Follow exact pattern from `features/portfolio/__tests__/portfolio-classic.test.tsx`: vitest, `@testing-library/react`, mock `next-intl` with a translations map, dynamic `import()` for each component inside the `it()` block
- `mockData` must include `services: []`, `testimonials: []`, `gallery: []`, `settings: null` fields on `PortfolioData` (the existing test file's `mockData` will need these added too if the type requires it, but that is a separate fix — the new test file must define its own complete mock)
- Six test cases required:
  1. `ClassicGallery renders gallery grid with items` — populate `data.gallery` with 2 items, assert `gallery-grid` is in the document and both items render (check alt text or caption text)
  2. `ClassicGallery shows empty state when no gallery items` — empty array, assert `gallery-empty-state` is in the document
  3. `ClassicServices renders service cards with all price types` — populate `data.services` with 4 services (one per `priceType`), assert 4 `service-card` elements, assert formatted price strings are present in the document
  4. `ClassicServices shows empty state when no services` — empty array, assert `services-empty-state` is in the document
  5. `ClassicTestimonials renders testimonial cards with star rating and content` — populate `data.testimonials` with 1 item (`rating: 4`, `content: "Great work"`, `clientName: "Jane Smith"`), assert `testimonial-card` exists, assert `"Great work"` text and `"Jane Smith"` text are in the document
  6. `ClassicTestimonials shows empty state when no testimonials` — empty array, assert `testimonials-empty-state` is in the document
- i18n mock must include all new translation keys: `sections.gallery.classic.title`, `sections.gallery.classic.emptyState`, `sections.services.classic.title`, `sections.services.classic.emptyState`, `sections.services.classic.priceContact`, `sections.testimonials.classic.title`, `sections.testimonials.classic.emptyState`

## Visual Design

No visual mockups were provided. Design reference is Squarespace, Read.cv, Awwwards (clean editorial style).

Key visual rules for all new and modified Classic components:
- Background: white or theme `--portfolio-bg`; section root `py-6`
- Headings: `text-2xl font-bold text-gray-900` (or `text-[var(--portfolio-text)]`) for `<h2>`, `font-semibold text-gray-900` for `<h3>`
- Body text: `text-sm text-gray-600` for descriptions and secondary content
- Cards: `rounded-lg border border-gray-100 bg-gray-50 shadow-sm p-4` — subtle lift, no dramatic shadows
- Accent color: `text-blue-600` / `bg-blue-600` for interactive elements, category pills, and links — these should use `var(--portfolio-accent)` where practical so theme presets take effect
- No terminal windows, no `font-mono` chrome headers, no macOS dots, no dark-on-dark elements in Classic components
- Images: `rounded-lg object-cover` with fixed heights for gallery cells (`h-48`), small circles for avatars (`h-8 w-8 rounded-full`)

## Existing Code to Leverage

**`features/portfolio/components/classic/ClassicProjects.tsx` — card grid pattern**
- Reference for the 2-column responsive grid (`grid gap-4 md:grid-cols-2`) used for Services and Testimonials cards
- Reference for `data-testid` placement on the grid container and individual cards
- Reference for section root structure: `<section className={cn('py-6', className)}>` → `<h2>` → empty state OR grid

**`features/portfolio/components/classic/ClassicHero.tsx` — existing hero to rewrite**
- The `getInitials(name)` helper function must be preserved and reused — extract it or copy it into ClassicTestimonials for the client avatar initials fallback
- The contact links pattern (Mail, Github, LinkedIn, custom links) is correct and must be kept verbatim, only its surrounding terminal chrome is removed
- `data-testid="avatar-initials"` on the initials fallback is relied upon by `portfolio-classic.test.tsx` test line 187 — must not be removed

**`features/portfolio/__tests__/portfolio-classic.test.tsx` — test file pattern**
- Copy the `vi.mock('next-intl', ...)` pattern with the translations map exactly
- Copy the `mockUser` object shape; extend `PortfolioData` mock with `services: []`, `testimonials: []`, `gallery: []`, `settings: null`
- Use dynamic `import()` inside each `it()` block to lazy-load the component under test (avoids circular issues)

**`features/portfolio-settings/constants/themes.ts` — THEME_PRESETS**
- Import path for PortfolioLayout: `@/features/portfolio-settings/constants/themes`
- `THEME_PRESETS` is a `Record<string, ThemePreset>` — always access with `?? THEME_PRESETS['default']` as a fallback in case an unknown theme ID is stored in `settings.theme`
- The five CSS variable names to set are exactly: `--portfolio-bg`, `--portfolio-text`, `--portfolio-accent`, `--portfolio-border`, `--portfolio-card-bg`

**`features/portfolio/types/portfolio.ts` — PortfolioSectionProps interface**
- All six section components (ClassicHero, ClassicSkills, ClassicGallery, ClassicServices, ClassicTestimonials, and the three existing untouched ones) must conform to `PortfolioSectionProps`: `{ data: PortfolioData; className?: string }`
- Import from `../../types/portfolio` (relative path from `features/portfolio/components/classic/`)

**`features/portfolio/components/classic/ClassicSkills.tsx` — tech header to remove**
- The only change is deleting the `<div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-1 border-b border-gray-100 pb-1">` block and its 4 `<span>` children (lines 30-35 in the current file)
- `ClassicAbout.tsx` has a similar terminal header (`drwxr-xr-x ... about.md`) — the requirements do NOT ask to remove it, so leave `ClassicAbout.tsx` untouched

## Out of Scope

- Dashboard CRUD UI for creating/editing Services, Testimonials, or Gallery items (Phase 2C)
- Image upload UI or Vercel Blob integration for gallery images, service images, or testimonial photos (Phase 2C)
- Mode switcher UI and onboarding flow for choosing Classic vs Tech Mode (Phase 2D)
- Removing the terminal header from `ClassicAbout.tsx` or `ClassicProjects.tsx` (not requested in this spec)
- Updating `ClassicContact.tsx`, `ClassicTimeline.tsx`, or `ClassicAI.tsx` in any way
- Adding i18n translation strings to locale JSON files (caller adds keys; new components use the key string as fallback if missing)
- PanelNavigation label updates for `gallery`, `services`, `testimonials` nav items (uses `labelKey` from `sections.ts` already defined in Phase 2A)
- Google Maps testimonial import
- Custom color picker or per-field accent color overrides (theme presets only)
- Tech Mode section components of any kind
- Adding `fontFamily` from the theme preset to the layout root `style` (font switching is a future enhancement)
- Writing tests for `ClassicHero` rewrite or `ClassicSkills` cleanup (existing test in `portfolio-classic.test.tsx` covers these and must keep passing)
