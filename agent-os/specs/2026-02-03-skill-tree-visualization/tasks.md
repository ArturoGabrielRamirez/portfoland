# Task Breakdown: Skill Tree Visualization

## Overview

**Total Tasks:** 58 sub-tasks across 6 task groups
**Estimated Duration:** 5-7 days
**Feature Path:** `features/skills/`

## Task List

---

### Foundation Layer

#### Task Group 1: Constants, Types, and Schema Setup
**Dependencies:** None
**Size:** Medium
**Specialist:** Backend Engineer

- [x] 1.0 Complete foundation layer setup
  - [x] 1.1 Write 4-6 focused tests for XP calculation and level determination
    - Test duration-weighted XP calculation (1-6mo, 6-12mo, 1-2yr, 2+yr)
    - Test self-assessment XP values (Beginner, Intermediate, Advanced)
    - Test level threshold determination (Novice through Master)
    - Test total XP aggregation from multiple sources
    - **File:** `features/skills/__tests__/skill-xp.test.ts`
  - [x] 1.2 Create skill XP constants file
    - Define `SKILL_LEVEL_THRESHOLDS` (0-199, 200-499, 500-999, 1000-1999, 2000+)
    - Define `SKILL_LEVEL_NAMES` (Novice, Apprentice, Journeyman, Expert, Master)
    - Define `DURATION_XP_VALUES` for experience-linked skills
    - Define `SELF_ASSESSMENT_XP_VALUES` for manual skills
    - Create `calculateDurationXP(startDate, endDate)` utility
    - Create `calculateLevelFromXP(totalXP)` utility
    - **File:** `features/skills/constants/xp.ts`
  - [x] 1.3 Create skill category constants
    - Define `DEFAULT_CATEGORIES` array with 6 predefined categories
    - Define `CATEGORY_COLORS` (Core: cyan, Frontend: purple, Backend: green, DevOps: orange, Design: pink, Soft Skills: yellow)
    - Define `CATEGORY_ICONS` mapping
    - **File:** `features/skills/constants/categories.ts`
  - [x] 1.4 Create skill level visual constants
    - Define `LEVEL_VISUAL_STYLES` for L1-L5 (opacity, glow, effects)
    - Define level-specific Tailwind classes
    - **File:** `features/skills/constants/levels.ts`
  - [x] 1.5 Create message constants for i18n
    - Define `SKILL_MESSAGES` for success/error messages
    - Support EN/ES following existing pattern
    - **File:** `features/skills/constants/messages.ts`
  - [x] 1.6 Create skill types file
    - Re-export Prisma types: `Skill`, `SkillCategory`, `UserSkill`, `SkillSource`
    - Define `SourceType` enum (EXPERIENCE, MANUAL)
    - Define `SkillLevel` enum (1-5)
    - Define input types: `CreateSkillInput`, `UpdateSkillInput`, `CreateCategoryInput`
    - Define component props interfaces
    - **File:** `features/skills/types/skill.ts`
  - [x] 1.7 Create Yup validation schemas
    - `createSkillSchema` - name (required), categoryId, selfAssessmentLevel
    - `updateSkillSchema` - partial fields
    - `createCategorySchema` - name (required), color
    - `manualSkillEntrySchema` - name, level, category, learningSources, dateStarted
    - **File:** `features/skills/schemas/skill.schema.ts`
  - [x] 1.8 Ensure foundation tests pass
    - Run tests from 1.1
    - Verify XP calculations work correctly
    - **Command:** `npm test -- features/skills/__tests__/skill-xp.test.ts`

**Acceptance Criteria:**
- All XP calculation tests pass
- Constants properly typed with TypeScript
- Types extend/re-export Prisma types correctly
- Validation schemas cover all input scenarios

---

### Database Layer

#### Task Group 2: Data Models and Migrations
**Dependencies:** Task Group 1
**Size:** Large
**Specialist:** Database Engineer

- [x] 2.0 Complete database layer
  - [x] 2.1 Write 4-6 focused tests for data models
    - Test Skill model creation with required fields
    - Test SkillCategory model with isDefault flag
    - Test UserSkill model with XP aggregation
    - Test SkillSource model with EXPERIENCE and MANUAL types
    - Test cascade deletion behavior
    - **File:** `features/skills/__tests__/skill-model.test.ts`
  - [x] 2.2 Add SourceType enum to Prisma schema
    - Values: EXPERIENCE, MANUAL
    - **File:** `prisma/schema.prisma`
  - [x] 2.3 Create Skill model in Prisma schema
    - Fields: id (cuid), name, slug, categoryId, iconName (optional), isCore (boolean)
    - Relations: category (SkillCategory), userSkills (UserSkill[])
    - Indexes: slug (unique), categoryId
    - **File:** `prisma/schema.prisma`
  - [x] 2.4 Create SkillCategory model in Prisma schema
    - Fields: id (cuid), name, slug, color, isDefault (boolean), userId (nullable)
    - Relations: skills (Skill[]), user (User, optional)
    - Indexes: slug (unique per user), userId
    - **File:** `prisma/schema.prisma`
  - [x] 2.5 Create UserSkill model in Prisma schema
    - Fields: id (cuid), userId, skillId, totalXP (Int), level (Int 1-5), createdAt, updatedAt
    - Relations: user (User), skill (Skill), sources (SkillSource[])
    - Indexes: userId + skillId (unique compound)
    - **File:** `prisma/schema.prisma`
  - [x] 2.6 Create SkillSource model in Prisma schema
    - Fields: id (cuid), userSkillId, sourceType (SourceType enum), experienceId (nullable), xpAmount (Int), metadata (Json), createdAt
    - Relations: userSkill (UserSkill), experience (Experience, optional)
    - Indexes: userSkillId, experienceId
    - **File:** `prisma/schema.prisma`
  - [x] 2.7 Add skills relation to User model
    - Add `userSkills UserSkill[]` relation
    - Add `skillCategories SkillCategory[]` relation for custom categories
    - **File:** `prisma/schema.prisma`
  - [x] 2.8 Run Prisma migration
    - Generate Prisma client with `npx prisma generate`
    - Push to database with `npx prisma db push` (MongoDB doesn't use migrations)
  - [x] 2.9 Update types file to re-export Prisma types
    - Update `features/skills/types/skill.ts` to import from generated Prisma client
    - **File:** `features/skills/types/skill.ts`
  - [x] 2.10 Ensure database tests pass
    - Run tests from 2.1
    - **Command:** `npm test -- features/skills/__tests__/skill-model.test.ts`

**Acceptance Criteria:**
- All model tests pass
- Database push runs successfully
- Prisma client generates without errors
- Types file re-exports Prisma types correctly

---

### Data Access Layer

#### Task Group 3: Data Layer Functions
**Dependencies:** Task Group 2
**Size:** Medium
**Specialist:** Backend Engineer

- [x] 3.0 Complete data access layer
  - [x] 3.1 Write 4-6 focused tests for data layer functions
    - Test `getUserSkillsData` returns skills with sources
    - Test `createUserSkillData` creates skill with source
    - Test `updateUserSkillXPData` recalculates total XP
    - Test `getSkillCategoriesData` returns default + custom
    - **File:** `features/skills/__tests__/skill-data.test.ts`
  - [x] 3.2 Create getSkillCategories data function
    - Fetch default categories (isDefault: true)
    - Fetch user's custom categories
    - Merge and return sorted by name
    - **File:** `features/skills/data/getSkillCategories.data.ts`
  - [x] 3.3 Create getUserSkills data function
    - Fetch all UserSkills for userId
    - Include skill details and sources
    - Include experience data for EXPERIENCE sources
    - **File:** `features/skills/data/getUserSkills.data.ts`
  - [x] 3.4 Create getSkillById data function
    - Fetch single UserSkill with full relations
    - Include all sources with metadata
    - **File:** `features/skills/data/getSkillById.data.ts`
  - [x] 3.5 Create createUserSkill data function
    - Create UserSkill record
    - Create initial SkillSource record
    - Calculate initial totalXP and level
    - **File:** `features/skills/data/createUserSkill.data.ts`
  - [x] 3.6 Create updateUserSkill data function
    - Update UserSkill fields
    - Recalculate totalXP from all sources
    - Update level based on new XP
    - **File:** `features/skills/data/updateUserSkill.data.ts`
  - [x] 3.7 Create deleteUserSkill data function
    - Delete UserSkill and cascade to sources
    - Only allow if no EXPERIENCE sources exist
    - **File:** `features/skills/data/deleteUserSkill.data.ts`
  - [x] 3.8 Create createSkillCategory data function
    - Create custom category for user
    - Validate unique name per user
    - **File:** `features/skills/data/createSkillCategory.data.ts`
  - [x] 3.9 Create syncSkillFromExperience data function
    - Find or create Skill by normalized name
    - Find or create UserSkill for user
    - Create SkillSource with EXPERIENCE type
    - Calculate duration-based XP
    - Update UserSkill totalXP
    - **File:** `features/skills/data/syncSkillFromExperience.data.ts`
  - [x] 3.10 Create data layer index file
    - Export all data functions
    - **File:** `features/skills/data/index.ts`
  - [x] 3.11 Ensure data layer tests pass
    - Run tests from 3.1
    - **Command:** `npm test -- features/skills/__tests__/skill-data.test.ts`

**Acceptance Criteria:**
- All data layer tests pass
- Functions follow pure data access pattern (no business logic)
- Proper error handling for not found cases
- XP recalculation works correctly

---

### API Layer

#### Task Group 4: Services and Server Actions
**Dependencies:** Task Group 3
**Size:** Medium
**Specialist:** Backend Engineer

- [x] 4.0 Complete API layer
  - [x] 4.1 Write 4-6 focused tests for services and actions
    - Test createSkill action with valid input
    - Test updateSkill action with ownership check
    - Test deleteSkill action prevents deletion of experience-linked skills
    - Test syncSkillsFromExperience service processes all skills
    - **File:** `features/skills/__tests__/skill-actions.test.ts`
  - [x] 4.2 Create skill service layer
    - `createSkillService` - validate input, create skill with source
    - `updateSkillService` - check ownership, update fields
    - `deleteSkillService` - check ownership, validate no experience sources
    - `syncSkillsFromExperienceService` - process skills array from experience
    - **File:** `features/skills/services/skill.service.ts`
  - [x] 4.3 Create category service layer
    - `createCategoryService` - validate unique name, create category
    - **File:** `features/skills/services/category.service.ts`
  - [x] 4.4 Create getSkills server action
    - Fetch user's skills with categories
    - Return grouped by category
    - Use actionWrapper pattern
    - **File:** `features/skills/actions/getSkills.ts`
  - [x] 4.5 Create getSkillById server action
    - Fetch single skill with full details
    - Include all sources and linked experiences
    - **File:** `features/skills/actions/getSkillById.ts`
  - [x] 4.6 Create createSkill server action
    - Validate with createSkillSchema
    - Call createSkillService
    - Revalidate `/dashboard/skills` path
    - **File:** `features/skills/actions/createSkill.ts`
  - [x] 4.7 Create updateSkill server action
    - Validate with updateSkillSchema
    - Call updateSkillService
    - Revalidate paths
    - **File:** `features/skills/actions/updateSkill.ts`
  - [x] 4.8 Create deleteSkill server action
    - Validate ownership
    - Call deleteSkillService
    - Return error if skill has experience sources
    - Revalidate paths
    - **File:** `features/skills/actions/deleteSkill.ts`
  - [x] 4.9 Create createCategory server action
    - Validate with createCategorySchema
    - Call createCategoryService
    - Revalidate paths
    - **File:** `features/skills/actions/createCategory.ts`
  - [x] 4.10 Create syncSkillsFromExperience server action
    - Accept experienceId and skills array
    - Calculate duration XP for each skill
    - Create/update SkillSource records
    - **File:** `features/skills/actions/syncSkillsFromExperience.ts`
  - [x] 4.11 Create actions index file
    - Export all actions
    - **File:** `features/skills/actions/index.ts`
  - [x] 4.12 Integrate skill sync into Timeline experience flow
    - Call syncSkillsFromExperience after experience create/update
    - Handle skill removal when experience is updated
    - **File:** `features/timeline/services/experience.service.ts` (modify)
  - [x] 4.13 Ensure API layer tests pass
    - Run tests from 4.1
    - **Command:** `npm test -- features/skills/__tests__/skill-actions.test.ts`

**Acceptance Criteria:**
- All action tests pass
- Actions use actionWrapper consistently
- Proper ownership validation
- Experience-skill sync works bidirectionally
- Path revalidation triggers correctly

---

### UI Components Layer

#### Task Group 5: Core UI Components
**Dependencies:** Task Group 4
**Size:** Large
**Specialist:** Frontend Engineer

- [x] 5.0 Complete core UI components
  - [x] 5.1 Write 4-6 focused tests for key components
    - Test SkillHexagonNode renders with correct level styling
    - Test SkillDetailCard flip animation triggers
    - Test ManualSkillForm validation and submission
    - Test MobileSkillList accordion behavior
    - **File:** `features/skills/__tests__/skill-components.test.tsx`
  - [x] 5.2 Create SkillHexagonNode component
    - Adapt HexagonNode from Timeline
    - Props: skill, level, categoryColor, onClick, isEmpty
    - Level-based styling: L1 dim, L2 soft glow, L3 full glow, L4 particles, L5 legendary
    - Empty state: dashed outline with "?" icon
    - Use Framer Motion for hover/click animations
    - **File:** `features/skills/components/SkillHexagonNode.tsx`
  - [x] 5.3 Create SkillDetailCard component
    - Pokemon card flip animation with Framer Motion
    - Front side: skill icon/letter, name, LevelBadge, XPBar
    - Back side: XP breakdown, linked experiences list, learning sources
    - Use GamingCard as base wrapper
    - Click outside or X to close
    - **File:** `features/skills/components/SkillDetailCard.tsx`
  - [x] 5.4 Create XPSourceList component
    - Display list of SkillSource entries
    - Show experience title + company for EXPERIENCE type
    - Show learning sources for MANUAL type
    - XP amount per source
    - Clickable experience links to navigate to Timeline
    - **File:** `features/skills/components/XPSourceList.tsx`
  - [x] 5.5 Create ManualSkillForm component
    - Fields: name, selfAssessmentLevel (select), category (select), learningSources (textarea), dateStarted (date picker)
    - Use react-hook-form with Yup resolver
    - Use shadcn/ui form components
    - useTransition pattern for submission
    - **File:** `features/skills/components/ManualSkillForm.tsx`
  - [x] 5.6 Create ManualSkillModal component
    - Modal wrapper for ManualSkillForm
    - Open from FAB button or empty hexagon click
    - Support pre-filled skill name (from suggestions)
    - **File:** `features/skills/components/ManualSkillModal.tsx`
  - [x] 5.7 Create CategorySelect component
    - Dropdown with predefined + custom categories
    - Category color indicators
    - "Create new category" option at bottom
    - **File:** `features/skills/components/CategorySelect.tsx`
  - [x] 5.8 Create CreateCategoryModal component
    - Form for name + color picker
    - Color swatches for quick selection
    - **File:** `features/skills/components/CreateCategoryModal.tsx`
  - [x] 5.9 Create SkillSuggestions component
    - Render empty hexagons for suggested skills
    - Static suggestions: predefined progression map
    - Smart suggestions: based on user's existing skills
    - Click to open ManualSkillModal with pre-filled name
    - **File:** `features/skills/components/SkillSuggestions.tsx`
  - [x] 5.10 Create skill suggestions data
    - Define static skill progressions (JS -> TS, React -> Next.js)
    - Define skill pairing rules for smart suggestions
    - **File:** `features/skills/constants/suggestions.ts`
  - [x] 5.11 Ensure component tests pass
    - Run tests from 5.1
    - **Command:** `npm test -- features/skills/__tests__/skill-components.test.tsx`

**Acceptance Criteria:**
- All component tests pass
- Components render correctly with mock data
- Forms validate and submit properly
- Flip animation works smoothly
- Level styling visually distinct

---

### Galaxy Visualization Layer

#### Task Group 6: Galaxy View and Mobile List
**Dependencies:** Task Group 5
**Size:** Large
**Specialist:** Frontend Engineer / UI Specialist

- [x] 6.0 Complete visualization layer
  - [x] 6.1 Write 4-6 focused tests for visualization components
    - Test GalaxyCanvas renders with category clusters
    - Test zoom/pan interactions work
    - Test MobileSkillList accordion expands/collapses
    - Test responsive view switching
    - **File:** `features/skills/__tests__/skill-visualization.test.tsx`
  - [x] 6.2 Create StarfieldBackground component
    - Dark space background (#0A0E1A)
    - Animated star particles (CSS or lightweight Canvas)
    - Performance optimized with requestAnimationFrame
    - **File:** `features/skills/components/StarfieldBackground.tsx`
  - [x] 6.3 Create CategoryCluster component
    - Hexagon arrangement for category skills
    - Category-colored glow effect
    - Core category at center position
    - Handle zoom state (collapsed cluster vs expanded nodes)
    - **File:** `features/skills/components/CategoryCluster.tsx`
  - [x] 6.4 Create SkillConnections component
    - Adapt TimelineConnections pattern
    - Solid lines for direct relationships
    - Dashed lines for suggested progressions
    - Cyan gradient with glow filter
    - **File:** `features/skills/components/SkillConnections.tsx`
  - [x] 6.5 Create GalaxyCanvas component
    - Container for full galaxy visualization
    - Render CategoryClusters in orbital positions
    - Handle zoom levels (all galaxies vs single category)
    - Pan/drag navigation with mouse/touch
    - **File:** `features/skills/components/GalaxyCanvas.tsx`
  - [x] 6.6 Create ZoomControls component
    - Zoom in/out buttons
    - Fit all button
    - Current zoom level indicator
    - **File:** `features/skills/components/ZoomControls.tsx`
  - [x] 6.7 Create MobileSkillItem component
    - Compact skill display: name, LevelBadge, XPBar (mini)
    - Source indicator icons (briefcase for experience, book for manual)
    - Tap to expand inline details
    - **File:** `features/skills/components/MobileSkillItem.tsx`
  - [x] 6.8 Create MobileSkillList component
    - Collapsible accordion by category
    - Category headers with skill count badges
    - Render MobileSkillItem for each skill
    - **File:** `features/skills/components/MobileSkillList.tsx`
  - [x] 6.9 Create SkillTreeView component
    - Responsive container component
    - Desktop (>=768px): render GalaxyCanvas
    - Mobile (<768px): render MobileSkillList
    - Use useMediaQuery hook for detection
    - **File:** `features/skills/components/SkillTreeView.tsx`
  - [x] 6.10 Create AddSkillFAB component
    - Floating action button for mobile
    - Opens ManualSkillModal
    - Fixed position bottom-right
    - **File:** `features/skills/components/AddSkillFAB.tsx`
  - [x] 6.11 Create components index file
    - Export all components
    - **File:** `features/skills/components/index.ts`
  - [x] 6.12 Ensure visualization tests pass
    - Run tests from 6.1
    - **Command:** `npm test -- features/skills/__tests__/skill-visualization.test.tsx`

**Acceptance Criteria:**
- All visualization tests pass
- Galaxy renders with proper cluster positioning
- Zoom/pan interactions work smoothly
- Mobile list is functional and accessible
- Responsive switching works correctly

---

### Pages and Integration Layer

#### Task Group 7: Pages and Full Integration
**Dependencies:** Task Groups 5, 6
**Size:** Medium
**Specialist:** Full Stack Engineer

- [x] 7.0 Complete pages and integration
  - [x] 7.1 Write 4-6 focused integration tests
    - Test skills page loads with user data
    - Test skill creation flow end-to-end
    - Test skill-experience linking displays correctly
    - Test navigation between skill tree and timeline
    - **File:** `features/skills/__tests__/skill-integration.test.ts`
  - [x] 7.2 Create skills dashboard page
    - Server component for data fetching
    - Pass skills data to SkillTreeView
    - Include page header with stats summary
    - **File:** `app/[locale]/(dashboard)/dashboard/skills/page.tsx`
  - [x] 7.3 Create skills page loading state
    - Skeleton for galaxy visualization
    - Skeleton for mobile list
    - **File:** `app/[locale]/(dashboard)/dashboard/skills/loading.tsx`
  - [x] 7.4 Create skills page layout
    - Consistent with dashboard layout
    - Gaming theme styling
    - **File:** `app/[locale]/(dashboard)/dashboard/skills/layout.tsx`
  - [x] 7.5 Create public skills page
    - View-only skill tree for `/[username]/skills`
    - No edit capabilities
    - **File:** `app/[locale]/[username]/skills/page.tsx`
  - [x] 7.6 Add skills navigation to dashboard
    - Add "Skill Tree" link to dashboard nav
    - Use appropriate icon (Sparkles or similar)
    - **File:** `features/dashboard/components/DashboardHeader.tsx` (modify)
  - [x] 7.7 Add i18n translations for skills feature
    - English translations
    - Spanish translations
    - Skill level names, messages, labels
    - **Files:** `messages/en.json`, `messages/es.json` (modify)
  - [x] 7.8 Create feature index file
    - Export components, actions, types, constants
    - **File:** `features/skills/index.ts`
  - [x] 7.9 Ensure integration tests pass
    - Run tests from 7.1
    - **Command:** `npm test -- features/skills/__tests__/skill-integration.test.ts`

**Acceptance Criteria:**
- All integration tests pass
- Pages load without errors
- Data flows correctly from server to client
- Navigation works between features
- i18n strings display correctly in both languages

---

### Testing and Polish

#### Task Group 8: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-7
**Size:** Small
**Specialist:** QA / Full Stack Engineer

- [x] 8.0 Review tests and fill critical gaps
  - [x] 8.1 Review all existing tests from Task Groups 1-7
    - Review XP calculation tests (Task 1.1)
    - Review model tests (Task 2.1)
    - Review data layer tests (Task 3.1)
    - Review action tests (Task 4.1)
    - Review component tests (Task 5.1)
    - Review visualization tests (Task 6.1)
    - Review integration tests (Task 7.1)
    - Total existing: 103 tests
  - [x] 8.2 Analyze critical gaps for skill tree feature
    - Check XP aggregation edge cases
    - Check skill-experience sync on experience delete
    - Check category deletion with existing skills
    - Focus on user-facing workflows only
  - [x] 8.3 Write up to 10 additional tests if needed
    - Add tests only for identified critical gaps
    - Focus on integration points
    - Skip edge cases unless business-critical
    - **File:** `features/skills/__tests__/skill-gaps.test.ts`
  - [x] 8.4 Run full feature test suite
    - Run all skill feature tests
    - Verify all pass
    - **Command:** `npm test -- features/skills/`

**Acceptance Criteria:**
- All feature tests pass (113 tests total)
- Critical user workflows covered
- No more than 10 additional gap tests added
- No regressions in Timeline feature

---

## Execution Order

```
1. Foundation Layer (Task Group 1)
   - Constants, types, schemas
   - No external dependencies

2. Database Layer (Task Group 2)
   - Prisma models and migrations
   - Depends on: Task Group 1 (types)

3. Data Access Layer (Task Group 3)
   - Pure database queries
   - Depends on: Task Group 2 (models)

4. API Layer (Task Group 4)
   - Services and server actions
   - Depends on: Task Group 3 (data functions)

5. UI Components Layer (Task Group 5)
   - Core interactive components
   - Depends on: Task Group 4 (actions to call)

6. Galaxy Visualization Layer (Task Group 6)
   - Galaxy canvas and mobile list
   - Depends on: Task Group 5 (base components)

7. Pages and Integration (Task Group 7)
   - Dashboard pages and routing
   - Depends on: Task Groups 5, 6 (components)

8. Test Review and Polish (Task Group 8)
   - Gap analysis and final testing
   - Depends on: All previous groups
```

---

## File Structure Summary

```
features/skills/
  __tests__/
    skill-xp.test.ts
    skill-model.test.ts
    skill-data.test.ts
    skill-actions.test.ts
    skill-components.test.tsx
    skill-visualization.test.ts
    skill-integration.test.ts
    skill-gaps.test.ts
  actions/
    index.ts
    getSkills.ts
    getSkillById.ts
    createSkill.ts
    updateSkill.ts
    deleteSkill.ts
    createCategory.ts
    syncSkillsFromExperience.ts
  components/
    index.ts
    SkillHexagonNode.tsx
    SkillDetailCard.tsx
    XPSourceList.tsx
    ManualSkillForm.tsx
    ManualSkillModal.tsx
    CategorySelect.tsx
    CreateCategoryModal.tsx
    SkillSuggestions.tsx
    StarfieldBackground.tsx
    CategoryCluster.tsx
    SkillConnections.tsx
    GalaxyCanvas.tsx
    ZoomControls.tsx
    MobileSkillItem.tsx
    MobileSkillList.tsx
    SkillTreeView.tsx
    AddSkillFAB.tsx
  constants/
    xp.ts
    categories.ts
    levels.ts
    messages.ts
    suggestions.ts
  data/
    index.ts
    getSkillCategories.data.ts
    getUserSkills.data.ts
    getSkillById.data.ts
    createUserSkill.data.ts
    updateUserSkill.data.ts
    deleteUserSkill.data.ts
    createSkillCategory.data.ts
    syncSkillFromExperience.data.ts
    getPublicSkills.data.ts
  schemas/
    skill.schema.ts
  services/
    skill.service.ts
    category.service.ts
  types/
    skill.ts
  index.ts

app/[locale]/
  (dashboard)/dashboard/skills/
    page.tsx
    loading.tsx
    layout.tsx
    DashboardSkillsView.tsx
  [username]/skills/
    page.tsx
    layout.tsx
    PublicSkillsView.tsx
```

---

## Size Estimates

| Task Group | Size | Estimated Hours |
|------------|------|-----------------|
| 1. Foundation | M | 3-4 hours |
| 2. Database | L | 4-5 hours |
| 3. Data Access | M | 3-4 hours |
| 4. API Layer | M | 4-5 hours |
| 5. UI Components | L | 6-8 hours |
| 6. Visualization | L | 6-8 hours |
| 7. Pages/Integration | M | 3-4 hours |
| 8. Test Review | S | 2-3 hours |
| **Total** | | **31-41 hours** |

---

## Key Dependencies and Risks

**Dependencies:**
- HexagonNode component from Timeline (Task 5.2)
- TimelineConnections component (Task 6.4)
- Gaming components: GamingCard, XPBar, LevelBadge (Task 5.3)
- actionWrapper utility from core (Task 4.x)
- Experience.skills array structure (Task 4.12)

**Technical Risks:**
- Galaxy visualization performance with many skills
- Zoom/pan interaction complexity
- Mobile touch interactions for drag
- Skill-experience sync data consistency

**Mitigations:**
- Use virtualization for large skill counts
- Test on multiple mobile devices
- Implement optimistic updates for better UX
- Add database transactions for sync operations
