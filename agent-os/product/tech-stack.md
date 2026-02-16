# Tech Stack

## Framework & Runtime

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Application Framework | Next.js | 16.1.1 | Full-stack React framework with App Router |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Runtime | Node.js | 20.x+ | Server-side JavaScript runtime |
| Package Manager | Bun | Latest | Fast package manager and runtime |

## Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| UI Library | React | 19.2.3 | Component-based UI development |
| CSS Framework | Tailwind CSS | 4.x | Utility-first CSS styling |
| UI Components | shadcn/ui + Radix UI | Latest | Accessible, customizable component library |
| Gaming Components | Custom Library | - | GamingCard, HUDPanel, XPBar, LevelBadge, etc. |
| Form Handling | react-hook-form | ^7.71.1 | Performant form state management |
| Form Validation | Yup + Zod | ^1.7.1 / ^4.3.6 | Schema-based form validation |
| Internationalization | next-intl | ^4.7.0 | English/Spanish localization |
| Animations | Framer Motion | ^12.30.0 | Smooth UI animations and transitions |
| Animations (Gaming) | anime.js | ^4.3.5 | Advanced gaming-style animations |
| Maps | @react-google-maps/api | ^2.20.8 | Google Maps for timeline feature |
| Themes | next-themes | ^0.4.6 | Dark/light theme switching |
| Icons | Lucide React | ^0.563.0 | Consistent icon library |
| Images | @vercel/blob | ^2.2.0 | Image storage and serving |

## Database & Storage

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Database | MongoDB Atlas | Latest | Cloud-hosted document database |
| ORM | Prisma | 6.19 | Type-safe database client and migrations |

## Authentication

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Auth Library | Better Auth | ^1.4.10 | TypeScript-first authentication framework |
| Primary Provider | Google OAuth | - | Google account login (primary method) |
| Additional Providers | GitHub, LinkedIn | - | Alternative social login options |

Better Auth is the authentication layer, providing OAuth flow, session management, and integration with Prisma for user storage. Migrated from NextAuth.js for better TypeScript support and plugin architecture.

## AI & Machine Learning

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| AI SDK | Vercel AI SDK | ^3.0.29 / ^6.0.0 | Core SDK installed (ai, @ai-sdk/openai, @ai-sdk/react) |
| LLM Provider | OpenAI / Anthropic | - | Provider packages installed, ready for API keys |

## Testing & Quality

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Test Runner | Vitest | ^4.0.18 | Fast unit/integration testing |
| Testing Library | @testing-library/react | ^16.3.2 | Component testing utilities |
| DOM Testing | @testing-library/dom | ^10.4.1 | DOM interaction testing |
| User Events | @testing-library/user-event | ^14.6.1 | Simulated user interactions |
| Linting | ESLint | 9.x | Code quality and style enforcement |
| Type Checking | TypeScript | 5.x | Static type analysis |

## Deployment & Infrastructure

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Hosting | Vercel | - | Serverless deployment with edge functions |
| CDN | Vercel Edge Network | - | Global content delivery |
| Domain Management | Vercel Domains | - | Subdomain routing (username.portfoland.com) |

## Development Tools

| Category | Technology | Purpose |
|----------|------------|---------|
| Version Control | Git | Source code management |
| Repository | GitHub | Code hosting and collaboration |
| IDE | VS Code / Cursor | Primary development environment |
| AI Coding | Antigravity + Claude Code | AI-assisted development |
| Skills | agent-os + 27 skills | Workflow automation and best practices |

## Versioning

### Semantic Versioning Strategy

Portfoland follows [Semantic Versioning](https://semver.org/) (SemVer) with the format **MAJOR.MINOR.PATCH**:

| Component | When to Increment | Example |
|-----------|-------------------|---------|
| **MAJOR** | Breaking changes, production-ready releases | 0.x.x -> 1.0.0 |
| **MINOR** | New features, roadmap phase completions | 0.1.0 -> 0.2.0 |
| **PATCH** | Bug fixes, minor improvements within a phase | 0.1.0 -> 0.1.1 |

### Version to Roadmap Phase Mapping

| Version | Phase | Milestone |
|---------|-------|-----------|
| v0.1.0 | Phase 1: Foundation | Database, auth, UI components, i18n, dashboard |
| v0.2.0 | Phase 2: Interactive Timeline | Google Maps + hexagons, experience cards, zoom |
| v0.3.0 | Phase 3: Skill Tree & Portfolio | Templates, editor, subdomain routing, SEO |
| v0.4.0 | Phase 4: AI Assistant | Vercel AI SDK, guided CV interview, document generation |
| v0.5.0 | Phase 5: Styles & Polish | Pixel art mode, character customization, achievements |
| v1.0.0 | Phase 6: Scale & Launch | Production-ready release |

### Version Tracking Approach

1. **package.json**: The `version` field in package.json is the source of truth (currently `0.3.0`)
2. **Git Tags**: Each minor version release is tagged (e.g., `git tag v0.1.0`)
3. **GitHub Releases**: Major milestones are documented as GitHub releases

### Changelog Strategy

Maintain a `CHANGELOG.md` file in the repository root following [Keep a Changelog](https://keepachangelog.com/) format.

Categories: Added, Changed, Deprecated, Removed, Fixed, Security.

## Architecture Decisions

### Why MongoDB Atlas + Prisma?
- Document-based structure fits well with flexible timeline and portfolio data
- Prisma provides type-safe queries and easy schema management
- MongoDB Atlas offers free tier for development and easy scaling

### Why Better Auth?
- TypeScript-first authentication framework with excellent type safety
- Plugin architecture for extending auth (2FA, organizations, etc.)
- Better integration with modern Next.js App Router patterns
- Session management handled automatically
- Works well with Prisma adapter for user storage
- Migrated from NextAuth.js for better DX and extensibility

### Why Vercel AI SDK?
- Native integration with Next.js and Vercel deployment
- Streaming responses for better UX during AI generation
- Provider-agnostic (can switch between OpenAI, Anthropic, etc.)
- Built-in conversation state management

### Why shadcn/ui + Custom Gaming Components?
- Unstyled, accessible components that can be fully customized
- Perfect for creating unique gaming/cyberpunk themes
- Copy-paste approach means full ownership of component code
- Custom gaming library (GamingCard, HUDPanel, XPBar) extends shadcn/ui

### Subdomain Strategy
- Vercel handles wildcard subdomains natively
- Next.js middleware parses subdomain for routing
- Each user gets username.portfoland.com
- Main app lives at portfoland.com or app.portfoland.com

### Two Visual Modes
- **Professional Mode:** Clean, ATS-friendly, corporate aesthetic
- **Gaming Mode:** Cyberpunk, neon colors, HUD elements, gamified
- Both modes share the same data, different presentation
