# Task Breakdown: Project Showcase

## Overview
Total Tasks: 8 Task Groups, 47 Sub-tasks

This spec introduces a complete project showcase system: a new `Project` Prisma model, Vercel Blob image upload, Yup validation schemas, three-layer CRUD (action -> service -> data), a dedicated dashboard form, dual-mode portfolio display (Professional and Gaming), and a detail modal with Framer Motion animations.

## Task List

### Database & Schema Layer

#### Task Group 1: Project Model, Types, Constants, and Validation Schemas
**Dependencies:** None

- [x] 1.0 Complete database model, types, constants, and validation schemas
  - [x] 1.1 Write 4 focused tests for Project model and schema validation
    - Test createProjectSchema validates required fields (title, description, startDate)
    - Test createProjectSchema validates links array structure ({ type, label, url })
    - Test createProjectSchema validates technologies array max length (15 items)
    - Test slug validation accepts lowercase alphanumeric with hyphens, rejects invalid characters
  - [x] 1.2 Add `ProjectStatus` enum and `Project` model to `prisma/schema.prisma`
    - Add `ProjectStatus` enum: `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`
    - Add `Project` model with fields: `id` (cuid, @map("_id")), `userId` (String), `title` (String), `slug` (String), `description` (String), `shortDescription` (String?), `imageUrl` (String?), `technologies` (String[]), `links` (Json), `featured` (Boolean, default false), `status` (ProjectStatus, default IN_PROGRESS), `startDate` (DateTime), `endDate` (DateTime?), `order` (Int?), `createdAt`/`updatedAt`
    - Add relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    - Add `@@map("projects")`, `@@index([userId])`, `@@unique([userId, slug])`
    - Add `projects Project[]` to the `User` model relations
    - **Do NOT run migration** -- present the schema changes for user review first
  - [x] 1.3 Run Prisma migration after user approval
    - Run `bunx prisma migrate dev --name add_project_model`
    - Run `bunx prisma generate` to regenerate types
  - [x] 1.4 Create feature directory structure
    - Create `features/projects/` with subdirectories: `components/`, `types/`, `data/`, `actions/`, `services/`, `constants/`, `schemas/`
  - [x] 1.5 Create `features/projects/types/project.ts`
    - Re-export `ProjectStatus` from `@/app/generated/prisma/enums`
    - Re-export `ProjectModel` type from `@/app/generated/prisma/models/Project` as `Project`
    - Define `ProjectLink` interface: `{ type: string; label: string; url: string }`
    - Define `PROJECT_LINK_TYPES` as const array: `['LIVE', 'REPO', 'DOCS', 'VIDEO', 'CASE_STUDY', 'OTHER']`
    - Define `CreateProjectInput` interface (excludes id, userId, createdAt, updatedAt)
    - Define `UpdateProjectInput` interface (all fields optional except id)
    - Define `ProjectCardProps` interface: `{ project: Project; mode: PortfolioMode; onClick: (project: Project) => void }`
    - Define `ProjectDetailProps` interface: `{ project: Project; mode: PortfolioMode; isOpen: boolean; onClose: () => void }`
    - Define `ProjectFormProps` interface: `{ project?: Project; onCancel?: () => void; className?: string }`
    - Follow pattern from `features/timeline/types/experience.ts`
  - [x] 1.6 Create `features/projects/constants/messages.ts`
    - Define `PROJECT_MESSAGES` const object with keys: `CREATE_SUCCESS`, `UPDATE_SUCCESS`, `DELETE_SUCCESS`, `NOT_FOUND`, `UNAUTHORIZED`, `LOGIN_REQUIRED`, `UPLOAD_SUCCESS`, `UPLOAD_ERROR`, `UPLOAD_TYPE_ERROR`, `UPLOAD_SIZE_ERROR`, `DELETE_IMAGE_SUCCESS`, `DELETE_IMAGE_ERROR`
    - Follow pattern from `features/timeline/constants/messages.ts`
  - [x] 1.7 Create `features/projects/schemas/project.schema.ts`
    - Define `createProjectSchema` with Yup: title (required, min 2, max 100), slug (optional, lowercase alphanumeric with hyphens via regex), description (required, min 10, max 5000), shortDescription (optional, max 200), imageUrl (optional, url format), technologies (array of strings, max 15 items), links (array of objects with type oneOf PROJECT_LINK_TYPES + label string max 50 + url string url format), featured (boolean, default false), status (oneOf ProjectStatus values), startDate (date, required), endDate (date, nullable, optional), order (number, optional, nullable)
    - Define `updateProjectSchema` with all fields optional except `id` (required string)
    - Define `deleteProjectSchema` with `id` (required string)
    - Export inferred types via `yup.InferType`
    - Follow pattern from `features/timeline/schemas/experience.schema.ts`
  - [x] 1.8 Ensure model and schema tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify Prisma types are generated correctly

**Acceptance Criteria:**
- The 4 tests written in 1.1 pass
- `Project` model exists in Prisma schema with correct fields, indexes, and relations
- `ProjectStatus` enum is defined with IN_PROGRESS, COMPLETED, ARCHIVED
- User model has `projects Project[]` relation
- Feature directory structure is created
- Types, constants, and Yup schemas are complete and follow existing patterns
- Migration has been run and Prisma client regenerated

---

### Data & Service Layer

#### Task Group 2: Data Layer (Pure Prisma Queries)
**Dependencies:** Task Group 1

- [x] 2.0 Complete data layer for Project CRUD
  - [x] 2.1 Write 3 focused tests for data layer functions
    - Test `createProjectData` creates a project and returns it with all fields
    - Test `getProjectsByUserIdData` returns projects ordered by order then createdAt desc
    - Test `getProjectByIdData` returns null for non-existent ID
  - [x] 2.2 Create `features/projects/data/createProject.data.ts`
    - Pure Prisma `prisma.project.create()` call
    - Import `prisma` from `@/lib/prisma`
    - Accept typed input, return `Promise<Project>`
  - [x] 2.3 Create `features/projects/data/updateProject.data.ts`
    - Pure Prisma `prisma.project.update()` call
    - Accept id and update data, return `Promise<Project>`
  - [x] 2.4 Create `features/projects/data/deleteProject.data.ts`
    - Pure Prisma `prisma.project.delete()` call
    - Accept id, return `Promise<Project>`
  - [x] 2.5 Create `features/projects/data/getProjectById.data.ts`
    - Pure Prisma `prisma.project.findUnique()` call
    - Accept id, return `Promise<Project | null>`
  - [x] 2.6 Create `features/projects/data/getProjectsByUserId.data.ts`
    - Pure Prisma `prisma.project.findMany()` with `where: { userId }`
    - Order by: `order` asc (nulls last), then `createdAt` desc
    - Return `Promise<Project[]>`
  - [x] 2.7 Create `features/projects/data/index.ts` barrel export
    - Re-export all data functions
  - [x] 2.8 Ensure data layer tests pass
    - Run ONLY the 3 tests written in 2.1

**Acceptance Criteria:**
- The 3 tests written in 2.1 pass
- All CRUD data functions are pure Prisma queries with no business logic
- Functions follow naming convention: `[action]ProjectData` suffix
- Files follow naming convention: `[action].data.ts`
- Prisma imported from `@/lib/prisma` (existing singleton)

---

#### Task Group 3: Service Layer and Server Actions
**Dependencies:** Task Group 2

- [x] 3.0 Complete service layer and server actions
  - [x] 3.1 Write 4 focused tests for service and action layer
    - Test `createProjectService` auto-generates slug from title when slug not provided
    - Test `updateProjectService` throws UNAUTHORIZED when userId does not match
    - Test `deleteProjectService` throws NOT_FOUND for non-existent project
    - Test `createProject` action returns ActionResponse with hasError false on success
  - [x] 3.2 Create `features/projects/services/project.service.ts`
    - `createProjectService`: accept input with userId, auto-generate slug from title (lowercase, replace spaces/special chars with hyphens) if slug not provided, trim strings, call createProjectData
    - `updateProjectService`: accept input with userId, check ownership (getById then compare userId), trim strings, call updateProjectData
    - `deleteProjectService`: accept id and userId, check ownership, if project has imageUrl call deleteProjectImage to clean up blob storage, call deleteProjectData
    - `getProjectsService`: accept userId, call getProjectsByUserIdData
    - Follow pattern from `features/timeline/services/experience.service.ts`
  - [x] 3.3 Create `features/projects/actions/createProject.ts`
    - `"use server"` directive
    - Authenticate via `auth.api.getSession` with `headers: await headers()`
    - Validate with `createProjectSchema.validate()`
    - Call `createProjectService` with userId from session
    - `revalidatePath('/dashboard/projects')` and portfolio paths
    - Return `ActionResponse<Project>` via `actionWrapper`
    - Follow pattern from `features/timeline/actions/createExperience.ts`
  - [x] 3.4 Create `features/projects/actions/updateProject.ts`
    - Same pattern as createProject but with `updateProjectSchema`
    - Call `updateProjectService`
  - [x] 3.5 Create `features/projects/actions/deleteProject.ts`
    - Same pattern as createProject but with `deleteProjectSchema`
    - Call `deleteProjectService`
  - [x] 3.6 Create `features/projects/actions/getProjects.ts`
    - `"use server"` directive
    - Authenticate, call `getProjectsService`
    - Return `ActionResponse<Project[]>` via `actionWrapper`
  - [x] 3.7 Create `features/projects/actions/index.ts` barrel export
    - Re-export all action functions
  - [x] 3.8 Ensure service and action tests pass
    - Run ONLY the 4 tests written in 3.1

**Acceptance Criteria:**
- The 4 tests written in 3.1 pass
- Service layer contains business logic (ownership checks, slug generation, string trimming, blob cleanup)
- Actions use `actionWrapper`, Yup validation, session auth, and `revalidatePath`
- Three-layer separation is maintained: action -> service -> data
- Constants from `messages.ts` used for all error messages

---

### Image Upload Layer

#### Task Group 4: Vercel Blob Image Upload Actions
**Dependencies:** Task Group 1 (types and constants only)

- [x] 4.0 Complete image upload and deletion actions
  - [x] 4.1 Write 3 focused tests for image upload actions
    - Test `uploadProjectImage` rejects files over 5MB with size error message
    - Test `uploadProjectImage` rejects invalid file types (e.g., .gif) with type error message
    - Test `deleteProjectImage` calls blob delete with correct URL
  - [x] 4.2 Install `@vercel/blob` package
    - Run `bun add @vercel/blob`
  - [x] 4.3 Create `features/projects/actions/uploadProjectImage.ts`
    - `"use server"` directive
    - Accept `formData: FormData` containing a File
    - Validate file type (PNG, JPG/JPEG, WEBP) -- reject others with `PROJECT_MESSAGES.UPLOAD_TYPE_ERROR`
    - Validate file size (max 5MB) -- reject others with `PROJECT_MESSAGES.UPLOAD_SIZE_ERROR`
    - Upload to Vercel Blob using `put()` from `@vercel/blob`
    - Return `ActionResponse<{ url: string }>` via `actionWrapper`
    - This action is separate from project CRUD -- the form uploads the image first, then stores the URL
  - [x] 4.4 Create `features/projects/actions/deleteProjectImage.ts`
    - `"use server"` directive
    - Accept the blob URL string
    - Call `del()` from `@vercel/blob` to remove from storage
    - Return `ActionResponse<void>` via `actionWrapper`
  - [x] 4.5 Ensure image upload tests pass
    - Run ONLY the 3 tests written in 4.1

**Acceptance Criteria:**
- The 3 tests written in 4.1 pass
- `@vercel/blob` package is installed
- Upload action validates file type (PNG, JPG, WEBP) and size (max 5MB)
- Delete action cleans up blob storage
- Both actions use `actionWrapper` for consistent error handling
- Actions are standalone (not coupled to project CRUD)

---

### Dashboard Form

#### Task Group 5: Project Form Component
**Dependencies:** Task Groups 1, 3, 4

- [x] 5.0 Complete the dashboard project form
  - [x] 5.1 Write 4 focused tests for ProjectForm component
    - Test form renders all required fields (title, description, startDate, status)
    - Test form shows validation errors when submitting empty required fields
    - Test form populates fields correctly in edit mode when `project` prop is provided
    - Test technologies SkillTagInput adds and removes tags
  - [x] 5.2 Create `features/projects/components/ProjectForm.tsx`
    - `"use client"` directive
    - Use `react-hook-form` with `yupResolver(createProjectSchema)` (or updateProjectSchema in edit mode)
    - Use `useTransition` + server action + `toast` (sonner) pattern for submission
    - Import `useTranslations('projects')` from next-intl for all labels
    - Use shadcn Form, FormField, FormItem, FormLabel, FormControl, FormMessage components
    - Fields:
      - Title: `Input` component
      - Slug: `Input` component, auto-generate from title on blur (if empty), editable
      - Short Description: `Input` component (max 200 chars)
      - Full Description: `textarea` element (larger, max 5000 chars)
      - Image Upload: File input with drag-and-drop zone, preview of uploaded image via Next.js `Image`, remove button that calls `deleteProjectImage`
      - Technologies: Reuse `SkillTagInput` from `features/timeline/components/SkillTagInput.tsx` with maxTags=15
      - Links: Dynamic list -- add/remove rows, each row has: type `select` (options from PROJECT_LINK_TYPES), label `Input` (max 50), url `Input`
      - Featured: Checkbox or switch toggle
      - Status: `select` with options IN_PROGRESS, COMPLETED, ARCHIVED
      - Start Date: `Input` type="date"
      - End Date: `Input` type="date" (optional)
    - Support create mode (no project prop) and edit mode (project prop provided)
    - Use `memo` wrapper like ExperienceForm
    - Follow pattern from `features/timeline/components/ExperienceForm.tsx`
  - [x] 5.3 Create image upload dropzone sub-component within ProjectForm (or as a separate `ImageUpload.tsx`)
    - Drag-and-drop zone with file picker fallback
    - Show preview thumbnail using Next.js `Image` component
    - "Remove" button calls `deleteProjectImage` action then clears imageUrl
    - Loading state during upload
    - Display accepted formats and max size to user
  - [x] 5.4 Create dynamic links list sub-component within ProjectForm (or as a separate `LinksFieldArray.tsx`)
    - "Add Link" button appends a new row `{ type: 'LIVE', label: '', url: '' }`
    - Each row: type select + label input + url input + remove button
    - Use `useFieldArray` from react-hook-form for managing the array
  - [x] 5.5 Ensure ProjectForm tests pass
    - Run ONLY the 4 tests written in 5.1

**Acceptance Criteria:**
- The 4 tests written in 5.1 pass
- Form supports both create and edit modes
- Image upload works independently from project CRUD
- Technologies field reuses SkillTagInput with maxTags=15
- Dynamic links list supports add/remove with type/label/url per row
- All labels use `useTranslations` for i18n
- Form follows `useTransition` + server action + toast pattern
- Uses shadcn Form components (FormField, FormItem, FormLabel, FormControl, FormMessage)

---

### Portfolio Display Layer

#### Task Group 6: Professional and Gaming Project Cards
**Dependencies:** Task Groups 1, 2 (model + data types)

- [x] 6.0 Complete portfolio project card display for both modes
  - [x] 6.1 Write 4 focused tests for project card components
    - Test ProfessionalProjects renders project cards with title, description, and technology badges
    - Test ProfessionalProjects renders featured projects first with featured indicator
    - Test GamingProjects renders GamingCard with variant="featured" for featured projects
    - Test GamingProjects renders StatCard with correct project count
  - [x] 6.2 Update `features/portfolio/types/portfolio.ts`
    - Change `ProjectData` type from `ExperienceModel` to the new `Project` model type from `@/app/generated/prisma/models/Project`
    - Remove the `ExperienceModel` import if no longer needed for ProjectData
    - `PortfolioData.projects` type updates automatically since it uses `ProjectData[]`
  - [x] 6.3 Update `features/portfolio/data/getPublicProjects.data.ts`
    - Query `prisma.project.findMany()` instead of `prisma.experience.findMany()` with type filter
    - Order by: featured desc (featured first), then order asc (nulls last), then startDate desc
    - Return type becomes `Project[]` (new model)
  - [x] 6.4 Update `features/portfolio/components/professional/ProfessionalProjects.tsx`
    - Consume updated `ProjectData` type shape (new Project model fields)
    - Card layout: cover image thumbnail at top using Next.js `Image` (if imageUrl exists), title, shortDescription (or truncated description), technology badges (rounded-full bg-gray-100 style), link icon buttons (small icons per link type), featured indicator (blue-600 left border or "Featured" badge)
    - Featured projects render first in grid (already handled by data ordering)
    - Grid layout: `grid gap-4 md:grid-cols-2` (preserve existing)
    - Make cards clickable: `onClick` opens the detail modal (pass project to state)
    - Add `useState` for selected project and modal open state
    - Render `ProjectDetailModal` at the bottom of the section
  - [x] 6.5 Update `features/portfolio/components/gaming/GamingProjects.tsx`
    - Consume updated `ProjectData` type shape (new Project model fields)
    - Use `GamingCard` with `variant="glow"` for standard and `variant="featured"` for featured projects
    - Card layout: cover image with cyberpunk gradient overlay (cyan/magenta), GamingCardTitle, shortDescription, GamingBadge color="cyan" for technologies, GamingButton variant="outline" size="sm" for link buttons
    - Preserve StatCard at top with project count and FolderOpen icon
    - Make cards clickable: `onClick` opens the gaming-styled detail modal
    - Add `useState` for selected project and modal open state
    - Render `ProjectDetailModal` at the bottom with mode="gaming"
  - [x] 6.6 Ensure portfolio card tests pass
    - Run ONLY the 4 tests written in 6.1

**Acceptance Criteria:**
- The 4 tests written in 6.1 pass
- `ProjectData` type is updated from ExperienceModel to new Project model
- Public data query fetches from `project` table with correct ordering (featured first)
- Professional cards show image, title, shortDescription, tech badges, link icons, featured indicator
- Gaming cards use correct GamingCard variants (glow/featured), GamingBadge, GamingButton
- Cards are clickable and open detail modal
- Grid layout `grid gap-4 md:grid-cols-2` is preserved

---

#### Task Group 7: Project Detail Modal
**Dependencies:** Task Group 6

- [x] 7.0 Complete project detail modal for both modes
  - [x] 7.1 Write 4 focused tests for ProjectDetailModal
    - Test modal renders project title, full description, and all technology badges when open
    - Test modal renders all project links as labeled buttons/anchors
    - Test modal closes when onClose callback is triggered
    - Test modal uses AnimatePresence for open/close animation
  - [x] 7.2 Install shadcn Dialog component
    - Run `npx shadcn@latest add dialog` (adds to `features/shadcn/ui/`)
    - Verify Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription are available
  - [x] 7.3 Create `features/projects/components/ProjectDetailModal.tsx`
    - `"use client"` directive
    - Accept props: `ProjectDetailProps` (project, mode, isOpen, onClose)
    - Professional mode rendering:
      - Use shadcn Dialog component
      - Clean white layout with full-size image (Next.js `Image`), full description, all technology badges (rounded-full bg-gray-100), all links as labeled buttons/anchors with appropriate icons per link type, dates, status badge
    - Gaming mode rendering:
      - Use HUDPanel from `features/gaming/index.tsx` as container
      - Cyberpunk-styled content: glow effects, cyan/magenta accents, GamingBadge for technologies, GamingButton for links
      - Dark overlay backdrop
    - Animate open/close with Framer Motion: `AnimatePresence` + `motion.div` with opacity and scale transitions
    - Accessibility: close on Escape key, close on backdrop click, focus trap (use Dialog's built-in for professional mode; implement manually for gaming mode)
    - Use `useTranslations('portfolio')` for label text
  - [x] 7.4 Ensure modal tests pass
    - Run ONLY the 4 tests written in 7.1

**Acceptance Criteria:**
- The 4 tests written in 7.1 pass
- Modal renders differently based on mode prop (professional vs gaming)
- Professional mode uses shadcn Dialog with clean white layout
- Gaming mode uses HUDPanel with cyberpunk styling
- Framer Motion AnimatePresence handles open/close animations
- Accessibility: Escape to close, backdrop click to close, focus management
- All project data displayed: image, title, description, technologies, links, dates, status

---

### i18n Layer

#### Task Group 8: Translation Keys and Integration Verification
**Dependencies:** Task Groups 5, 6, 7

- [x] 8.0 Complete i18n translation keys and verify integration
  - [x] 8.1 Write 2 focused tests for i18n integration
    - Test ProjectForm renders translated labels when locale is EN
    - Test ProfessionalProjects renders translated section title
  - [x] 8.2 Add `projects` namespace keys to `messages/en.json`
    - Form labels: title, slug, shortDescription, description, imageUpload, technologies, links, featured, status, startDate, endDate
    - Form placeholders for each field
    - Status labels: inProgress, completed, archived
    - Link type labels: live, repo, docs, video, caseStudy, other
    - Success/error toast messages matching PROJECT_MESSAGES keys
    - Empty state text
    - Modal: closeButton, featuredBadge
    - Validation messages
  - [x] 8.3 Add `projects` namespace keys to `messages/es.json`
    - Spanish translations for all keys added in 8.2
  - [x] 8.4 Add portfolio projects section keys to existing `portfolio` namespace in both `en.json` and `es.json`
    - Update section titles if needed for new model context
    - Add link type labels, status labels, featured badge text for portfolio display
    - Add modal-specific labels (close, viewProject, etc.)
  - [x] 8.5 Ensure i18n tests pass
    - Run ONLY the 2 tests written in 8.1

**Acceptance Criteria:**
- The 2 tests written in 8.1 pass
- All user-facing strings in ProjectForm use `useTranslations('projects')`
- All user-facing strings in portfolio components use `useTranslations('portfolio')`
- EN and ES translations are complete for both namespaces
- No hardcoded user-facing strings remain in any component

---

## Execution Order

Recommended implementation sequence:

```
1. Task Group 1: Project Model, Types, Constants, Schemas (foundation)
       |
       +---> 2. Task Group 2: Data Layer (depends on model)
       |            |
       |            +---> 3. Task Group 3: Service Layer & Actions (depends on data)
       |                         |
       +---> 4. Task Group 4: Image Upload (depends on types/constants only)
       |                         |
       |                         v
       +------------> 5. Task Group 5: Dashboard Form (depends on TG1, TG3, TG4)
       |
       +---> 6. Task Group 6: Portfolio Cards (depends on TG1, TG2)
                     |
                     +---> 7. Task Group 7: Detail Modal (depends on TG6)
                                  |
                                  v
                     8. Task Group 8: i18n Keys (depends on TG5, TG6, TG7)
```

**Parallelization opportunities:**
- Task Group 2 and Task Group 4 can run in parallel (both depend only on TG1)
- Task Group 5 and Task Group 6 can start in parallel once their dependencies are met (TG5 needs TG3+TG4; TG6 needs TG1+TG2)

**Strict sequential dependencies:**
- TG1 must complete before anything else
- TG2 must complete before TG3
- TG3 + TG4 must complete before TG5
- TG6 must complete before TG7
- TG5, TG6, TG7 must complete before TG8

## Notes

- **Database**: This project uses MongoDB Atlas (see `datasource db { provider = "mongodb" }` in schema.prisma). Prisma on MongoDB uses `@map("_id")` for ID fields and does not support traditional SQL indexes -- `@@index` directives create MongoDB indexes.
- **Prisma imports**: Use `@/lib/prisma` for the Prisma singleton (matching existing data layer imports like `getPublicProjects.data.ts`).
- **Generated types**: Prisma types are generated to `@/app/generated/prisma/` (see generator output in schema). Import model types from `@/app/generated/prisma/models/` and enums from `@/app/generated/prisma/enums`.
- **Gaming components**: All gaming UI primitives come from the single barrel file `features/gaming/index.tsx` -- import GamingCard, GamingBadge, GamingButton, StatCard, HUDPanel from `@/features/gaming`.
- **shadcn location**: All shadcn components live under `features/shadcn/ui/`.
- **Existing SkillTagInput**: Reuse directly from `features/timeline/components/SkillTagInput.tsx` -- do not duplicate.
- **Out of scope per spec**: Responsive/mobile optimizations, automated testing beyond what is defined here, migration of existing Experience PROJECT records, search/filter on public portfolio, project categories, analytics, collaborative projects, AI descriptions.
