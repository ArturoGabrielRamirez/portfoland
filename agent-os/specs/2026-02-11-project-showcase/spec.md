# Specification: Project Showcase

## Goal
Build a complete project showcase system with a dedicated Prisma model, file upload for cover images, flexible multi-type links, a dedicated dashboard form, dual-mode portfolio display (Professional and Gaming), and a modal detail view -- replacing the current Experience-based project display.

## User Stories
- As a portfolio owner, I want to create rich project entries with images, tech stacks, and multiple links so that recruiters and clients can evaluate my work
- As a portfolio visitor, I want to click a project card and see an expanded detail view with full description, all links, and a larger image so I can understand the project in depth
- As a portfolio owner, I want to mark projects as featured so they appear more prominently in both Professional and Gaming modes

## Specific Requirements

**New Project Prisma Model**
- Create a `Project` model in `prisma/schema.prisma`, completely separate from the `Experience` model
- Fields: `id` (cuid, @map("_id")), `userId` (relation to User with onDelete: Cascade), `title` (String, required), `slug` (String, unique per user for URL-friendly identification), `description` (String, required, longer format up to 5000 chars), `shortDescription` (String, optional, for card previews up to 200 chars), `imageUrl` (String, optional, stores uploaded image URL), `technologies` (String[]), `links` (Json, stores array of `{ type, label, url }` objects), `featured` (Boolean, default false), `status` (enum: IN_PROGRESS, COMPLETED, ARCHIVED), `startDate` (DateTime), `endDate` (DateTime, optional), `order` (Int, optional for custom sort), `createdAt`/`updatedAt` timestamps
- Add a `ProjectStatus` enum to the schema
- Create `@@map("projects")`, add `@@index([userId])` and `@@unique([userId, slug])`
- Add `projects Project[]` relation to the User model
- The link types to support in the Json array: LIVE, REPO, DOCS, VIDEO, CASE_STUDY, OTHER

**Image Upload with Vercel Blob**
- Use the `@vercel/blob` package for file storage, integrated with a Next.js server action
- Create an `uploadProjectImage` server action that accepts a File, validates type (PNG, JPG, WEBP) and size (max 5MB), uploads to Vercel Blob, and returns the public URL
- Create a corresponding `deleteProjectImage` action to clean up blob storage on image removal or project deletion
- Use Next.js `Image` component with the blob URL for display in cards and detail views
- The upload action should be separate from the project CRUD actions so the form can upload the image independently and store only the resulting URL

**Feature Directory Structure**
- Create `features/projects/` with subdirectories: `components/`, `types/`, `data/`, `actions/`, `services/`, `constants/`, `schemas/`
- Follow the three-layer architecture: action (validation + actionWrapper + revalidation) -> service (business logic + ownership checks) -> data (pure Prisma queries)
- Export types from `features/projects/types/project.ts` re-exporting the Prisma-generated `ProjectModel` type and defining derived types (CreateProjectInput, UpdateProjectInput, ProjectLink, ProjectCardProps, ProjectDetailProps, etc.)
- Define constants in `features/projects/constants/messages.ts` for all user-facing messages (create/update/delete success, not found, unauthorized, upload errors)

**Yup Validation Schemas**
- Create `features/projects/schemas/project.schema.ts` with `createProjectSchema`, `updateProjectSchema`, and `deleteProjectSchema`
- Validate links as an array of objects with `type` (oneOf the link type enum values), `label` (string, max 50 chars), and `url` (string, url format)
- Validate technologies as an array of strings (max 15 items)
- Validate imageUrl as optional string with url format
- Validate slug as lowercase alphanumeric with hyphens, auto-generated from title if not provided
- Use these schemas both in server actions (via yupResolver-compatible validate) and in the client form (via yupResolver for react-hook-form)

**Server Actions (CRUD)**
- `createProject`: validate with createProjectSchema, auto-generate slug from title, call service, revalidate `/dashboard/projects` and portfolio paths
- `updateProject`: validate with updateProjectSchema, call service with ownership check, revalidate same paths
- `deleteProject`: validate with deleteProjectSchema, delete associated blob image if exists, call service, revalidate same paths
- `getProjects`: fetch all projects for the authenticated user, ordered by `order` then `createdAt` desc
- All actions use `actionWrapper` from `@/features/core` and authenticate via `auth.api.getSession`

**Dedicated Project Form**
- Create `features/projects/components/ProjectForm.tsx` as a client component using react-hook-form + yupResolver pattern from ExperienceForm
- Form fields: title, slug (auto-generated, editable), short description, full description (textarea, larger), image upload dropzone, technologies (reuse SkillTagInput from `features/timeline/components/SkillTagInput.tsx`), dynamic links list (add/remove rows, each row has type select + label input + url input), featured toggle (switch or checkbox), status select, start date, end date
- Image upload section: drag-and-drop zone or file picker, preview of uploaded image, remove button
- The form follows the `useTransition` + server action + toast (sonner) pattern for submission
- Support both create and edit modes based on whether a `project` prop is provided
- All form labels must use `useTranslations` from next-intl for EN/ES i18n

**Professional Mode Project Cards**
- Replace the current `ProfessionalProjects` component content to use the new Project model data shape
- Card layout: cover image thumbnail at top (if available, use Next.js Image), title, short description, technology badges (rounded-full bg-gray-100 style, matching existing pattern), link icon buttons (small icons per link type), featured indicator (subtle blue-600 accent border or badge)
- Featured projects: render first in the grid, with a subtle highlight (e.g., blue-600 left border or "Featured" badge)
- Grid layout: `grid gap-4 md:grid-cols-2` matching existing pattern
- Cards are clickable; clicking opens the detail modal

**Gaming Mode Project Cards**
- Replace the current `GamingProjects` component content to use the new Project model data shape
- Use `GamingCard` with `variant="glow"` for standard projects and `variant="featured"` for featured projects
- Card layout: cover image with cyberpunk overlay effect (gradient overlay in cyan/magenta), title in GamingCardTitle, short description, GamingBadge (color="cyan") for technologies, link buttons styled with GamingButton (variant="outline", size="sm")
- Keep the StatCard at the top showing project count with FolderOpen icon
- Cards are clickable; clicking opens the gaming-styled detail modal

**Project Detail Modal**
- Create a shared `ProjectDetailModal` client component that renders differently based on the portfolio mode prop
- Professional mode: use shadcn Dialog component (add to `features/shadcn/ui/` if not installed), clean white layout with full-size image, full description, all technology badges, all links as labeled buttons, dates, and status
- Gaming mode: use HUDPanel-styled overlay/modal with glow effects, cyberpunk-styled content matching the gaming aesthetic
- Animate open/close with Framer Motion (`AnimatePresence` + `motion.div` with opacity and scale/slide transitions)
- Modal receives the full project data and mode as props; accessibility: trap focus, close on Escape, close on backdrop click

**Public Portfolio Data Integration**
- Update `getPublicProjectsByUsername` in `features/portfolio/data/getPublicProjects.data.ts` to query the new `Project` model instead of `Experience` with `type: PROJECT`
- Update the `ProjectData` type in `features/portfolio/types/portfolio.ts` from `ExperienceModel` to the new Project model type
- Update `PortfolioData.projects` type accordingly
- Ensure projects are ordered by: featured first, then by `order` field, then by `startDate` desc
- Both `ProfessionalProjects` and `GamingProjects` components consume the updated data shape

**i18n Translation Keys**
- Add translation keys for EN and ES locales covering: form labels, form placeholders, validation messages, status labels (In Progress, Completed, Archived), link type labels, section titles, empty states, modal close button, featured badge text, success/error toast messages
- Follow existing pattern using `useTranslations('projects')` namespace for dashboard form and `useTranslations('portfolio')` namespace for portfolio display sections

## Visual Design
No spec-specific visuals were provided. The design follows these established patterns from `agent-os/product/visuals/`:

**Product design references (dashboard-v1/v2, timeline-v1/v2, skilltree-v1/v2)**
- Professional mode: white background, gray-900 text, gray-100 borders and badge backgrounds, blue-600 accent for interactive elements and featured highlights
- Gaming mode: dark background #0A0E1A, card bg #0D1421, border #1E293B, cyan #00D4FF primary accent, magenta #D946EF secondary, glow box-shadow effects on hover
- Cards use rounded-xl corners with transition-all duration-300 for hover states
- Gaming stat cards at section tops match the StatCard pattern (colored icon + large number + label)
- HUD panels with top/bottom gradient accent lines for container elements
- Featured items get enhanced glow treatment (variant="featured" on GamingCard)

## Existing Code to Leverage

**`features/gaming/index.tsx` - Gaming UI component library**
- Provides GamingCard (variants: default, glow, featured, magenta, green), GamingCardHeader, GamingCardTitle, GamingCardContent, GamingBadge (colors: cyan, magenta, green, yellow, purple, gray), GamingButton, StatCard, HUDPanel
- Reuse GamingCard variant="glow" for standard project cards and variant="featured" for featured project cards in gaming mode
- Reuse GamingBadge color="cyan" for technology badges in gaming mode
- Reuse HUDPanel for the gaming mode detail modal container
- Reuse StatCard for the project count indicator at the top of gaming projects section

**`features/timeline/` - Three-layer architecture reference**
- Actions pattern: `createExperience.ts` shows `actionWrapper` usage, session auth via `auth.api.getSession`, Yup `schema.validate()`, service call, `revalidatePath`, and `ActionResponse<T>` return
- Service pattern: `experience.service.ts` shows ownership validation (getById then check userId), business logic (coordinate validation, date validation), trimming strings, and orchestrating data calls
- Data pattern: `createExperience.data.ts` shows pure Prisma query with typed input interface and Promise return
- Schema pattern: `experience.schema.ts` shows Yup schemas for create/update/delete with `InferType` exports
- Type pattern: `experience.ts` shows re-exporting Prisma model types, defining derived types (CreateInput, UpdateInput), and component prop interfaces
- Replicate this exact layered structure for the projects feature

**`features/timeline/components/ExperienceForm.tsx` and `SkillTagInput.tsx` - Form patterns**
- ExperienceForm uses react-hook-form with yupResolver, FormField/FormItem/FormLabel/FormControl/FormMessage from shadcn/ui form, useTransition + saveStatus pattern, memo wrapper
- SkillTagInput provides tag input with keyboard support (Enter, comma, Backspace), max tags limit, and tag display with remove buttons
- Directly reuse SkillTagInput for the technologies field in the ProjectForm
- Follow the same form structure and shadcn form component imports for ProjectForm

**`features/portfolio/components/professional/ProfessionalProjects.tsx` and `gaming/GamingProjects.tsx` - Current display components**
- These components currently consume `PortfolioSectionProps` with `data.projects` typed as `ExperienceModel[]`
- They will be updated in-place to consume the new Project model data shape
- The grid layout pattern (`grid gap-4 md:grid-cols-2`) and section structure should be preserved
- The gaming version's StatCard and empty state patterns should be preserved

**`features/shadcn/ui/` - Available shadcn components**
- Currently installed: avatar, badge, button, card, dropdown-menu, form, input, label, sonner
- Dialog component will need to be added (`npx shadcn@latest add dialog`) for the professional mode detail modal
- Card, Form, Input, Label, Button, Badge are all available for immediate use in the project form and professional mode cards

## Out of Scope
- Project categories or tags beyond the technologies/skills string array
- Sorting or filtering controls for public portfolio visitors (only admin ordering via the `order` field)
- Project analytics such as view counts or click tracking
- Migration of existing Experience records with `type: PROJECT` to the new Project model (separate migration effort)
- Project search or filter functionality on the public portfolio page
- Collaborative projects linking multiple users to a single project
- Project comments, endorsements, or social features
- AI-generated project descriptions (reserved for Phase 4)
- Responsive/mobile-specific layout optimizations (separate spec for responsive pass)
- Automated testing for this feature (separate spec for test pass)
