# Task Breakdown: Classic Mode Schema & Data Layer (Phase 2A)

## Overview
Total Tasks: 7 Task Groups, ~45 sub-tasks

This is a **DATA LAYER ONLY** spec. No UI components, no pages. The work covers Prisma schema changes (4 new models, 1 enum, User relations), three new CRUD feature directories, a PortfolioSettings feature with lazy creation, section system updates, and portfolio data aggregation extensions.

**Critical ordering rationale:** Prisma schema must come first because `npx prisma generate` produces the TypeScript types that all subsequent code depends on. Types files come second to define input/output interfaces. Data layer third, services fourth, actions fifth -- each layer depends on the one below it. Section system and aggregation come last because they integrate all new features into the existing portfolio system.

**Primary reference pattern:** `features/projects/` (full CRUD feature with three-layer architecture)

---

## Task List

### Prisma Schema Layer

#### Task Group 1: Prisma Models, Enum, and Relations
**Dependencies:** None

- [x] 1.0 Complete Prisma schema changes and type generation
  - [x] 1.1 Add `PriceType` enum to `prisma/schema.prisma`
    - Values: `FIXED`, `RANGE`, `STARTING_FROM`, `CONTACT`
    - Place above the Service model definition
  - [x] 1.2 Add `Service` model to `prisma/schema.prisma`
    - Fields: `id` (String @id @default(cuid()) @map("_id")), `userId` (String), `title` (String), `description` (String), `priceType` (PriceType), `priceMin` (Float?), `priceMax` (Float?), `currency` (String @default("USD")), `durationMinutes` (Int?), `order` (Int @default(0)), `published` (Boolean @default(true)), `imageUrl` (String?), `createdAt` (DateTime @default(now())), `updatedAt` (DateTime @updatedAt)
    - Relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    - Indexes: `@@index([userId])`, `@@map("services")`
  - [x] 1.3 Add `Testimonial` model to `prisma/schema.prisma`
    - Fields: `id`, `userId`, `clientName` (String), `clientTitle` (String?), `content` (String), `rating` (Int), `imageUrl` (String?), `source` (String?), `externalId` (String?), `order` (Int @default(0)), `published` (Boolean @default(true)), `createdAt`, `updatedAt`
    - Relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    - Indexes: `@@index([userId])`, `@@map("testimonials")`
  - [x] 1.4 Add `GalleryItem` model to `prisma/schema.prisma`
    - Fields: `id`, `userId`, `imageUrl` (String, required), `caption` (String?), `altText` (String?), `category` (String?), `order` (Int @default(0)), `published` (Boolean @default(true)), `createdAt`, `updatedAt`
    - Relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    - Indexes: `@@index([userId])`, `@@map("gallery_items")`
  - [x] 1.5 Add `PortfolioSettings` model to `prisma/schema.prisma`
    - Fields: `id`, `userId` (String @unique), `theme` (String @default("default")), `layoutVariant` (String @default("bento")), `accentColor` (String?), `fontFamily` (String?), `heroStyle` (String @default("standard")), `showBranding` (Boolean @default(true)), `createdAt`, `updatedAt`
    - Relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    - Index: `@@map("portfolio_settings")`
    - Note: `userId` is `@unique` (1:1 relation, no `@@index` needed -- unique constraint implies index)
  - [x] 1.6 Add new relation fields to User model
    - Add `services Service[]` to User model relations block
    - Add `testimonials Testimonial[]` to User model relations block
    - Add `galleryItems GalleryItem[]` to User model relations block
    - Add `portfolioSettings PortfolioSettings?` to User model relations block
  - [x] 1.7 Run `npx prisma generate` to produce TypeScript types
    - This MUST succeed before any subsequent task group can begin
    - Verify that `@/app/generated/prisma` exports `Service`, `Testimonial`, `GalleryItem`, `PortfolioSettings`, and `PriceType`
  - [x] 1.8 Run `npx prisma db push` to sync schema with MongoDB
    - Verify no errors from the push operation

**Acceptance Criteria:**
- All four models and the enum exist in `prisma/schema.prisma`
- User model has all four new relation fields
- `npx prisma generate` succeeds without errors
- `npx prisma db push` succeeds without errors
- Generated Prisma client exports all new types

---

### Services Feature (CRUD)

#### Task Group 2: Services Feature — Types, Schemas, Data, Services, Actions
**Dependencies:** Task Group 1 (Prisma types must be generated)

- [x] 2.0 Complete the `features/services/` feature directory
  - [x] 2.1 Write 4-6 focused tests for Services feature
    - Test create service with valid data
    - Test create service with conditional price validation (RANGE requires priceMax > priceMin)
    - Test update service with ownership check (unauthorized user rejected)
    - Test delete service with ownership check
    - Test getPublicServices returns only published items ordered by `order`
    - Test MAX_SERVICES_PER_USER limit enforcement
  - [x] 2.2 Create `features/services/types/service.ts`
    - Re-export `Service as ServiceModel` and `PriceType` from `@/app/generated/prisma`
    - Define `CreateServiceInput` interface (Omit id, userId, createdAt, updatedAt from ServiceModel)
    - Define `UpdateServiceInput` interface (Partial of CreateServiceInput + required id)
    - Follow pattern from `features/projects/types/project.ts`
  - [x] 2.3 Create `features/services/schemas/service.schema.ts`
    - `createServiceSchema`: title required max 100, description required max 2000, priceType required oneOf [FIXED, RANGE, STARTING_FROM, CONTACT], priceMin conditional (required + >= 0 when priceType != CONTACT), priceMax conditional (required + > priceMin when priceType == RANGE), currency required 3-char uppercase, durationMinutes optional > 0, order integer >= 0, published optional boolean, imageUrl optional string
    - `updateServiceSchema`: same fields all optional + id required string
    - `deleteServiceSchema`: id required string
    - Export inferred types via `yup.InferType`
  - [x] 2.4 Create `features/services/constants/messages.ts`
    - Export `SERVICE_MESSAGES` with keys: CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS, NOT_FOUND, UNAUTHORIZED
    - Follow pattern from `features/projects/constants/messages.ts`
  - [x] 2.5 Create `features/services/constants/limits.ts`
    - Export `MAX_SERVICES_PER_USER = 20`
  - [x] 2.6 Create data layer files in `features/services/data/`
    - `createService.data.ts` -- `createServiceData(input): Promise<ServiceModel>`
    - `updateService.data.ts` -- `updateServiceData(input): Promise<ServiceModel>`
    - `deleteService.data.ts` -- `deleteServiceData(id): Promise<ServiceModel>`
    - `getServiceById.data.ts` -- `getServiceByIdData(id): Promise<ServiceModel | null>`
    - `getServicesByUserId.data.ts` -- `getServicesByUserIdData(userId): Promise<ServiceModel[]>` (all services for dashboard, ordered by `order asc`)
    - `getPublicServices.data.ts` -- `getPublicServicesData(userId): Promise<ServiceModel[]>` (filter `published: true`, order by `order asc`)
    - `index.ts` barrel re-exporting all data functions
    - Import `prisma` from `@/lib/prisma`
  - [x] 2.7 Create `features/services/services/service.service.ts`
    - `createServiceService(input)` -- check MAX_SERVICES_PER_USER limit, create, call `invalidateNarrativeCache(userId).catch(() => {})`
    - `updateServiceService(input)` -- ownership check via getServiceByIdData, throw NOT_FOUND / UNAUTHORIZED, update, invalidate cache
    - `deleteServiceService(id, userId)` -- ownership check, delete, invalidate cache
    - `getServicesService(userId)` -- delegate to getServicesByUserIdData
    - Follow pattern from `features/projects/services/project.service.ts`
  - [x] 2.8 Create `features/services/actions/serviceActions.ts`
    - `"use server"` directive
    - `createServiceAction` -- validate with createServiceSchema, get userId from session, call createServiceService, `revalidatePath`
    - `updateServiceAction` -- validate with updateServiceSchema, ownership via service layer, revalidatePath
    - `deleteServiceAction` -- validate with deleteServiceSchema, call deleteServiceService, revalidatePath
    - All actions use `actionWrapper` from `@/features/core`
  - [x] 2.9 Create `features/services/index.ts` barrel file
    - Re-export types, actions, and public data functions
  - [x] 2.10 Ensure Services feature tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- All CRUD operations work end-to-end (action -> service -> data)
- Conditional price validation works correctly for all PriceType values
- Ownership checks prevent unauthorized mutations
- `invalidateNarrativeCache` called after all mutations
- MAX_SERVICES_PER_USER limit enforced

---

### Testimonials Feature (CRUD)

#### Task Group 3: Testimonials Feature — Types, Schemas, Data, Services, Actions
**Dependencies:** Task Group 1 (Prisma types must be generated)

- [ ] 3.0 Complete the `features/testimonials/` feature directory
  - [ ] 3.1 Write 4-6 focused tests for Testimonials feature
    - Test create testimonial with valid data (including rating 1-5)
    - Test create testimonial fails with rating outside 1-5 range
    - Test update testimonial with ownership check
    - Test delete testimonial with ownership check
    - Test getPublicTestimonials returns only published items ordered by `order`
  - [ ] 3.2 Create `features/testimonials/types/testimonial.ts`
    - Re-export `Testimonial as TestimonialModel` from `@/app/generated/prisma`
    - Define `CreateTestimonialInput` and `UpdateTestimonialInput` interfaces
    - Follow same Omit/Partial pattern as Services types
  - [ ] 3.3 Create `features/testimonials/schemas/testimonial.schema.ts`
    - `createTestimonialSchema`: clientName required max 100, clientTitle optional max 100, content required max 1000, rating required integer min 1 max 5, source optional oneOf ["manual", "google_maps"], externalId optional max 255, order integer >= 0, published optional boolean, imageUrl optional string
    - `updateTestimonialSchema`: same fields all optional + id required
    - `deleteTestimonialSchema`: id required
    - Export inferred types
  - [ ] 3.4 Create `features/testimonials/constants/messages.ts`
    - Export `TESTIMONIAL_MESSAGES` with keys: CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS, NOT_FOUND, UNAUTHORIZED
  - [ ] 3.5 Create `features/testimonials/constants/limits.ts`
    - Export `MAX_TESTIMONIALS_PER_USER = 30`
  - [ ] 3.6 Create data layer files in `features/testimonials/data/`
    - `createTestimonial.data.ts`, `updateTestimonial.data.ts`, `deleteTestimonial.data.ts`
    - `getTestimonialById.data.ts`, `getTestimonialsByUserId.data.ts`
    - `getPublicTestimonials.data.ts` -- filter `published: true`, order by `order asc`
    - `index.ts` barrel file
  - [ ] 3.7 Create `features/testimonials/services/testimonial.service.ts`
    - Same pattern as Services: create (with limit check), update (ownership), delete (ownership), get
    - Call `invalidateNarrativeCache` after mutations
  - [ ] 3.8 Create `features/testimonials/actions/testimonialActions.ts`
    - `"use server"` directive, actionWrapper, Yup validation, revalidatePath
    - `createTestimonialAction`, `updateTestimonialAction`, `deleteTestimonialAction`
  - [ ] 3.9 Create `features/testimonials/index.ts` barrel file
  - [ ] 3.10 Ensure Testimonials feature tests pass
    - Run ONLY the 4-6 tests written in 3.1

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- Rating validation enforces integer 1-5 range
- All CRUD operations work with ownership checks
- `invalidateNarrativeCache` called after mutations
- MAX_TESTIMONIALS_PER_USER limit enforced

---

### Gallery Feature (CRUD)

#### Task Group 4: Gallery Feature — Types, Schemas, Data, Services, Actions
**Dependencies:** Task Group 1 (Prisma types must be generated)

- [ ] 4.0 Complete the `features/gallery/` feature directory
  - [ ] 4.1 Write 4-6 focused tests for Gallery feature
    - Test create gallery item with valid data (imageUrl required)
    - Test create gallery item fails without imageUrl
    - Test update gallery item with ownership check
    - Test getPublicGallery returns only published items ordered by `order`
    - Test getPublicGallery returns distinct categories list
  - [ ] 4.2 Create `features/gallery/types/galleryItem.ts`
    - Re-export `GalleryItem as GalleryItemModel` from `@/app/generated/prisma`
    - Define `CreateGalleryItemInput` and `UpdateGalleryItemInput` interfaces
    - Define `PublicGalleryData` type: `{ items: GalleryItemModel[], categories: string[] }`
  - [ ] 4.3 Create `features/gallery/schemas/galleryItem.schema.ts`
    - `createGalleryItemSchema`: imageUrl required valid URL, caption optional max 500, altText optional max 255, category optional max 50, order integer >= 0, published optional boolean
    - `updateGalleryItemSchema`: same fields all optional + id required
    - `deleteGalleryItemSchema`: id required
    - Export inferred types
  - [ ] 4.4 Create `features/gallery/constants/messages.ts`
    - Export `GALLERY_MESSAGES` with keys: CREATE_SUCCESS, UPDATE_SUCCESS, DELETE_SUCCESS, NOT_FOUND, UNAUTHORIZED
  - [ ] 4.5 Create `features/gallery/constants/limits.ts`
    - Export `MAX_GALLERY_ITEMS_PER_USER = 50`
  - [ ] 4.6 Create data layer files in `features/gallery/data/`
    - `createGalleryItem.data.ts`, `updateGalleryItem.data.ts`, `deleteGalleryItem.data.ts`
    - `getGalleryItemById.data.ts`, `getGalleryItemsByUserId.data.ts`
    - `getPublicGallery.data.ts` -- filter `published: true`, order by `order asc`, return `{ items, categories }` where `categories` is distinct non-null category values
    - `index.ts` barrel file
  - [ ] 4.7 Create `features/gallery/services/galleryItem.service.ts`
    - Same pattern: create (with limit check), update (ownership), delete (ownership), get
    - Call `invalidateNarrativeCache` after mutations
  - [ ] 4.8 Create `features/gallery/actions/galleryItemActions.ts`
    - `"use server"` directive, actionWrapper, Yup validation, revalidatePath
    - `createGalleryItemAction`, `updateGalleryItemAction`, `deleteGalleryItemAction`
  - [ ] 4.9 Create `features/gallery/index.ts` barrel file
  - [ ] 4.10 Ensure Gallery feature tests pass
    - Run ONLY the 4-6 tests written in 4.1

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- imageUrl is required on create (not optional like Services/Testimonials)
- PublicGalleryData returns items + distinct categories array
- All CRUD operations work with ownership checks
- MAX_GALLERY_ITEMS_PER_USER limit enforced

---

### PortfolioSettings Feature

#### Task Group 5: PortfolioSettings Feature — Types, Themes, Data, Services, Actions
**Dependencies:** Task Group 1 (Prisma types must be generated)

- [ ] 5.0 Complete the `features/portfolio-settings/` feature directory
  - [ ] 5.1 Write 3-4 focused tests for PortfolioSettings feature
    - Test getPortfolioSettings lazy-creates default settings on first access
    - Test updatePortfolioSettings validates theme ID exists in THEME_PRESETS
    - Test updatePortfolioSettings validates layoutVariant is one of ["bento", "stacked", "sidebar"]
    - Test updatePortfolioSettings validates heroStyle is one of ["standard", "minimal", "cover"]
  - [ ] 5.2 Create `features/portfolio-settings/types/portfolioSettings.ts`
    - Re-export `PortfolioSettings as PortfolioSettingsModel` from `@/app/generated/prisma`
    - Define `ThemePreset` interface: `{ id: string, name: string, backgroundColor: string, textColor: string, accentColor: string, borderColor: string, cardBackground: string, fontFamily: string }`
    - Define `UpdatePortfolioSettingsInput` interface
    - Define `PortfolioSettingsData` as a Pick of the model with theme-relevant fields (for public portfolio use)
  - [ ] 5.3 Create `features/portfolio-settings/constants/themes.ts`
    - Export `THEME_PRESETS` as `Record<string, ThemePreset>` with four presets:
      - `"default"`: Clean White -- white bg, gray-900 text, blue-600 accent
      - `"warm"`: Warm Cream -- cream bg, brown-900 text, amber-600 accent
      - `"dark-elegant"`: Dark Elegant -- gray-950 bg, gray-100 text, gold accent
      - `"ocean"`: Ocean Blue -- slate-50 bg, slate-900 text, teal-600 accent
    - Each preset defines: backgroundColor, textColor, accentColor, borderColor, cardBackground, fontFamily
  - [ ] 5.4 Create `features/portfolio-settings/constants/messages.ts`
    - Export `PORTFOLIO_SETTINGS_MESSAGES` with keys: UPDATE_SUCCESS, INVALID_THEME, INVALID_LAYOUT, INVALID_HERO_STYLE
  - [ ] 5.5 Create `features/portfolio-settings/schemas/portfolioSettings.schema.ts`
    - `updatePortfolioSettingsSchema`: theme optional string, layoutVariant optional oneOf ["bento", "stacked", "sidebar"], accentColor optional hex color regex `/^#[0-9A-Fa-f]{6}$/`, fontFamily optional max 100, heroStyle optional oneOf ["standard", "minimal", "cover"], showBranding optional boolean
    - Export inferred type
  - [ ] 5.6 Create `features/portfolio-settings/data/getPortfolioSettings.data.ts`
    - `getPortfolioSettingsData(userId): Promise<PortfolioSettingsModel>`
    - Use `prisma.portfolioSettings.upsert` for lazy creation pattern
    - `where: { userId }`, `create: { userId }` (Prisma @default values handle initial state), `update: {}`
    - This ensures settings always exist after first access
  - [ ] 5.7 Create `features/portfolio-settings/data/updatePortfolioSettings.data.ts`
    - `updatePortfolioSettingsData(userId, input): Promise<PortfolioSettingsModel>`
    - Use `prisma.portfolioSettings.update` with `where: { userId }`
  - [ ] 5.8 Create `features/portfolio-settings/data/index.ts` barrel file
  - [ ] 5.9 Create `features/portfolio-settings/services/portfolioSettings.service.ts`
    - `getPortfolioSettingsService(userId)` -- delegates to data layer
    - `updatePortfolioSettingsService(userId, input)` -- validates theme ID exists in `THEME_PRESETS`, validates layoutVariant in allowed list, validates heroStyle in allowed list, then calls updatePortfolioSettingsData
    - Throws descriptive errors from PORTFOLIO_SETTINGS_MESSAGES for invalid values
  - [ ] 5.10 Create `features/portfolio-settings/actions/portfolioSettingsActions.ts`
    - `"use server"` directive
    - `updatePortfolioSettingsAction` -- actionWrapper, validate with updatePortfolioSettingsSchema, get userId from session, call updatePortfolioSettingsService, revalidatePath
  - [ ] 5.11 Create `features/portfolio-settings/index.ts` barrel file
  - [ ] 5.12 Ensure PortfolioSettings feature tests pass
    - Run ONLY the 3-4 tests written in 5.1

**Acceptance Criteria:**
- The 3-4 tests written in 5.1 pass
- Lazy creation via upsert works (first access creates default settings)
- Theme validation rejects unknown theme IDs
- Layout variant and hero style validation enforce allowed values
- Four theme presets defined with complete color/font data

---

### Section System Updates

#### Task Group 6: Section Constants and Content Helpers
**Dependencies:** Task Groups 2, 3, 4 (new features must exist for content helpers to query)

- [ ] 6.0 Complete section system updates
  - [ ] 6.1 Write 3-4 focused tests for section system
    - Test hasServicesData returns true when published services exist, false when none
    - Test hasGalleryItemsData returns true/false correctly
    - Test hasTestimonialsData returns true/false correctly
    - Test CLASSIC_DEFAULT_SECTIONS and TECH_DEFAULT_SECTIONS contain expected keys
  - [ ] 6.2 Update `features/portfolio/constants/sections.ts`
    - Add three new entries to `PORTFOLIO_SECTIONS` array:
      - `{ key: 'services', icon: 'Briefcase', labelKey: 'nav.services' }`
      - `{ key: 'testimonials', icon: 'MessageSquare', labelKey: 'nav.testimonials' }`
      - `{ key: 'gallery', icon: 'Image', labelKey: 'nav.gallery' }`
    - Add exported constant: `TECH_DEFAULT_SECTIONS = ['hero', 'about', 'timeline', 'skills', 'projects', 'ai', 'contact'] as const`
    - Add exported constant: `CLASSIC_DEFAULT_SECTIONS = ['hero', 'about', 'gallery', 'services', 'skills', 'testimonials', 'contact'] as const`
    - Update `PortfolioSectionKey` type to include new keys
  - [ ] 6.3 Create `features/portfolio/data/hasClassicContent.data.ts`
    - `hasServicesData(userId: string): Promise<boolean>` -- `prisma.service.count({ where: { userId, published: true } }) > 0`
    - `hasGalleryItemsData(userId: string): Promise<boolean>` -- same pattern with galleryItem
    - `hasTestimonialsData(userId: string): Promise<boolean>` -- same pattern with testimonial
    - Import `prisma` from `@/lib/prisma`
  - [ ] 6.4 Ensure section system tests pass
    - Run ONLY the 3-4 tests written in 6.1

**Acceptance Criteria:**
- The 3-4 tests written in 6.1 pass
- `PORTFOLIO_SECTIONS` includes all 10 sections (7 existing + 3 new)
- Mode-specific default arrays contain correct section keys
- Boolean content helpers return correct true/false based on published data

---

### Portfolio Data Aggregation

#### Task Group 7: Extend PortfolioData Type and Aggregation Query
**Dependencies:** Task Groups 2, 3, 4, 5, 6 (all feature data layers and section updates)

- [ ] 7.0 Complete portfolio data aggregation extensions
  - [ ] 7.1 Write 2-4 focused tests for portfolio aggregation
    - Test getPortfolioByUsername returns services, testimonials, gallery, and settings fields
    - Test getPortfolioByUsername returns empty arrays for users with no Classic Mode content
    - Test byUsername wrapper functions resolve username to userId correctly
  - [ ] 7.2 Update `features/portfolio/types/portfolio.ts`
    - Import `ServiceModel` from `@/features/services/types/service`
    - Import `TestimonialModel` from `@/features/testimonials/types/testimonial`
    - Import `GalleryItemModel` from `@/features/gallery/types/galleryItem`
    - Import `PortfolioSettingsData` from `@/features/portfolio-settings/types/portfolioSettings`
    - Extend `PortfolioData` interface with:
      - `services: ServiceModel[]`
      - `testimonials: TestimonialModel[]`
      - `gallery: GalleryItemModel[]`
      - `settings: PortfolioSettingsData | null`
  - [ ] 7.3 Create byUsername wrapper functions in `features/portfolio/data/`
    - `getPublicServices.data.ts` -- `getPublicServicesByUsername(username)`: resolve username to userId via `prisma.user.findUnique`, call `getPublicServicesData(userId)` from services feature
    - `getPublicTestimonials.data.ts` -- `getPublicTestimonialsByUsername(username)`: same pattern, calls `getPublicTestimonialsData`
    - `getPublicGallery.data.ts` -- `getPublicGalleryByUsername(username)`: same pattern, calls `getPublicGalleryData` (return items array, not grouped)
    - `getPortfolioSettings.data.ts` -- `getPortfolioSettingsByUsername(username)`: same pattern, calls `getPortfolioSettingsData` (lazy creation via upsert)
  - [ ] 7.4 Update `features/portfolio/data/getPortfolio.data.ts`
    - Import the four new byUsername wrapper functions
    - Add to the `Promise.all` array: `getPublicServicesByUsername(username)`, `getPublicTestimonialsByUsername(username)`, `getPublicGalleryByUsername(username)`, `getPortfolioSettingsByUsername(username)`
    - Destructure results and add to the returned `PortfolioData` object:
      - `services: services ?? []`
      - `testimonials: testimonials ?? []`
      - `gallery: gallery ?? []`
      - `settings: settings ?? null`
  - [ ] 7.5 Ensure portfolio aggregation tests pass
    - Run ONLY the 2-4 tests written in 7.1

**Acceptance Criteria:**
- The 2-4 tests written in 7.1 pass
- `PortfolioData` type includes all four new fields
- `getPortfolioByUsername` fetches all data in parallel (no waterfall queries)
- Existing portfolio functionality (experiences, skills, projects) remains unchanged
- Empty Classic Mode content returns empty arrays, not null

---

## Testing Summary

#### Task Group 8: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-7

- [ ] 8.0 Review existing tests and fill critical gaps only
  - [ ] 8.1 Review tests from Task Groups 2-7
    - Review the 4-6 tests from Services (Task 2.1)
    - Review the 4-6 tests from Testimonials (Task 3.1)
    - Review the 4-6 tests from Gallery (Task 4.1)
    - Review the 3-4 tests from PortfolioSettings (Task 5.1)
    - Review the 3-4 tests from Sections (Task 6.1)
    - Review the 2-4 tests from Aggregation (Task 7.1)
    - Total existing tests: approximately 20-30 tests
  - [ ] 8.2 Analyze test coverage gaps for THIS feature only
    - Identify critical workflows that lack coverage
    - Focus on integration between features (e.g., does aggregation correctly fetch from all features)
    - Check cross-feature ownership validation patterns
    - Do NOT assess entire application test coverage
  - [ ] 8.3 Write up to 10 additional strategic tests maximum
    - Focus on integration points:
      - End-to-end: action -> service -> data -> database for at least one feature
      - Cross-feature: aggregation query returns correct data from all four new features
      - Edge cases: lazy creation of PortfolioSettings when called from aggregation
      - Conditional validation: Service price validation across all PriceType values
    - Do NOT write comprehensive coverage for all scenarios
  - [ ] 8.4 Run all feature-specific tests
    - Run ONLY tests related to this spec's features (from 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, and 8.3)
    - Expected total: approximately 30-40 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 30-40 tests total)
- Critical integration points between new features and existing portfolio system are covered
- No more than 10 additional tests added
- Testing focused exclusively on Phase 2A feature requirements

---

## Execution Order

Recommended implementation sequence:

```
1. Task Group 1: Prisma Schema (MUST be first -- all TS code depends on generated types)
   |
   +-- 2. Task Group 2: Services Feature     \
   +-- 3. Task Group 3: Testimonials Feature   |-- Can run in parallel (independent features)
   +-- 4. Task Group 4: Gallery Feature        |
   +-- 5. Task Group 5: PortfolioSettings     /
   |
   6. Task Group 6: Section System Updates (depends on TG 2-4 for content helpers)
   |
   7. Task Group 7: Portfolio Aggregation (depends on all features + sections)
   |
   8. Task Group 8: Test Review & Gap Analysis (depends on all task groups)
```

**Notes for the implementer (Sonnet):**
- MongoDB via Prisma: use `npx prisma db push`, NOT `prisma migrate`
- Yup for validation, NOT Zod
- `actionWrapper` from `@/features/core` for all server actions
- `prisma` import from `@/lib/prisma` for all data layer files
- Image fields (imageUrl) are just String fields -- upload handling is Phase 2C
- Always run `npx prisma generate` after schema changes and before writing any TypeScript that references new models
- Reference `features/projects/` for the canonical three-layer pattern
- Call `invalidateNarrativeCache(userId).catch(() => {})` after all mutations in service layer (not action layer)
