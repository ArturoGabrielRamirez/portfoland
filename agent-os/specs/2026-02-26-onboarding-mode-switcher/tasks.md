# Task Breakdown: Phase 2D — Onboarding & Mode Switcher

## Overview

**Spec:** `agent-os/specs/2026-02-26-onboarding-mode-switcher/spec.md`
**Branch:** `feature/classic-mode-2d`
Total Task Groups: 6
Total Tasks: 6 parent tasks, 22 sub-tasks

Task groups must be executed in order: TG1 → TG2 → TG3 → (TG4, TG5, TG6 can be parallel). TG1 provides the schema field, TG2 provides the server action, TG3 provides the page, TG4-6 modify existing code. No tests are required.

---

## Task List

---

### TG1: Schema Change & Migration Script

#### Task Group 1: Add `onboardingCompleted` field to User model
**Dependencies:** None
**Existing pattern to follow:** The `portfolioMode` field on User is the nearest neighbor

- [x] 1.0 Add `onboardingCompleted` field and create migration script
  - [x] 1.1 Modify `prisma/schema.prisma`
    - Add `onboardingCompleted Boolean @default(false)` on the line after `portfolioMode` (line 32):
      ```prisma
      portfolioMode         String   @default("classic")
      onboardingCompleted   Boolean  @default(false)
      ```
  - [x] 1.2 Run `npx prisma db push` to sync the schema to MongoDB
  - [x] 1.3 Create `scripts/migrate-onboarding-completed.ts`
    - Standalone script that updates all existing users to have `onboardingCompleted: true`
    - Content:
      ```ts
      import { PrismaClient } from '../app/generated/prisma'

      const prisma = new PrismaClient()

      async function main() {
        const result = await prisma.user.updateMany({
          data: { onboardingCompleted: true },
        })
        console.log(`Migrated ${result.count} users — set onboardingCompleted: true`)
      }

      main()
        .then(() => prisma.$disconnect())
        .catch((e) => {
          console.error(e)
          prisma.$disconnect()
          process.exit(1)
        })
      ```
    - Run after deployment: `npx tsx scripts/migrate-onboarding-completed.ts`

**Acceptance Criteria:**
- `prisma/schema.prisma` has `onboardingCompleted Boolean @default(false)` on the User model
- `npx prisma db push` completes without errors
- Migration script exists and can be run with `npx tsx scripts/migrate-onboarding-completed.ts`

---

### TG2: Onboarding Feature Module (Actions, Schema, Types, Utils)

#### Task Group 2: Create the `features/onboarding/` module with server action and utilities
**Dependencies:** TG1 (needs `onboardingCompleted` field in schema)
**Existing pattern to follow:** `features/portfolio/actions/togglePortfolioMode.ts` for the action; `features/portfolio/schemas/portfolio.schema.ts` for the Yup schema

- [x] 2.0 Create the onboarding feature module
  - [x] 2.1 Create `features/onboarding/types/onboarding.ts`
    - Export `CompleteOnboardingInput` interface:
      ```ts
      export interface CompleteOnboardingInput {
        mode: 'tech' | 'classic'
      }
      ```
  - [x] 2.2 Create `features/onboarding/constants/messages.ts`
    - Export `ONBOARDING_MESSAGES`:
      ```ts
      export const ONBOARDING_MESSAGES = {
        COMPLETED: 'Onboarding completed successfully',
        INVALID_MODE: 'Invalid portfolio mode',
        LOGIN_REQUIRED: 'Please log in to continue',
      } as const
      ```
  - [x] 2.3 Create `features/onboarding/schemas/onboarding.schema.ts`
    - Export `completeOnboardingSchema` Yup schema:
      ```ts
      import * as yup from 'yup'

      export const completeOnboardingSchema = yup.object({
        mode: yup.string().oneOf(['tech', 'classic']).required(),
      })
      ```
  - [x] 2.4 Create `features/onboarding/actions/completeOnboarding.ts`
    - Mark as `'use server'`
    - Import `auth` from `@/lib/auth`, `headers` from `next/headers`, `revalidatePath` from `next/cache`, `actionWrapper` from `@/features/core`, `prisma` from `@/lib/prisma`
    - Import `completeOnboardingSchema` from `../schemas/onboarding.schema`
    - Import `ONBOARDING_MESSAGES` from `../constants/messages`
    - Import `TECH_DEFAULT_SECTIONS`, `CLASSIC_DEFAULT_SECTIONS` from `@/features/portfolio/constants/sections`
    - Export `completeOnboarding` function:
      ```ts
      export async function completeOnboarding(input: Record<string, unknown>) {
        return actionWrapper(async () => {
          const session = await auth.api.getSession({ headers: await headers() })
          if (!session?.user?.id) {
            throw new Error(ONBOARDING_MESSAGES.LOGIN_REQUIRED)
          }

          const data = await completeOnboardingSchema.validate(input)

          const sections = data.mode === 'tech'
            ? [...TECH_DEFAULT_SECTIONS]
            : [...CLASSIC_DEFAULT_SECTIONS]
          const sectionVisibility = Object.fromEntries(sections.map(s => [s, true]))

          const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
              portfolioMode: data.mode,
              sectionOrder: sections,
              sectionVisibility,
              onboardingCompleted: true,
            },
          })

          revalidatePath('/', 'layout')

          return {
            payload: updatedUser,
            message: ONBOARDING_MESSAGES.COMPLETED,
          }
        })
      }
      ```
  - [x] 2.5 Create `features/onboarding/utils/checkOnboarding.ts`
    - Import `prisma` from `@/lib/prisma`, `redirect` from `next/navigation`
    - Export `checkOnboarding` function:
      ```ts
      export async function checkOnboarding(userId: string, locale: string) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { onboardingCompleted: true },
        })
        if (user && !user.onboardingCompleted) {
          redirect(`/${locale}/onboarding`)
        }
      }
      ```

**Acceptance Criteria:**
- `features/onboarding/` directory contains: `types/onboarding.ts`, `constants/messages.ts`, `schemas/onboarding.schema.ts`, `actions/completeOnboarding.ts`, `utils/checkOnboarding.ts`
- `completeOnboarding` action follows the `actionWrapper` + Yup validation pattern
- `completeOnboarding` sets `portfolioMode`, `sectionOrder`, `sectionVisibility`, and `onboardingCompleted` in a single Prisma update
- `checkOnboarding` utility redirects to `/onboarding` when `onboardingCompleted` is `false`

---

### TG3: Onboarding Page

#### Task Group 3: Create the onboarding page with mode selection UI
**Dependencies:** TG2 (needs `completeOnboarding` action)
**Existing pattern to follow:** `app/[locale]/(auth)/login/page.tsx` for visual style and component imports

- [x] 3.0 Build the onboarding page
  - [x] 3.1 Create `app/[locale]/(auth)/onboarding/page.tsx`
    - Mark as `'use client'` at the top
    - Imports:
      ```ts
      import { useState, useTransition } from 'react'
      import { useRouter } from 'next/navigation'
      import Link from 'next/link'
      import { useTranslations, useLocale } from 'next-intl'
      import { toast } from 'sonner'
      import { Terminal, Briefcase } from 'lucide-react'
      import { cn } from '@/lib/utils'
      import { completeOnboarding } from '@/features/onboarding/actions/completeOnboarding'
      import { TechButton, Spinner } from '@/features/tech'
      ```
    - State: `const [selectedMode, setSelectedMode] = useState<'tech' | 'classic' | null>(null)`
    - State: `const [isPending, startTransition] = useTransition()`
    - Translations: `const t = useTranslations('onboarding')`, `const tCommon = useTranslations('common')`
    - Router: `const router = useRouter()`, `const locale = useLocale()`
    - `handleContinue` function:
      ```ts
      const handleContinue = () => {
        if (!selectedMode) return
        startTransition(async () => {
          const result = await completeOnboarding({ mode: selectedMode })
          if (result.hasError) {
            toast.error(result.message)
          } else {
            router.push(`/${locale}/dashboard`)
          }
        })
      }
      ```
    - Page shell: `<div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center font-mono relative overflow-hidden">`
    - Hex grid background SVG (copy from login page):
      ```tsx
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 0 L30 7.5 L30 22.5 L15 30 L0 22.5 L0 7.5 Z" fill="none" stroke="#00D4FF" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>
      ```
    - Content container: `<div className="relative z-10 w-full max-w-2xl mx-auto px-4">`
    - Logo (inline hexagon SVG + "PORTFOLAND" text, same as login page):
      ```tsx
      <div className="flex justify-center mb-8">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 100 100">
            <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="hsl(174,100%,50%)" fillOpacity="0.3" stroke="hsl(174,100%,50%)" strokeWidth="2.5" />
            <text x="50" y="62" textAnchor="middle" fill="hsl(174,100%,50%)" fontSize="44" fontWeight="bold" fontFamily="monospace">P</text>
          </svg>
          <span className="font-mono font-bold text-lg tracking-[0.15em] text-foreground uppercase">
            {tCommon('appName')}
          </span>
        </Link>
      </div>
      ```
    - Title: `<h1 className="text-2xl md:text-3xl font-mono font-bold text-foreground text-center">{t('title')}</h1>`
    - Subtitle: `<p className="text-sm font-mono text-[#94A3B8] text-center mt-2 mb-8">{t('subtitle')}</p>`
    - Mode selection cards: `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">`
      - Digital card — `onClick={() => setSelectedMode('tech')}`:
        - Icon: `<Terminal className="w-8 h-8 text-[#00D4FF]" />`
        - Title: `{t('digitalTitle')}` in `text-lg font-mono font-bold text-foreground`
        - Description: `{t('digitalDescription')}` in `text-xs font-mono text-[#94A3B8]`
        - Selected state: `border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]`
        - Unselected state: `border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]`
      - Service card — `onClick={() => setSelectedMode('classic')}`:
        - Icon: `<Briefcase className="w-8 h-8 text-[#D946EF]" />`
        - Title: `{t('serviceTitle')}` in `text-lg font-mono font-bold text-foreground`
        - Description: `{t('serviceDescription')}` in `text-xs font-mono text-[#94A3B8]`
        - Same selected/unselected border logic using `cn()`
    - Continue button:
      ```tsx
      <div className="flex justify-center mt-6">
        <TechButton
          type="button"
          variant="primary"
          className="w-full max-w-xs uppercase tracking-[0.2em]"
          disabled={!selectedMode || isPending}
          onClick={handleContinue}
        >
          {isPending ? (
            <><Spinner /><span>{tCommon('loading')}</span></>
          ) : (
            t('continue')
          )}
        </TechButton>
      </div>
      ```
    - Change later note: `<p className="text-[10px] font-mono text-[#64748B] text-center mt-3">{t('changeLater')}</p>`

**Acceptance Criteria:**
- Page renders at `/{locale}/onboarding` with the correct dark Tech aesthetic
- Two mode selection cards are clickable and show a cyan highlight when selected
- "Continue" button is disabled until a mode is selected
- On continue, `completeOnboarding` is called with the selected mode
- On success, user is redirected to `/{locale}/dashboard`
- On error, `toast.error` is shown
- All text uses i18n keys from `onboarding.*` namespace

---

### TG4: Dashboard Redirect Guards

#### Task Group 4: Add onboarding check to all dashboard server pages
**Dependencies:** TG2 (needs `checkOnboarding` utility)
**Existing pattern to follow:** Each dashboard page already has an auth check — add onboarding check right after

- [x] 4.0 Add onboarding redirect guards to all dashboard pages
  - [x] 4.1 Modify `app/[locale]/(protected)/dashboard/page.tsx`
    - Add import: `import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding'`
    - After the session check (`if (!user) return null`), replace `return null` with a proper redirect:
      ```ts
      if (!session?.user?.id) { redirect(`/${locale}/login`) }
      ```
    - Then add:
      ```ts
      await checkOnboarding(session.user.id, locale)
      ```
    - Add `redirect` import from `next/navigation` if not already imported
    - Note: this page currently does `if (!user) return null` — change to redirect for consistency with other dashboard pages
  - [x] 4.2 Modify `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`
    - Add import: `import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding'`
    - After the existing auth redirect, add: `await checkOnboarding(session.user.id, locale)`
  - [x] 4.3 Modify `app/[locale]/(dashboard)/dashboard/projects/page.tsx`
    - Same pattern: add `checkOnboarding` import and call after auth check
  - [x] 4.4 Modify `app/[locale]/(dashboard)/dashboard/skills/page.tsx`
    - Same pattern: add `checkOnboarding` import and call after auth check
  - [x] 4.5 Modify `app/[locale]/(dashboard)/dashboard/timeline/page.tsx`
    - Same pattern: add `checkOnboarding` import and call after auth check
  - [x] 4.6 Modify `app/[locale]/(dashboard)/dashboard/services/page.tsx`
    - Same pattern: add `checkOnboarding` import and call after auth check
  - [x] 4.7 Modify `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx`
    - Same pattern: add `checkOnboarding` import and call after auth check
  - [x] 4.8 Modify `app/[locale]/(dashboard)/dashboard/gallery/page.tsx`
    - Same pattern: add `checkOnboarding` import and call after auth check

**Acceptance Criteria:**
- Visiting any dashboard URL when `onboardingCompleted === false` redirects to `/{locale}/onboarding`
- Visiting any dashboard URL when `onboardingCompleted === true` proceeds normally
- The auth check still works — unauthenticated users still redirect to `/login`
- The main dashboard page now redirects to `/login` instead of returning `null` when unauthenticated

---

### TG5: Enhanced Mode Switcher with Confirmation

#### Task Group 5: Add confirmation dialog to PortfolioModeToggle
**Dependencies:** TG2 (for the enhanced toggle that updates sections) — actually depends on TG6 which modifies the toggle action. But TG5 and TG6 can be done together since they touch different files.
**Existing pattern to follow:** The existing `PortfolioModeToggle` component

- [x] 5.0 Add confirmation dialog to the mode toggle
  - [x] 5.1 Modify `features/portfolio/components/PortfolioModeToggle.tsx`
    - Add state: `const [showConfirm, setShowConfirm] = useState(false)`
    - Change the existing `handleToggle` function: instead of calling the action directly, set `setShowConfirm(true)`
    - Add a new `confirmToggle` function that contains the existing action call logic:
      ```ts
      const confirmToggle = () => {
        startTransition(async () => {
          try {
            const result = await togglePortfolioMode({ mode: nextMode })
            if (result.hasError) {
              toast.error(result.message)
            } else {
              toast.success(t('modeToggle.success'))
            }
          } catch {
            toast.error(tCommon('errors.unexpected'))
          } finally {
            setShowConfirm(false)
          }
        })
      }
      ```
    - Wrap the component's return in a `<div>` instead of returning just a `<Button>`:
      ```tsx
      return (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            aria-label={`${t('modeToggle.label')}: ${modeLabel}`}
            className={cn(/* existing classes */)}
          >
            {/* existing button content */}
          </Button>
          {showConfirm && (
            <div className="mt-3 p-3 border border-[hsl(52,100%,50%,0.3)] bg-[hsl(52,100%,50%,0.05)] rounded-sm">
              <p className="text-[10px] font-mono text-[#FCD34D] mb-3">
                {t('modeToggle.switchWarning')}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmToggle}
                  disabled={isPending}
                  className="px-3 py-1 text-[10px] font-mono font-bold uppercase bg-[hsl(60,100%,50%)] text-[hsl(200,25%,8%)] rounded-sm hover:shadow-[0_0_12px_hsl(60_100%_50%_/_0.4)]"
                >
                  {t('modeToggle.confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1 text-[10px] font-mono text-[#64748B] hover:text-foreground"
                >
                  {t('modeToggle.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )
      ```

**Acceptance Criteria:**
- Clicking the mode toggle button shows a warning panel instead of immediately switching
- The warning panel displays the `switchWarning` i18n message in yellow/amber text
- "Confirm Switch" button triggers the actual mode switch with toast feedback
- "Cancel" button hides the warning panel
- Loading state is shown during the switch (existing `isPending` behavior)

---

### TG6: Enhanced Toggle Action — Section Reconfiguration

#### Task Group 6: Update togglePortfolioMode to also reset sections on mode switch
**Dependencies:** None (modifies existing files that TG5 calls, but TG5 and TG6 touch different files)
**Existing pattern to follow:** The existing data/service layer for portfolio mode

- [x] 6.0 Update mode toggle to also update sections
  - [x] 6.1 Modify `features/portfolio/data/updatePortfolioMode.data.ts`
    - Change the function signature to accept additional parameters:
      ```ts
      export async function updatePortfolioModeData(
        userId: string,
        mode: string,
        sectionOrder: string[],
        sectionVisibility: Record<string, boolean>
      ) {
        return await prisma.user.update({
          where: { id: userId },
          data: { portfolioMode: mode, sectionOrder, sectionVisibility },
        })
      }
      ```
  - [x] 6.2 Modify `features/portfolio/services/portfolio.service.ts`
    - Add import: `import { TECH_DEFAULT_SECTIONS, CLASSIC_DEFAULT_SECTIONS } from '../constants/sections'`
    - Update `updatePortfolioModeService` to compute and pass section data:
      ```ts
      export async function updatePortfolioModeService(
        userId: string,
        mode: "tech" | "classic"
      ) {
        if (!VALID_MODES.includes(mode)) {
          throw new Error(PORTFOLIO_MESSAGES.INVALID_MODE)
        }

        const sections = mode === 'tech'
          ? [...TECH_DEFAULT_SECTIONS]
          : [...CLASSIC_DEFAULT_SECTIONS]
        const sectionVisibility = Object.fromEntries(sections.map(s => [s, true]))

        return await updatePortfolioModeData(userId, mode, sections, sectionVisibility)
      }
      ```
    - Note: `togglePortfolioMode.ts` (the action) does NOT need changes — it already calls this service

**Acceptance Criteria:**
- When mode is toggled from Tech to Classic, `sectionOrder` is set to `CLASSIC_DEFAULT_SECTIONS` and `sectionVisibility` makes all Classic sections visible
- When mode is toggled from Classic to Tech, `sectionOrder` is set to `TECH_DEFAULT_SECTIONS` and `sectionVisibility` makes all Tech sections visible
- The existing `togglePortfolioMode` action works without modification (it calls the updated service)

---

### TG7: i18n Strings

#### Task Group 7: Add onboarding and mode switch warning translations
**Dependencies:** None — can be done at any point, but must be done before TG3 and TG5 are tested
**Files to modify:** `messages/en.json`, `messages/es.json`

- [x] 7.0 Add i18n translations for onboarding and enhanced mode toggle
  - [x] 7.1 Add `onboarding` namespace to `messages/en.json`
    - Add as a new top-level key (sibling to `auth`, `dashboard`, etc.):
      ```json
      "onboarding": {
        "title": "What best describes your work?",
        "subtitle": "This helps us set up your portfolio with the right sections and style.",
        "digitalTitle": "Digital / Online",
        "digitalDescription": "Developer, designer, data scientist, content creator",
        "serviceTitle": "In-Person / Service",
        "serviceDescription": "Photographer, chef, architect, coach, stylist",
        "continue": "Continue",
        "changeLater": "You can change this later in settings"
      }
      ```
  - [x] 7.2 Add `onboarding` namespace to `messages/es.json`
    - Same structure:
      ```json
      "onboarding": {
        "title": "¿Qué describe mejor tu trabajo?",
        "subtitle": "Esto nos ayuda a configurar tu portfolio con las secciones y estilo correctos.",
        "digitalTitle": "Digital / Online",
        "digitalDescription": "Desarrollador, diseñador, científico de datos, creador de contenido",
        "serviceTitle": "Presencial / Servicio",
        "serviceDescription": "Fotógrafo, chef, arquitecto, coach, estilista",
        "continue": "Continuar",
        "changeLater": "Puedes cambiar esto después en ajustes"
      }
      ```
  - [x] 7.3 Add mode toggle warning keys to `messages/en.json`
    - Under the existing `dashboard.modeToggle` object, add:
      ```json
      "switchWarning": "Switching modes will change your default sections and visual style. Your data (projects, skills, services, etc.) will NOT be deleted.",
      "confirm": "Confirm Switch",
      "cancel": "Cancel"
      ```
  - [x] 7.4 Add mode toggle warning keys to `messages/es.json`
    - Under the existing `dashboard.modeToggle` object, add:
      ```json
      "switchWarning": "Cambiar de modo cambiará tus secciones por defecto y estilo visual. Tus datos (proyectos, habilidades, servicios, etc.) NO se eliminarán.",
      "confirm": "Confirmar Cambio",
      "cancel": "Cancelar"
      ```

**Acceptance Criteria:**
- `messages/en.json` has `onboarding.*` keys and `dashboard.modeToggle.switchWarning/confirm/cancel` keys
- `messages/es.json` has the same structure with Spanish translations
- No existing keys are modified or removed

---

## Execution Order

Recommended execution order for incremental testability:

1. **TG7** — i18n strings (no dependencies, needed by TG3 and TG5)
2. **TG1** — Schema change + migration script (foundation for everything else)
3. **TG6** — Enhanced toggle action (modifies service/data layer, needed by TG5)
4. **TG2** — Onboarding feature module (actions, utils — needed by TG3 and TG4)
5. **TG5** — Enhanced mode switcher with confirmation (modifies PortfolioModeToggle)
6. **TG3** — Onboarding page (depends on TG2 for the action)
7. **TG4** — Dashboard redirect guards (depends on TG2 for checkOnboarding util)

## Key Implementation Notes (applies to all TGs)

- **No tests required** — consistent with all dashboard view components having zero test files
- **No new packages** — all dependencies (lucide-react, sonner, cn, useTransition, yup) are already installed
- **Feature-based architecture:** All new code goes in `features/onboarding/` except the page component which goes in `app/[locale]/(auth)/onboarding/`
- **Onboarding page is in `(auth)` route group** — same group as login/register, NOT in `(dashboard)` or `(protected)`. This ensures unauthenticated users who somehow reach `/onboarding` don't get a broken page (the server action will fail gracefully with "Please log in to continue")
- **`actionWrapper` pattern** — all server actions use `return actionWrapper(async () => { ... })` which returns `{ hasError: boolean, message: string, payload?: any }`
- **`useTransition` pattern** — always wrap server action calls in `startTransition(async () => { const result = await someAction(...); if (result.hasError) { toast.error(result.message) } else { toast.success(result.message) } })`
- **Import paths:**
  - Onboarding action: `@/features/onboarding/actions/completeOnboarding`
  - Onboarding utils: `@/features/onboarding/utils/checkOnboarding`
  - Section constants: `@/features/portfolio/constants/sections`
  - Portfolio mode data: `@/features/portfolio/data/updatePortfolioMode.data`
  - Portfolio mode service: `@/features/portfolio/services/portfolio.service`
  - Tech UI components: `@/features/tech` (barrel file exports `TechButton`, `Spinner`, etc.)
- **MongoDB note:** `prisma db push` is the correct command for MongoDB (no migration files). The `updateMany` in the migration script works with MongoDB's Prisma adapter.
- **`redirect()` from `next/navigation`** throws a special Next.js error internally — it must NOT be inside a try/catch. The `checkOnboarding` utility calls `redirect()` directly, which is correct because it runs in a server component context (not inside `actionWrapper`).
