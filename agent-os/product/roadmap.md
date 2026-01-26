# Product Roadmap

## Phase 1: Foundation (v0.1.0)

1. [ ] Database Schema & Prisma Setup — Configure MongoDB Atlas connection with Prisma ORM, define core models for users, profiles, timelines, skills, and portfolios `M`
2. [ ] Authentication System — Implement user registration, login, and session management with NextAuth.js including Google OAuth (primary) and GitHub `M`
3. [ ] UI Component Library — Set up shadcn/ui with custom retro/pixel/comic theme variants that align with the gamified aesthetic `S`
4. [ ] Internationalization — Configure next-intl for English and Spanish support with language switcher and locale-based routing `S`
5. [ ] User Dashboard — Create authenticated user dashboard displaying profile overview, timeline progress, and portfolio status `M`

## Phase 2: Interactive Timeline (v0.2.0)

6. [ ] Pixelated Map Component — Build interactive SVG-based pixelated map of Argentina with clickable regions and hover states `L`
7. [ ] Character Selection System — Create character customization interface with ethnicity options and fun characters (wizard, troll, etc.) with pixel art sprites `M`
8. [ ] Timeline Entry Creator — Build forms for adding timeline entries (education, work, projects) with location, date range, and description fields `M`
9. [ ] Career Field Configuration — Implement career field selection that dynamically adjusts available skill categories and terminology `S`
10. [ ] Skill Tree Visualization — Create video game-style skill tree component showing skill progression, dependencies, and mastery levels `L`
11. [ ] Timeline Playback View — Build animated timeline view that shows the user's journey chronologically with character movement across the map `L`
12. [ ] Achievement Image Generator — Implement server-side image generation (using Satori or similar) to create shareable achievement summary images `M`

## Phase 3: Portfolio Generator (v0.3.0)

13. [ ] Portfolio Template System — Create flexible portfolio template architecture supporting multiple themes (retro, comic, pixel, professional) `L`
14. [ ] Portfolio Content Editor — Build WYSIWYG-style editor for portfolio sections (about, projects, skills, contact) with real-time preview `L`
15. [ ] Subdomain Routing — Implement subdomain-based routing (username.portfoland.com) with Next.js middleware and DNS configuration `M`
16. [ ] Project Showcase Component — Create project display cards with images, descriptions, tech stack tags, and links `M`
17. [ ] Portfolio Analytics — Add basic analytics tracking for portfolio views, visitor sources, and popular sections `M`
18. [ ] Portfolio SEO & Meta Tags — Implement dynamic meta tags, Open Graph images, and structured data for portfolio pages `S`

## Phase 4: AI Assistant (v0.4.0)

19. [ ] Vercel AI SDK Integration — Set up Vercel AI SDK with streaming responses and conversation state management `M`
20. [ ] Guided CV Interview — Build conversational AI flow that asks users questions about their experience, skills, and goals to gather CV content `L`
21. [ ] AI Content Suggestions — Implement AI-powered suggestions for improving timeline entries, skill descriptions, and portfolio content `M`
22. [ ] CV Document Generator — Create PDF/document export for AI-generated CVs with professional formatting and templates `M`
23. [ ] Field-Specific AI Prompts — Develop specialized AI prompting for different career fields (tech, law, design, etc.) with industry-appropriate language `M`

## Phase 5: Social & Sharing (v0.5.0)

24. [ ] Social Authentication Providers — Add additional OAuth providers (LinkedIn, Twitter) for easier onboarding `S`
25. [ ] Public Profile Pages — Create public-facing profile pages showing timeline, skills, and portfolio preview `M`
26. [ ] Social Share Cards — Generate dynamic social share images for timelines and portfolios optimized for each platform `M`
27. [ ] Recruiter View Mode — Build optimized viewing experience for recruiters with quick navigation and candidate comparison features `M`
28. [ ] Export & Download Options — Allow users to export timeline data, CV documents, and portfolio content in various formats `S`

## Phase 6: Polish & Scale (v1.0.0)

29. [ ] Performance Optimization — Optimize bundle size, implement lazy loading, and add caching strategies for production readiness `M`
30. [ ] Mobile Responsive Refinement — Ensure all interactive components (map, skill tree, editor) work seamlessly on mobile devices `M`
31. [ ] Onboarding Flow — Create guided onboarding experience for new users explaining features and getting them started quickly `S`
32. [ ] Error Handling & Recovery — Implement comprehensive error boundaries, retry logic, and user-friendly error messages `S`
33. [ ] Accessibility Audit — Ensure WCAG compliance across all interactive components and keyboard navigation support `M`

> Notes
> - Order items by technical dependencies and product architecture
> - Each item represents an end-to-end functional and testable feature
> - Phase 1 establishes all foundational infrastructure before building features
> - Timeline (Phase 2) comes before Portfolio (Phase 3) as it generates content used in portfolios
> - AI features (Phase 4) enhance existing content creation flows
> - Social features (Phase 5) add distribution after core product is complete
> - v1.0.0 marks the first production-ready release
