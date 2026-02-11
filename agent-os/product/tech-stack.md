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
| UI Components | shadcn/ui | Latest | Accessible, customizable component library |
| Form Handling | react-hook-form | Latest | Performant form state management |
| Form Validation | Yup | Latest | Schema-based form validation |
| Internationalization | next-intl | Latest | English/Spanish localization |

## Database & Storage

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Database | MongoDB Atlas | Latest | Cloud-hosted document database |
| ORM | Prisma | Latest | Type-safe database client and migrations |

## Authentication

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Auth Library | NextAuth.js | 5.x (Auth.js) | Authentication with OAuth providers |
| Primary Provider | Google OAuth | - | Google account login (primary method) |
| Additional Providers | GitHub, LinkedIn | - | Alternative social login options |

Google OAuth is the confirmed primary authentication method. NextAuth.js handles the OAuth flow, session management, and integrates with Prisma for user storage.

## AI & Machine Learning

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| AI SDK | Vercel AI SDK | Latest | Streaming AI responses, conversation management |
| LLM Provider | OpenAI / Anthropic | - | Language model for CV generation and guidance |

## Testing & Quality

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Linting | ESLint | 9.x | Code quality and style enforcement |
| Type Checking | TypeScript | 5.x | Static type analysis |

## Deployment & Infrastructure

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Hosting | Vercel | - | Serverless deployment with edge functions |
| CDN | Vercel Edge Network | - | Global content delivery |
| Domain Management | Vercel Domains | - | Subdomain routing (username.portfoland.com) |

## Key Libraries & Utilities

| Category | Technology | Purpose |
|----------|------------|---------|
| Image Generation | Satori / @vercel/og | Server-side image generation for social cards |
| Date Handling | date-fns | Date manipulation and formatting |
| Icons | Lucide React | Consistent icon library |
| Animations | Framer Motion | Smooth UI animations and transitions |

## Development Tools

| Category | Technology | Purpose |
|----------|------------|---------|
| Version Control | Git | Source code management |
| Repository | GitHub | Code hosting and collaboration |
| IDE | VS Code | Primary development environment |
| API Testing | Postman / Thunder Client | API endpoint testing |

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
| v0.2.0 | Phase 2: Interactive Timeline | Pixelated map, characters, skill tree, achievements |
| v0.3.0 | Phase 3: Portfolio Generator | Templates, editor, subdomain routing, analytics |
| v0.4.0 | Phase 4: AI Assistant | Vercel AI SDK, guided CV interview, document generation |
| v0.5.0 | Phase 5: Social & Sharing | Public profiles, social cards, recruiter view |
| v1.0.0 | Phase 6: Polish & Scale | Production-ready release |

### Version Tracking Approach

1. **package.json**: The `version` field in package.json is the source of truth
2. **Git Tags**: Each minor version release is tagged (e.g., `git tag v0.1.0`)
3. **GitHub Releases**: Major milestones are documented as GitHub releases

### Changelog Strategy

Maintain a `CHANGELOG.md` file in the repository root following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [Unreleased]
### Added
- New features in development

## [0.1.0] - YYYY-MM-DD
### Added
- Database schema with Prisma and MongoDB Atlas
- Authentication with NextAuth.js and Google OAuth
- shadcn/ui component library with custom themes
- next-intl internationalization (EN/ES)
- User dashboard
```

Categories used in changelog:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed in future
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related changes

### Pre-release Versions

During development (v0.x.x), breaking changes may occur between minor versions. The v1.0.0 release marks the first stable, production-ready version with API stability guarantees.

## Architecture Decisions

### Why MongoDB Atlas + Prisma?
- Document-based structure fits well with flexible timeline and portfolio data
- Prisma provides type-safe queries and easy schema management
- MongoDB Atlas offers free tier for development and easy scaling

### Why NextAuth.js with Google OAuth?
- First-party integration with Next.js App Router
- Google OAuth provides familiar, trusted login for users
- Built-in support for multiple OAuth providers for future expansion
- Session management handled automatically
- Works well with Prisma adapter for user storage

### Why Vercel AI SDK?
- Native integration with Next.js and Vercel deployment
- Streaming responses for better UX during AI generation
- Provider-agnostic (can switch between OpenAI, Anthropic, etc.)
- Built-in conversation state management

### Why shadcn/ui?
- Unstyled, accessible components that can be fully customized
- Perfect for creating unique retro/pixel/comic themes
- Copy-paste approach means full ownership of component code
- Works seamlessly with Tailwind CSS

### Subdomain Strategy
- Vercel handles wildcard subdomains natively
- Next.js middleware parses subdomain for routing
- Each user gets username.portfoland.com
- Main app lives at portfoland.com or app.portfoland.com
