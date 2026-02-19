# Specification: Classic Mode Schema & Data Layer (Phase 2A)

## Goal

Add the Prisma models, TypeScript types, Yup validation schemas, data access functions, services, and server actions needed for Classic Mode portfolios -- specifically Service, Testimonial, GalleryItem, and PortfolioSettings -- without any UI work.

## User Stories

- As a Classic Mode professional, I want my portfolio to support services, testimonials, and a gallery so that potential clients can see what I offer, what others say about me, and examples of my work.
- As a portfolio visitor, I want to see a themed, well-structured Classic Mode portfolio that loads services, testimonials, gallery items, and theme settings in a single aggregated query.

## Specific Requirements

**R1: Service Prisma Model**
- Add to `prisma/schema.prisma` a `Service` model with fields: `id` (String @id @default(cuid()) @map("_id")), `userId` (String), `title` (String), `description` (String), `priceType` (PriceType enum), `priceMin` (Float?), `priceMax` (Float?), `currency` (String @default("USD")), `durationMinutes` (Int?), `order` (Int @default(0)), `published` (Boolean @default(true)), `imageUrl` (String?), `createdAt` (DateTime @default(now())), `updatedAt` (DateTime @updatedAt)
- Add enum `PriceType` with values: `FIXED`, `RANGE`, `STARTING_FROM`, `CONTACT`
- Add relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
- Add `@@index([userId])` and `@@map("services")`
- Add `services Service[]` to the User model relations block in `prisma/schema.prisma`

**R2: Testimonial Prisma Model**
- Add to `prisma/schema.prisma` a `Testimonial` model with fields: `id`, `userId`, `clientName` (String), `clientTitle` (String?), `content` (String), `rating` (Int), `imageUrl` (String?), `source` (String?), `externalId` (String?), `order` (Int @default(0)), `published` (Boolean @default(true)), `createdAt`, `updatedAt`
- Add relation to User with `onDelete: Cascade`, add `@@index([userId])`, `@@map("testimonials")`
- Add `testimonials Testimonial[]` to the User model

**R3: GalleryItem Prisma Model**
- Add to `prisma/schema.prisma` a `GalleryItem` model with fields: `id`, `userId`, `imageUrl` (String, required), `caption` (String?), `altText` (String?), `category` (String?), `order` (Int @default(0)), `published` (Boolean @default(true)), `createdAt`, `updatedAt`
- Add relation to User with `onDelete: Cascade`, add `@@index([userId])`, `@@map("gallery_items")`
- Add `galleryItems GalleryItem[]` to the User model

**R4: PortfolioSettings Prisma Model**
- Add to `prisma/schema.prisma` a `PortfolioSettings` model with fields: `id`, `userId` (String @unique), `theme` (String @default("default")), `layoutVariant` (String @default("bento")), `accentColor` (String?), `fontFamily` (String?), `heroStyle` (String @default("standard")), `showBranding` (Boolean @default(true)), `createdAt`, `updatedAt`
- Add relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
- Add `@@map("portfolio_settings")`
- Add `portfolioSettings PortfolioSettings?` to the User model
- After all schema changes, run `npx prisma generate` then `npx prisma db push`

**R5: Services Feature (`features/services/`)**
- Create `features/services/types/service.ts` -- re-export `ServiceModel` and `PriceType` from `@/app/generated/prisma`, define `CreateServiceInput` and `UpdateServiceInput` interfaces following the pattern in `features/projects/types/project.ts`
- Create `features/services/schemas/service.schema.ts` -- Yup schemas: `createServiceSchema` (title required max 100, description required max 2000, priceType required oneOf FIXED/RANGE/STARTING_FROM/CONTACT, priceMin conditional required when priceType != CONTACT and >= 0, priceMax conditional required when priceType == RANGE and > priceMin, currency required 3-char uppercase, durationMinutes optional > 0, order integer >= 0), `updateServiceSchema` (same fields optional + id required), `deleteServiceSchema` (id required). Export inferred types.
- Create `features/services/data/index.ts` barrel file re-exporting all data functions
- Create `features/services/data/createService.data.ts`, `updateService.data.ts`, `deleteService.data.ts`, `getServiceById.data.ts`, `getServicesByUserId.data.ts`, `getPublicServices.data.ts` -- follow exact pattern from `features/projects/data/`. `getPublicServices` filters `published: true` and orders by `order asc`
- Create `features/services/services/service.service.ts` -- `createServiceService`, `updateServiceService`, `deleteServiceService`, `getServicesService` following the ownership-check pattern in `features/projects/services/project.service.ts`. Call `invalidateNarrativeCache` after mutations.
- Create `features/services/actions/serviceActions.ts` -- server actions using `actionWrapper` from `@/features/core`, validate with Yup schemas, call service layer, `revalidatePath` after mutations
- Create `features/services/constants/messages.ts` -- `SERVICE_MESSAGES` object with CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS, NOT_FOUND, UNAUTHORIZED keys following `features/projects/constants/messages.ts` pattern
- Create `features/services/constants/limits.ts` -- `MAX_SERVICES_PER_USER = 20`
- Create `features/services/index.ts` barrel file

**R6: Testimonials Feature (`features/testimonials/`)**
- Same file structure as Services: `types/testimonial.ts`, `schemas/testimonial.schema.ts`, `data/` (create, update, delete, getById, getByUserId, getPublicTestimonials), `services/testimonial.service.ts`, `actions/testimonialActions.ts`, `constants/messages.ts`, `constants/limits.ts`, `index.ts`
- Yup validation: `clientName` required max 100, `clientTitle` optional max 100, `content` required max 1000, `rating` required integer 1-5, `source` optional oneOf ["manual", "google_maps"], `externalId` optional max 255, `order` integer >= 0
- `getPublicTestimonials.data.ts` filters `published: true`, orders by `order asc`
- `MAX_TESTIMONIALS_PER_USER = 30`

**R7: Gallery Feature (`features/gallery/`)**
- Same file structure as Services: `types/galleryItem.ts`, `schemas/galleryItem.schema.ts`, `data/` (create, update, delete, getById, getByUserId, getPublicGallery), `services/galleryItem.service.ts`, `actions/galleryItemActions.ts`, `constants/messages.ts`, `constants/limits.ts`, `index.ts`
- Yup validation: `imageUrl` required valid URL, `caption` optional max 500, `altText` optional max 255, `category` optional max 50, `order` integer >= 0
- `getPublicGallery.data.ts` filters `published: true`, orders by `order asc`. Return type should include items grouped by category: `{ items: GalleryItemModel[], categories: string[] }` where `categories` is the distinct list of non-null category values
- `MAX_GALLERY_ITEMS_PER_USER = 50`

**R8: PortfolioSettings Feature (`features/portfolio-settings/`)**
- Create `features/portfolio-settings/types/portfolioSettings.ts` -- re-export `PortfolioSettingsModel` from generated Prisma types, define `ThemePreset` interface with fields: `id`, `name`, `backgroundColor`, `textColor`, `accentColor`, `borderColor`, `cardBackground`, `fontFamily`
- Create `features/portfolio-settings/constants/themes.ts` -- export `THEME_PRESETS` as a `Record<string, ThemePreset>` with four presets: `"default"` (Clean White: white bg, gray-900 text, blue-600 accent), `"warm"` (Warm Cream: cream bg, brown-900 text, amber-600 accent), `"dark-elegant"` (Dark Elegant: gray-950 bg, gray-100 text, gold accent), `"ocean"` (Ocean Blue: slate-50 bg, slate-900 text, teal-600 accent). Each preset defines `backgroundColor`, `textColor`, `accentColor`, `borderColor`, `cardBackground`, `fontFamily`.
- Create `features/portfolio-settings/data/getPortfolioSettings.data.ts` -- uses `prisma.portfolioSettings.upsert` to get-or-create on first access (lazy creation pattern). `where: { userId }`, `create: { userId }` (Prisma defaults handle initial values), `update: {}`.
- Create `features/portfolio-settings/services/portfolioSettings.service.ts` -- `updatePortfolioSettingsService` that validates theme ID exists in `THEME_PRESETS`, validates `layoutVariant` is one of `["bento", "stacked", "sidebar"]`, validates `heroStyle` is one of `["standard", "minimal", "cover"]`
- Create `features/portfolio-settings/actions/portfolioSettingsActions.ts` -- server action using `actionWrapper`, Yup validation, calls service
- Create `features/portfolio-settings/schemas/portfolioSettings.schema.ts` -- Yup schema for update: `theme` optional string, `layoutVariant` optional oneOf, `accentColor` optional hex color regex, `fontFamily` optional string max 100, `heroStyle` optional oneOf, `showBranding` optional boolean

**R9: Section System Updates**
- In `features/portfolio/constants/sections.ts`, add three new entries to `PORTFOLIO_SECTIONS`: `{ key: 'services', icon: 'Briefcase', labelKey: 'nav.services' }`, `{ key: 'testimonials', icon: 'MessageSquare', labelKey: 'nav.testimonials' }`, `{ key: 'gallery', icon: 'Image', labelKey: 'nav.gallery' }`
- Add two new exported constants: `TECH_DEFAULT_SECTIONS = ['hero', 'about', 'timeline', 'skills', 'projects', 'ai', 'contact']` and `CLASSIC_DEFAULT_SECTIONS = ['hero', 'about', 'gallery', 'services', 'skills', 'testimonials', 'contact']`
- Add three boolean helper functions in a new file `features/portfolio/data/hasClassicContent.data.ts`: `hasServicesData(userId: string): Promise<boolean>` (count > 0 on Service where userId + published), `hasGalleryItemsData(userId: string): Promise<boolean>`, `hasTestimonialsData(userId: string): Promise<boolean>`

**R10: Extend PortfolioData Type and Aggregation**
- In `features/portfolio/types/portfolio.ts`, add imports for `ServiceModel`, `TestimonialModel`, `GalleryItemModel`, and `PortfolioSettingsModel` from their respective feature type files. Extend the `PortfolioData` interface with: `services: ServiceModel[]`, `testimonials: TestimonialModel[]`, `gallery: GalleryItemModel[]`, `settings: PortfolioSettingsData | null` (define `PortfolioSettingsData` as a Pick of the settings model with theme-relevant fields)
- In `features/portfolio/data/getPortfolio.data.ts`, add three new parallel data fetches alongside experiences/skills/projects: `getPublicServicesByUsername`, `getPublicTestimonialsByUsername`, `getPublicGalleryByUsername`, and `getPortfolioSettingsByUsername`. Each function looks up the user by username, then calls the corresponding feature's public data function with the userId. Add the results to the returned `PortfolioData` object.
- Create these four "byUsername" wrapper functions in new files under `features/portfolio/data/`: `getPublicServices.data.ts`, `getPublicTestimonials.data.ts`, `getPublicGallery.data.ts`, `getPortfolioSettings.data.ts`. Each resolves username to userId then delegates to the feature's data function.

## Visual Design

No visual design assets -- this spec is data layer only. UI belongs to Phase 2B/2C.

## Existing Code to Leverage

**`features/projects/` -- Full CRUD feature reference**
- This is the primary pattern to replicate for Services, Testimonials, and Gallery features
- Copy the three-layer structure: `data/` (one file per query), `services/` (ownership checks + business logic), `actions/` (actionWrapper + Yup), `types/` (re-export Prisma + input types), `schemas/` (Yup create/update/delete), `constants/` (messages)
- File: `C:/Users/user/code/nextjs/portfoland/features/projects/services/project.service.ts` shows the ownership validation + `invalidateNarrativeCache` pattern

**`features/portfolio/data/getPortfolio.data.ts` -- Portfolio aggregation**
- This is the file to extend with new Classic Mode data fetches (services, testimonials, gallery, settings)
- Uses `Promise.all` for parallel fetching -- add the new queries to this array
- File: `C:/Users/user/code/nextjs/portfoland/features/portfolio/data/getPortfolio.data.ts`

**`features/portfolio/types/portfolio.ts` -- PortfolioData type**
- Extend this interface with four new fields for Classic Mode data
- Follow existing pattern of importing types from feature-specific type files
- File: `C:/Users/user/code/nextjs/portfoland/features/portfolio/types/portfolio.ts`

**`features/portfolio/constants/sections.ts` -- Section system**
- Add three new section entries and mode-specific default arrays
- Keep the `as const` assertion on the array
- File: `C:/Users/user/code/nextjs/portfoland/features/portfolio/constants/sections.ts`

**`features/core/index.ts` -- Shared utilities**
- Import `actionWrapper` and `prisma` from `@/features/core` in all new actions and data files
- File: `C:/Users/user/code/nextjs/portfoland/features/core/index.ts`

## Out of Scope

- UI components for Services, Testimonials, Gallery, or Settings (Phase 2B/2C)
- Dashboard CRUD pages and forms (Phase 2C)
- Onboarding flow and mode switcher UI (Phase 2D)
- Image upload UI and Vercel Blob integration for service images, gallery images, or testimonial photos (Phase 2C)
- Google Maps testimonial import functionality (Phase 5+)
- Custom color picker for accent colors (future -- using theme presets for now)
- Bento Grid visual layout implementation (Phase 2B -- only boolean data helpers are defined here)
- i18n translation strings for new section labels (Phase 2B when UI is built)
- Any migration scripts for existing users -- new collections start empty, existing sectionOrder/sectionVisibility remain untouched
- Rate limiting or quota enforcement on new server actions (handled at infrastructure level)
