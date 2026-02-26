# Phase 2B Requirements — Classic Mode Public Template

**Date:** 2026-02-25
**Branch:** feature/classic-mode-2b
**Context:** Roadmap ROADMAP_V2.md Phase 2B

## What Phase 2A already completed (DO NOT redo)

All Prisma models, data layer, services, actions for:
- `Service` model + full CRUD feature (`features/services/`)
- `Testimonial` model + full CRUD feature (`features/testimonials/`)
- `GalleryItem` model + full CRUD feature (`features/gallery/`)
- `PortfolioSettings` model + feature (`features/portfolio-settings/`) with 4 THEME_PRESETS
- `PortfolioData` type extended with `services`, `testimonials`, `gallery`, `settings` fields
- `getPortfolioByUsername` already fetches all in parallel
- Section system: `CLASSIC_DEFAULT_SECTIONS`, `TECH_DEFAULT_SECTIONS` defined

## What this spec must build (Phase 2B ONLY)

### CP1: Redesign ClassicHero for non-technical professionals
File: `features/portfolio/components/classic/ClassicHero.tsx`

Current problem: The hero has a terminal-style window with macOS dots and `const ROLE = 'Fullstack Developer'` code styling. This is wrong for photographers, barbers, architects.

Required: Clean, professional hero. Layout: centered avatar → name (h1) → optional subtitle/role (from bio first line or a future role field — for now just show bio briefly) → contact links row. Style: white bg, gray-900 text, blue-600 accents, rounded-full avatar, subtle border. No terminal, no code syntax.

Keep `data-testid="avatar-initials"` on the initials fallback div.

### CP2: Remove tech-flavored header from ClassicSkills
File: `features/portfolio/components/classic/ClassicSkills.tsx`

Remove the line with `CPU: 12.4% MEM: 2.1GB/16GB UPTIME: 365d skills.bin`. Keep everything else.

### CP3: Create ClassicGallery component
File: `features/portfolio/components/classic/ClassicGallery.tsx` (NEW)

Data: `data.gallery` — array of `GalleryItemModel` (imageUrl, caption, altText, category, order, published)

Layout:
- Heading "Gallery" / `t('sections.gallery.classic.title')`
- Grid layout: responsive 2-col on mobile, 3-col on md+
- Each item: `<img>` tag (not next/image, keep it simple) with `alt={item.altText ?? item.caption ?? ''}`, caption below if present
- Filter bar (optional but recommended): if items have categories, show category pill buttons to filter by category
- Empty state: `data-testid="gallery-empty-state"` with text from `t('sections.gallery.classic.emptyState')`
- `data-testid="gallery-grid"` on the grid container

### CP4: Create ClassicServices component
File: `features/portfolio/components/classic/ClassicServices.tsx` (NEW)

Data: `data.services` — array of `ServiceModel` (title, description, priceType, priceMin, priceMax, currency, durationMinutes, order, published, imageUrl)

Layout:
- Heading "Services" / `t('sections.services.classic.title')`
- List of service cards (responsive grid, 2-col md+)
- Each card: title (h3), description, price display (smart: "Contact us" for CONTACT, "$50" for FIXED, "$50 - $100" for RANGE, "From $50" for STARTING_FROM), duration in minutes formatted as "30 min" or "1h 30min"
- Subtle border, rounded corners, light card bg
- Empty state: `data-testid="services-empty-state"`
- `data-testid="service-card"` on each card

### CP5: Create ClassicTestimonials component
File: `features/portfolio/components/classic/ClassicTestimonials.tsx` (NEW)

Data: `data.testimonials` — array of `TestimonialModel` (clientName, clientTitle, content, rating, imageUrl, order)

Layout:
- Heading "Testimonials" / `t('sections.testimonials.classic.title')`
- Grid of testimonial cards (1 col mobile, 2 col md+)
- Each card: star rating (1-5 filled stars), `"content"` quoted text (italic), client name (bold), clientTitle below if present, client avatar if imageUrl present (else initials circle)
- Empty state: `data-testid="testimonials-empty-state"`
- `data-testid="testimonial-card"` on each card

### CP6: Apply theme from PortfolioSettings in PortfolioLayout
File: `features/portfolio/components/PortfolioLayout.tsx`

Currently: classic mode uses hardcoded `bg-white text-gray-900`.

Required: Read `data.settings` → resolve theme preset via `THEME_PRESETS[settings.theme ?? 'default']` → apply as inline CSS variables on the root container.

CSS variables to apply via `style` prop:
```
--portfolio-bg: preset.backgroundColor
--portfolio-text: preset.textColor
--portfolio-accent: preset.accentColor
--portfolio-border: preset.borderColor
--portfolio-card-bg: preset.cardBackground
```

Then change the className for classic mode from `bg-white text-gray-900` to use `bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]`.

Import `THEME_PRESETS` from `@/features/portfolio-settings/constants/themes`.

### CP7: Register new sections in PortfolioLayout
File: `features/portfolio/components/PortfolioLayout.tsx`

Add to `classicSections` map:
```ts
gallery: ClassicGallery,
services: ClassicServices,
testimonials: ClassicTestimonials,
```

Import the three new components.

### CP8: Tests for new Classic Mode components
File: `features/portfolio/__tests__/portfolio-classic-new-sections.test.tsx` (NEW)

Tests needed (follow pattern from `portfolio-classic.test.tsx`):
1. `ClassicGallery` renders gallery grid and items
2. `ClassicGallery` shows empty state when no gallery items
3. `ClassicServices` renders service cards with price display (FIXED + RANGE + CONTACT + STARTING_FROM)
4. `ClassicServices` shows empty state when no services
5. `ClassicTestimonials` renders testimonial cards with star rating and content
6. `ClassicTestimonials` shows empty state when no testimonials

## Design Reference

Visual style: Squarespace, Read.cv, Awwwards.
- Clean white bg (or theme-based)
- Gray-900 text for headings
- Gray-600 for body text
- Blue-600 accent (or theme accentColor)
- Subtle borders: `border border-gray-100` or `border-gray-200`
- Cards: soft shadow `shadow-sm`, rounded `rounded-lg`
- No tech/terminal elements in Classic Mode sections

## Existing Patterns to Follow

- All section components: `'use client'`, props `{ data: PortfolioData, className?: string }`
- i18n: `useTranslations('portfolio')` from `next-intl`
- Conditional classes: `cn()` from `@/lib/utils`
- `data-testid` on key elements for tests
- No new packages needed (all deps already installed: lucide-react, framer-motion, next-intl, cn)

## Out of Scope (Phase 2C/2D)

- Dashboard CRUD pages for Services, Testimonials, Gallery
- Image upload UI (Vercel Blob integration)
- Mode switcher UI / onboarding
- PanelNavigation i18n label updates for new section keys (add empty key fallbacks)
- Google Maps testimonial import
- Custom color picker (theme presets only for now)
