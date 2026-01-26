# Specification: Foundation & Authentication Setup

## Goal

Establish the foundational infrastructure for Portfoland including MongoDB database with Prisma ORM v6.19, authentication system with Better Auth (Google OAuth + email/password), UI foundation with shadcn/ui, internationalization with next-intl, and an authenticated dashboard with placeholder cards for future features.

## User Stories

- As a new user, I want to register with email/password or Google OAuth so that I can create an account and access the platform
- As a returning user, I want to log in with my credentials or Google account so that I can access my personalized dashboard
- As a user, I want to switch between English and Spanish so that I can use the platform in my preferred language

## Specific Requirements

**MongoDB Atlas & Prisma Setup**
- Install Prisma v6.19 specifically (MongoDB support for v7 coming later): `bun add -d prisma@6.19 && bun add @prisma/client@6.19`
- Initialize with MongoDB provider: `npx prisma init --datasource-provider mongodb`
- MongoDB Atlas connection string format: `mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE`
- Use `@db.ObjectId` for id fields and `@map("_id")` for MongoDB document id mapping
- Use `npx prisma db push` instead of migrations (MongoDB flexible schema)
- Create singleton Prisma client instance in `lib/prisma.ts`

**User Data Model (Prisma Schema)**
- `id` - String with @id @default(auto()) @map("_id") @db.ObjectId
- `email` - String, unique, required
- `name` - String, required
- `image` - String, optional (profile image URL from OAuth)
- `username` - String, unique, optional (for future subdomain routing username.portfoland.com)
- `locale` - String, default "en" (language preference: "en" or "es")
- `emailVerified` - Boolean, default false
- `createdAt` - DateTime @default(now())
- `updatedAt` - DateTime @updatedAt
- Include Better Auth required models: Session, Account, Verification (generated via CLI)

**Better Auth Configuration**
- Install: `bun add better-auth`
- Create auth instance in `lib/auth.ts` using `betterAuth()` with Prisma adapter
- Configure Prisma adapter: `prismaAdapter(prisma, { provider: "mongodb" })`
- Environment variables: `BETTER_AUTH_SECRET` (32-char secret), `BETTER_AUTH_URL`
- Enable email/password: `emailAndPassword: { enabled: true }`
- Configure Google OAuth in `socialProviders.google` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Password hashing uses scrypt by default (OWASP recommended)
- Generate schema with: `npx @better-auth/cli@latest generate`

**Better Auth API Route**
- Create `app/api/auth/[...all]/route.ts`
- Export GET and POST handlers using `toNextJsHandler(auth)`
- This handles all auth endpoints: /api/auth/sign-in, /api/auth/sign-up, /api/auth/callback/google, etc.

**Better Auth Client**
- Create `lib/auth-client.ts` with `createAuthClient()` from `better-auth/react`
- Configure `baseURL` to match `BETTER_AUTH_URL`
- Exports: `signIn`, `signUp`, `signOut`, `useSession` hook

**Registration Page (/register)**
- Form fields: name, email, password, confirm password
- Client-side validation with react-hook-form and Yup schema
- Use `authClient.signUp.email({ name, email, password })` for registration
- Redirect to /dashboard after successful registration
- Link to /login for existing users

**Login Page (/login)**
- Google OAuth button using `authClient.signIn.social({ provider: "google" })`
- Email/password form using `authClient.signIn.email({ email, password })`
- Client-side validation with react-hook-form and Yup schema
- Error toast for invalid credentials
- Redirect to /dashboard after successful login
- Link to /register for new users

**Public Landing Page (/)**
- Hero section with product tagline and value proposition
- Call-to-action buttons for Sign Up and Log In
- Brief feature highlights (Timeline, Portfolio, AI Assistant)
- Mobile-responsive layout using Tailwind CSS grid/flexbox
- Accessible to unauthenticated users only (redirect logged-in users to /dashboard)

**Authenticated Dashboard (/dashboard)**
- Protected route (proxy redirects unauthenticated users to /login)
- Welcome message displaying user's name and avatar
- User avatar with fallback to initials if no image
- Progress indicator showing account completion status (percentage)
- Quick stats section with placeholder metrics
- Placeholder feature cards with "Coming Soon" badges: Timeline (v0.2.0), Portfolio (v0.3.0), AI Assistant (v0.4.0)
- Language switcher in header/navigation

**shadcn/ui Component Library**
- Initialize shadcn/ui using CLI with default theme
- Install to `features/shadcn/ui/` directory (not components/ui)
- Configure `components.json` with correct aliases
- Initial components to install: Button, Card, Avatar, Input, Label, Form, Toast, Dropdown Menu
- Use CSS variables for theming (automatic dark mode support)
- Defer brutalista-pixel custom theme to Phase 2 (layouts brutalistas + iconos/detalles pixel art)

**Internationalization (next-intl)**
- Configure next-intl with App Router in `i18n/` directory
- Create message files: `messages/en.json` and `messages/es.json`
- Implement browser language detection for default locale
- Locale-based routing with `[locale]` dynamic segment in app directory
- Language switcher component in main navigation
- Persist user's language choice to `locale` field in User model
- Translation keys for: navigation, auth forms, dashboard, common UI elements

**Protected Route Proxy (Next.js 16)**
- Create `proxy.ts` at project root (replaces middleware.ts in Next.js 16)
- Export named `proxy` function or default export
- Use `config.matcher` to define protected paths: `/dashboard`, `/settings/*`
- Define public paths that skip proxy: `/`, `/login`, `/register`, `/api/auth/*`
- Integrate next-intl for locale routing
- Check session via Better Auth and redirect unauthenticated users to `/[locale]/login`

## Visual Design

**Style Direction: Brutalismo + Pixel detalles**
- Layouts brutalistas: bordes duros, tipografía bold, colores raw, asimetría controlada
- Elementos pixel art: iconos, ilustraciones, detalles decorativos
- Phase 1: shadcn/ui default theme (base funcional)
- Phase 2: implementación completa del custom theme brutalista-pixel

## Existing Code to Leverage

**Create Next App Scaffold**
- Existing `app/` directory structure with App Router
- Tailwind CSS 4 already configured with postcss
- TypeScript configuration in place
- ESLint 9 with Next.js config
- Use existing `app/globals.css` for CSS variable definitions

**Project Standards (agent-os/standards/)**
- Follow three-layer architecture: Actions -> Services -> Data
- Use actionWrapper for consistent error handling in server actions
- Define props interfaces in `/types` directories, not in component files
- Yup schemas for validation with reusable field validators
- Server Components first, Client Components only when interactivity needed
- cn() utility for conditional Tailwind classes

## Out of Scope

- Password reset/forgot password flow (deferred, users can use Google OAuth as fallback)
- Email verification flow with Resend (noted for future implementation)
- Retro/pixel/comic custom themes (Phase 2)
- Interactive timeline features (Phase 2)
- Character selection and pixelated map (Phase 2)
- Portfolio generator and subdomain routing logic (Phase 3)
- AI assistant and CV generation (Phase 4)
- GitHub and LinkedIn OAuth providers (Phase 5)
- User profile editing and settings page
- Admin panel or user management
