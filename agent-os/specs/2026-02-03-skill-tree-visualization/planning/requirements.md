# Spec Requirements: Skill Tree Visualization

## Initial Description

An RPG-style skill tree where users can visualize their technical skills with progression, dependencies, and unlockable nodes. This feature is part of Phase 3 of the product roadmap, representing the first major gamification element after completing the foundational Timeline feature (Phase 2). It aims to provide an engaging, visual representation of technical skills in an interactive tree structure similar to RPG game skill systems.

## Requirements Discussion

### First Round Questions

**Q1:** I assume skills will be automatically populated from the `skills` array in existing Timeline experiences (WORK, EDUCATION, PROJECT, CERTIFICATION), grouped into categories like "Programming Languages", "Frameworks", "Soft Skills", etc. Is that correct, or should users manually define skills separate from their experiences?

**Answer:** Hybrid approach - recover skills from Timeline experiences AND allow manual addition for self-taught skills (cases where they studied/learned on their own without formal courses or certifications).

**Q2:** I'm thinking each skill gains XP from experiences that list it (e.g., "React" mentioned in 3 jobs = higher level). Should skill levels be auto-calculated from experience duration and frequency, user-defined (e.g., 1-5 proficiency scale), or hybrid (auto-calculated with manual adjustment)?

**Answer:** User asked for a recommendation - something that motivates users to level up their skills. Recommendation provided: Hybrid XP-Based System with duration-weighted XP from experiences plus self-assessment for manual skills, using 5 gaming-style levels (Novice, Apprentice, Journeyman, Expert, Master).

**Q3:** RPG skill trees typically have dependencies (must learn "JavaScript" before unlocking "React"). Should we implement no dependencies, suggested dependencies, or enforced dependencies?

**Answer:** They want logical/realistic dependencies with ecosystem awareness. Example: if you go with Next.js or Remix, it would be harder to have a comparable academic level with Angular (they're different ecosystems). They want to identify how to handle this properly. Recommendation provided: Ecosystem Branch Model with parallel paths rather than strict prerequisites.

**Q4:** I assume a vertical or radial tree layout similar to games like Path of Exile or Final Fantasy X Sphere Grid. Do you prefer single tree, multiple trees, or galaxy/constellation style?

**Answer:** Galaxy/constellation style WITH hexagons (consistent with Timeline). They suggest using empty hexagons or paths to show progression. They want to define this better along with the dependency system.

**Q5:** Given the hexagon system in Timeline, should skill nodes also use hexagons for visual consistency, or would you prefer hexagons, circles, or mixed shapes?

**Answer:** Mostly hexagons. Circles only if needed for UX purposes that don't interfere with the hexagon design.

**Q6:** When clicking a skill node, should it show a skill detail card with level/XP info only, link back to Timeline experiences, or both?

**Answer:** BOTH - and they suggest a Pokemon card style flip animation. Front side: images and minimal info. Back side (flipped): links, detailed info, etc.

**Q7:** Timeline has both modes. For skill tree, should both Professional and Gaming modes exist, or is this feature Gaming-mode only?

**Answer:** Gaming mode ONLY for this feature (no Professional mode needed).

**Q8:** What should be explicitly OUT of scope for this initial implementation?

**Answer:** They were uncertain but were thinking about AI implementation that could measure/analyze the skill tree. Clarification provided: AI features are out of scope for v0.3.0 (this feature) but should be kept in mind for Phase 4 (v0.4.0+).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Timeline - Path: `C:/Users/user/code/nextjs/portfoland/features/timeline/`
- Components to potentially reuse: HexagonNode, TimelineConnections, experience type constants/colors
- Backend logic to reference: Experience data layer, XP calculation patterns from `features/timeline/constants/xp.ts`
- Existing models: Experience model with skills array field

### Follow-up Questions

**Follow-up 1:** For the galaxy clusters, should categories be fixed (predefined by us) or user-customizable (users can create their own galaxies)?

**Answer:** HYBRID approach - Have some predefined categories as a base (so users have something to start with), but allow customization. Creating a full career path for every profession would be too complex, so provide a good starting point that users can modify.

**Follow-up 2:** For manually added skills, what information should users provide?

**Answer:** Yes to all proposed fields:
- Skill name (required)
- Self-assessed level (Beginner/Intermediate/Advanced)
- Category assignment
- Learning sources (optional - courses, tutorials, books)
- Date started learning

Add any other fields if appropriate.

**Follow-up 3:** Should the system suggest skills to learn (empty hexagons) based on static suggestions, no suggestions, or smart suggestions?

**Answer:** MIX - Both static suggestions AND smart suggestions based on existing skills.

**Follow-up 4:** For the skill tree galaxy view on mobile, should we use simplified list view, touch-optimized galaxy, or both?

**Answer:** BOTH - Detect device and show appropriate view (simplified list for mobile, full galaxy for desktop).

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual files were added to the visuals folder.

## Requirements Summary

### Functional Requirements

**Skill Data Management:**
- Hybrid skill sourcing: automatically extract skills from Timeline experiences AND allow manual addition
- Manual skill entry with fields: name (required), self-assessed level, category, learning sources (optional), date started
- Skills linked to experiences that contributed to them

**Progression System (Hybrid XP-Based):**
- XP from experience-linked skills (duration-weighted):
  - 1-6 months = 100 XP
  - 6-12 months = 250 XP
  - 1-2 years = 500 XP
  - 2+ years = 750 XP
- XP from self-taught skills (self-assessment):
  - Beginner = 100 XP
  - Intermediate = 300 XP
  - Advanced = 600 XP
- 5 skill levels with gaming names:
  - Level 1 (0-199 XP): Novice
  - Level 2 (200-499 XP): Apprentice
  - Level 3 (500-999 XP): Journeyman
  - Level 4 (1000-1999 XP): Expert
  - Level 5 (2000+ XP): Master

**Dependency/Ecosystem System:**
- Ecosystem Branch Model with parallel paths (React ecosystem, Angular ecosystem, Vue ecosystem)
- Core skills (JS, TS, HTML, CSS) as universal prerequisites
- No hard locks - users can add skills from multiple ecosystems
- Visual indication of ecosystem branches and "bridges" between them
- "Multi-framework Developer" achievement for users with high-level skills in competing ecosystems

**Skill Categories:**
- Predefined base categories with user customization allowed
- Suggested categories:
  - Core/Fundamentals (center): HTML, CSS, JavaScript, TypeScript
  - Frontend: React, Angular, Vue, and their ecosystems
  - Backend: Node.js, Python, databases, APIs
  - DevOps: Docker, CI/CD, cloud platforms
  - Design: Figma, UI/UX principles
  - Soft Skills: Communication, Leadership, Problem-solving

**Skill Suggestions:**
- Mix of static suggestions (predefined logical progressions) and smart suggestions (based on user's existing skills)
- Empty hexagons shown as dim outlines with "?" indicating suggested skills to learn

**Visualization - Galaxy/Constellation Style:**
- Dark space background with subtle star particles
- Skill galaxies as hexagon clusters (one per category)
- Core skills at center, category galaxies branching outward
- Connection types:
  - Solid line: direct relationship
  - Dashed line: suggested progression path
  - Double line: strong prerequisite
- Hexagon nodes for skills (circles only if UX requires)
- Visual progression: nodes grow brighter/more elaborate with level

**Interactions:**
- Default view: zoomed out showing all galaxies as clusters
- Click galaxy: zoom into that constellation
- Click skill node: Pokemon card flip animation
  - Front: images and minimal info (skill name, level, icon)
  - Back: detailed info (XP, linked experiences, learning sources, dates)
- Pan/drag: navigate the skill space
- Empty hexagons: clickable to add skill

**Animations and Effects:**
- "Level Up" animations when XP thresholds are crossed
- Glowing nodes with cyberpunk effects
- "SKILL UNLOCKED" animations for newly added skills
- Skill mastery badges for Level 5 skills

**Responsive Design:**
- Desktop: full galaxy/constellation visualization with pan/zoom
- Mobile: simplified collapsible list view by category with skill cards
- Device detection to serve appropriate view

### Reusability Opportunities

- HexagonNode component from Timeline feature (adapt for skill nodes)
- TimelineConnections component patterns for skill connections
- Experience type color constants and glow effects from `features/timeline/constants/xp.ts`
- Gaming components: GamingCard (for flip animation), HUDPanel, XPBar, LevelBadge, GamingBadge
- Framer Motion for animations (already in use for Timeline)

### Scope Boundaries

**In Scope:**
- Skill data model and database schema
- Skill extraction from Timeline experiences
- Manual skill entry form
- XP calculation and level system
- Galaxy/constellation visualization (desktop)
- Simplified list view (mobile)
- Hexagon node components with level-based styling
- Skill category management (predefined + custom)
- Ecosystem branch visualization
- Pokemon card flip animation for skill details
- Skill-to-experience linking
- Empty hexagon suggestions (static + smart)
- Gaming mode styling only
- Pan/zoom/navigation interactions
- Level up animations and effects

**Out of Scope:**
- Professional mode (Gaming mode only)
- AI skill gap analysis
- AI skill recommendations from job descriptions
- AI-powered skill level assessment/verification
- AI career path suggestions
- Skill endorsements from other users
- Skill verification/testing
- Export to LinkedIn format
- Interview simulator
- Portfolio adaptation to visitor type

**Future Considerations (Phase 4 - AI Features):**
The following AI features have been documented in `agent-os/product/ai-features-ideas.md` for future implementation:
- Portfolio that adapts to visitor type (Recruiter/Tech Lead/etc)
- Conversational skill tree explorer
- AI-narrated timeline
- Dynamic CV generator optimized for job descriptions
- Interview simulator with feedback

The data model should be designed with AI-readiness in mind to support these Phase 4 features.

### Technical Considerations

**Data Model (AI-Ready):**
- Skill model with: id, name, category, level, totalXP, userId
- SkillSource model linking skills to experiences or manual entries
- SkillCategory model with: id, name, isCustom, userId (null for predefined)
- Consider metadata fields for future AI analysis

**Integration Points:**
- Timeline feature: extract skills from Experience.skills array
- User profile: display skill tree summary
- Dashboard: skill stats widget

**Technology Preferences:**
- Framer Motion for animations (consistent with Timeline)
- Canvas or SVG for galaxy visualization (evaluate performance)
- Existing gaming component library for UI elements
- Prisma/MongoDB for data persistence

**Similar Code Patterns to Follow:**
- Timeline feature structure: `features/timeline/`
- XP constants pattern: `features/timeline/constants/xp.ts`
- Type definitions pattern: `features/timeline/types/experience.ts`
- Server actions pattern: `features/timeline/actions/`
- Data layer pattern: `features/timeline/data/`
