# Requirements: Phase 2A — Classic Mode Schema & Data Layer

**Date:** 2026-02-19
**Phase:** 2A of ROADMAP_V2
**Depends on:** Phase 1 (Rebrand & Unification) — completed
**Blocks:** Phase 2B (Classic Template), 2C (Dashboard CRUD), 2D (Onboarding)

---

## Scope

Phase 2A is **DATA LAYER ONLY** — Prisma models, TypeScript types, data access functions, services, actions, and validation schemas. No UI components, no pages, no visual design. Those belong to Phase 2B/2C.

---

## R1: Service Model

New Prisma model for services offered by Classic Mode professionals (photographer sessions, haircut packages, coaching hours, etc.).

### Fields

| Field | Type | Details |
|---|---|---|
| `id` | `String @id @default(cuid()) @map("_id")` | Standard MongoDB ID |
| `userId` | `String` | FK to User |
| `title` | `String` | Service name (e.g., "Portrait Session") |
| `description` | `String` | Detailed description |
| `priceType` | `PriceType` enum | `FIXED`, `RANGE`, `STARTING_FROM`, `CONTACT` |
| `priceMin` | `Float?` | Minimum/fixed price. Null when `priceType = CONTACT` |
| `priceMax` | `Float?` | Maximum price. Only used when `priceType = RANGE` |
| `currency` | `String @default("USD")` | ISO 4217 currency code |
| `durationMinutes` | `Int?` | Nullable — not all services have fixed duration |
| `order` | `Int @default(0)` | Display ordering |
| `published` | `Boolean @default(true)` | Draft/published toggle |
| `imageUrl` | `String?` | Optional service image (Vercel Blob URL) |
| `createdAt` | `DateTime @default(now())` | |
| `updatedAt` | `DateTime @updatedAt` | |

### Enum

```prisma
enum PriceType {
  FIXED
  RANGE
  STARTING_FROM
  CONTACT
}
```

### Indexes
- `@@index([userId])`
- `@@map("services")`

### Validation Rules (Yup)
- `title`: required, max 100 chars
- `description`: required, max 2000 chars
- `priceMin`: required when `priceType` is FIXED, RANGE, or STARTING_FROM; must be >= 0
- `priceMax`: required when `priceType` is RANGE; must be > `priceMin`
- `currency`: required, 3-char uppercase string
- `durationMinutes`: optional, must be > 0 if provided
- `order`: integer >= 0

### Data Layer (feature: `features/services/`)
- `data/getServices.data.ts` — get all services for a user (dashboard)
- `data/getPublicServices.data.ts` — get published services for public portfolio
- `services/service.service.ts` — create, update, delete, reorder
- `actions/serviceActions.ts` — server actions with `actionWrapper` + Yup validation
- `types/service.ts` — TypeScript types derived from Prisma model
- `schemas/service.schema.ts` — Yup validation schemas
- `constants/service.ts` — messages, limits

---

## R2: Testimonial Model

Testimonials/reviews for Classic Mode portfolios. MVP: manually created by portfolio owner. Future: Google Maps import.

### Fields

| Field | Type | Details |
|---|---|---|
| `id` | `String @id @default(cuid()) @map("_id")` | Standard MongoDB ID |
| `userId` | `String` | FK to User |
| `clientName` | `String` | Name of the client who gave the testimonial |
| `clientTitle` | `String?` | Optional title/role (e.g., "CEO at Acme") |
| `content` | `String` | Testimonial text |
| `rating` | `Int` | 1-5 star rating |
| `imageUrl` | `String?` | Client photo (Vercel Blob URL) |
| `source` | `String?` | Future: "google_maps", "manual", etc. Default null = manual |
| `externalId` | `String?` | Future: external review ID for deduplication |
| `order` | `Int @default(0)` | Display ordering |
| `published` | `Boolean @default(true)` | Draft/published toggle |
| `createdAt` | `DateTime @default(now())` | |
| `updatedAt` | `DateTime @updatedAt` | |

### Indexes
- `@@index([userId])`
- `@@map("testimonials")`

### Validation Rules (Yup)
- `clientName`: required, max 100 chars
- `clientTitle`: optional, max 100 chars
- `content`: required, max 1000 chars
- `rating`: required, integer 1-5
- `source`: optional, one of `["manual", "google_maps"]` (extensible)
- `externalId`: optional, max 255 chars

### Data Layer (feature: `features/testimonials/`)
- Same pattern as Services: data/, services/, actions/, types/, schemas/, constants/
- `getPublicTestimonials.data.ts` — published testimonials ordered by `order`

---

## R3: GalleryItem Model

Independent image gallery for visual portfolios (photographers, designers, chefs showing plates, etc.).

### Fields

| Field | Type | Details |
|---|---|---|
| `id` | `String @id @default(cuid()) @map("_id")` | Standard MongoDB ID |
| `userId` | `String` | FK to User |
| `imageUrl` | `String` | Required — Vercel Blob URL |
| `caption` | `String?` | Optional image caption |
| `altText` | `String?` | Accessibility alt text |
| `category` | `String?` | Optional grouping (e.g., "Weddings", "Portraits") — flat string, no model |
| `order` | `Int @default(0)` | Display ordering |
| `published` | `Boolean @default(true)` | Draft/published toggle |
| `createdAt` | `DateTime @default(now())` | |
| `updatedAt` | `DateTime @updatedAt` | |

### Indexes
- `@@index([userId])`
- `@@map("gallery_items")`

### Validation Rules (Yup)
- `imageUrl`: required, valid URL
- `caption`: optional, max 500 chars
- `altText`: optional, max 255 chars
- `category`: optional, max 50 chars
- `order`: integer >= 0

### Data Layer (feature: `features/gallery/`)
- Same three-layer pattern
- `getPublicGallery.data.ts` — published items ordered by `order`, optionally grouped by `category`

---

## R4: PortfolioSettings Model

New 1:1 model with User for Classic Mode configuration. Separate from User to keep the User model clean and provide explicit typed fields.

### Fields

| Field | Type | Details |
|---|---|---|
| `id` | `String @id @default(cuid()) @map("_id")` | Standard MongoDB ID |
| `userId` | `String @unique` | 1:1 FK to User |
| `theme` | `String @default("default")` | Preset theme identifier |
| `layoutVariant` | `String @default("bento")` | Layout style: `"bento"`, `"stacked"`, `"sidebar"` (future) |
| `accentColor` | `String?` | Optional override (hex color). Null = use theme default |
| `fontFamily` | `String?` | Optional font override. Null = use theme default |
| `heroStyle` | `String @default("standard")` | Hero section variant: `"standard"`, `"minimal"`, `"cover"` |
| `showBranding` | `Boolean @default(true)` | Show "Made with Portfoland" badge |
| `createdAt` | `DateTime @default(now())` | |
| `updatedAt` | `DateTime @updatedAt` | |

### Theme Presets (constants, not DB)

Define in `features/portfolio-settings/constants/themes.ts`:

| Preset ID | Name | Description |
|---|---|---|
| `"default"` | Clean White | White bg, gray-900 text, blue-600 accents |
| `"warm"` | Warm Cream | Cream bg, brown-900 text, amber-600 accents |
| `"dark-elegant"` | Dark Elegant | Gray-950 bg, gray-100 text, gold accents |
| `"ocean"` | Ocean Blue | Slate-50 bg, slate-900 text, teal-600 accents |

Each preset defines: `backgroundColor`, `textColor`, `accentColor`, `borderColor`, `cardBackground`, `fontFamily`.

### Indexes
- `@@map("portfolio_settings")`

### Relation
- Add to User model: `portfolioSettings PortfolioSettings?`
- Add to PortfolioSettings: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`

### Data Layer (feature: `features/portfolio-settings/`)
- `data/getPortfolioSettings.data.ts` — get or create default settings for user
- `services/portfolioSettings.service.ts` — update settings
- `actions/portfolioSettingsActions.ts` — server action with validation
- Auto-create PortfolioSettings on first access (lazy creation pattern, not migration)

---

## R5: Section System Updates

### New Section Identifiers

Add to the existing `PORTFOLIO_SECTIONS` constant in `features/portfolio/constants/sections.ts`:

| Key | Label (en) | Label (es) | Available in |
|---|---|---|---|
| `"services"` | Services | Servicios | Classic only |
| `"testimonials"` | Testimonials | Testimonios | Classic only |
| `"gallery"` | Gallery | Galería | Classic only |

### Default Section Orders

Define mode-specific defaults in constants:

```ts
export const TECH_DEFAULT_SECTIONS = ['hero', 'about', 'timeline', 'skills', 'projects', 'ai', 'contact'];
export const CLASSIC_DEFAULT_SECTIONS = ['hero', 'about', 'gallery', 'services', 'skills', 'testimonials', 'contact'];
```

### Application Rules
- **New users:** Apply mode-specific default based on selected mode during onboarding (Phase 2D).
- **Mode switchers:** When a user changes from Tech to Classic (or vice versa), offer to reset `sectionOrder` to mode defaults. Don't force — let user keep custom order if they want.
- **Existing users:** No forced migration. Keep current `sectionOrder` and `sectionVisibility` untouched.

### Bento Grid Collapsing (ATS-Friendly / "Solo CV" persona)
- When a Classic Mode user has **no services, no gallery items, and no testimonials**, the Bento Grid layout must collapse gracefully:
  - Empty sections are hidden automatically (not shown as "Add your first..." placeholder in public view)
  - Bio and Experience sections expand to fill the available grid space
  - The result looks like a clean, professional CV — not a broken grid with holes
- This is a **rendering concern** (Phase 2B) but the data layer must support it by:
  - Providing count-based helpers: `hasServices(userId)`, `hasGalleryItems(userId)`, `hasTestimonials(userId)`
  - These are simple `count > 0` checks, used by the template to decide which grid cells to render

---

## R6: Migration & Defaults

### What requires migration
- **Nothing** for existing users. New models (Service, Testimonial, GalleryItem, PortfolioSettings) are empty collections.
- `sectionOrder` and `sectionVisibility` on existing users remain untouched.

### Lazy creation pattern
- `PortfolioSettings` is created on first access (when user visits settings page or when public portfolio is rendered and needs theme info).
- Default values from Prisma `@default()` handle initial state.

### Prisma schema changes
- Add new models to `prisma/schema.prisma`
- Add relations to User model (Service[], Testimonial[], GalleryItem[], PortfolioSettings?)
- Run `npx prisma generate` (no `prisma migrate` since MongoDB uses push, not migrations)
- Run `npx prisma db push` if needed

---

## R7: Public Data Aggregation

Extend the existing `getPortfolioByUsername` function (or create a companion) to also fetch:
- Published services (ordered by `order`)
- Published testimonials (ordered by `order`)
- Published gallery items (ordered by `order`, grouped by category)
- Portfolio settings (theme, layout)

This data will be consumed by the Classic Mode template in Phase 2B.

### Extended PortfolioData type

Add to `features/portfolio/types/portfolio.ts`:

```ts
export interface PortfolioData {
  user: PortfolioUser;
  experiences: PublicTimelineData | null;
  skills: PublicSkillsData | null;
  projects: ProjectData[];
  // New in Phase 2A:
  services: ServiceData[];
  testimonials: TestimonialData[];
  gallery: GalleryItemData[];
  settings: PortfolioSettingsData | null;
}
```

---

## Out of Scope (Phase 2A)

- UI components for Services, Testimonials, Gallery, Settings (→ Phase 2B/2C)
- Dashboard CRUD pages (→ Phase 2C)
- Onboarding flow and mode switcher UI (→ Phase 2D)
- Image upload UI and Vercel Blob integration (→ Phase 2C)
- Google Maps testimonial import (→ Phase 5+)
- Custom color picker (→ future, using presets for now)
- Bento Grid visual implementation (→ Phase 2B, but data helpers defined here)
- i18n for new section labels (→ Phase 2B when UI is built)
