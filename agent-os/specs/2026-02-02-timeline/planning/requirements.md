# Spec Requirements: Timeline Feature

## Initial Description

Timeline component for the portfolio application. This feature is part of Phase 2 (v0.2.0) of the Portfoland roadmap and involves creating an interactive timeline using Google Maps as a background with hexagonal nodes representing career experiences.

The approved concept combines Google Maps with gaming/cyberpunk aesthetics:
- Google Maps as a blurred/faded background layer
- Hexagonal nodes connected to represent experiences
- Gaming-style cards for experience details
- Dynamic zoom interactions based on experience locations

## Requirements Discussion

### First Round Questions

**Q1:** Should the public view (for recruiters/visitors) and the edit mode (for the user) be on the same page with a toggle, or separate pages?
**Answer:** Separate pages - Public view vs edit mode should be different pages.

**Q2:** Should we implement all 4 experience types (Work, Projects, Achievements, Education) from the start, or start with just Work and Education?
**Answer:** All 4 types - Implement Work, Projects, Achievements, Education from the start.

**Q3:** For the map behavior, should it start centered on a specific location (e.g., user's current city) or show a general view that encompasses all experiences?
**Answer:** Dynamic map centering - Start with a general location that encompasses all experiences, then change/zoom based on where each experience took place.

**Q4:** What fields should each experience entry have? (Suggested: Title, Company, Location, Date range, Description, Skills/Tags)
**Answer:** Fields confirmed - Title, Company, Location (coordinates), Date range, Description, Skills/Tags.

**Q5:** Should connections between hexagon nodes be manually defined by the user, or auto-generated based on chronological order?
**Answer:** Chronological connections - Auto-generate connections based on chronological order.

**Q6:** On mobile, should we maintain the map view with smaller hexagons, or switch to a simplified vertical timeline?
**Answer:** Simplified mobile - Acceptable to use a simplified vertical timeline view on mobile.

**Q7:** Should the form for adding/editing experiences auto-save, or require explicit save button?
**Answer:** Auto-save - Save data automatically with visual feedback.

**Q8:** Are there any features from the roadmap you'd like to exclude from this initial implementation?
**Answer:** Follow the plan - No exclusions, follow the roadmap as planned.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Previous timeline design - Path: `C:/Users/user/code/nextjs/portfoland/backups/design-idea/`
  - Contains a complete design prototype from before the Google Maps approach
  - Includes vertical timeline with gaming cards, XP system, filter tabs
  - User wants this ADAPTED/IMPROVED to the new Google Maps + Hexagons structure
- Components to potentially reuse: Gaming components from `C:/Users/user/code/nextjs/portfoland/features/gaming/index.tsx`
  - GamingButton, GamingCard, GamingInput
  - StatCard, XPBar, LevelBadge, HUDPanel
  - TimelineEvent, NavTab, GamingBadge, CategoryPill
  - AchievementBadge, SkillTreeNode
- Backend logic to reference: None specified - this is a new feature

### Follow-up Questions

No follow-up questions needed - user provided comprehensive answers and reference materials.

## Visual Assets

### Files Provided:
- `image1.png`: Full dashboard view showing the timeline page with:
  - Left sidebar navigation (Dashboard, Timeline active, Skill Tree, Logros, Mi CV)
  - Top header with search, level badge (Lv 42), XP display (2,450 XP), progress bar, user avatar
  - Stats bar with 4 metric cards: XP Total (2,450), Hitos Completados (5), Experiencias Registradas (8), Logros Desbloqueados (12)
  - Filter tabs: Todos, Trabajo, Educacion, Proyectos, Certificaciones
  - Vertical timeline with color-coded dots (cyan for ACTUAL/work, magenta for work history, purple for education)
  - Experience cards with type badge, title, company, date range, description, skill tags, and XP reward

- `image.png`: Close-up of the timeline section showing:
  - Continuation of the vertical timeline
  - Multiple experience types with distinct colors:
    - TRABAJO (cyan) - Photographer Assistant
    - EDUCACION (purple) - Diplomatura en Fotografia Digital
    - PROYECTO (green) - Street Photography
    - CERTIFICACION (yellow) - Adobe Lightroom
  - Left sidebar showing "MI JOURNEY" stats: 2,450 XP, Hitos cumplidos (5), Experiencias (8), Logros (12)
  - User profile at bottom: Maria Garcia, Nivel 42 - 2,450 XP
  - "Agregar nueva experiencia" button at bottom

### Visual Insights:
- **Design patterns identified:**
  - Color-coded experience types: Cyan (Work/Current), Magenta (Work history), Purple (Education), Green (Projects), Yellow (Certifications)
  - XP gamification system with rewards per experience (+500, +350, +400, +200, +150 XP)
  - Gaming-style cards with glow effects and colored borders
  - Stats displayed as HUD-style metric cards
  - Filter system using pill buttons
  - Vertical timeline with connecting line and colored dot indicators

- **User flow implications:**
  - Users filter timeline by experience type
  - Current position highlighted with "ACTUAL" badge and special indicator
  - Each experience shows: Type badge, Title, Company, Date range, Description, Skills tags, XP earned
  - Add new experience via button at bottom of timeline

- **UI components shown:**
  - Sidebar navigation with active state highlighting
  - Header with level badge, XP counter, progress bar
  - Stat cards (4 metrics)
  - Filter tabs
  - Timeline event cards
  - User avatar with level display

- **Fidelity level:** High-fidelity mockup - These are detailed UI designs showing the existing vertical timeline implementation

**IMPORTANT NOTE ON ADAPTATION:**
The provided visuals show the PREVIOUS vertical timeline design. The new implementation must:
1. Keep the gaming aesthetic, card design, and color system from these mockups
2. REPLACE the vertical timeline structure with Google Maps + Hexagon nodes
3. Use the ExperienceCard design shown when a hexagon is selected
4. Transform the stats bar and filter tabs to work with the map view
5. Mobile view can fall back to this simplified vertical timeline

## Requirements Summary

### Functional Requirements

**Public Timeline View (Separate Page):**
- Display Google Maps as blurred/faded background
- Show hexagonal nodes positioned at experience locations
- Nodes colored by type (Cyan=Work, Magenta=Projects, Green=Achievements, Yellow=Education)
- Auto-generated chronological connections between nodes
- Click on hexagon to zoom into location and show experience card
- Show overall stats (XP, milestones, experiences count)
- Filter experiences by type

**Edit Mode (Separate Page):**
- All public view features plus editing capabilities
- Add new experience button
- Auto-save with visual feedback indicator
- Form fields: Title, Company, Location (with coordinate picker), Date range, Description, Skills/Tags
- Delete/edit existing experiences
- Drag-and-drop reordering (optional enhancement)

**Map Interactions:**
- Initial view: Zoomed out to encompass all experience locations
- On node selection: Animated zoom to that location
- Map styling: Dark/night mode with blur, saturation reduction, and opacity
- Increased blur when a card is displayed (focus effect)

**Experience Cards:**
- Gaming-style card design (from existing GamingCard component)
- Display: Type badge, Title, Company, Date range, Description, Skills tags, XP earned
- Glow effect based on experience type color
- "ACTUAL" badge for current position

**Gamification Elements:**
- XP system (different XP values per experience type)
- Level display
- Stats: Total XP, Milestones, Experiences count, Achievements unlocked
- Progress bar for level progression

**Mobile Experience:**
- Simplified vertical timeline view (similar to backup design)
- Maintain all functionality in linear format
- Touch-friendly interactions

### Reusability Opportunities

**Existing Gaming Components to Use:**
From `C:/Users/user/code/nextjs/portfoland/features/gaming/index.tsx`:
- `GamingCard` - For experience cards
- `GamingButton` - For add/edit/filter buttons
- `GamingInput` - For form fields
- `StatCard` - For stats display (XP, milestones, etc.)
- `XPBar` - For level progression
- `LevelBadge` - For user level display
- `HUDPanel` - For sections/panels
- `NavTab` - For filter tabs
- `GamingBadge` - For type badges
- `CategoryPill` - For skill tags
- `TimelineEvent` - For mobile vertical timeline fallback

**New Components to Create:**
- `TimelineMap` - Google Maps integration with gaming overlay
- `HexagonNode` - Hexagonal experience node component
- `HexagonGrid` - Reusable hexagon layout system
- `ExperienceCard` - Adapted card for map view (based on existing TimelineEvent)
- `LocationPicker` - Coordinate selection for experiences
- `TimelineFilter` - Filter bar for experience types

**Backend Patterns to Reference:**
- Prisma schema patterns from existing User/Session models
- API route patterns from authentication system

### Scope Boundaries

**In Scope:**
- Google Maps integration with dark/blurred styling
- Hexagonal node system with connections
- All 4 experience types from start
- Public view page
- Edit mode page (separate)
- Experience CRUD operations
- Auto-save functionality
- Dynamic map zooming based on selections
- Filter by experience type
- XP and gamification display
- Mobile-responsive vertical timeline fallback
- Auto-generated chronological connections

**Out of Scope:**
- Skill Tree visualization (Phase 3)
- AI-powered content suggestions (Phase 4)
- Social sharing features (Phase 5)
- Character/avatar customization (Phase 5)
- Manual connection definition (using auto-generation instead)
- Complex animation sequences beyond zoom transitions
- Offline support

### Technical Considerations

**Dependencies Required:**
- `@react-google-maps/api` - Google Maps React library
- `framer-motion` - Already in tech stack for animations

**Google Maps Configuration:**
- Dark/night mode map styling
- CSS filters: blur(3px), saturate(0.4), brightness(0.6), opacity 0.4
- Focused state: blur(6px), saturate(0.2), brightness(0.4), opacity 0.3
- Free tier limit: 28,000 map loads/month

**Database Schema Considerations:**
- Experience model with: id, userId, type, title, company, location (coordinates), startDate, endDate, description, skills (array), xp
- Location stored as coordinates for map positioning

**API Routes:**
- GET /api/timeline - Fetch user's experiences
- POST /api/timeline - Create new experience (auto-save)
- PUT /api/timeline/[id] - Update experience
- DELETE /api/timeline/[id] - Delete experience

**Styling Approach:**
- Use existing gaming color palette from `features/gaming/index.tsx`
- Primary: #00d4ff (Cyan)
- Secondary: #e930ff (Magenta)
- Success: #3fb950 (Green)
- Warning: #f0b429 (Yellow)
- Background: #0a0e14 base, #0d1117 cards

**Internationalization:**
- Use next-intl for EN/ES support
- All text content must be translatable

**Responsive Breakpoints:**
- Desktop: Full map view with hexagons
- Tablet: Simplified map view
- Mobile: Vertical timeline fallback
