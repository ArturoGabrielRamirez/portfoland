# Portfolio Template System - Requirements

## Overview
Public portfolio page system with two visual modes (Professional and Gaming) that integrates existing Timeline and Skill Tree features into a single-viewport experience.

## Key Decisions

### Mode System
- Owner chooses default mode (`professional` | `gaming`) from dashboard
- Visitors see ONLY what the owner chose (no toggle for visitors)
- Store `portfolioMode` field on User model
- Clean URL: `/[username]` (no query params needed)

### Layout Constraints
- **Web (desktop)**: NO SCROLL - everything fits in one viewport
- **Mobile**: Scroll is OK and comfortable
- **Approach**: Panel-based/tabbed navigation - one section visible at a time with sidebar/nav to switch between sections

### Professional Mode
- 100% clean, standard, suitable for serious job applications
- No gaming elements (no glow, no neon, no hexagons)
- ATS-friendly: semantic HTML, proper heading hierarchy, no critical content in images
- Compliance-friendly structure
- Traditional CV/resume sections layout

### Gaming Mode
- Full cyberpunk with existing components (GamingCard, HUDPanel, XPBar, LevelBadge, etc.)
- Timeline map with hexagon nodes as interactive section
- Skill Tree galaxy view as interactive section
- All gaming visual effects (glow, neon colors, animations)

## Sections

1. **Hero/Header** - Avatar, name, title/role, social links
2. **About/Summary** - Brief professional summary
3. **Experience Timeline** - Integrates existing Timeline feature
4. **Skills** - Integrates existing Skill Tree feature
5. **Projects** - Reuses Experience model with `type: PROJECT` (no new data model)
6. **Contact** - Contact information/form
7. **AI Placeholder** - Visual representation only (actual AI functionality deferred to Phase 4 - adapts display based on visitor context)

## Architecture

### Data
- Add `portfolioMode` field to User model (`String`, default: `'gaming'`)
- Reuse Experience model filtered by `type: PROJECT` for projects section
- No new data models required

### UI / Settings
- Portfolio mode toggle added to **dashboard header** (consistent with existing pattern of adding tools there)
- No separate settings page needed

### Routes
- Public portfolio: `/[locale]/[username]` (already partially exists)
- Sections render within the same page via panel/tab navigation

### Design Reference
- Based on existing gaming components and cyberpunk theme
- Professional mode follows standard CV/portfolio conventions
- No visual mockups provided - use existing codebase patterns

## Technical Constraints
- Next.js 16.1.1 + App Router
- Tailwind CSS 4 + shadcn/ui
- Framer Motion for animations
- MongoDB + Prisma
- next-intl for i18n (EN/ES)

## Out of Scope (Deferred)
- AI-driven personalization logic (Phase 4 - only placeholder in this phase)
- Subdomain routing (Roadmap item #16)
- Portfolio SEO & Meta Tags (Roadmap item #18)
- PDF/CV export (Phase 4)
