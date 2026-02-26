# Tasks: Classic Mode Public Template (Phase 2B)

## Overview

Total Task Groups: 4
Total Tasks: 12
Dependencies resolved: TG1 has no dependencies. TG2 has no dependencies. TG3 depends on TG2. TG4 depends on TG2.

## Execution Order

1. TG1 — Component Fixes (independent, fastest wins)
2. TG2 — New Section Components (independent of TG1, can begin in parallel)
3. TG3 — PortfolioLayout Integration (depends on TG2 files existing)
4. TG4 — Tests (depends on TG2 components being implemented)

---

## TG1: Component Fixes

**Dependencies:** None
**Scope:** Modify two existing Classic Mode components to remove terminal/tech-flavored UI chrome. No new files. No new packages.

### TG1-1: Rewrite ClassicHero to remove terminal/code styling

**File:** `features/portfolio/components/classic/ClassicHero.tsx`

- [x] Delete the `const ROLE` badge div (lines 39-48 in the current file): the `font-mono` block that renders `const ROLE = 'Fullstack Developer'` with orange code syntax styling
- [x] Delete the entire `terminal-window` bio block (lines 51-66): the div with `terminal-header`, macOS dots (red/yellow/green), `bg-[#0D1117]` dark background, `➜` arrow, and `font-mono text-slate-300` text
- [x] Replace the deleted bio block with a plain `<p>` tag: `className="text-sm leading-relaxed text-gray-600 line-clamp-3 max-w-xl text-center"` — render `user.bio` directly inside it; wrap in `{user.bio && (...)}` conditional as before
- [x] The `<header>` root element, `className`, avatar block, and contact links row (`<div className="flex flex-wrap items-center justify-center gap-4">`) are kept verbatim — do NOT modify them
- [x] Keep `getInitials()` helper function at the top of the file unchanged
- [x] Keep `data-testid="avatar-initials"` on the initials fallback div — this is required by the existing test at `portfolio-classic.test.tsx` line 187
- [x] Keep all imports (`useTranslations`, `Mail`, `Github`, `Linkedin`, `Link`, `cn`, `PortfolioSectionProps`) — no new imports needed
- [x] Remove any leftover CSS class references to `terminal-window`, `terminal-header`, `terminal-dot`, `terminal-content`

**Acceptance Criteria:**
- `features/portfolio/__tests__/portfolio-classic.test.tsx` test `"ClassicHero renders user name in h1 and avatar with initials fallback"` still passes (name in `<h1>`, `data-testid="avatar-initials"` present with text `"JD"`)
- The rendered hero contains no `font-mono` elements, no macOS dots, no dark terminal background, no code-syntax spans
- Bio is displayed as a plain `<p>` with `line-clamp-3`

---

### TG1-2: Remove tech-flavored CPU/MEM header from ClassicSkills

**File:** `features/portfolio/components/classic/ClassicSkills.tsx`

- [x] Delete exactly the `<div>` on lines 30-35 that contains the four `<span>` children: `CPU: 12.4%`, `MEM: 2.1GB/16GB`, `UPTIME: 365d`, `skills.bin` — this is the only change to this file
- [x] The `className` on this div is `flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-1 border-b border-gray-100 pb-1` — delete the entire div including all children
- [x] Everything below that div (`<h2>`, empty state `<p>`, `skills-grid`, category dots, progress bars) remains identical
- [x] Do NOT touch `ClassicAbout.tsx` or `ClassicProjects.tsx` — those components have similar terminal headers but removing them is explicitly out of scope for this spec

**Acceptance Criteria:**
- All existing tests in `features/portfolio/__tests__/portfolio-classic.test.tsx` continue to pass without modification (including the `"ClassicSkills renders skills grouped by category with progress bars"` test)
- The rendered skills section contains no `font-mono` header, no CPU/MEM text, no `skills.bin` span

---

## TG2: New Classic Mode Section Components

**Dependencies:** None (Phase 2A data layer already exists: `GalleryItemModel`, `ServiceModel`, `TestimonialModel`, `PortfolioSectionProps` are all defined)
**Scope:** Create three new files. Follow the `ClassicProjects.tsx` card-grid pattern for structure. All components are `'use client'` because they use `useTranslations` (a hook) and `useState` (for the gallery filter).

**Reference pattern from `ClassicProjects.tsx`:**
- Section root: `<section className={cn('py-6', className)}>`
- Heading: `<h2 className="mb-6 text-2xl font-bold text-gray-900">{t(...)}</h2>`
- Empty state: `<p className="text-gray-400" data-testid="...">` before the grid
- Grid: `<div className="grid gap-4 md:grid-cols-2" data-testid="...">`
- Card: element with `data-testid="...card"`, `rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm`
- Note: `ClassicProjects` uses shadcn `<Card>` — the new components use plain `<div>` cards per the spec, which is acceptable for simpler layouts

---

### TG2-1: Create ClassicGallery component

**File:** `features/portfolio/components/classic/ClassicGallery.tsx` (new file)

- [x] Add `'use client'` directive at the top
- [x] Imports: `useState` from `'react'`, `useTranslations` from `'next-intl'`, `cn` from `'@/lib/utils'`, `PortfolioSectionProps` from `'../../types/portfolio'`, `GalleryItemModel` from `'@/features/gallery/types/galleryItem'`
- [x] Export named function `ClassicGallery({ data, className }: PortfolioSectionProps)`
- [x] Derive items: `const items = (data.gallery ?? []).filter(item => item.published)` — defensive published filter even though data layer filters already
- [x] Category filter state: `const [activeCategory, setActiveCategory] = useState<string | null>(null)` — `null` means "All"
- [x] Derive categories: extract distinct non-null `item.category` values from `items` using a `Set`; only render the filter bar if `categories.length > 0`
- [x] Filter bar (render only when categories exist): a `<div>` of pill `<button>` elements — "All" button + one per distinct category; active pill class `bg-blue-600 text-white rounded-full px-3 py-1 text-sm`, inactive class `bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm hover:bg-gray-200`; clicking a category sets `activeCategory` to that string, clicking "All" sets it to `null`
- [x] Filtered items: `const filteredItems = activeCategory ? items.filter(i => i.category === activeCategory) : items`
- [x] Section root: `<section className={cn('py-6', className)}>`
- [x] Heading: `<h2 className="mb-6 text-2xl font-bold text-gray-900">{t('sections.gallery.classic.title')}</h2>`
- [x] Empty state (when `filteredItems.length === 0`): `<p className="text-gray-400" data-testid="gallery-empty-state">{t('sections.gallery.classic.emptyState')}</p>`
- [x] Grid (when items exist): `<div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="gallery-grid">`
- [x] Each grid cell: a `<div>` wrapping `<img src={item.imageUrl} alt={item.altText ?? item.caption ?? ''} className="w-full h-48 object-cover rounded-lg" />` — if `item.caption` is set, render `<p className="mt-1 text-xs text-gray-500 text-center">{item.caption}</p>` below the image
- [x] Use `item.id` as the React `key` on each cell div

**Acceptance Criteria:**
- Component renders `data-testid="gallery-grid"` when items exist and `data-testid="gallery-empty-state"` when empty
- Category filter pills render only when items have non-null categories; clicking filters the displayed items
- No terminal styling, no `font-mono` elements, no dark backgrounds
- File follows `'use client'` + `useTranslations` + `cn` pattern identical to existing Classic components

---

### TG2-2: Create ClassicServices component

**File:** `features/portfolio/components/classic/ClassicServices.tsx` (new file)

- [x] Add `'use client'` directive at the top
- [x] Imports: `useTranslations` from `'next-intl'`, `cn` from `'@/lib/utils'`, `PortfolioSectionProps` from `'../../types/portfolio'`, `ServiceModel` from `'@/features/services/types/service'`
- [x] Export named function `ClassicServices({ data, className }: PortfolioSectionProps)`
- [x] Derive services: `const services = (data.services ?? []).filter(s => s.published)` — defensive filter
- [x] Implement `formatPrice(service: ServiceModel): string` helper inside the file (not exported):
  - `priceType === 'CONTACT'`: return `t('sections.services.classic.priceContact')`
  - `priceType === 'FIXED'`: return `$${service.priceMin} ${service.currency}` — e.g. `$50 USD`
  - `priceType === 'RANGE'`: return `$${service.priceMin} – $${service.priceMax} ${service.currency}`
  - `priceType === 'STARTING_FROM'`: return `From $${service.priceMin} ${service.currency}`
  - fallback: return empty string `''`
- [x] Implement `formatDuration(minutes: number): string` helper inside the file (not exported):
  - `minutes < 60`: return `${minutes} min`
  - `minutes >= 60`: return `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}min` : ''}`
- [x] Section root: `<section className={cn('py-6', className)}>`
- [x] Heading: `<h2 className="mb-6 text-2xl font-bold text-gray-900">{t('sections.services.classic.title')}</h2>`
- [x] Empty state (when `services.length === 0`): `<p className="text-gray-400" data-testid="services-empty-state">{t('sections.services.classic.emptyState')}</p>`
- [x] Grid (when services exist): `<div className="grid gap-4 md:grid-cols-2">`
- [x] Each service card: `<div key={service.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm" data-testid="service-card">`
  - `<h3 className="font-semibold text-gray-900">{service.title}</h3>`
  - `{service.description && <p className="mt-1 text-sm text-gray-600">{service.description}</p>}`
  - Price line: `<p className="mt-2 text-sm font-medium text-gray-800">{formatPrice(service)}</p>` — only render if `formatPrice(service)` is non-empty
  - Duration line: `{service.durationMinutes && <p className="text-xs text-gray-500">{formatDuration(service.durationMinutes)}</p>}`

**Acceptance Criteria:**
- Component renders `data-testid="service-card"` for each published service and `data-testid="services-empty-state"` when empty
- `formatPrice` produces the correct string for all four `priceType` variants (`CONTACT`, `FIXED`, `RANGE`, `STARTING_FROM`)
- `formatDuration` formats `30` as `"30 min"` and `90` as `"1h 30min"` and `60` as `"1h"`
- No terminal styling anywhere in the component

---

### TG2-3: Create ClassicTestimonials component

**File:** `features/portfolio/components/classic/ClassicTestimonials.tsx` (new file)

- [x] Add `'use client'` directive at the top
- [x] Imports: `useTranslations` from `'next-intl'`, `cn` from `'@/lib/utils'`, `PortfolioSectionProps` from `'../../types/portfolio'`, `TestimonialModel` from `'@/features/testimonials/types/testimonial'`
- [x] Export named function `ClassicTestimonials({ data, className }: PortfolioSectionProps)`
- [x] Derive testimonials: `const testimonials = (data.testimonials ?? []).filter(t => t.published)` — defensive filter (note: avoid naming this `t` since `t` is used for translations; use `item` or `testimonial` as loop variable)
- [x] Implement `getInitials(name: string): string` helper inside the file (same pattern as ClassicHero): split on whitespace, take first letter of first and last word uppercased; single-word name returns first letter uppercased
- [x] Section root: `<section className={cn('py-6', className)}>`
- [x] Heading: `<h2 className="mb-6 text-2xl font-bold text-gray-900">{t('sections.testimonials.classic.title')}</h2>`
- [x] Empty state (when `testimonials.length === 0`): `<p className="text-gray-400" data-testid="testimonials-empty-state">{t('sections.testimonials.classic.emptyState')}</p>`
- [x] Grid (when testimonials exist): `<div className="grid gap-4 md:grid-cols-2">`
- [x] Each testimonial card: `<div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm" data-testid="testimonial-card">`
  - Star rating row: `<div className="flex gap-0.5">` containing 5 `<span>` elements; for index `i` in `1..5`, use `className={i <= item.rating ? 'text-amber-400' : 'text-gray-200'}` and render `★` unicode character
  - Quote: `<blockquote className="mt-2 text-sm italic text-gray-600">"{item.content}"</blockquote>`
  - Client name: `<p className="mt-3 font-semibold text-gray-900">{item.clientName}</p>`
  - Client title (conditional): `{item.clientTitle && <p className="text-xs text-gray-500">{item.clientTitle}</p>}`
  - Client avatar row: `<div className="mt-3 flex items-center gap-2">` containing either `<img src={item.imageUrl} alt={item.clientName} className="h-8 w-8 rounded-full object-cover" />` (when `item.imageUrl` is set) or `<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{getInitials(item.clientName)}</div>` (initials fallback)

**Acceptance Criteria:**
- Component renders `data-testid="testimonial-card"` for each published testimonial and `data-testid="testimonials-empty-state"` when empty
- Star rating renders exactly 5 `★` spans with `text-amber-400` for filled and `text-gray-200` for unfilled stars (e.g., `rating: 4` → 4 amber + 1 gray)
- Client avatar shows image if `imageUrl` is set, else initials circle
- No terminal styling anywhere in the component

---

## TG3: PortfolioLayout Integration

**Dependencies:** TG2 (all three new component files must exist before this task)
**Scope:** Two changes to a single existing file. Both changes are in `PortfolioLayout.tsx` and are done together.

**File:** `features/portfolio/components/PortfolioLayout.tsx`

### TG3-1: Apply THEME_PRESETS CSS variables for Classic Mode

- [ ] Add import at the top of the Classic components import block: `import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';`
- [ ] Inside the component body, before the `return`, add: `const preset = THEME_PRESETS[data.settings?.theme ?? 'default'] ?? THEME_PRESETS['default'];`
- [ ] On the root `<div>` (currently at line 116, the one with `data-testid="portfolio-layout"`), add a `style` prop:
  ```tsx
  style={isClassic ? {
    '--portfolio-bg': preset.backgroundColor,
    '--portfolio-text': preset.textColor,
    '--portfolio-accent': preset.accentColor,
    '--portfolio-border': preset.borderColor,
    '--portfolio-card-bg': preset.cardBackground,
  } as React.CSSProperties : undefined}
  ```
- [ ] On that same root `<div>`, in the `cn(...)` className call, change `isClassic ? 'bg-white text-gray-900'` to `isClassic ? 'bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]'`
- [ ] The tech mode branch of the ternary (`'bg-[#0A0E1A] text-white overflow-hidden'`) is unchanged
- [ ] `data-testid="portfolio-layout"` is preserved on the root div

### TG3-2: Register ClassicGallery, ClassicServices, ClassicTestimonials in classicSections map

- [ ] Add three imports in the Classic mode components import block (lines 22-28), after the existing 7 imports:
  ```tsx
  import { ClassicGallery } from './classic/ClassicGallery';
  import { ClassicServices } from './classic/ClassicServices';
  import { ClassicTestimonials } from './classic/ClassicTestimonials';
  ```
- [ ] In the `classicSections` object (currently lines 43-51), add three new entries after `ai: ClassicAI,`:
  ```tsx
  gallery: ClassicGallery,
  services: ClassicServices,
  testimonials: ClassicTestimonials,
  ```
- [ ] After this change `classicSections` has 10 keys: `hero`, `about`, `timeline`, `skills`, `projects`, `contact`, `ai`, `gallery`, `services`, `testimonials`
- [ ] The `techSections` map and all other code in the file is unchanged

**Acceptance Criteria:**
- The app compiles without TypeScript errors after TG3-1 and TG3-2 are applied
- A Classic Mode portfolio with `data.settings.theme = 'warmCream'` (or any valid preset key) renders with the corresponding CSS variables injected on the root div
- Navigating to the `gallery`, `services`, or `testimonials` section on a Classic Mode portfolio renders the new components (not a blank panel)
- The existing boot screen, CRT overlay, PanelNavigation, and Tech Mode rendering are unaffected

---

## TG4: Tests

**Dependencies:** TG2 (all three new components must be implemented)
**Scope:** One new test file with exactly 6 test cases. Follow the pattern from `features/portfolio/__tests__/portfolio-classic.test.tsx` precisely.

### TG4-1: Write tests for ClassicGallery (grid render + empty state)

**File:** `features/portfolio/__tests__/portfolio-classic-new-sections.test.tsx` (new file — create when starting TG4)

- [ ] Set up the test file with the same boilerplate as `portfolio-classic.test.tsx`:
  - Imports: `describe`, `it`, `expect`, `vi` from `'vitest'`; `render`, `screen` from `'@testing-library/react'`; `'@testing-library/jest-dom'`
  - `vi.mock('next-intl', ...)` with a translations map that includes ALL new keys:
    - `'sections.gallery.classic.title'`: `'Gallery'`
    - `'sections.gallery.classic.emptyState'`: `'No gallery items yet'`
    - `'sections.services.classic.title'`: `'Services'`
    - `'sections.services.classic.emptyState'`: `'No services yet'`
    - `'sections.services.classic.priceContact'`: `'Contact us'`
    - `'sections.testimonials.classic.title'`: `'Testimonials'`
    - `'sections.testimonials.classic.emptyState'`: `'No testimonials yet'`
  - `vi.mock('next/image', ...)` returning a plain `<img>`
- [ ] Define `mockData` with `PortfolioData` type — include all required fields: `user` (same shape as `portfolio-classic.test.tsx` `mockUser`), `experiences: null`, `skills: null`, `projects: []`, `services: []`, `testimonials: []`, `gallery: []`, `settings: null`
- [ ] Test case 1 — `'ClassicGallery renders gallery grid with items'`:
  - Override `gallery` with 2 items: `[{ id: 'g1', imageUrl: '/img1.jpg', altText: 'First photo', caption: null, category: null, order: 0, published: true }, { id: 'g2', imageUrl: '/img2.jpg', altText: null, caption: 'Second photo', category: null, order: 1, published: true }]`
  - Dynamic import: `const { ClassicGallery } = await import('../components/classic/ClassicGallery')`
  - Render and assert: `screen.getByTestId('gallery-grid')` is in document; `screen.getByAltText('First photo')` is in document; `screen.getByText('Second photo')` is in document (the caption)
- [ ] Test case 2 — `'ClassicGallery shows empty state when no gallery items'`:
  - Use `mockData` with `gallery: []`
  - Dynamic import the same component
  - Assert: `screen.getByTestId('gallery-empty-state')` is in document

### TG4-2: Write tests for ClassicServices (price formatting variants + empty state)

- [ ] Test case 3 — `'ClassicServices renders service cards with all price types'`:
  - Override `services` with 4 items, one per `priceType`:
    - `{ id: 's1', title: 'Consultation', priceType: 'CONTACT', priceMin: null, priceMax: null, currency: 'USD', durationMinutes: 30, description: null, published: true, order: 0 }`
    - `{ id: 's2', title: 'Haircut', priceType: 'FIXED', priceMin: 50, priceMax: null, currency: 'USD', durationMinutes: 45, description: null, published: true, order: 1 }`
    - `{ id: 's3', title: 'Retouching', priceType: 'RANGE', priceMin: 100, priceMax: 200, currency: 'USD', durationMinutes: 90, description: null, published: true, order: 2 }`
    - `{ id: 's4', title: 'Design', priceType: 'STARTING_FROM', priceMin: 300, priceMax: null, currency: 'USD', durationMinutes: null, description: null, published: true, order: 3 }`
  - Dynamic import: `const { ClassicServices } = await import('../components/classic/ClassicServices')`
  - Assert: `screen.getAllByTestId('service-card')` has length 4; `screen.getByText('Contact us')` in document; `screen.getByText('$50 USD')` in document; `screen.getByText(/\$100.*\$200/)` or `screen.getByText('$100 – $200 USD')` in document; `screen.getByText(/From \$300/)` in document
- [ ] Test case 4 — `'ClassicServices shows empty state when no services'`:
  - Use `mockData` with `services: []`
  - Dynamic import the same component
  - Assert: `screen.getByTestId('services-empty-state')` is in document

### TG4-3: Write tests for ClassicTestimonials (star rating + empty state)

- [ ] Test case 5 — `'ClassicTestimonials renders testimonial cards with star rating and content'`:
  - Override `testimonials` with 1 item: `{ id: 't1', clientName: 'Jane Smith', clientTitle: 'CEO', content: 'Great work', rating: 4, imageUrl: null, published: true, order: 0 }`
  - Dynamic import: `const { ClassicTestimonials } = await import('../components/classic/ClassicTestimonials')`
  - Assert: `screen.getByTestId('testimonial-card')` is in document; `screen.getByText('Great work')` in document; `screen.getByText('Jane Smith')` in document; query for amber stars: `document.querySelectorAll('.text-amber-400')` has length 4 and `document.querySelectorAll('.text-gray-200')` has length 1
- [ ] Test case 6 — `'ClassicTestimonials shows empty state when no testimonials'`:
  - Use `mockData` with `testimonials: []`
  - Dynamic import the same component
  - Assert: `screen.getByTestId('testimonials-empty-state')` is in document
- [ ] Run only the new test file to verify all 6 tests pass: `npx vitest run features/portfolio/__tests__/portfolio-classic-new-sections.test.tsx`
- [ ] Run the existing test file to verify no regressions: `npx vitest run features/portfolio/__tests__/portfolio-classic.test.tsx`

**Acceptance Criteria:**
- All 6 new tests in `portfolio-classic-new-sections.test.tsx` pass
- All 5 existing tests in `portfolio-classic.test.tsx` continue to pass (ClassicHero, ClassicTimeline, ClassicSkills, ClassicProjects, ClassicAbout tests)
- No tests outside these two files are run as part of this task group
