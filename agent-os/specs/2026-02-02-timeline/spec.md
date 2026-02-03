# Specification: Timeline Feature

## Goal

Create an interactive career timeline that combines Google Maps as a blurred background with hexagonal nodes representing career experiences, featuring gaming aesthetics and dynamic zoom interactions based on experience locations.

## User Stories

- As a job seeker, I want to visualize my career journey on an interactive map so that recruiters can understand my professional progression geographically
- As a recruiter, I want to quickly navigate through a candidate's experiences by clicking on map nodes so that I can efficiently evaluate their career path

## Specific Requirements

**Google Maps Background Integration**
- Embed Google Maps using `@react-google-maps/api` as the base layer
- Apply dark/night mode map styling via Google Maps Styles API
- CSS filters for blurred effect: `blur(3px) saturate(0.4) brightness(0.6) opacity(0.4)`
- Focused state (when card displayed): `blur(6px) saturate(0.2) brightness(0.4) opacity(0.3)`
- Initial view zoomed out to encompass all experience locations
- Animated zoom transitions when selecting hexagon nodes

**Hexagonal Node System**
- Render hexagonal SVG nodes positioned at experience coordinates on map
- Color-code by type: Cyan (#00D4FF) for Work, Magenta (#D946EF) for Projects, Green (#22C55E) for Achievements, Yellow (#EAB308) for Education
- Auto-generate chronological connections between nodes using SVG lines
- Glow effect on hover matching experience type color
- Current position node has pulsing "ACTUAL" indicator

**Experience Cards**
- Gaming-style card design using existing `GamingCard` component patterns
- Display: Type badge, Title, Company, Date range, Description, Skills tags, XP earned
- Card appears on hexagon click with map zoom animation
- Positioned adjacent to selected node with proper viewport containment
- Close on click outside or explicit close button

**Public Timeline View Page**
- Route: `/[locale]/timeline/[username]` for public viewing
- Server Component for initial data fetch
- Display stats bar: Total XP, Milestones, Experiences count, Achievements unlocked
- Filter tabs: Todos, Trabajo, Educacion, Proyectos, Certificaciones
- Read-only interaction - no edit capabilities

**Edit Mode Page**
- Route: `/[locale]/dashboard/timeline` for authenticated user editing
- Protected route requiring authentication via Better Auth
- "Add Experience" button opens form modal
- Auto-save with debounce (500ms) and visual feedback indicator
- Delete confirmation modal before removing experiences

**Experience Form**
- Fields: Title, Company, Location (with coordinate picker), Date range (start/end), Description, Skills/Tags, Experience Type
- Location picker integrates with Google Places API for address autocomplete
- Yup validation schema for all required fields
- Skills as tag input with autocomplete from existing user skills

**Mobile Responsive Design**
- Desktop (1024px+): Full Google Maps view with hexagon nodes
- Tablet (768px-1023px): Simplified map view with smaller hexagons
- Mobile (<768px): Fallback to vertical timeline using existing `TimelineEvent` component pattern

**Data Model**
- Experience model with: id, userId, type (enum), title, company, latitude, longitude, address, startDate, endDate (nullable for current), description, skills (string array), xp (calculated)
- XP values by type: Work=500, Projects=350, Achievements=400, Education=200
- Relation to User model via userId foreign key

**API Architecture**
- Server Actions following three-layer pattern: Action -> Service -> Data
- GET experiences via Server Component data fetching
- POST/PUT/DELETE via Server Actions with `actionWrapper`
- Revalidate paths after mutations: `/dashboard/timeline`, `/timeline/[username]`

## Visual Design

**`planning/visuals/image1.png`**
- Full dashboard layout with left sidebar navigation (Dashboard, Timeline, Skill Tree, Logros, Mi CV)
- Top header showing level badge (Lv 42), XP counter (2,450 XP), progress bar, user avatar
- Stats bar with 4 metric cards in cyan-bordered HUD style
- Filter tabs row with "Todos" active state (filled cyan background)
- Experience cards with type badge top-left, XP reward badge top-right
- Vertical timeline line connecting colored dots to cards

**`planning/visuals/image.png`**
- Continuation showing multiple experience types with distinct colors
- TRABAJO (cyan dot) - current work with pulsing indicator
- EDUCACION (purple dot) - education entries
- PROYECTO (green dot) - personal projects
- CERTIFICACION (yellow dot) - certifications
- Left sidebar "MI JOURNEY" stats panel with 4 metrics
- User profile card at bottom with avatar, name, level, XP
- "Agregar nueva experiencia" button at timeline bottom

**`designs/TimelineBuilder.png`**
- Map editor concept showing dark background with dashed path lines
- Node positioned at specific location with experience card below
- AI assistant suggestion panel at bottom
- Timeline scrubber at very bottom showing years (2018-Present) with XP total

## Existing Code to Leverage

**`features/gaming/index.tsx` - Gaming Components**
- `GamingCard`, `GamingCardHeader`, `GamingCardTitle`, `GamingCardContent` for experience cards
- `StatCard` for stats display (XP, milestones, etc.)
- `GamingBadge` for type badges (TRABAJO, EDUCACION, etc.)
- `GamingButton` for add/filter actions
- `CategoryPill` for filter tabs and skill tags

**`backups/design-idea/components/gaming/index.tsx` - TimelineEvent Component**
- Complete `TimelineEvent` component for mobile vertical timeline fallback
- Type colors mapping: work=primary, education=accent, project=success, certification=warning
- Card structure with dot indicator, type badge, title, company, period, description, tags, XP

**`prisma/schema.prisma` - Database Patterns**
- cuid() for IDs, createdAt/updatedAt timestamps pattern
- User relation pattern with userId foreign key and Cascade delete
- Index definitions for foreign keys

**`agent-os/standards/backend/api.md` - Server Actions Pattern**
- Three-layer architecture: Action -> Service -> Data
- `actionWrapper` utility for consistent error handling
- Yup validation before processing
- `revalidatePath` after mutations

**`agent-os/product/design-ideas.md` - Design Specifications**
- Approved color palette: Background #0A0E1A, Cards #0D1421
- CSS filter values for map background states
- Hexagon usage patterns and connection styling

## Out of Scope

- Skill Tree visualization (Phase 3 - v0.3.0)
- AI-powered content suggestions for experience descriptions (Phase 4)
- Social sharing of timeline images (Phase 5)
- Character/avatar customization on timeline (Phase 5)
- Manual connection definition between nodes (using auto-generation instead)
- Complex animation sequences beyond zoom transitions
- Offline support or PWA features
- Drag-and-drop reordering of experiences
- Real-time collaboration on timeline editing
- Export timeline as PDF or image
