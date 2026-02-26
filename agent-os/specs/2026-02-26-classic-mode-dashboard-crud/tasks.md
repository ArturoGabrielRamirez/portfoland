# Task Breakdown: Phase 2C — Classic Mode Dashboard CRUD

## Overview

**Spec:** `agent-os/specs/2026-02-26-classic-mode-dashboard-crud/spec.md`
**Branch:** `feature/classic-mode-2c`
Total Task Groups: 5
Total Tasks: 5 parent tasks, 25 sub-tasks

All five task groups are independent of each other and can be executed in any order. No cross-dependencies exist between TG1–TG5. No tests are required — consistent with the existing pattern across all dashboard view components in this codebase.

---

## Task List

---

### TG1: Dashboard Nav — Classic Mode Links

#### Task Group 1: Extend DashboardNav with conditional Classic links
**Dependencies:** None
**Existing pattern to follow:** `navItems` array + `Link` loop (desktop) and hex SVG button loop (mobile) already in the file

- [x] 1.0 Add Classic Mode nav links to the dashboard nav
  - [x] 1.1 Modify `features/tech/components/dashboard-nav.tsx`
    - Add `Briefcase`, `MessageSquare`, `Images` to the existing lucide-react import line
    - Define a `classicNavItems` constant array (same shape as `navItems`, no `exact` field needed) after the `navItems` declaration:
      ```ts
      const classicNavItems = [
        { href: '/dashboard/services', label: 'Services', icon: Briefcase },
        { href: '/dashboard/testimonials', label: 'Testimonials', icon: MessageSquare },
        { href: '/dashboard/gallery', label: 'Gallery', icon: Images },
      ]
      ```
    - Do NOT change `DashboardNavProps` — `user.portfolioMode` is already present
  - [x] 1.2 Render Classic items in the desktop nav
    - Inside the existing `<nav className="flex items-center gap-1">` block, after the `{navItems.map(...)}` call, add a conditional block: `{user.portfolioMode === 'classic' && classicNavItems.map(...)}`
    - Use the exact same `<Link>` JSX, active state detection via `cleanPathname`, and active/inactive `cn()` class pattern that `navItems` already uses
    - Active state check: `cleanPathname === item.href || cleanPathname.startsWith(item.href + '/')`
  - [x] 1.3 Render Classic items in the mobile bottom toolbar
    - The mobile toolbar currently renders `{navItems.slice(1).map(...)}` — this gives 3 items (Timeline, Skills, Projects) plus the logo and UserMenu
    - Replace the single `navItems.slice(1).map(...)` with a conditional: when `user.portfolioMode === 'classic'` map over `classicNavItems`; otherwise map over `navItems.slice(1)` (Timeline, Skills, Projects)
    - This keeps the mobile bar at exactly 3 icon buttons at all times — no overflow possible
    - Use the identical hex SVG button JSX (svg path, fill/stroke, active dot, Icon overlay, label span) that is already used in the mobile loop

**Acceptance Criteria:**
- Classic Mode users see Services, Testimonials, Gallery links in the desktop nav after the existing nav items
- Tech Mode users see no change — Timeline, Skills, Projects remain
- Mobile bar shows exactly 3 hex buttons: Classic items when `portfolioMode === 'classic'`, tech items otherwise
- Active state highlight works correctly for all new links using `cleanPathname`

---

### TG2: Dashboard Services Page

#### Task Group 2: Services CRUD page — server page + client view
**Dependencies:** None
**Existing pattern to follow:** `app/[locale]/(dashboard)/dashboard/projects/page.tsx` + `DashboardProjectsView.tsx`
**Actions already exist:** `createServiceAction`, `updateServiceAction`, `deleteServiceAction` in `features/services/actions/serviceActions.ts`
**Data function:** `getServicesByUserIdData` from `features/services/data/index.ts`
**Types:** `ServiceModel`, `PriceType` from `features/services/types/service.ts`

- [ ] 2.0 Build the Dashboard Services page
  - [ ] 2.1 Create `app/[locale]/(dashboard)/dashboard/services/page.tsx`
    - Mirror the exact structure of `app/[locale]/(dashboard)/dashboard/projects/page.tsx`
    - Auth guard: `auth.api.getSession({ headers: await headers() })` — redirect to `/login` if no session
    - Fetch user row: `prisma.user.findUnique` selecting `id, name, email, username, image, portfolioMode`
    - Fetch data: `const services = await getServicesByUserIdData(session.user.id)`
    - Import `getServicesByUserIdData` from `@/features/services/data`
    - Render: `<DashboardServicesView services={services} user={{ id, name, email, username, image, portfolioMode }} />`
    - Export metadata: `export const metadata = { title: 'My Services | Portfoland' }`
  - [ ] 2.2 Create `app/[locale]/(dashboard)/dashboard/services/DashboardServicesView.tsx`
    - Mark as `'use client'` at the top
    - Props interface: `{ services: ServiceModel[]; user: { id, name, email, username: string | null, image: string | null, portfolioMode: PortfolioMode } }`
    - Import `ServiceModel`, `PriceType` from `@/features/services/types/service`
    - Import `createServiceAction`, `updateServiceAction`, `deleteServiceAction` from `@/features/services/actions/serviceActions`
    - State: `const [showForm, setShowForm] = useState(false)` and `const [editingService, setEditingService] = useState<ServiceModel | undefined>()`
    - State: `const [isPending, startTransition] = useTransition()`
    - State: controlled form fields (title, description, priceType, priceMin, priceMax, currency, durationMinutes, published)
    - Page shell: `<div className="min-h-screen bg-[#0A0E1A] font-mono">`
    - Render `<DashboardNav locale={locale} user={user} />` at the top (import from `@/features/tech`)
    - Page header: `<div className="px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]">` containing `<h1 className="text-2xl font-mono font-bold text-foreground">Services</h1>` and an "Add Service" button
    - Main content area: `<div className="max-w-5xl mx-auto px-4 py-8">`
  - [ ] 2.3 Implement the inline add/edit form
    - When `showForm` is true, render the form above the list inside `<div className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-6 mb-6">`
    - Form title: `{editingService ? 'Edit Service' : 'New Service'}` rendered as `<h2 className="text-sm font-mono font-bold text-foreground uppercase tracking-widest mb-4">`
    - Form fields with established input styles (`w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none transition-all`):
      - `title` — text input, required
      - `description` — textarea, required
      - `priceType` — `<select>` with options `FIXED`, `RANGE`, `STARTING_FROM`, `CONTACT`; same input styles applied to select element
      - `priceMin` — number input, hidden when `priceType === 'CONTACT'`
      - `priceMax` — number input, shown only when `priceType === 'RANGE'`
      - `currency` — text input, default `"USD"`, hidden when `priceType === 'CONTACT'`
      - `durationMinutes` — number input, optional
      - `published` — checkbox or toggle
    - Save button calls `createServiceAction(...)` or `updateServiceAction({ id: editingService.id, ... })` inside `startTransition(async () => { ... })`; on `result.hasError` show `toast.error(result.message)`, otherwise `toast.success(result.message)` and close form
    - Cancel button calls `setShowForm(false); setEditingService(undefined)`
    - "Add Service" button in the page header: sets `setEditingService(undefined); setShowForm(true)`
    - Use `bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)]` for the primary save/add button style
  - [ ] 2.4 Implement the service cards list
    - Each card: `<div className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-4 hover:border-[hsl(174,100%,50%,0.3)] transition-all">`
    - Show: `title` (bold font-mono), price display (see price rules below), `durationMinutes` badge if present, published badge
    - Price display logic:
      - `FIXED`: `${currency} ${priceMin}`
      - `RANGE`: `${currency} ${priceMin} – ${priceMax}`
      - `STARTING_FROM`: `From ${currency} ${priceMin}`
      - `CONTACT`: `"Contact for pricing"`
    - Published badge live: `<span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase">Live</span>`
    - Published badge draft: same pattern with `text-[#64748B] bg-[#64748B]/10` and label `"Draft"`
    - Edit button: `<button className="p-2 text-muted-foreground hover:text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)] rounded-sm">` — calls `setEditingService(service); setShowForm(true)`
    - Delete button: `<button className="p-2 text-muted-foreground hover:text-[hsl(0,100%,60%)] hover:bg-[hsl(0,100%,60%,0.1)] rounded-sm">` — calls `window.confirm(...)` then `deleteServiceAction({ id: service.id })` inside `startTransition`; show `toast.success` or `toast.error` based on `result.hasError`
    - Empty state: centered placeholder with icon and "No services yet" message + "Add First Service" button

**Acceptance Criteria:**
- Page loads with auth guard — unauthenticated users redirect to `/login`
- All services render as cards with correct price display per priceType
- "Add Service" opens inline form; "Edit" populates form with service data
- Save calls correct action (create vs update) and shows appropriate toast
- Delete requires confirmation and shows toast on result
- Form fields show/hide correctly based on `priceType` value
- Visual styles match established dashboard dark theme exactly

---

### TG3: Dashboard Testimonials Page

#### Task Group 3: Testimonials CRUD page — server page + client view
**Dependencies:** None
**Existing pattern to follow:** Same pattern as TG2 / projects
**Actions already exist:** `createTestimonialAction`, `updateTestimonialAction`, `deleteTestimonialAction` in `features/testimonials/actions/testimonialActions.ts`
**Data function:** `getTestimonialsByUserIdData` from `features/testimonials/data/index.ts`
**Types:** `TestimonialModel` from `features/testimonials/types/testimonial.ts`

- [ ] 3.0 Build the Dashboard Testimonials page
  - [ ] 3.1 Create `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx`
    - Mirror exact structure of `app/[locale]/(dashboard)/dashboard/projects/page.tsx`
    - Auth guard + `prisma.user.findUnique` (same fields: `id, name, email, username, image, portfolioMode`)
    - Fetch data: `const testimonials = await getTestimonialsByUserIdData(session.user.id)`
    - Import `getTestimonialsByUserIdData` from `@/features/testimonials/data`
    - Render: `<DashboardTestimonialsView testimonials={testimonials} user={...} />`
    - Export metadata: `export const metadata = { title: 'My Testimonials | Portfoland' }`
  - [ ] 3.2 Create `app/[locale]/(dashboard)/dashboard/testimonials/DashboardTestimonialsView.tsx`
    - Mark as `'use client'`
    - Props interface: `{ testimonials: TestimonialModel[]; user: { id, name, email, username: string | null, image: string | null, portfolioMode: PortfolioMode } }`
    - Import `TestimonialModel` from `@/features/testimonials/types/testimonial`
    - Import `createTestimonialAction`, `updateTestimonialAction`, `deleteTestimonialAction` from `@/features/testimonials/actions/testimonialActions`
    - State: `showForm`, `editingTestimonial: TestimonialModel | undefined`, `isPending` / `startTransition`
    - State: controlled form fields (`clientName`, `clientTitle`, `content`, `rating`, `published`)
    - Page shell, `DashboardNav`, page header with "Add Testimonial" button, main content area — same structure as TG2
  - [ ] 3.3 Implement the inline add/edit form
    - Same form container and styling as TG2
    - Form title: `{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}`
    - Form fields:
      - `clientName` — text input, required
      - `clientTitle` — text input, optional
      - `content` — textarea, required
      - `rating` — either a number input (min 1, max 5) or 5 clickable star buttons that set a `rating` number state; stars approach: render 5 `<button type="button">` elements, filled star character `★` when index <= rating, empty `☆` otherwise; clicking sets `setRating(index)`
      - `published` — checkbox or toggle
    - Save: `createTestimonialAction({ clientName, clientTitle, content, rating, published })` or `updateTestimonialAction({ id: editingTestimonial.id, ... })` inside `startTransition`; same toast pattern as TG2
    - Cancel button resets form state
  - [ ] 3.4 Implement the testimonial cards list
    - Each card: same `bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)]` card style
    - Show: `clientName` (bold), `clientTitle` (muted text, only if present), star rating display (5 characters: `★` filled, `☆` empty, based on `rating` 1–5), `content` preview with `line-clamp-2` (`overflow-hidden` + `display: -webkit-box` + `-webkit-line-clamp: 2` + `-webkit-box-orient: vertical`), published badge, Edit/Delete buttons
    - Edit and Delete buttons follow exact same pattern and class strings as TG2
    - Empty state: "No testimonials yet" message + "Add First Testimonial" button

**Acceptance Criteria:**
- Page loads with auth guard
- All testimonials render with correct star display based on `rating` value (1–5)
- Content preview is clamped to 2 lines
- "Add Testimonial" and "Edit" open the inline form correctly
- Save calls correct action and shows toast; delete requires confirmation
- Visual styles match established dashboard dark theme

---

### TG4: Dashboard Gallery Page

#### Task Group 4: Gallery CRUD page — server page + client view
**Dependencies:** None
**Existing pattern to follow:** Same pattern as TG2 / projects
**Actions already exist:** `createGalleryItemAction`, `updateGalleryItemAction`, `deleteGalleryItemAction` in `features/gallery/actions/galleryItemActions.ts`
**Data function:** `getGalleryItemsByUserIdData` from `features/gallery/data/index.ts`
**Types:** `GalleryItemModel` from `features/gallery/types/galleryItem.ts`

- [ ] 4.0 Build the Dashboard Gallery page
  - [ ] 4.1 Create `app/[locale]/(dashboard)/dashboard/gallery/page.tsx`
    - Mirror exact structure of `app/[locale]/(dashboard)/dashboard/projects/page.tsx`
    - Auth guard + `prisma.user.findUnique` (same fields: `id, name, email, username, image, portfolioMode`)
    - Fetch data: `const items = await getGalleryItemsByUserIdData(session.user.id)`
    - Import `getGalleryItemsByUserIdData` from `@/features/gallery/data`
    - Render: `<DashboardGalleryView items={items} user={...} />`
    - Export metadata: `export const metadata = { title: 'My Gallery | Portfoland' }`
  - [ ] 4.2 Create `app/[locale]/(dashboard)/dashboard/gallery/DashboardGalleryView.tsx`
    - Mark as `'use client'`
    - Props interface: `{ items: GalleryItemModel[]; user: { id, name, email, username: string | null, image: string | null, portfolioMode: PortfolioMode } }`
    - Import `GalleryItemModel` from `@/features/gallery/types/galleryItem`
    - Import `createGalleryItemAction`, `updateGalleryItemAction`, `deleteGalleryItemAction` from `@/features/gallery/actions/galleryItemActions`
    - State: `showForm`, `editingItem: GalleryItemModel | undefined`, `isPending` / `startTransition`
    - State: controlled form fields (`imageUrl`, `caption`, `altText`, `category`, `order`, `published`)
    - Page shell, `DashboardNav`, page header with "Add Image" button, main content area — same structure as TG2
  - [ ] 4.3 Implement the inline add/edit form
    - Same form container and styling as TG2/TG3
    - Form title: `{editingItem ? 'Edit Image' : 'New Image'}`
    - Form fields:
      - `imageUrl` — text/URL input, required; note: plain URL string only, no file upload for MVP
      - `caption` — text input, optional
      - `altText` — text input, optional (accessibility label)
      - `category` — text input, optional
      - `order` — number input, optional
      - `published` — checkbox or toggle
    - Save: `createGalleryItemAction({ imageUrl, caption, altText, category, order, published })` or `updateGalleryItemAction({ id: editingItem.id, ... })` inside `startTransition`; same toast pattern
    - Cancel button resets form state
  - [ ] 4.4 Implement the gallery cards list
    - Each card: same `bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)]` card style
    - Show: small image preview `<img src={item.imageUrl} className="h-20 w-28 object-cover rounded-sm" alt={item.altText ?? ''} />`, caption (if present, muted text), category badge if present (`text-[10px] font-mono px-2 py-0.5 border border-[hsl(174,100%,50%,0.2)] rounded-sm`), published badge, Edit/Delete buttons
    - Edit and Delete buttons follow exact same pattern and class strings as TG2/TG3
    - Empty state: centered placeholder with an icon and "No gallery items yet" message + "Add First Image" button (this is the only page where an empty-state "Add First Image" button should appear — the other pages may also render one but the gallery spec calls it out explicitly)

**Acceptance Criteria:**
- Page loads with auth guard
- Gallery items render as cards with image preview, caption, category badge, and published badge
- Empty state renders correctly when no items exist
- "Add Image" and "Edit" open inline form; `imageUrl` field is a plain text/URL input (no file picker)
- Save calls correct action and shows toast; delete requires confirmation
- Visual styles match established dashboard dark theme

---

### TG5: Classic Mode Settings in DashboardPortfolioView

#### Task Group 5: Extend Portfolio page with theme picker and Classic section visibility
**Dependencies:** None
**Files to modify:**
- `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`

**Already exists and must NOT be changed:** `THEME_PRESETS` in `features/portfolio-settings/constants/themes.ts`, `updatePortfolioSettingsAction` in `features/portfolio-settings/actions/portfolioSettingsActions.ts`, `getPortfolioSettingsData` in `features/portfolio-settings/data/getPortfolioSettings.data.ts`, `PortfolioSettingsModel` in `features/portfolio-settings/types/portfolioSettings.ts`

- [ ] 5.0 Add Classic Mode theme picker and section visibility toggles
  - [ ] 5.1 Modify `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`
    - Add import: `import { getPortfolioSettingsData } from '@/features/portfolio-settings/data'`
    - After the existing `prisma.user.findUnique(...)` call, fetch: `const portfolioSettings = await getPortfolioSettingsData(session.user.id)`
    - Add `portfolioSettings` to the `select` in the existing `prisma.user.findUnique` call if needed, OR keep as a separate call — the `getPortfolioSettingsData` function already handles the lookup by userId, so a separate call is correct
    - Pass `portfolioSettings` as a new prop to `<DashboardPortfolioView portfolioSettings={portfolioSettings} ...existingProps />`
    - The existing user fields passed (`id, name, email, username, image, bio, portfolioMode`) do NOT change — only `portfolioSettings` is added
    - Note: `page.tsx` currently fetches `sectionOrder`, `contactLinks`, `sectionVisibility` inside `prisma.user.findUnique` — add those to the select if not already present (read the existing select to verify); these are needed for the `DashboardPortfolioView` props
  - [ ] 5.2 Extend `DashboardPortfolioView.tsx` props interface
    - Add import: `import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes'`
    - Add import: `import { updatePortfolioSettingsAction } from '@/features/portfolio-settings/actions/portfolioSettingsActions'`
    - Add import: `import type { PortfolioSettingsModel } from '@/features/portfolio-settings/types/portfolioSettings'`
    - Extend `DashboardPortfolioViewProps` interface: add `portfolioSettings: PortfolioSettingsModel | null`
    - Add state: `const [currentTheme, setCurrentTheme] = useState(portfolioSettings?.theme ?? 'default')`
    - Extend the `sectionVisibility` default value to include Classic sections:
      ```ts
      user.sectionVisibility || {
        about: true,
        experience: true,
        skills: true,
        projects: true,
        gallery: true,
        services: true,
        testimonials: true,
      }
      ```
  - [ ] 5.3 Add the "Classic Mode Theme" HUDPanel
    - Place this new HUDPanel immediately after the existing "Preferences" HUDPanel (which contains `<PortfolioModeToggle>`)
    - Wrap entirely in `{user.portfolioMode === 'classic' && (...)}`
    - HUDPanel props: `title="Classic Mode Theme"`, `icon={<Layers className="w-4 h-4" />}` (Layers is already imported)
    - Inside the panel: `<div className="grid grid-cols-2 md:grid-cols-4 gap-3">`
    - Map over `Object.values(THEME_PRESETS)` to render one card per preset
    - Each card JSX:
      ```tsx
      <button
        key={preset.id}
        type="button"
        onClick={() => handleThemeSelect(preset.id)}
        className={cn(
          "flex flex-col gap-2 p-3 border rounded-sm text-left transition-all",
          currentTheme === preset.id
            ? "border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]"
            : "border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]"
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.backgroundColor }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accentColor }} />
          {currentTheme === preset.id && (
            <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase ml-auto">Active</span>
          )}
        </div>
        <span className="text-xs font-mono text-gray-200">{preset.name}</span>
      </button>
      ```
    - Implement `handleThemeSelect`: call `updatePortfolioSettingsAction({ theme: presetId })` inside `startTransition(async () => { ... })`; on success: `setCurrentTheme(presetId); toast.success("Theme updated")`; on error: `toast.error(result.message)`
    - Note: this uses `startTransition` which is already declared for the main form submit — use the same `[isPending, startTransition]` pair; theme selection and form save share the same pending state, which is acceptable
  - [ ] 5.4 Add Classic section visibility toggles to the section order area
    - The existing section order loop renders HUDPanels for `about`, `experience`, `skills`, `projects`
    - After the closing `})}` of the `sectionOrder.map(...)` block (and before the Social Links HUDPanel), add a conditional block: `{user.portfolioMode === 'classic' && (...)}`
    - Inside the conditional, render a single `HUDPanel` with `title="Classic Sections"` and `icon={<Layers className="w-4 h-4" />}` (or use a relevant icon like `Images`)
    - Inside this panel, render 3 toggle rows, one each for `gallery`, `services`, `testimonials`:
      - Each row: `<div className="flex items-center justify-between py-2 border-b border-[hsl(174,100%,50%,0.08)] last:border-0">`
      - Left: section label text (`"Images / Gallery"`, `"Services"`, `"Testimonials"`)
      - Right: a toggle button that calls `toggleVisibility('gallery')` etc.; indicate state visually — when visible: `text-[hsl(150,100%,45%)]` "Visible", when hidden: `text-[#64748B]` "Hidden"
    - These are saved as part of the existing `handleSubmit` form submit because `sectionVisibility` is already included in the `updateProfile(...)` call payload — no separate save action needed

**Acceptance Criteria:**
- `portfolio/page.tsx` fetches `portfolioSettings` and passes it to the view
- "Classic Mode Theme" HUDPanel is invisible when `portfolioMode === 'tech'` and visible when `portfolioMode === 'classic'`
- Clicking a theme preset card calls `updatePortfolioSettingsAction({ theme: presetId })`, updates `currentTheme` state, and shows `toast.success("Theme updated")`
- "Active" badge renders only on the currently selected preset card
- Gallery, Services, Testimonials visibility toggles appear only when `portfolioMode === 'classic'` and are saved as part of the existing profile form submit (no extra save button)
- Existing portfolio page behavior (profile edit, social links, section order, preferences) is completely unchanged

---

## Execution Order

All five task groups are independent and can be executed in any order. Recommended sequence for incremental testability:

1. **TG1** — Nav update (smallest change, validates routing before pages exist)
2. **TG2** — Services CRUD (establishes the pattern for TG3 and TG4)
3. **TG3** — Testimonials CRUD (follow TG2 pattern)
4. **TG4** — Gallery CRUD (follow TG2 pattern)
5. **TG5** — Portfolio page Classic settings (most complex modification to existing file)

## Key Implementation Notes (applies to all TGs)

- **No tests required** — consistent with `DashboardPortfolioView`, `DashboardProjectsView`, and all other dashboard view components having zero test files
- **No new packages** — all dependencies (lucide-react, sonner, cn, useTransition) are already installed
- **Dashboard always dark** — `bg-[#0A0E1A]` and `font-mono` apply to all dashboard pages regardless of `portfolioMode`; only the public portfolio changes appearance based on the theme
- **useTransition pattern** — always wrap server action calls in `startTransition(async () => { const result = await someAction(...); if (result.hasError) { toast.error(result.message) } else { toast.success(result.message) } })`
- **i18n** — use inline English strings for all new dashboard labels, consistent with how existing dashboard labels are handled
- **Import paths for actions:** `@/features/services/actions/serviceActions`, `@/features/testimonials/actions/testimonialActions`, `@/features/gallery/actions/galleryItemActions`, `@/features/portfolio-settings/actions/portfolioSettingsActions`
- **Import paths for data:** `@/features/services/data`, `@/features/testimonials/data`, `@/features/gallery/data`, `@/features/portfolio-settings/data`
- **Import paths for types:** `@/features/services/types/service`, `@/features/testimonials/types/testimonial`, `@/features/gallery/types/galleryItem`, `@/features/portfolio-settings/types/portfolioSettings`
- **HUDPanel** is imported from `@/features/dashboard/components/HUDPanel` — already used in `DashboardPortfolioView`
- **DashboardNav** is imported from `@/features/tech` — already used in `DashboardPortfolioView` and `DashboardProjectsView`
