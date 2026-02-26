# Phase 2C Requirements — Classic Mode Dashboard CRUD

**Date:** 2026-02-26
**Branch:** feature/classic-mode-2c
**Context:** Roadmap ROADMAP_V2.md Phase 2C

## What already exists (DO NOT redo)

**From Phase 2A (data layer):**
- `features/services/actions/serviceActions.ts` — `createServiceAction`, `updateServiceAction`, `deleteServiceAction`
- `features/testimonials/actions/testimonialActions.ts` — same pattern
- `features/gallery/actions/galleryItemActions.ts` — same pattern
- `features/portfolio-settings/actions/portfolioSettingsActions.ts` — `updatePortfolioSettingsAction`
- `features/portfolio-settings/constants/themes.ts` — `THEME_PRESETS` (4 presets: default, warm, dark-elegant, ocean)
- `features/services/data/index.ts` — `getServicesByUserIdData`
- `features/testimonials/data/index.ts` — `getTestimonialsByUserIdData`
- `features/gallery/data/index.ts` — `getGalleryItemsByUserIdData`
- `features/portfolio-settings/data/getPortfolioSettings.data.ts` — `getPortfolioSettingsData(userId)`

**From Phase 2B (public template):**
- Classic Mode public sections (ClassicGallery, ClassicServices, ClassicTestimonials)
- Theme applied via CSS variables in PortfolioLayout

**Existing dashboard structure:**
- `features/tech/components/dashboard-nav.tsx` — nav with: Dashboard, Timeline, Skills, Projects
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` — profile edit, section order, links, mode toggle
- `app/[locale]/(dashboard)/dashboard/projects/page.tsx` — reference: server page + `DashboardProjectsView.tsx` client pattern
- `features/dashboard/components/HUDPanel` — UI wrapper component used across dashboard

## What this spec must build

### R1: Dashboard Services page
**New files:**
- `app/[locale]/(dashboard)/dashboard/services/page.tsx` — server: auth + fetch `getServicesByUserIdData(userId)` → render `DashboardServicesView`
- `app/[locale]/(dashboard)/dashboard/services/DashboardServicesView.tsx` — client: list + create + edit + delete

**UI behavior:**
- List existing services as cards (title, price display, duration, published badge)
- "Add Service" button → inline form OR modal-like expanded state (not a new route)
- Each card has Edit and Delete buttons
- Edit: expand card into editable form (inline)
- Delete: confirm then call `deleteServiceAction({ id })`
- Form fields: title (text), description (textarea), priceType (select: FIXED/RANGE/STARTING_FROM/CONTACT), priceMin (number, shown when not CONTACT), priceMax (number, shown only for RANGE), currency (text, default "USD"), durationMinutes (number, optional), published (checkbox/toggle)
- On success: `toast.success(...)`, on error: `toast.error(...)`
- Use `useTransition` + server action pattern (same as rest of dashboard)
- Styled with dark Tech theme (`bg-[#0A0E1A]`, `HUDPanel`, `font-mono` inputs) — dashboard is always dark regardless of portfolio mode
- Skip imageUrl — not needed for MVP

### R2: Dashboard Testimonials page
**New files:**
- `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx`
- `app/[locale]/(dashboard)/dashboard/testimonials/DashboardTestimonialsView.tsx`

**UI behavior:**
- Same CRUD pattern as Services
- Form fields: clientName (text), clientTitle (text, optional), content (textarea), rating (1-5 star selector or number input), published (toggle)
- Skip imageUrl and source — not needed for MVP
- Display: client name, rating stars, content preview, published badge, edit/delete buttons

### R3: Dashboard Gallery page
**New files:**
- `app/[locale]/(dashboard)/dashboard/gallery/page.tsx`
- `app/[locale]/(dashboard)/dashboard/gallery/DashboardGalleryView.tsx`

**UI behavior:**
- Same CRUD pattern
- Form fields: imageUrl (text input — URL only, no file upload for MVP), caption (text, optional), altText (text, optional), category (text, optional), order (number), published (toggle)
- Display: image preview (small `<img>` tag), caption, category badge, published toggle
- Note: No Vercel Blob integration — imageUrl is a URL string input for MVP

### R4: Classic Mode Settings in DashboardPortfolioView
**Modified file:** `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`
**Modified file:** `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` (fetch portfolioSettings)

**What to add (only shown when `user.portfolioMode === 'classic'`):**

1. **Theme Preset Picker HUD Panel** — below the existing Preferences HUD:
   - Title: "Classic Mode Theme"
   - 4 clickable cards, one per preset (default, warm, dark-elegant, ocean)
   - Each card shows: preset name, color swatches (backgroundColor + accentColor dots), "Active" badge when selected
   - On click: call `updatePortfolioSettingsAction({ theme: presetId })` → toast
   - Current theme loaded from `portfolioSettings.theme` (passed as prop from server)

2. **Classic Sections Visibility** — add gallery/services/testimonials to the section visibility toggles that already exist in the profile form
   - Currently `sectionVisibility` handles: about, experience, skills, projects
   - Add: gallery, services, testimonials — shown only when `portfolioMode === 'classic'`
   - These use the same `toggleVisibility` function and are saved with the existing `updateProfile` action (sectionVisibility is already part of that payload)

### R5: DashboardNav — add Classic Mode nav links
**Modified file:** `features/tech/components/dashboard-nav.tsx`

Add 3 new nav items: Services, Testimonials, Gallery
- These link to `/dashboard/services`, `/dashboard/testimonials`, `/dashboard/gallery`
- **Shown conditionally**: only when `user.portfolioMode === 'classic'`
- `DashboardNav` already receives `user` with `portfolioMode` — use it
- Icons: `Briefcase` (Services), `MessageSquare` (Testimonials), `Images` (Gallery) from lucide-react
- The `DashboardNav` component props already include `user.portfolioMode`

## Design constraints

- Dashboard UI is ALWAYS dark Tech theme (`bg-[#0A0E1A]`, `font-mono`) regardless of portfolio mode — only the PUBLIC portfolio changes appearance
- Follow `HUDPanel` wrapper pattern for all dashboard sections
- `useTransition` + server action + `toast` (sonner) pattern for all mutations
- No new packages
- No tests required — dashboard view components don't have tests in this codebase (consistent with existing DashboardPortfolioView, DashboardProjectsView having no test files)

## Out of scope

- Image upload (Vercel Blob) — imageUrl is URL string input for MVP
- Drag-and-drop reordering of services/testimonials/gallery items — use order number field for MVP
- Section reordering drag UI for Classic sections — toggle visibility only
- Google Maps testimonial import
- Custom hex color picker (THEME_PRESETS only)
- i18n for new dashboard labels (use English inline strings for MVP, same as most existing dashboard labels)
- Phase 2D (Onboarding & Mode Switcher) — separate spec
