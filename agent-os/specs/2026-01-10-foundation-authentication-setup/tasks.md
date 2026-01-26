# Task Breakdown: Foundation & Authentication Setup

## Overview
Total Tasks: 8 Task Groups
Estimated Total Effort: Medium-High (foundational infrastructure)

---

## Task List

### Infrastructure Layer

#### Task Group 1: Environment & Database Setup
**Dependencies:** None
**Complexity:** Simple

- [ ] 1.0 Complete environment and database infrastructure
  - [x] 1.1 Create environment variables file
    - Create `.env.local` with all required variables
    - `DATABASE_URL` - MongoDB Atlas connection string format: `mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE`
    - `BETTER_AUTH_SECRET` - 32-character secret for session encryption
    - `BETTER_AUTH_URL` - Base URL (http://localhost:3000 for dev)
    - `GOOGLE_CLIENT_ID` - Google OAuth client ID
    - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
    - Create `.env.example` with placeholder values for documentation
  - [x] 1.2 Install and configure Prisma v6.19 for MongoDB
    - Run: `bun add -d prisma@6.19 && bun add @prisma/client@6.19`
    - Initialize: `npx prisma init --datasource-provider mongodb`
    - Configure `prisma/schema.prisma` with MongoDB provider
  - [x] 1.3 Create User model in Prisma schema
    - `id` - String with @id @default(auto()) @map("_id") @db.ObjectId
    - `email` - String @unique
    - `name` - String
    - `image` - String? (optional, for OAuth profile image)
    - `username` - String? @unique (optional, for future subdomain routing)
    - `locale` - String @default("en")
    - `emailVerified` - Boolean @default(false)
    - `createdAt` - DateTime @default(now())
    - `updatedAt` - DateTime @updatedAt
  - [x] 1.4 Create Prisma singleton client
    - Create `lib/prisma.ts` with singleton pattern
    - Handle development hot-reload without creating multiple instances
    - Export typed Prisma client instance
  - [x] 1.5 Verify database connection
    - Run: `npx prisma db push`
    - Verify models are created in MongoDB Atlas
    - Test connection with a simple query

**Acceptance Criteria:**
- Environment variables documented and configured
- Prisma connects to MongoDB Atlas successfully
- User model schema is valid and pushed to database
- Singleton Prisma client prevents multiple connections

---

### Authentication Layer

#### Task Group 2: Better Auth Core Setup
**Dependencies:** Task Group 1
**Complexity:** Medium

- [x] 2.0 Complete Better Auth core configuration
  - [x] 2.1 Install Better Auth
    - Run: `bun add better-auth`
  - [x] 2.2 Generate Better Auth schema models
    - Run: `npx @better-auth/cli@latest generate`
    - This generates Session, Account, Verification models
    - Review and merge generated schema into existing Prisma schema
    - Run: `npx prisma db push` to sync models
  - [x] 2.3 Create auth instance configuration
    - Create `lib/auth.ts`
    - Configure `betterAuth()` with Prisma adapter: `prismaAdapter(prisma, { provider: "mongodb" })`
    - Enable email/password: `emailAndPassword: { enabled: true }`
    - Configure Google OAuth in `socialProviders.google`
    - Set up user field mapping for `locale` and `username`
  - [x] 2.4 Create Better Auth API route handler
    - Create `app/api/auth/[...all]/route.ts`
    - Export GET and POST handlers using `toNextJsHandler(auth)`
    - This handles: /api/auth/sign-in, /api/auth/sign-up, /api/auth/callback/google, etc.
  - [x] 2.5 Create Better Auth client
    - Create `lib/auth-client.ts`
    - Use `createAuthClient()` from `better-auth/react`
    - Configure `baseURL` to match `BETTER_AUTH_URL`
    - Export: `signIn`, `signUp`, `signOut`, `useSession`

**Acceptance Criteria:**
- Better Auth schema models are generated and pushed to MongoDB
- Auth instance properly configured with Prisma adapter
- API route handles all authentication endpoints
- Client exports ready for use in components

---

#### Task Group 3: Protected Route Proxy
**Dependencies:** Task Group 2
**Complexity:** Medium

- [x] 3.0 Complete route protection with proxy.ts
  - [x] 3.1 Create proxy.ts at project root
    - Create `proxy.ts` (Next.js 16 replacement for middleware.ts)
    - Export named `proxy` function or default export
  - [x] 3.2 Configure route matchers
    - Define protected paths: `/dashboard`, `/settings/*`
    - Define public paths: `/`, `/login`, `/register`, `/api/auth/*`
    - Use `config.matcher` for path matching
  - [x] 3.3 Implement authentication check
    - Check session via Better Auth
    - Redirect unauthenticated users from protected routes to `/[locale]/login`
    - Redirect authenticated users from auth pages to `/[locale]/dashboard`
  - [x] 3.4 Integrate next-intl locale routing
    - Extract locale from URL or cookies
    - Redirect with correct locale prefix

**Acceptance Criteria:**
- Unauthenticated users redirected from /dashboard to /login
- Authenticated users redirected from /login to /dashboard
- Locale is preserved in all redirects

---

### Internationalization Layer

#### Task Group 4: next-intl Setup
**Dependencies:** Task Group 1
**Complexity:** Medium

- [x] 4.0 Complete internationalization infrastructure
  - [x] 4.1 Install and configure next-intl
    - Run: `bun add next-intl`
    - Create `i18n/` directory structure
    - Create `i18n/config.ts` with supported locales: ['en', 'es']
    - Configure default locale and locale detection
  - [x] 4.2 Create message files
    - Create `messages/en.json` with translation keys
    - Create `messages/es.json` with Spanish translations
    - Translation keys for: navigation, auth forms, dashboard, common UI
  - [x] 4.3 Set up locale-based routing
    - Restructure app directory with `[locale]` dynamic segment
    - Move pages under `app/[locale]/`
    - Configure next-intl request handling
  - [x] 4.4 Implement browser language detection
    - Detect user's preferred language from browser
    - Fall back to 'en' if unsupported language
    - Read from Accept-Language header
  - [x] 4.5 Create useLocale hook integration
    - Ensure translations available in Server Components
    - Configure Client Component providers

**Acceptance Criteria:**
- Messages load correctly for both locales
- URLs include locale prefix (/en/dashboard, /es/dashboard)
- Browser language detection works
- Server and Client Components can access translations

---

### UI Foundation Layer

#### Task Group 5: shadcn/ui Setup
**Dependencies:** Task Group 1
**Complexity:** Simple

- [ ] 5.0 Complete shadcn/ui component library setup
  - [x] 5.1 Initialize shadcn/ui
    - Run: `bunx shadcn@latest init`
    - Select default theme
    - Configure `components.json` with correct aliases
    - Set components path to `features/shadcn/ui/`
  - [ ] 5.2 Install initial components
    - Button: `bunx shadcn@latest add button`
    - Card: `bunx shadcn@latest add card`
    - Avatar: `bunx shadcn@latest add avatar`
    - Input: `bunx shadcn@latest add input`
    - Label: `bunx shadcn@latest add label`
    - Form: `bunx shadcn@latest add form`
    - Toast: `bunx shadcn@latest add toast`
    - Dropdown Menu: `bunx shadcn@latest add dropdown-menu`
  - [ ] 5.3 Configure CSS variables
    - Update `app/globals.css` with shadcn CSS variables
    - Ensure Tailwind CSS 4 compatibility
    - Set up dark mode support via CSS variables
  - [ ] 5.4 Create cn() utility
    - Create `lib/utils.ts` with cn() function
    - Use clsx and tailwind-merge for conditional classes

**Acceptance Criteria:**
- All specified components installed and importable
- Components render with default theme
- cn() utility available for class merging
- CSS variables configured for theming

---

### Pages & Components Layer

#### Task Group 6: Authentication Pages
**Dependencies:** Task Groups 2, 4, 5
**Complexity:** Medium

- [ ] 6.0 Complete authentication pages
  - [ ] 6.1 Write 2-6 focused tests for auth pages
    - Test login form renders with email/password fields
    - Test registration form renders with name/email/password/confirm fields
    - Test Google OAuth button renders
    - Test form validation error display
    - Skip edge cases and error state tests
  - [ ] 6.2 Create Yup validation schemas for auth forms
    - Create `features/auth/schemas/` directory
    - `loginSchema`: email (required, valid email), password (required, min 8)
    - `registerSchema`: name (required), email (required, valid), password (min 8), confirmPassword (matches password)
  - [ ] 6.3 Create Login page component
    - Create `app/[locale]/login/page.tsx`
    - Google OAuth button using `authClient.signIn.social({ provider: "google" })`
    - Email/password form using `authClient.signIn.email({ email, password })`
    - Client-side validation with react-hook-form and Yup
    - Error toast for invalid credentials
    - Link to /register for new users
    - Use shadcn/ui components (Button, Input, Label, Card)
  - [ ] 6.4 Create Registration page component
    - Create `app/[locale]/register/page.tsx`
    - Form fields: name, email, password, confirm password
    - Use `authClient.signUp.email({ name, email, password })`
    - Client-side validation with react-hook-form and Yup
    - Redirect to /dashboard after successful registration
    - Link to /login for existing users
  - [ ] 6.5 Create auth layout with translations
    - Create `app/[locale]/(auth)/layout.tsx`
    - Centered card layout for auth forms
    - Apply translations using next-intl
  - [ ] 6.6 Ensure auth page tests pass
    - Run ONLY the 2-6 tests written in 6.1
    - Verify forms render correctly
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-6 tests written in 6.1 pass
- Login page functional with both auth methods
- Registration page creates new users
- Form validation provides clear feedback
- All text uses translation keys

---

#### Task Group 7: Public Landing & Dashboard Pages
**Dependencies:** Task Groups 2, 4, 5, 6
**Complexity:** Medium

- [ ] 7.0 Complete public and protected pages
  - [ ] 7.1 Write 2-6 focused tests for pages
    - Test landing page renders hero section and CTAs
    - Test dashboard renders welcome message with user name
    - Test dashboard shows placeholder feature cards
    - Test language switcher toggles locale
    - Skip edge cases and exhaustive UI tests
  - [ ] 7.2 Create Public Landing page
    - Create `app/[locale]/page.tsx`
    - Hero section with product tagline and value proposition
    - Call-to-action buttons: Sign Up and Log In
    - Brief feature highlights (Timeline, Portfolio, AI Assistant)
    - Mobile-responsive layout using Tailwind CSS grid/flexbox
    - Redirect logged-in users to /dashboard
  - [ ] 7.3 Create Dashboard layout
    - Create `app/[locale]/(protected)/layout.tsx`
    - Header/navigation with user avatar and language switcher
    - Sidebar or top navigation structure
    - Protected route wrapper
  - [ ] 7.4 Create Dashboard page
    - Create `app/[locale]/(protected)/dashboard/page.tsx`
    - Welcome message displaying user's name
    - User avatar with fallback to initials if no image
  - [ ] 7.5 Create Dashboard feature cards
    - Progress indicator showing account completion percentage
    - Quick stats section with placeholder metrics
    - Placeholder cards with "Coming Soon" badges:
      - Timeline (v0.2.0)
      - Portfolio (v0.3.0)
      - AI Assistant (v0.4.0)
  - [ ] 7.6 Create Language Switcher component
    - Create `features/i18n/components/LanguageSwitcher.tsx`
    - Dropdown menu with English/Spanish options
    - Update URL with new locale
    - Save preference to user's `locale` field in database
  - [ ] 7.7 Ensure page tests pass
    - Run ONLY the 2-6 tests written in 7.1
    - Verify pages render correctly
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-6 tests written in 7.1 pass
- Landing page displays correctly for unauthenticated users
- Dashboard displays user info and placeholder cards
- Language switcher updates locale and saves preference

---

### Integration & Testing Layer

#### Task Group 8: Test Review & Integration Verification
**Dependencies:** Task Groups 1-7
**Complexity:** Simple

- [ ] 8.0 Review tests and verify integration
  - [ ] 8.1 Review all existing tests
    - Review tests from Task Group 6 (auth pages)
    - Review tests from Task Group 7 (landing/dashboard)
    - Total existing tests: approximately 4-12 tests
  - [ ] 8.2 Identify critical integration gaps
    - Focus on end-to-end auth flow gaps
    - Identify missing user workflow coverage
    - Do NOT assess entire application coverage
  - [ ] 8.3 Write up to 8 additional integration tests
    - Test complete registration flow (form -> redirect to dashboard)
    - Test complete login flow with email/password
    - Test Google OAuth callback handling
    - Test protected route redirect for unauthenticated user
    - Test authenticated user redirect from login to dashboard
    - Test locale persistence across navigation
    - Skip edge cases and error scenarios
  - [ ] 8.4 Run feature-specific tests
    - Run ONLY tests related to this feature
    - Expected total: approximately 12-20 tests
    - Do NOT run entire application test suite
    - Verify all critical user workflows pass
  - [ ] 8.5 Manual integration verification
    - Test full registration flow manually
    - Test full login flow with both methods
    - Verify dashboard displays correctly
    - Verify language switching works
    - Verify protected routes redirect properly

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 12-20 tests)
- Full auth flow works end-to-end
- Protected routes properly secured
- Language switching persists correctly
- No more than 8 additional tests added

---

## Execution Order

Recommended implementation sequence:

```
1. Infrastructure Layer
   Task Group 1: Environment & Database Setup

2. Authentication Layer (parallel tracks possible)
   Task Group 2: Better Auth Core Setup
   Task Group 4: next-intl Setup (can run in parallel with TG2)
   Task Group 5: shadcn/ui Setup (can run in parallel with TG2)
   Task Group 3: Protected Route Proxy (depends on TG2, TG4)

3. Pages & Components Layer
   Task Group 6: Authentication Pages
   Task Group 7: Public Landing & Dashboard Pages

4. Integration & Testing
   Task Group 8: Test Review & Integration Verification
```

---

## Technical Notes

### File Structure (Expected)

```
portfoland/
├── .env.local
├── .env.example
├── proxy.ts
├── prisma/
│   └── schema.prisma
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── auth-client.ts
│   └── utils.ts
├── i18n/
│   └── config.ts
├── messages/
│   ├── en.json
│   └── es.json
├── features/
│   ├── shadcn/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── avatar.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── form.tsx
│   │       ├── toast.tsx
│   │       └── dropdown-menu.tsx
│   ├── auth/
│   │   ├── schemas/
│   │   │   ├── login.schema.ts
│   │   │   └── register.schema.ts
│   │   └── types/
│   │       └── auth.ts
│   └── i18n/
│       └── components/
│           └── LanguageSwitcher.tsx
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts
│   ├── globals.css
│   └── [locale]/
│       ├── page.tsx (landing)
│       ├── login/
│       │   └── page.tsx
│       ├── register/
│       │   └── page.tsx
│       └── (protected)/
│           ├── layout.tsx
│           └── dashboard/
│               └── page.tsx
└── components.json
```

### Key Dependencies

- `prisma@6.19` + `@prisma/client@6.19` (MongoDB support)
- `better-auth` (authentication)
- `next-intl` (internationalization)
- `shadcn/ui` components
- `react-hook-form` + `@hookform/resolvers` (form handling)
- `yup` (validation schemas)

### Standards Compliance

- Follow three-layer architecture for any server actions
- Use Server Components by default, Client Components only when needed
- Props interfaces in `/types` directories
- Yup schemas for all form validation
- cn() utility for conditional Tailwind classes
- actionWrapper for consistent error handling (when server actions are added)
