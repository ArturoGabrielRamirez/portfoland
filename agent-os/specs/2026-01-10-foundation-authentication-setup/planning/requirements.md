# Spec Requirements: Foundation & Authentication Setup

## Initial Description

Phase 1 (v0.1.0) of Portfoland - a gamified career storytelling platform. This spec covers the foundational infrastructure including database setup with MongoDB Atlas and Prisma, authentication with NextAuth.js and Google OAuth, UI foundation with shadcn/ui, internationalization with next-intl, and a basic authenticated dashboard.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the User model should store: `id`, `email`, `name`, `image` (from Google OAuth), `createdAt`, `updatedAt`, plus a `locale` preference field for language (defaulting to Spanish). Should we also store a `username` field now for future subdomain routing (username.portfoland.com), or defer that to a later phase?
**Answer:** YES - Create the username field now for future subdomain routing.

**Q2:** I assume we will NOT store a password field since Google OAuth is the primary (and only initial) authentication method. Is that correct, or do you want to support email/password registration from the start?
**Answer:** YES - Support email/password authentication from the start, in addition to Google OAuth.

**Q3:** I assume after successful Google OAuth login, new users should be redirected to the dashboard immediately. For returning users, should they also go directly to the dashboard, or to a different landing page?
**Answer:** (Clarified in follow-up) Direct to Dashboard for all users after login.

**Q4:** I assume unauthenticated users visiting protected routes should be redirected to a `/login` page with a "Sign in with Google" button. Should there be any public marketing pages at the root `/` path, or should `/` redirect to login/dashboard based on auth state?
**Answer:** YES - "/" should be a public landing/marketing page.

**Q5:** For the initial authenticated dashboard, I assume we should show a simple welcome message with the user's name/avatar and placeholder cards for "Timeline" (coming in v0.2.0), "Portfolio" (v0.3.0), and "AI Assistant" (v0.4.0) - marked as "Coming Soon". Should we include any other elements like a progress indicator or quick stats?
**Answer:** YES - Include everything (progress indicator, stats, placeholder cards).

**Q6:** For shadcn/ui setup, I assume we should initialize it with a base theme (default shadcn) and plan to add retro/pixel custom themes in Phase 2 when building the interactive timeline. Should we set up any specific shadcn components now beyond the basics (Button, Card, Avatar, Toast), or install them as needed per feature?
**Answer:** Base theme for now, retro/pixel themes deferred to Phase 2. Install components as needed.

**Q7:** I assume the language switcher should be in the main navigation/header, persisting the user's choice to their profile (stored in the `locale` field). The default language should be Spanish since the primary audience is Argentina. Is that correct, or should we default to the browser's detected language?
**Answer:** Detect browser language (not hardcoded Spanish). Language preference saved to user profile.

**Q8:** Is there anything specific you want to explicitly EXCLUDE from this foundation phase?
**Answer:** None - everything proposed is fine.

### Existing Code to Reference

No similar existing features identified for reference. This is the initial foundation setup for a new project (only has initial Create Next App commit).

### Follow-up Questions

**Follow-up 1:** Cuando un usuario que ya tiene cuenta inicia sesion, ¿a donde deberia ir automaticamente? ¿Al Dashboard directamente, o a otra pagina especifica?
**Answer:** Option A - Direct to Dashboard.

**Follow-up 2:** Dado que quieres soporte de email/password desde el inicio, ¿deberiamos incluir el flujo completo de "Olvide mi contrasena" (forgot password) en esta fase?
**Answer:** Defer to later phase. Users can use Google OAuth as fallback if they forget their password.

**Follow-up 3:** Si incluimos el flujo de recuperacion de contrasena en el futuro, ¿tienes preferencia por algun servicio de email?
**Answer:** Resend (user already has an account). Note for future implementation.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual files were added to the planning/visuals folder.

## Requirements Summary

### Functional Requirements

**User Data Model:**
- `id` - Unique identifier (cuid)
- `email` - User email address (unique)
- `name` - Display name
- `image` - Profile image URL (from OAuth or uploaded)
- `username` - Unique username for future subdomain routing (username.portfoland.com)
- `password` - Hashed password for email/password authentication (nullable for OAuth-only users)
- `locale` - User's language preference (en/es)
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Authentication System:**
- NextAuth.js v5 (Auth.js) integration
- Google OAuth provider (primary)
- Email/password credentials provider
- Registration page with email, password, and name fields
- Login page with both Google OAuth and email/password options
- Session management with Prisma adapter
- Protected route middleware

**Password Reset Flow:**
- DEFERRED to later phase
- Users can use Google OAuth as fallback
- Future implementation will use Resend email service

**Routing & Pages:**
- `/` - Public landing/marketing page (unauthenticated)
- `/login` - Login page with Google OAuth + email/password options
- `/register` - Registration page for email/password signup
- `/dashboard` - Authenticated user dashboard (protected)
- Protected routes redirect unauthenticated users to `/login`
- Successful login redirects to `/dashboard`

**Dashboard Features:**
- Welcome message with user's name and avatar
- Placeholder cards for upcoming features:
  - Timeline (Coming in v0.2.0)
  - Portfolio (Coming in v0.3.0)
  - AI Assistant (Coming in v0.4.0)
- Progress indicator showing account completion status
- Quick stats section

**UI Foundation:**
- shadcn/ui component library
- Base/default shadcn theme
- Custom theme direction: **Brutalismo + Pixel detalles**
  - Layouts brutalistas: bordes duros, tipografía bold, colores raw, asimetría controlada
  - Elementos pixel art: iconos, ilustraciones, detalles decorativos
  - Full custom theme implementation DEFERRED to Phase 2
- Initial components: Button, Card, Avatar, Toast, Form inputs
- Additional components installed as needed per feature

**Internationalization:**
- next-intl for English and Spanish support
- Browser language detection for default locale
- Language switcher in main navigation/header
- User's language preference saved to profile (locale field)
- Locale-based routing

### Reusability Opportunities

- This is a greenfield project with no existing codebase to reference
- NextAuth.js Prisma adapter provides standard user/account/session models
- shadcn/ui components provide reusable UI patterns
- next-intl provides standard i18n patterns for Next.js

### Scope Boundaries

**In Scope:**
- MongoDB Atlas connection and Prisma ORM setup
- User model with all specified fields
- NextAuth.js v5 configuration with Google OAuth
- Email/password credentials authentication
- Registration and login pages
- Public landing page at root path
- Authenticated dashboard with placeholders and stats
- shadcn/ui initialization with base theme
- next-intl setup with English/Spanish support
- Language switcher component
- Protected route middleware

**Out of Scope:**
- Password reset/forgot password flow (deferred)
- Email sending functionality (Resend noted for future)
- Retro/pixel/comic custom themes (Phase 2)
- Interactive timeline features (Phase 2)
- Portfolio features (Phase 3)
- AI assistant features (Phase 4)
- Onboarding flow (Phase 6)
- GitHub/LinkedIn OAuth providers (Phase 5)

### Technical Considerations

**Tech Stack:**
- Next.js 16.1.1 with App Router
- React 19.2.3
- TypeScript 5.x
- Tailwind CSS 4.x
- MongoDB Atlas (cloud database)
- Prisma ORM (latest)
- NextAuth.js v5 (Auth.js)
- shadcn/ui (latest)
- next-intl (latest)
- Bun package manager
- Deployment: Vercel

**Architecture Patterns (per project standards):**
- Server Components first, Client Components only when needed
- Three-layer architecture: Actions -> Services -> Data
- Prisma types as foundation for TypeScript types
- Yup for form validation
- Tailwind utility-first CSS
- Props interfaces in /types directories
- actionWrapper for consistent error handling
- useTransition pattern for client-side mutations

**Integration Points:**
- MongoDB Atlas cloud database connection
- Google OAuth API credentials
- Prisma adapter for NextAuth.js session storage
- next-intl middleware for locale routing

**Future Integration Notes:**
- Resend email service account available for password reset implementation
- Username field ready for subdomain routing in Phase 3
