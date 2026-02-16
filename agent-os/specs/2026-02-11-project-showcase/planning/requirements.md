# Spec Requirements: Project Showcase

## Initial Description

**Project Showcase** - Cards de proyectos con imagenes, tech stack, links. Enhanced project display within the portfolio system, showing project cards with images, technology stack badges, live/repo links, and rich details. This builds on the existing Experience model filtered by `type: PROJECT` that's already used in the portfolio's Projects section. Roadmap item #17, sized Medium (M).

## Requirements Discussion

### First Round Questions

**Q1:** The Experience model currently serves four types (WORK, EDUCATION, PROJECT, CERTIFICATION). Should we add new project-specific fields (like imageUrl, liveUrl, repoUrl) directly to the Experience model as optional fields, rather than creating a separate Project model? Or would a separate Project model linked to Experience be preferred?
**Answer:** Add all necessary fields required for recruiters and clients. Use a separate model if that's the best practice, since projects need many specific fields like images, multiple URLs, etc. that don't apply to WORK/EDUCATION/CERTIFICATION experiences.

**Q2:** For project images, should we use an external URL field (user pastes a URL) or file upload functionality (e.g., to Vercel Blob or similar)?
**Answer:** File upload (not just URL pasting). Will need a storage solution like Vercel Blob or similar.

**Q3:** For project links, should we have two fixed fields (liveUrl, repoUrl), or support additional link types (documentation, video demo, case study, etc.)?
**Answer:** Flexible mode - support multiple link types, not just liveUrl and repoUrl. Think: documentation, video demo, case study, etc. A flexible links structure.

**Q4:** Should users be able to mark certain projects as "featured" so they appear more prominently?
**Answer:** Yes, add a featured boolean flag.

**Q5:** Should we enhance the existing ExperienceForm with conditional project fields, or create a dedicated separate form for project creation/editing?
**Answer:** Dedicated form separate from the Experience form.

**Q6:** Should clicking a project card open an expanded detail view (modal or separate section), or should all information be visible directly on the card itself?
**Answer:** Expand on click - modal or expanded view when clicking a project card.

**Q7:** Is there anything that should explicitly be out of scope for this feature?
**Answer:** Refer to design reference images in `agent-os/product/visuals/` for aesthetic inspiration. No additional exclusions mentioned.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Gaming UI Components - Path: `C:/Users/user/code/nextjs/portfoland/features/gaming/index.tsx` - GamingCard (variant="glow", "featured"), GamingBadge, GamingCardHeader, GamingCardTitle, GamingCardContent, StatCard, HUDPanel components
- Feature: Professional Projects - Path: `C:/Users/user/code/nextjs/portfoland/features/portfolio/components/professional/ProfessionalProjects.tsx` - shadcn Card-based layout with skill badges
- Feature: Gaming Projects - Path: `C:/Users/user/code/nextjs/portfoland/features/portfolio/components/gaming/GamingProjects.tsx` - GamingCard with glow variant, GamingBadge for skills
- Feature: Experience Form - Path: `C:/Users/user/code/nextjs/portfoland/features/timeline/components/ExperienceForm.tsx` - react-hook-form + yup pattern, conditional type-based rendering, SkillTagInput component
- Feature: Experience Schema - Path: `C:/Users/user/code/nextjs/portfoland/features/timeline/schemas/experience.schema.ts` - Yup validation pattern reference
- Feature: Portfolio Types - Path: `C:/Users/user/code/nextjs/portfoland/features/portfolio/types/portfolio.ts` - PortfolioData, PortfolioSectionProps, ProjectData type definitions
- Feature: Public Projects Data - Path: `C:/Users/user/code/nextjs/portfoland/features/portfolio/data/getPublicProjects.data.ts` - Data fetching pattern for public portfolio
- Feature: Prisma Schema - Path: `C:/Users/user/code/nextjs/portfoland/prisma/schema.prisma` - Current Experience model and schema patterns
- Feature: Experience Types - Path: `C:/Users/user/code/nextjs/portfoland/features/timeline/types/experience.ts` - Type re-export pattern from Prisma, derived types
- Design References: `C:/Users/user/code/nextjs/portfoland/agent-os/product/visuals/` - v1 and v2 dashboard, timeline, skilltree, and login mockups
- Backup References: `C:/Users/user/code/nextjs/portfoland/backups/design-idea-v1/` and `backups/design-idea-v2/` - Component patterns and page structure references

### Follow-up Questions

No follow-up questions were needed. The user's answers were comprehensive and unambiguous.

## Visual Assets

### Files Provided:
No spec-specific visual files were provided in `agent-os/specs/2026-02-11-project-showcase/planning/visuals/`.

### Product Design Reference Files Analyzed:
- `dashboard-v1.png`: Full gaming dashboard with dark background (#0A0E1A), cyan accent lines, stat cards with glow effects (Total XP, Current Level, Experiences, Achievements), progress bars with yellow/gold gradients, HUD-style panels with top/bottom cyan accent lines, hexagonal badge elements, "Quick Actions" grid at bottom with icon cards.
- `dashboard-v2.png`: Refined dashboard iteration - cleaner layout, same cyberpunk palette, hexagonal badges more prominent, stat cards with colored icon indicators (cyan, magenta, green, yellow), activity feed on right side, same dark bg with subtle particle/star effects.
- `timeline-v1.png`: Left sidebar with experience list cards (dark cards with cyan accents, XP badges), right side shows Google Maps with hexagonal nodes connected by dashed cyan lines, experience detail card popup with gaming styling. Card list shows type labels with color coding.
- `timeline-v2.png`: Similar layout to v1 but cleaner execution, hexagonal nodes with letter identifiers, dashed connection lines between nodes, "Add Experience" button with cyan accent in top-right.
- `skilltree-v1.png`: Node-based skill visualization, hexagonal/circular nodes with color-coded categories (magenta for Core/Fundamentals, green for Backend), stat bar at top with 4 metrics (Total Skills, Total XP, Mastered, Categories), "Add Skill" button, connection lines between skill nodes.
- `skilltree-v2.png`: Refined skill tree with cleaner node connections, same color coding system (magenta, green/cyan), category labels ("CORE / FUNDAMENTALS", "BACKEND", "FRONTEND"), zoom controls on right side.
- `login-v1.png`: Full-width dark layout, "START YOUR ADVENTURE" hero text with cyan highlight, sign in/sign up tabs, form inputs with dark bg and border styling, "START GAME" CTA button in full cyan, Google OAuth option, "PORTFOLAND" logo with cyan accent.
- `login-v2.png`: Similar login but more compact, same color scheme and input styling, confirms the consistent cyberpunk aesthetic across all pages.

### Visual Insights:
- **Consistent cyberpunk palette**: Background #0A0E1A, primary accent cyan #00D4FF, secondary magenta #D946EF, success green #22C55E, XP/gold yellow #EAB308
- **Card patterns**: Dark cards (#0D1421) with subtle borders (#1E293B), glow effects on hover/active states, rounded-xl corners
- **Stat/metric displays**: Prominent number + label pattern with colored icons, used in dashboard and skill tree stat bars
- **Typography**: Monospace/gaming fonts for headers, clean sans-serif for body text, uppercase tracking-wider for labels
- **Hexagonal elements**: Used as disruptive layout shapes (skill tree nodes, timeline nodes, badges), part of the gaming identity
- **Glow effects**: Consistent box-shadow glow patterns matching the color system (cyan glow, magenta glow, etc.)
- **Panel structure**: HUD-style panels with top/bottom gradient accent lines, consistent padding/spacing
- **Fidelity level**: High-fidelity mockups - these are polished design references, not wireframes
- **Dual-mode system**: The app has Professional (clean, white bg, gray tones, blue accents) and Gaming (cyberpunk dark) modes. Project cards must support both modes.

## Requirements Summary

### Functional Requirements

**Data Model - New Project Model (separate from Experience):**
- Create a dedicated `Project` model in Prisma schema, separate from the Experience model
- Fields needed for recruiters and clients:
  - `id` (cuid, primary key)
  - `userId` (relation to User)
  - `title` (string, required)
  - `slug` (string, unique per user, for URL-friendly identification)
  - `description` (string, required, rich text or longer format than Experience's 1000 char limit)
  - `shortDescription` (string, optional, for card preview summaries)
  - `imageUrl` (string, optional, stores the uploaded image URL from storage)
  - `skills` / `technologies` (String[], tech stack used in the project)
  - `links` (flexible structure - embedded JSON or related model to support multiple link types: live site, repository, documentation, video demo, case study, etc.)
  - `featured` (boolean, default false)
  - `status` (enum: IN_PROGRESS, COMPLETED, ARCHIVED or similar)
  - `startDate` (DateTime)
  - `endDate` (DateTime, optional)
  - `order` (Int, optional, for custom sort order)
  - `createdAt` / `updatedAt` (timestamps)
- Each link in the flexible links structure needs: `label`, `url`, and `type` (e.g., LIVE, REPO, DOCS, VIDEO, CASE_STUDY, OTHER)

**Image Upload:**
- File upload capability for project cover/thumbnail images
- Storage solution needed (Vercel Blob or similar)
- Support common image formats (PNG, JPG, WEBP)
- Image optimization/resizing considerations for card thumbnails vs. detail view

**Dashboard - Dedicated Project Form:**
- Separate form from ExperienceForm for creating/editing projects
- Form fields: title, description, short description, image upload, technology tags, flexible links (add/remove multiple links with type + URL), featured toggle, status, dates
- Follow existing form patterns: react-hook-form + yupResolver + Yup schema validation
- Follow existing server action patterns: actionWrapper with Yup validation
- SkillTagInput component can be reused for technology/skill tags
- i18n support for form labels (EN/ES via next-intl)

**Portfolio Display - Professional Mode:**
- Enhanced project cards using shadcn Card components
- Card shows: cover image thumbnail, title, short description, technology badges (rounded-full bg-gray-100 style), link icons/buttons
- Featured projects displayed more prominently (larger card, top of grid, or highlighted border)
- Clean, white bg aesthetic matching professional palette (gray-900 text, gray-100 borders, blue-600 accents)

**Portfolio Display - Gaming Mode:**
- Enhanced project cards using GamingCard components (variant="glow" for standard, variant="featured" for featured projects)
- Card shows: cover image with cyberpunk overlay/treatment, title, description, GamingBadge for technologies (color="cyan"), link buttons with glow effects
- Featured projects with enhanced glow/neon treatment
- Cyberpunk aesthetic: bg #0A0E1A, cyan #00D4FF accents, magenta #D946EF for highlights

**Project Detail View (Modal/Expanded):**
- Clicking a project card opens an expanded detail view
- Shows: full-size image, complete description, all technology badges, all links with labels, project dates, status
- Professional mode: clean modal with shadcn Dialog or sheet component
- Gaming mode: HUDPanel-styled modal with glow effects and cyberpunk aesthetic
- Smooth open/close animation (Framer Motion)

**Public Portfolio Integration:**
- Update data fetching to query the new Project model instead of Experience with type PROJECT
- Update `getPublicProjectsByUsername` or create new data function for the Project model
- Update PortfolioData type to reference the new Project model
- Both ProfessionalProjects and GamingProjects components need updating to use new data shape

### Reusability Opportunities
- GamingCard, GamingBadge, GamingCardHeader, GamingCardTitle, GamingCardContent from `features/gaming/index.tsx` - direct reuse for gaming mode cards
- StatCard component for project count display in gaming mode
- HUDPanel for gaming mode detail view container
- shadcn Card, CardHeader, CardTitle, CardContent for professional mode cards
- SkillTagInput from `features/timeline/components/SkillTagInput.tsx` for technology tag input
- react-hook-form + yupResolver pattern from ExperienceForm
- actionWrapper pattern for server actions
- Data function pattern from `getPublicProjectsByUsername`
- Prisma type re-export pattern from `features/timeline/types/experience.ts`
- shadcn Dialog or Sheet component for detail view modal (check if already installed in `features/shadcn/ui/`)

### Scope Boundaries

**In Scope:**
- New `Project` Prisma model (separate from Experience)
- Image file upload with storage solution (Vercel Blob or similar)
- Flexible links structure (multiple link types per project)
- Featured project flag
- Dedicated project creation/editing form in dashboard
- Enhanced project cards in both Professional and Gaming portfolio modes
- Project detail modal/expanded view on card click
- Updated data fetching for public portfolio
- Yup validation schemas for project data
- Server actions for CRUD operations (create, read, update, delete projects)
- i18n translations for EN/ES
- Framer Motion animations for card interactions and modal

**Out of Scope:**
- Project categories/tags beyond the existing skills/technologies array
- Project ordering/sorting controls for portfolio visitors (admin can set order)
- Project analytics (view counts, click tracking)
- Migration of existing Experience records with type PROJECT to the new Project model (can be addressed separately)
- Project search/filter functionality on the public portfolio
- Collaborative projects (multiple users on one project)
- Project comments or endorsements
- AI-generated project descriptions (Phase 4 feature)

### Technical Considerations
- **Storage**: Vercel Blob or equivalent needed for image uploads; must work with Vercel deployment
- **Database**: MongoDB + Prisma 6.19; new Project model with proper indexes on userId and slug
- **Flexible Links**: MongoDB's document-based nature supports embedded JSON for links array, but consider a typed structure within Prisma (e.g., `links Json` field storing an array of `{ type, label, url }` objects)
- **Image Handling**: Consider Next.js Image component for optimization, max file size limits, accepted formats validation
- **Form Pattern**: react-hook-form + yupResolver + Yup schemas, following existing ExperienceForm conventions
- **Server Actions**: actionWrapper pattern with Yup validation, three-layer architecture (action -> service -> data)
- **Feature Structure**: New `features/projects/` directory with components/, types/, data/, actions/, services/, constants/, schemas/ subdirectories following feature-based architecture
- **Dual Mode Support**: All display components need Professional and Gaming variants
- **Existing Data**: Currently projects are Experience records with `type: PROJECT`; the new Project model will coexist. Future migration of existing data can be addressed separately.
- **Relation to User**: Project model needs `userId` foreign key with `onDelete: Cascade`, indexed
- **Portfolio Types Update**: `PortfolioData.projects` type needs updating from `ExperienceModel` to new `Project` model type
- **i18n**: All user-facing strings need translation keys in both EN and ES locale files
