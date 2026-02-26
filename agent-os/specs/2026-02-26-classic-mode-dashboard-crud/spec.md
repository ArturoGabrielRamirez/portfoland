# Specification: Phase 2C — Classic Mode Dashboard CRUD

## Goal

Add dashboard pages for managing Services, Testimonials, and Gallery items, and extend the Portfolio settings page with Classic Mode theme picker and Classic section visibility toggles — all wired to the server actions built in Phase 2A.

## User Stories

- As a Classic Mode user, I want to create, edit, and delete my services, testimonials, and gallery items from the dashboard so that my public portfolio stays up to date.
- As a Classic Mode user, I want to pick a theme preset and control section visibility from the portfolio settings page so that I can customize my portfolio's appearance without touching code.
- As any user, I want the dashboard nav to show Classic Mode links only when I am in Classic Mode so that the nav stays uncluttered.

## Specific Requirements

**R1: Dashboard Services Page**

- Create `app/[locale]/(dashboard)/dashboard/services/page.tsx` — async server component: auth-guard (redirect to `/login` if no session), fetch `getServicesByUserIdData(session.user.id)` from `@/features/services/data`, fetch user row from `prisma.user` (`id, name, email, username, image, portfolioMode`), render `<DashboardServicesView services={services} user={user} />`
- Create `app/[locale]/(dashboard)/dashboard/services/DashboardServicesView.tsx` — `'use client'`; receives `services: ServiceModel[]` and `user` prop; renders `<DashboardNav>` and a `max-w-5xl mx-auto px-4 py-8` main area
- List each service as a card inside `bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)]`; show title, formatted price (see price display rules below), duration badge, and a `published` indicator badge (green dot + "Live" or gray + "Draft")
- "Add Service" button in the page header calls `setShowForm(true)` with `editingService` set to `undefined`; when `showForm` is true, render an inline form section above the list inside a `border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] p-6` container
- Edit button on a card sets `editingService` to that service and opens the same inline form; form title shows "Edit Service" vs "New Service" based on `editingService` presence
- Form fields: `title` (text, required), `description` (textarea, required), `priceType` (select: `FIXED` / `RANGE` / `STARTING_FROM` / `CONTACT`), `priceMin` (number, hidden when `priceType === 'CONTACT'`), `priceMax` (number, shown only when `priceType === 'RANGE'`), `currency` (text, default `"USD"`, hidden when `priceType === 'CONTACT'`), `durationMinutes` (number, optional), `published` (checkbox/toggle)
- On save: call `createServiceAction({ title, description, ... })` or `updateServiceAction({ id, title, ... })` inside `startTransition`; on `result.hasError` show `toast.error(result.message)`, otherwise `toast.success(result.message)` and close the form
- Delete button calls `window.confirm(...)` then `deleteServiceAction({ id: service.id })` inside `startTransition`; show `toast.success` or `toast.error` based on `result.hasError`
- Page metadata export: `title: 'My Services | Portfoland'`

**R2: Dashboard Testimonials Page**

- Create `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx` — same server pattern as R1: auth-guard, fetch `getTestimonialsByUserIdData(session.user.id)` from `@/features/testimonials/data`, fetch user row, render `<DashboardTestimonialsView testimonials={testimonials} user={user} />`
- Create `app/[locale]/(dashboard)/dashboard/testimonials/DashboardTestimonialsView.tsx` — `'use client'`; same structural pattern as DashboardServicesView
- List each testimonial as a card: client name (bold), client title (muted, if present), star rating display (5 filled/empty star characters based on `rating` 1–5), content preview (truncated to 2 lines via `line-clamp-2`), published badge, Edit/Delete buttons
- Inline form fields: `clientName` (text, required), `clientTitle` (text, optional), `content` (textarea, required), `rating` (number input 1–5, or 5 clickable star buttons that set a number state), `published` (toggle)
- On save: call `createTestimonialAction({ clientName, content, rating, ... })` or `updateTestimonialAction({ id, ... })` from `@/features/testimonials/actions/testimonialActions`; same `toast.success` / `toast.error` pattern
- Delete: `deleteTestimonialAction({ id })` with confirm dialog; same toast pattern
- Page metadata export: `title: 'My Testimonials | Portfoland'`

**R3: Dashboard Gallery Page**

- Create `app/[locale]/(dashboard)/dashboard/gallery/page.tsx` — same server pattern: auth-guard, fetch `getGalleryItemsByUserIdData(session.user.id)` from `@/features/gallery/data`, fetch user row, render `<DashboardGalleryView items={items} user={user} />`
- Create `app/[locale]/(dashboard)/dashboard/gallery/DashboardGalleryView.tsx` — `'use client'`; same structural pattern
- Display gallery items as cards; each card shows a small image preview (`<img src={item.imageUrl} className="h-20 w-28 object-cover rounded-sm" alt={item.altText ?? ''} />`), caption (if present), category badge, published toggle, Edit/Delete buttons
- Empty state: show a centered placeholder with an icon and "No gallery items yet" message and an "Add First Image" button
- Inline form fields: `imageUrl` (text/URL input, required), `caption` (text, optional), `altText` (text, optional), `category` (text, optional), `order` (number, optional), `published` (toggle)
- On save: call `createGalleryItemAction({ imageUrl, caption, ... })` or `updateGalleryItemAction({ id, ... })` from `@/features/gallery/actions/galleryItemActions`; same toast pattern
- Delete: `deleteGalleryItemAction({ id })` with confirm dialog; same toast pattern
- Page metadata export: `title: 'My Gallery | Portfoland'`

**R4: Classic Mode Settings in DashboardPortfolioView**

- Modify `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`: additionally fetch `getPortfolioSettingsData(session.user.id)` from `@/features/portfolio-settings/data`; pass `portfolioSettings` as a new prop to `<DashboardPortfolioView>`
- Modify `DashboardPortfolioView.tsx` props interface to accept `portfolioSettings: PortfolioSettingsModel | null`; add `useState` for `currentTheme` initialized from `portfolioSettings?.theme ?? 'default'`
- Add a "Classic Mode Theme" `HUDPanel` rendered conditionally only when `user.portfolioMode === 'classic'`, positioned below the existing "Preferences" HUDPanel
- Inside the theme panel, render 4 preset cards in a `grid grid-cols-2 gap-3` (or `grid-cols-4` on desktop); each card shows: preset `name` as label, two color swatch dots (`backgroundColor` and `accentColor`), and an "Active" badge when `currentTheme === preset.id`; import `THEME_PRESETS` from `@/features/portfolio-settings/constants/themes`
- Clicking a preset card calls `updatePortfolioSettingsAction({ theme: preset.id })` inside `startTransition`; on success set `setCurrentTheme(preset.id)` and show `toast.success("Theme updated")`; on error show `toast.error(result.message)`
- Add Classic section visibility toggles to the existing `sectionVisibility` state: extend the default value to include `gallery: true, services: true, testimonials: true`; render 3 additional visibility toggle rows (`Images / Gallery`, `Services`, `Testimonials`) wrapped in `{user.portfolioMode === 'classic' && (...)}` inside the existing section list or as a separate "Classic Sections" group at the bottom of the section order area — these use the existing `toggleVisibility` helper and are saved as part of the existing `updateProfile` form submit (no separate save action needed)

**R5: DashboardNav — Classic Mode Links**

- Modify `features/tech/components/dashboard-nav.tsx`: import `Briefcase`, `MessageSquare`, `Images` from `lucide-react`
- Define a `classicNavItems` array with 3 entries: `{ href: '/dashboard/services', label: 'Services', icon: Briefcase }`, `{ href: '/dashboard/testimonials', label: 'Testimonials', icon: MessageSquare }`, `{ href: '/dashboard/gallery', label: 'Gallery', icon: Images }`
- In the desktop nav, render `classicNavItems` after the existing `navItems` only when `user.portfolioMode === 'classic'` — use the same `<Link>` rendering logic, active state detection via `cleanPathname`, and active/inactive class pattern already applied to `navItems`
- In the mobile bottom toolbar, add the 3 Classic items to the hex button row conditionally using the same hex SVG button pattern; since the mobile bar may get crowded with 6 items, render the Classic items only when `user.portfolioMode === 'classic'` and the non-Classic secondary items (`Timeline`, `Skills`, `Projects`) when in tech mode — this keeps the mobile bar at ≤4 icon buttons at any time
- Do not change the `DashboardNavProps` interface — `user.portfolioMode` is already present

## Visual Design

No mockup files provided. Follow the established dark Tech dashboard aesthetic for all new pages and components.

**Established dashboard visual patterns to replicate exactly**
- Page container: `min-h-screen bg-[#0A0E1A] font-mono`
- Page header: `px-6 py-6 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.1)]` with h1 `text-2xl font-mono font-bold text-foreground`
- Main content area: `max-w-5xl mx-auto px-4 py-8`
- Cards/inline form wrapper: `bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm p-4` with `hover:border-[hsl(174,100%,50%,0.3)]` transition
- Inputs: `w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none transition-all`
- Add/primary button: `bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)]`
- Edit icon button: `p-2 text-muted-foreground hover:text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%,0.1)] rounded-sm`
- Delete icon button: `p-2 text-muted-foreground hover:text-[hsl(0,100%,60%)] hover:bg-[hsl(0,100%,60%,0.1)] rounded-sm`
- Published badge (live): `text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase`
- Published badge (draft): same pattern using `text-[#64748B] bg-[#64748B]/10`

## Existing Code to Leverage

**`app/[locale]/(dashboard)/dashboard/projects/DashboardProjectsView.tsx` and `page.tsx`**
- Canonical pattern for a CRUD dashboard page: server page auth-guards and fetches data, passes to a `'use client'` view component; use this as the direct structural template for R1, R2, and R3
- The inline `showForm` / `editingProject` state toggle pattern (show form above list, close on cancel/success) is the exact pattern to replicate for Services, Testimonials, and Gallery

**`app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`**
- Source of the `HUDPanel` usage pattern, `useTransition` + `startTransition(async () => { ... })` mutation pattern, `sectionVisibility` state and `toggleVisibility` helper — extend these directly for R4
- The "Preferences" `HUDPanel` at the bottom of the file is the insertion point for the new "Classic Mode Theme" panel

**`features/dashboard/components/HUDPanel.tsx`**
- Props: `title`, `icon`, `isVisible`, `onToggleVisibility`, `onMoveUp`, `onMoveDown`, `className`, `children` — use for any section wrapper in new pages
- Renders a dark panel with cyan accent header; pass `icon` as a Lucide icon element, `title` as an uppercase label string

**`features/tech/components/dashboard-nav.tsx`**
- The `navItems` array and its `Link` rendering loop (desktop) and hex SVG button loop (mobile) are the exact patterns to extend with `classicNavItems`; `cleanPathname` active state logic is already correct and reusable as-is

**`features/portfolio-settings/constants/themes.ts` — `THEME_PRESETS`**
- `Record<string, ThemePreset>` with keys `'default'`, `'warm'`, `'dark-elegant'`, `'ocean'`; each preset has `id`, `name`, `backgroundColor`, `accentColor`, `borderColor`, `cardBackground`, `fontFamily` — use `backgroundColor` and `accentColor` as the two color swatches in the theme picker cards

## Out of Scope

- Image file upload (Vercel Blob) — `imageUrl` is a plain URL string text input for all three CRUD pages
- Drag-and-drop reordering of services, testimonials, or gallery items — the `order` number field is the only ordering mechanism for MVP
- Drag-and-drop section reordering for Classic sections — visibility toggles only
- Google Maps or external source import for testimonials
- Custom hex color picker — only the 4 `THEME_PRESETS` are selectable
- i18n translations for new dashboard labels — use inline English strings consistent with existing dashboard labels
- `layoutVariant`, `heroStyle`, `accentColor`, `fontFamily`, or `showBranding` fields from `updatePortfolioSettingsAction` — only `theme` is exposed in the UI for MVP
- Phase 2D (Onboarding flow and Mode Switcher wizard) — separate spec
- Unit or integration tests for any of the new dashboard view components
