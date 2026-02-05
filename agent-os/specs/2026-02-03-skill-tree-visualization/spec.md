# Specification: Skill Tree Visualization

## Goal

Create an RPG-style skill tree visualization where users can view and manage their technical skills with XP-based progression, ecosystem dependencies, and interactive galaxy/constellation navigation - providing an engaging, gamified representation of their skill portfolio.

## User Stories

- As a developer, I want to see all my skills extracted from Timeline experiences and manually added skills visualized as an interactive galaxy, so that I can understand my technical profile at a glance
- As a user, I want to click on skill nodes to see detailed information including XP breakdown and linked experiences, so that I can track how each skill was developed

## Specific Requirements

**Data Model - Skill and SkillCategory**
- Create `Skill` model with: id, name, slug, categoryId, iconName (optional), isCore (boolean for universal prerequisites)
- Create `SkillCategory` model with: id, name, slug, color, isDefault (true for predefined categories), userId (null for system categories)
- Create `UserSkill` model with: id, userId, skillId, totalXP, level (1-5), createdAt, updatedAt
- Create `SkillSource` model with: id, userSkillId, sourceType (EXPERIENCE or MANUAL), experienceId (nullable), xpAmount, metadata (JSON for manual entry details like self-assessment level, learning sources, date started)
- Add AI-ready metadata fields to support future skill analysis features
- Use MongoDB with Prisma following existing schema patterns (cuid for IDs, timestamps, @@map for collection names)

**XP Calculation System**
- Experience-linked XP based on duration: 1-6 months = 100 XP, 6-12 months = 250 XP, 1-2 years = 500 XP, 2+ years = 750 XP
- Manual skill XP based on self-assessment: Beginner = 100 XP, Intermediate = 300 XP, Advanced = 600 XP
- Aggregate XP from all sources for total skill XP; recalculate when experiences change
- Level thresholds: Novice (0-199), Apprentice (200-499), Journeyman (500-999), Expert (1000-1999), Master (2000+)
- Create skill XP constants file following pattern from `features/timeline/constants/xp.ts`

**Skill Extraction from Timeline**
- On timeline experience create/update, extract skills array and create/update corresponding UserSkill and SkillSource records
- Calculate duration-weighted XP for each skill based on experience startDate and endDate
- Handle skill name normalization (case-insensitive matching, trim whitespace)
- Link SkillSource to Experience via experienceId for back-reference in skill details

**Manual Skill Entry**
- Create form for adding self-taught skills with: name (required), self-assessment level (Beginner/Intermediate/Advanced), category, learning sources (optional textarea), date started
- Store manual entry details in SkillSource.metadata JSON field
- Allow editing and deleting manual skills; prevent deletion of experience-linked sources

**Predefined Categories**
- Create 6 default categories: Core/Fundamentals, Frontend, Backend, DevOps, Design, Soft Skills
- Assign colors to each category for visual distinction in galaxy clusters
- Allow users to create custom categories with custom colors
- Core category positioned at galaxy center; other categories as orbital clusters

**Galaxy Visualization - Desktop**
- Dark space background (#0A0E1A) with subtle animated star particles using Canvas or CSS
- Category clusters as hexagon constellations radiating from central Core cluster
- Zoom levels: zoomed-out (all galaxies visible as clusters) and zoomed-in (single category with individual skill nodes)
- Pan/drag navigation within the visualization canvas
- Connection lines between related skills: solid for direct relationships, dashed for suggested progressions

**SkillHexagonNode Component**
- Adapt existing HexagonNode component for skill visualization
- Level-based visual styling: L1 dim node, L2 soft glow, L3 full glow, L4 glow + particles, L5 legendary glow + crown icon
- Display skill icon (if available) or first letter fallback inside hexagon
- Category-based color theming using existing EXPERIENCE_COLORS pattern as reference
- Empty hexagons with "?" icon for skill suggestions (dim outline styling)

**Skill Detail Card - Pokemon Card Flip**
- Implement card flip animation using Framer Motion (consistent with existing timeline animations)
- Front side: skill name, level badge, XP bar, category icon, skill icon
- Back side: XP breakdown by source, linked experiences list (clickable to navigate to timeline), learning sources for manual skills, date first acquired
- Use existing gaming components: GamingCard base, XPBar, LevelBadge
- Close on click outside or explicit close button

**Skill Suggestions System**
- Static suggestions: predefined logical progressions (e.g., JavaScript -> TypeScript, React -> Next.js)
- Smart suggestions: based on user's existing skills and common skill pairings in the industry
- Display as clickable empty hexagons; clicking opens "Add Skill" flow with pre-filled name

**Mobile View - Collapsible List**
- Detect viewport width; show list view on mobile (<768px), galaxy on desktop
- Collapsible accordion by category with skill count badges
- Skill list items showing: name, level badge, XP bar (compact), source indicator icons
- Tap skill to expand inline details (no flip animation on mobile)
- "Add Skill" floating action button

**Server Actions and Data Layer**
- Create actions: createSkill, updateSkill, deleteSkill, createCategory, syncSkillsFromExperience
- Follow three-layer architecture: Action (validation + actionWrapper) -> Service (business logic) -> Data (Prisma queries)
- Validate with Yup schemas following existing patterns in `features/timeline/schemas/`
- Revalidate `/dashboard/skills` path after mutations

## Visual Design

No visual mockups provided. Follow these design guidelines:

**Galaxy Theme**
- Background: dark space (#0A0E1A) matching THEME_COLORS.background from xp.ts
- Particles: subtle white/blue twinkling stars (CSS animation or lightweight Canvas)
- Clusters: hexagon arrangements with category-colored glows
- Connections: cyan (#00D4FF) gradient lines with glow filter, similar to TimelineConnections

**Level Visual Hierarchy**
- Level 1 (Novice): hexagon with 30% opacity fill, no glow
- Level 2 (Apprentice): 50% opacity fill, subtle outer glow
- Level 3 (Journeyman): 80% opacity fill, prominent glow matching category color
- Level 4 (Expert): full opacity, glow + subtle particle effect around node
- Level 5 (Master): legendary golden glow overlay + crown/star icon badge

**Category Colors (suggested)**
- Core: #00D4FF (cyan - matches accent)
- Frontend: #A855F7 (purple)
- Backend: #22C55E (green)
- DevOps: #F97316 (orange)
- Design: #EC4899 (pink)
- Soft Skills: #EAB308 (yellow)

## Existing Code to Leverage

**HexagonNode Component** (`features/timeline/components/HexagonNode.tsx`)
- Reuse SVG hexagon path geometry ("M24 2 L46 15 L46 41 L24 54 L2 41 L2 15 Z")
- Adapt gradient and glow filter patterns for level-based styling
- Reuse motion animation patterns (scale, opacity transitions)
- Extend props interface for skill-specific data (level, xp, category color)

**TimelineConnections Component** (`features/timeline/components/TimelineConnections.tsx`)
- Reuse SVG overlay approach with position mapping
- Adapt connection gradient and glow filter for skill tree connections
- Modify to support different line styles (solid, dashed, double)

**XP Constants Pattern** (`features/timeline/constants/xp.ts`)
- Follow same structure for SKILL_LEVEL_THRESHOLDS, SKILL_COLORS, SKILL_LEVEL_NAMES
- Reuse THEME_COLORS for background and UI consistency
- Create parallel SKILL_XP_VALUES for duration and self-assessment mappings

**Experience Service Pattern** (`features/timeline/services/experience.service.ts`)
- Follow same service layer structure with input interfaces and validation
- Replicate ownership checking pattern for skill mutations
- Use similar error message constants pattern

**Server Action Pattern** (`features/timeline/actions/createExperience.ts`)
- Follow exact pattern: 'use server', actionWrapper, schema validation, service call, revalidatePath
- Use same auth session checking approach
- Handle both FormData and plain object inputs

## Out of Scope

- Professional mode styling (Gaming mode only for this feature)
- AI skill gap analysis and recommendations
- AI-powered skill level assessment or verification
- AI career path suggestions based on skill tree
- Skill endorsements from other users
- Skill verification or testing/quiz features
- Export to LinkedIn or other platforms
- Interview simulator integration
- Portfolio adaptation based on visitor type
- Skill comparisons with other users
- Achievements system (except noting "Multi-framework Developer" as future enhancement)
- Animated "Level Up" celebrations (can be added as enhancement)
- "SKILL UNLOCKED" animations for new skills (can be added as enhancement)
- Ecosystem branch enforcement (no hard locks - users can add any skill)
- Drag-and-drop skill repositioning within galaxy
