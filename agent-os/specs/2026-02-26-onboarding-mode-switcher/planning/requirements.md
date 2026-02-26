# Phase 2D Requirements — Onboarding & Mode Switcher

**Date:** 2026-02-26
**Branch:** feature/classic-mode-2d
**Context:** Roadmap ROADMAP_V2.md Phase 2D

## What already exists (DO NOT redo)

**User model (`prisma/schema.prisma`):**
- `portfolioMode String @default("classic")` — already on the User model
- `sectionOrder String[] @default(["about", "experience", "skills", "projects"])` — default sections
- `sectionVisibility Json @default("{}")` — section visibility toggles

**Portfolio mode toggling:**
- `features/portfolio/components/PortfolioModeToggle.tsx` — client component with `useTransition` + server action + toast pattern
- `features/portfolio/actions/togglePortfolioMode.ts` — server action that calls `updatePortfolioModeService`
- `features/portfolio/services/portfolio.service.ts` — `updatePortfolioModeService(userId, mode)`
- `features/portfolio/data/updatePortfolioMode.data.ts` — Prisma `user.update({ portfolioMode })`
- `features/portfolio/constants/messages.ts` — `PORTFOLIO_MODES`, `PORTFOLIO_MESSAGES`
- `features/portfolio/constants/sections.ts` — `TECH_DEFAULT_SECTIONS`, `CLASSIC_DEFAULT_SECTIONS`

**Auth flow:**
- `app/[locale]/(auth)/register/page.tsx` — registration page, redirects to `/${locale}/dashboard` on success
- `app/[locale]/(auth)/login/page.tsx` — login page, redirects to `/${locale}/dashboard` on success
- Google OAuth `callbackURL` also points to `/${locale}/dashboard`
- `app/[locale]/(protected)/dashboard/page.tsx` — main dashboard (server component)
- `lib/auth.ts` — Better Auth configuration
- `lib/auth-client.ts` — `signUp`, `signIn` client functions

**Dashboard settings:**
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` — contains `PortfolioModeToggle` in a HUDPanel (Preferences section)
- The toggle already calls `togglePortfolioMode` action and shows toast
- Mode switch does NOT currently update `sectionOrder` or `sectionVisibility`

**i18n:**
- `messages/en.json` and `messages/es.json` via next-intl
- Auth namespace: `auth.login.*`, `auth.register.*`
- Dashboard namespace: `dashboard.*`

## Architectural decisions (RESOLVED — not open questions)

### D1: Where onboarding happens
**Decision:** Dedicated `/onboarding` page (`app/[locale]/(auth)/onboarding/page.tsx`) that the user is redirected to after their first signup/login when `onboardingCompleted` is `false`.

**Rationale:** A modal on first dashboard visit would require conditional rendering logic in the already complex dashboard page. A step inside registration would make the registration form longer and risk drop-off. A separate page is the simplest, most testable approach and follows the existing `(auth)` group routing pattern.

### D2: What triggers "first time"
**Decision:** Add a new `onboardingCompleted Boolean @default(false)` field on the User model in Prisma.

**Rationale:** Checking `sectionOrder` emptiness is fragile — it could be empty for other reasons. A dedicated boolean is explicit, queryable, and cheap. It defaults to `false` for all new users and gets set to `true` when onboarding completes. Existing users who already have `portfolioMode` set will also have `onboardingCompleted: false` in MongoDB (since the field didn't exist before), so we need a one-time data migration or a guard in the redirect logic.

### D3: Existing users skip onboarding
**Decision:** The redirect-to-onboarding logic checks TWO conditions: `onboardingCompleted === false` AND `createdAt` is after the deployment date (i.e., the user was created AFTER onboarding was deployed). This way existing users who registered before the feature was built never see onboarding, even though their `onboardingCompleted` field defaults to `false`.

**Simpler alternative chosen:** Run a one-time Prisma script to set `onboardingCompleted: true` for ALL existing users. Then the redirect logic only needs to check `onboardingCompleted === false`. The script goes in `scripts/migrate-onboarding-completed.ts`.

### D4: Mode switcher UX — confirmation modal
**Decision:** Yes, the mode switcher in settings (`PortfolioModeToggle`) will be enhanced with a confirmation dialog before switching. The dialog explains that switching modes changes the default sections and visual style but does NOT delete any data.

**Rationale:** The roadmap explicitly says "Warning al cambiar (no se pierden datos, cambia visual + secciones default)". A confirmation prevents accidental clicks.

### D5: What happens on mode switch
**Decision:** When the mode is changed (either during onboarding or via the settings toggle), the server action ALSO updates `sectionOrder` to the mode's defaults (`TECH_DEFAULT_SECTIONS` or `CLASSIC_DEFAULT_SECTIONS`) and resets `sectionVisibility` to all-visible. This replaces the current `updatePortfolioModeData` which only updates `portfolioMode`.

**Rationale:** Users expect the sections to match their mode. Without this, a user switching from Tech to Classic would still have `["about", "experience", "skills", "projects"]` as their sectionOrder, missing gallery/services/testimonials.

### D6: i18n approach
**Decision:** Add new i18n keys under `onboarding.*` namespace in both `messages/en.json` and `messages/es.json`. The onboarding page uses `useTranslations('onboarding')`.

## What this spec must build

### R1: Schema change — `onboardingCompleted` field
- Add `onboardingCompleted Boolean @default(false)` to the User model in `prisma/schema.prisma`
- Run `npx prisma db push` to sync (MongoDB — no migration files needed)
- Create `scripts/migrate-onboarding-completed.ts` — sets `onboardingCompleted: true` for all existing users

### R2: Onboarding page
**New files:**
- `app/[locale]/(auth)/onboarding/page.tsx` — `'use client'` page component

**UI behavior:**
- Full-screen page with the same dark `bg-[#0A0E1A]` aesthetic as the login/register pages
- Centered card with:
  - Welcome message: "What best describes your work?" / "¿Qué describe mejor tu trabajo?"
  - Two large clickable cards side by side:
    - **Digital / Online** (icon: `Terminal`) — "Developer, designer, content creator..." / selects `tech` mode
    - **In-Person / Service** (icon: `Briefcase`) — "Photographer, chef, architect, coach..." / selects `classic` mode
  - Each card has a title, subtitle with example professions, and an icon
  - Selected card gets a cyan highlight border
  - "Continue" button at the bottom (disabled until a choice is made)
- On submit:
  1. Call a new server action `completeOnboarding({ mode })` that:
     - Sets `portfolioMode` to the chosen mode
     - Sets `sectionOrder` to `TECH_DEFAULT_SECTIONS` or `CLASSIC_DEFAULT_SECTIONS`
     - Sets `sectionVisibility` to all-visible for the relevant sections
     - Sets `onboardingCompleted` to `true`
  2. Redirect to `/${locale}/dashboard`

### R3: Redirect logic — dashboard guards to onboarding
**Modified files:**
- `app/[locale]/(protected)/dashboard/page.tsx` — check `onboardingCompleted`; if `false`, redirect to `/${locale}/onboarding`
- Every other dashboard sub-page (portfolio, projects, skills, timeline, services, testimonials, gallery) — same guard

**Decision:** Instead of adding the guard to every sub-page individually, add it to the main dashboard page and to a shared utility function that sub-pages can call. Since the `(dashboard)` and `(protected)` route groups don't share a layout that runs server-side auth, each server page already does its own auth check. Add the onboarding check right after the auth check in each page.

**Simpler approach chosen:** Create a utility function `checkOnboarding(userId, locale)` in `features/onboarding/utils/checkOnboarding.ts` that reads `onboardingCompleted` from the DB and returns a redirect URL if needed. Each dashboard server page calls this after auth. This is the least invasive approach — no layout changes, no middleware changes.

### R4: Enhanced mode switcher with confirmation dialog
**Modified file:** `features/portfolio/components/PortfolioModeToggle.tsx`

**Changes:**
- Before calling `togglePortfolioMode`, show a confirmation dialog (can use `window.confirm()` or a simple inline confirmation state for MVP)
- The confirmation message explains: "Switching modes will change your portfolio's default sections and visual style. Your data (projects, experiences, skills, services, testimonials, gallery) will NOT be deleted. Continue?"
- On confirm: proceed with the toggle action (which now also updates sectionOrder and sectionVisibility via R5)

### R5: Enhanced `togglePortfolioMode` action — also update sections
**Modified files:**
- `features/portfolio/data/updatePortfolioMode.data.ts` — update to also set `sectionOrder` and `sectionVisibility`
- `features/portfolio/services/portfolio.service.ts` — pass section defaults to data layer

**Changes:**
- When mode is updated, also set `sectionOrder` to the new mode's default sections
- Also set `sectionVisibility` to an object where all relevant sections are `true`

### R6: Server action for onboarding completion
**New files:**
- `features/onboarding/actions/completeOnboarding.ts` — server action using `actionWrapper` + Yup validation
- `features/onboarding/schemas/onboarding.schema.ts` — Yup schema for `{ mode: 'tech' | 'classic' }`
- `features/onboarding/constants/messages.ts` — messages
- `features/onboarding/types/onboarding.ts` — types

### R7: i18n strings
**Modified files:** `messages/en.json`, `messages/es.json`

**New namespace `onboarding`:**
- `title` — "What best describes your work?" / "¿Qué describe mejor tu trabajo?"
- `subtitle` — "This helps us set up your portfolio with the right sections and style." / "Esto nos ayuda a configurar tu portfolio con las secciones y estilo correctos."
- `digitalTitle` — "Digital / Online" / "Digital / Online"
- `digitalDescription` — "Developer, designer, data scientist, content creator" / "Desarrollador, diseñador, científico de datos, creador de contenido"
- `serviceTitle` — "In-Person / Service" / "Presencial / Servicio"
- `serviceDescription` — "Photographer, chef, architect, coach, stylist" / "Fotógrafo, chef, arquitecto, coach, estilista"
- `continue` — "Continue" / "Continuar"
- `switchWarning` — "Switching modes will change your portfolio's default sections and visual style. Your data will NOT be deleted. Continue?" / "Cambiar de modo cambiará las secciones y estilo visual de tu portfolio. Tus datos NO se eliminarán. ¿Continuar?"

## Design constraints

- Onboarding page uses the same dark Tech aesthetic (`bg-[#0A0E1A]`, `font-mono`) as the login/register pages — it is NOT mode-dependent
- Follow `useTransition` + server action + `toast` (sonner) pattern for all mutations
- No new packages
- No tests required
- The feature-based architecture: `features/onboarding/` with actions, schemas, constants, types, utils subdirectories

## Out of scope

- Multi-step onboarding wizard (username picker, avatar upload, bio prompt) — this is step 1 only (mode selection)
- Animated transitions between mode selection cards
- A/B testing of onboarding copy
- Analytics tracking of onboarding completion rate
- Onboarding for existing users who already have a mode set (handled by migration script)
- Custom theme selection during onboarding (handled separately in dashboard settings)
