# Task Breakdown: Timeline Feature

## Overview
Total Tasks: 48 sub-tasks across 6 task groups
Feature: Interactive career timeline with Google Maps background and hexagonal nodes

## Visual Reference
- `planning/visuals/image1.png` - Full dashboard layout with stats bar, filter tabs, experience cards
- `planning/visuals/image.png` - Timeline continuation with experience types and "MI JOURNEY" sidebar

## Existing Components to Reuse
From `C:/Users/user/code/nextjs/portfoland/features/gaming/index.tsx`:
- `GamingCard`, `GamingCardHeader`, `GamingCardTitle`, `GamingCardContent` - Experience cards
- `GamingButton` - Add/filter/action buttons
- `GamingInput` - Form fields
- `StatCard` - Stats display (XP, milestones, etc.)
- `XPBar` - Level progression bar
- `LevelBadge` - User level display
- `HUDPanel` - Section panels with accent lines
- `GamingBadge` - Type badges (TRABAJO, EDUCACION, etc.)
- `GamingAvatar` - User avatar with frame

From `C:/Users/user/code/nextjs/portfoland/backups/design-idea/components/gaming/index.tsx`:
- `TimelineEvent` - Complete component for mobile vertical timeline fallback
- `CategoryPill` - Filter tabs component
- `NavTab` - Navigation tabs

---

## Task List

### Task Group 1: Foundation - Data Layer
**Dependencies:** None
**Complexity:** Medium

- [ ] 1.0 Complete database layer for experiences
  - [ ] 1.1 Write 4-6 focused tests for Experience model functionality
    - Test experience creation with valid data
    - Test experience type enum validation (WORK, EDUCATION, PROJECT, CERTIFICATION)
    - Test user-experience relationship (userId foreign key)
    - Test XP calculation by type
    - Test coordinate validation (latitude, longitude)
  - [ ] 1.2 Add Experience model to Prisma schema
    - **File:** `C:/Users/user/code/nextjs/portfoland/prisma/schema.prisma`
    - Fields: id (cuid), userId, type (enum), title, company, latitude (Float), longitude (Float), address, startDate, endDate (nullable), description, skills (String[]), xp (Int), createdAt, updatedAt
    - Add ExperienceType enum: WORK, EDUCATION, PROJECT, CERTIFICATION
    - Add relation to User model with Cascade delete
    - Add @@index([userId])
    - Add @@map("experiences")
  - [ ] 1.3 Create and run migration
    - Run `npx prisma generate` to update client
    - Run `npx prisma db push` for MongoDB
  - [ ] 1.4 Create Experience types file
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/types/experience.ts`
    - Re-export Prisma types: Experience, ExperienceType
    - Create derived types: ExperienceWithUser, CreateExperienceInput, UpdateExperienceInput
    - Create component props: ExperienceCardProps, TimelineMapProps, HexagonNodeProps
  - [ ] 1.5 Create XP calculation constants
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/constants/xp.ts`
    - XP_VALUES: { WORK: 500, PROJECT: 350, CERTIFICATION: 400, EDUCATION: 200 }
    - Type color mappings: { WORK: cyan, EDUCATION: purple, PROJECT: green, CERTIFICATION: yellow }
  - [ ] 1.6 Ensure database layer tests pass
    - Run only the 4-6 tests written in 1.1
    - Verify schema generates correctly

**Acceptance Criteria:**
- Experience model exists in Prisma schema with all required fields
- Migration runs successfully
- Types are properly exported and available for import
- XP values are correctly mapped by experience type

**Files to Create/Modify:**
- `C:/Users/user/code/nextjs/portfoland/prisma/schema.prisma` (modify)
- `C:/Users/user/code/nextjs/portfoland/features/timeline/types/experience.ts` (create)
- `C:/Users/user/code/nextjs/portfoland/features/timeline/constants/xp.ts` (create)
- `C:/Users/user/code/nextjs/portfoland/features/timeline/constants/messages.ts` (create)

---

### Task Group 2: Foundation - Data Access Layer
**Dependencies:** Task Group 1
**Complexity:** Medium

- [ ] 2.0 Complete data access layer for experiences
  - [ ] 2.1 Write 4-6 focused tests for data layer functions
    - Test getExperiencesByUserId returns sorted by date
    - Test getExperienceById with valid/invalid ID
    - Test createExperience creates with correct XP
    - Test updateExperience updates fields correctly
    - Test deleteExperience removes record
  - [ ] 2.2 Create getExperiencesByUserId data function
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/data/getExperiences.data.ts`
    - Query experiences by userId, ordered by startDate DESC
    - Include calculated stats (total XP, counts by type)
  - [ ] 2.3 Create getExperienceById data function
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/data/getExperienceById.data.ts`
    - Query single experience by id with user validation
  - [ ] 2.4 Create createExperience data function
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/data/createExperience.data.ts`
    - Auto-calculate XP based on type from constants
    - Set createdAt/updatedAt timestamps
  - [ ] 2.5 Create updateExperience data function
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/data/updateExperience.data.ts`
    - Recalculate XP if type changes
    - Validate userId ownership
  - [ ] 2.6 Create deleteExperience data function
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/data/deleteExperience.data.ts`
    - Verify userId ownership before delete
  - [ ] 2.7 Create getPublicTimelineByUsername data function
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/data/getPublicTimeline.data.ts`
    - Query user by username, return experiences with calculated stats
    - Return null if user not found or has no public timeline
  - [ ] 2.8 Ensure data layer tests pass
    - Run only the 4-6 tests written in 2.1

**Acceptance Criteria:**
- All data functions follow pure database query patterns
- XP is auto-calculated on create/update
- User ownership is validated for mutations
- Experiences are returned sorted chronologically

**Files to Create:**
- `C:/Users/user/code/nextjs/portfoland/features/timeline/data/getExperiences.data.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/data/getExperienceById.data.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/data/createExperience.data.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/data/updateExperience.data.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/data/deleteExperience.data.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/data/getPublicTimeline.data.ts`

---

### Task Group 3: API Layer - Server Actions
**Dependencies:** Task Group 2
**Complexity:** Medium

- [ ] 3.0 Complete API layer with server actions
  - [ ] 3.1 Write 4-6 focused tests for server actions
    - Test createExperience action validates required fields
    - Test updateExperience action revalidates paths
    - Test deleteExperience action requires authentication
    - Test actions return ActionResponse format
  - [ ] 3.2 Create Yup validation schemas
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/schemas/experience.schema.ts`
    - createExperienceSchema: title (required), company (required), type (enum), latitude (number), longitude (number), startDate (date), endDate (date nullable), description (string), skills (array)
    - updateExperienceSchema: Same as create but all fields optional
  - [ ] 3.3 Create experience service layer
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/services/experience.service.ts`
    - createExperienceService: Validate business rules, call data layer
    - updateExperienceService: Check ownership, validate updates
    - deleteExperienceService: Verify ownership, handle cascade
  - [ ] 3.4 Create createExperience server action
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/actions/createExperience.ts`
    - Use 'use server' directive
    - Wrap with actionWrapper
    - Validate with Yup schema
    - Call service layer
    - revalidatePath('/dashboard/timeline') and '/timeline/[username]'
  - [ ] 3.5 Create updateExperience server action
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/actions/updateExperience.ts`
    - Implement debounced auto-save support (500ms on client)
    - Return updated experience data
  - [ ] 3.6 Create deleteExperience server action
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/actions/deleteExperience.ts`
    - Require confirmation (handled on client)
    - Revalidate paths after deletion
  - [ ] 3.7 Ensure API layer tests pass
    - Run only the 4-6 tests written in 3.1

**Acceptance Criteria:**
- All actions use actionWrapper for consistent error handling
- Yup validation catches invalid input before processing
- Paths are revalidated after mutations
- Actions return ActionResponse<T> format

**Files to Create:**
- `C:/Users/user/code/nextjs/portfoland/features/timeline/schemas/experience.schema.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/services/experience.service.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/actions/createExperience.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/actions/updateExperience.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/actions/deleteExperience.ts`

---

### Task Group 4: UI Components - Timeline System
**Dependencies:** Task Group 1 (types only)
**Complexity:** Large

- [ ] 4.0 Complete timeline UI components
  - [ ] 4.1 Write 4-6 focused tests for UI components
    - Test HexagonNode renders with correct color by type
    - Test ExperienceCard displays all required fields
    - Test TimelineFilter toggles active state
    - Test TimelineStats calculates totals correctly
  - [ ] 4.2 Create HexagonNode component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/HexagonNode.tsx`
    - SVG hexagon shape with type-based coloring
    - Colors: WORK=#00D4FF, EDUCATION=#A855F7, PROJECT=#22C55E, CERTIFICATION=#EAB308
    - Glow effect on hover (matching type color)
    - Pulsing indicator for current position (ACTUAL)
    - onClick handler for selection
    - Props defined in types/experience.ts
  - [ ] 4.3 Create ExperienceCard component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceCard.tsx`
    - Extend existing GamingCard pattern
    - Display: GamingBadge for type, title, company, date range, description, skill tags, XP badge
    - Position calculation for map overlay (viewport containment)
    - Close button with onClose callback
    - Animated entry/exit with framer-motion
  - [ ] 4.4 Create TimelineConnections component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineConnections.tsx`
    - SVG lines connecting hexagon nodes chronologically
    - Dashed line style matching gaming aesthetic
    - Auto-calculate paths between coordinate points
  - [ ] 4.5 Create TimelineFilter component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineFilter.tsx`
    - Reuse CategoryPill component for filter tabs
    - Options: Todos, Trabajo, Educacion, Proyectos, Certificaciones
    - Active state styling (filled cyan background)
    - onFilterChange callback
  - [ ] 4.6 Create TimelineStats component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineStats.tsx`
    - Reuse StatCard component for 4 metrics
    - Display: XP Total, Hitos Completados, Experiencias Registradas, Logros Desbloqueados
    - HUD-style border with cyan accents (see image1.png)
  - [ ] 4.7 Create MobileTimelineEvent component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/MobileTimelineEvent.tsx`
    - Adapt TimelineEvent from backups for mobile vertical fallback
    - Vertical timeline with connecting line and colored dots
    - Card structure matching desktop ExperienceCard
  - [ ] 4.8 Ensure UI component tests pass
    - Run only the 4-6 tests written in 4.1

**Acceptance Criteria:**
- HexagonNode renders correctly with type-based colors and glow
- ExperienceCard displays all fields with gaming styling
- Timeline connections auto-generate between nodes
- Filter tabs toggle correctly
- Stats display calculated totals

**Files to Create:**
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/HexagonNode.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceCard.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineConnections.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineFilter.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineStats.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/MobileTimelineEvent.tsx`

---

### Task Group 5: UI Components - Map & Forms
**Dependencies:** Task Group 4
**Complexity:** Large

- [ ] 5.0 Complete map integration and form components
  - [ ] 5.1 Write 4-6 focused tests for map and form components
    - Test TimelineMap renders Google Maps with dark styling
    - Test LocationPicker returns coordinates on selection
    - Test ExperienceForm validates required fields
    - Test auto-save triggers after debounce period
  - [ ] 5.2 Install and configure @react-google-maps/api
    - Add to package.json dependencies
    - Create Google Maps API key environment variable
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/config/maps.ts`
    - Configure dark/night mode map styling
  - [ ] 5.3 Create TimelineMap component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineMap.tsx`
    - Client component with 'use client'
    - Embed Google Maps with dark styling
    - CSS filters: blur(3px) saturate(0.4) brightness(0.6) opacity(0.4)
    - Focused state: blur(6px) saturate(0.2) brightness(0.4) opacity(0.3)
    - Render HexagonNode components at experience coordinates
    - Render TimelineConnections between nodes
    - Initial view: Fit bounds to encompass all experience locations
    - Animated zoom on hexagon selection
    - Display ExperienceCard on node click
  - [ ] 5.4 Create LocationPicker component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/LocationPicker.tsx`
    - Client component with 'use client'
    - Integrate Google Places API for address autocomplete
    - Map click to select coordinates manually
    - Display selected address and coordinates
    - onLocationSelect callback with { latitude, longitude, address }
  - [ ] 5.5 Create ExperienceForm component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceForm.tsx`
    - Client component with 'use client'
    - Use GamingInput for form fields
    - Fields: title, company, type (select), location (LocationPicker), startDate, endDate, description, skills (tag input)
    - Auto-save with 500ms debounce using useTransition
    - Visual feedback indicator for save status
    - Yup validation with error display
  - [ ] 5.6 Create ExperienceFormModal component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceFormModal.tsx`
    - Modal wrapper for ExperienceForm
    - Gaming-styled modal with HUDPanel
    - Controlled open/close state
    - Support for create and edit modes
  - [ ] 5.7 Create DeleteConfirmModal component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/DeleteConfirmModal.tsx`
    - Confirmation dialog before deleting experience
    - Display experience title in message
    - Destructive action styling
  - [ ] 5.8 Create SkillTagInput component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/SkillTagInput.tsx`
    - Tag input with autocomplete from existing user skills
    - Add/remove tags with keyboard support
    - Display as CategoryPill components
  - [ ] 5.9 Ensure map and form component tests pass
    - Run only the 4-6 tests written in 5.1

**Acceptance Criteria:**
- Google Maps renders with dark styling and blur effect
- Location picker returns valid coordinates
- Form validates and submits correctly
- Auto-save triggers with visual feedback
- Modals open/close correctly

**Files to Create:**
- `C:/Users/user/code/nextjs/portfoland/features/timeline/config/maps.ts`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/TimelineMap.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/LocationPicker.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceForm.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceFormModal.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/DeleteConfirmModal.tsx`
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/SkillTagInput.tsx`

---

### Task Group 6: Pages & Integration
**Dependencies:** Task Groups 3, 4, 5
**Complexity:** Large

- [ ] 6.0 Complete pages and full integration
  - [ ] 6.1 Write 4-6 focused tests for page integration
    - Test public timeline page renders experiences
    - Test edit page requires authentication
    - Test filter changes update displayed experiences
    - Test responsive layout switches to mobile view
  - [ ] 6.2 Create public timeline page
    - **File:** `C:/Users/user/code/nextjs/portfoland/app/[locale]/timeline/[username]/page.tsx`
    - Server Component for initial data fetch
    - Call getPublicTimelineByUsername data function
    - 404 if user/timeline not found
    - Render TimelineStats, TimelineFilter, TimelineMap
    - Read-only interaction (no edit capabilities)
    - Mobile: Render MobileTimelineEvent list instead of map
  - [ ] 6.3 Create public timeline layout
    - **File:** `C:/Users/user/code/nextjs/portfoland/app/[locale]/timeline/[username]/layout.tsx`
    - Minimal layout without dashboard sidebar
    - Include user profile header
  - [ ] 6.4 Create dashboard timeline page
    - **File:** `C:/Users/user/code/nextjs/portfoland/app/[locale]/(protected)/dashboard/timeline/page.tsx`
    - Protected route (layout handles auth)
    - Server Component with initial data fetch
    - Render TimelineStats, TimelineFilter, TimelineMap
    - "Add Experience" GamingButton opens ExperienceFormModal
    - Edit/delete actions on ExperienceCard
  - [ ] 6.5 Create DashboardTimelineClient component
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/components/DashboardTimelineClient.tsx`
    - Client component for interactive dashboard features
    - Manage modal state (add/edit/delete)
    - Handle filter state
    - Coordinate map selection and card display
  - [ ] 6.6 Add timeline navigation to dashboard sidebar
    - **File:** `C:/Users/user/code/nextjs/portfoland/app/[locale]/(protected)/layout.tsx` (modify)
    - Add "Timeline" NavItem with icon
    - Active state when on /dashboard/timeline
  - [ ] 6.7 Create timeline feature barrel export
    - **File:** `C:/Users/user/code/nextjs/portfoland/features/timeline/index.ts`
    - Export all public components, types, actions, constants
  - [ ] 6.8 Add i18n translations
    - **File:** `C:/Users/user/code/nextjs/portfoland/messages/en.json` (modify)
    - **File:** `C:/Users/user/code/nextjs/portfoland/messages/es.json` (modify)
    - Add timeline namespace with all user-facing strings
    - Labels: "Mi Timeline", "Agregar nueva experiencia", filter names, etc.
  - [ ] 6.9 Ensure page integration tests pass
    - Run only the 4-6 tests written in 6.1

**Acceptance Criteria:**
- Public timeline displays at /[locale]/timeline/[username]
- Edit mode displays at /[locale]/dashboard/timeline (protected)
- Filter tabs update displayed experiences
- Add/edit/delete experiences work correctly
- Mobile responsive layout activates below 768px
- All text is internationalized (EN/ES)

**Files to Create/Modify:**
- `C:/Users/user/code/nextjs/portfoland/app/[locale]/timeline/[username]/page.tsx` (create)
- `C:/Users/user/code/nextjs/portfoland/app/[locale]/timeline/[username]/layout.tsx` (create)
- `C:/Users/user/code/nextjs/portfoland/app/[locale]/(protected)/dashboard/timeline/page.tsx` (create)
- `C:/Users/user/code/nextjs/portfoland/features/timeline/components/DashboardTimelineClient.tsx` (create)
- `C:/Users/user/code/nextjs/portfoland/app/[locale]/(protected)/layout.tsx` (modify)
- `C:/Users/user/code/nextjs/portfoland/features/timeline/index.ts` (create)
- `C:/Users/user/code/nextjs/portfoland/messages/en.json` (modify)
- `C:/Users/user/code/nextjs/portfoland/messages/es.json` (modify)

---

### Task Group 7: Test Review & Polish
**Dependencies:** Task Groups 1-6
**Complexity:** Medium

- [ ] 7.0 Review tests and polish implementation
  - [ ] 7.1 Review all tests from Task Groups 1-6
    - Database layer: 4-6 tests (Task 1.1)
    - Data layer: 4-6 tests (Task 2.1)
    - API layer: 4-6 tests (Task 3.1)
    - UI components: 4-6 tests (Task 4.1)
    - Map/forms: 4-6 tests (Task 5.1)
    - Pages: 4-6 tests (Task 6.1)
    - Total existing: approximately 24-36 tests
  - [ ] 7.2 Analyze test coverage gaps for timeline feature
    - Identify critical user workflows lacking coverage
    - Focus on end-to-end flows: create experience, view timeline, filter
    - Do NOT assess entire application coverage
  - [ ] 7.3 Write up to 8 additional strategic tests if needed
    - E2E: Complete experience creation flow
    - E2E: Public timeline viewing flow
    - E2E: Filter and navigation interaction
    - Integration: Map zoom and card display
    - Skip edge cases unless business-critical
  - [ ] 7.4 Run all timeline feature tests
    - Run only tests related to timeline feature
    - Expected total: approximately 32-44 tests
    - Do NOT run entire application test suite
  - [ ] 7.5 Verify responsive breakpoints
    - Desktop (1024px+): Full map view with hexagons
    - Tablet (768px-1023px): Simplified map with smaller hexagons
    - Mobile (<768px): Vertical timeline fallback
  - [ ] 7.6 Verify visual design matches mockups
    - Compare with planning/visuals/image1.png
    - Compare with planning/visuals/image.png
    - Verify color palette: Background #0A0E1A, Cards #0D1421
    - Verify glow effects and gaming aesthetics
  - [ ] 7.7 Performance review
    - Verify map loads efficiently
    - Check for unnecessary re-renders
    - Ensure auto-save debounce works correctly

**Acceptance Criteria:**
- All timeline feature tests pass (32-44 tests total)
- No more than 8 additional tests added
- Responsive design works at all breakpoints
- Visual design matches mockups
- Performance is acceptable

---

## Execution Order

Recommended implementation sequence:

```
1. Task Group 1: Foundation - Data Layer
   └── Prisma schema, types, constants

2. Task Group 2: Foundation - Data Access Layer
   └── Pure database query functions

3. Task Group 3: API Layer - Server Actions
   └── Validation, services, actions

4. Task Group 4: UI Components - Timeline System (can start after Group 1)
   └── HexagonNode, ExperienceCard, filters, stats

5. Task Group 5: UI Components - Map & Forms (after Group 4)
   └── Google Maps, LocationPicker, forms, modals

6. Task Group 6: Pages & Integration (after Groups 3, 4, 5)
   └── Public timeline, dashboard timeline, navigation

7. Task Group 7: Test Review & Polish (after all)
   └── Test gaps, responsive verification, visual polish
```

**Parallel Execution Opportunities:**
- Task Groups 1-3 (backend) can progress in parallel with Task Group 4 (frontend components) after types are defined in Group 1
- Task Groups 4 and 5 can have some overlap once HexagonNode is complete

---

## Technical Notes

### Dependencies to Install
```bash
npm install @react-google-maps/api
```

### Environment Variables Required
```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Key Patterns to Follow
- Three-layer architecture: Action -> Service -> Data (per api.md)
- actionWrapper for all server actions
- Yup validation schemas
- Props interfaces in /types directory (never in component files)
- Server Components by default, Client Components only when needed
- useTransition + Server Action + Toast for client mutations

### Color Reference
| Type | Color | Hex |
|------|-------|-----|
| Work | Cyan | #00D4FF |
| Education | Purple | #A855F7 |
| Project | Green | #22C55E |
| Certification | Yellow | #EAB308 |
| Background | Dark Blue | #0A0E1A |
| Cards | Dark Blue | #0D1421 |

### XP Values
| Type | XP |
|------|-----|
| Work | 500 |
| Certification | 400 |
| Project | 350 |
| Education | 200 |
