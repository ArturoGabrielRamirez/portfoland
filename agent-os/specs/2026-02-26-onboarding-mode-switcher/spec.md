# Specification: Phase 2D — Onboarding & Mode Switcher

## Goal

Add a one-step onboarding flow that asks new users whether their work is digital/online or in-person/service, sets their portfolio mode accordingly, and enhances the existing mode switcher in dashboard settings with a confirmation warning and automatic section reconfiguration.

## User Stories

- As a new user, I want to be asked about my work type during my first visit so that my portfolio starts with the right sections and visual style for my profession.
- As an existing user, I want to switch my portfolio mode from dashboard settings with a clear warning that my sections will change but my data will be preserved.
- As an existing user who registered before this feature was deployed, I want to skip onboarding entirely and continue using my portfolio as before.

## Specific Requirements

**R1: Schema Change — `onboardingCompleted` Field**

- Add `onboardingCompleted Boolean @default(false)` to the `User` model in `prisma/schema.prisma`, placed after the `portfolioMode` field (line 32)
- Run `npx prisma db push` to sync the schema to MongoDB (no migration files needed for MongoDB)
- Create `scripts/migrate-onboarding-completed.ts` — a standalone Prisma script that sets `onboardingCompleted: true` for ALL existing users:
  ```ts
  import { PrismaClient } from '../app/generated/prisma'
  const prisma = new PrismaClient()
  async function main() {
    const result = await prisma.user.updateMany({
      data: { onboardingCompleted: true },
    })
    console.log(`Updated ${result.count} users`)
  }
  main().then(() => prisma.$disconnect())
  ```
- Run this script once after deployment: `npx tsx scripts/migrate-onboarding-completed.ts`

**R2: Onboarding Feature Module**

Create the `features/onboarding/` module with the following files:

- `features/onboarding/types/onboarding.ts`:
  ```ts
  export interface CompleteOnboardingInput {
    mode: 'tech' | 'classic'
  }
  ```

- `features/onboarding/constants/messages.ts`:
  ```ts
  export const ONBOARDING_MESSAGES = {
    COMPLETED: 'Onboarding completed successfully',
    INVALID_MODE: 'Invalid portfolio mode',
    LOGIN_REQUIRED: 'Please log in to continue',
  } as const
  ```

- `features/onboarding/schemas/onboarding.schema.ts` — Yup schema:
  ```ts
  import * as yup from 'yup'
  export const completeOnboardingSchema = yup.object({
    mode: yup.string().oneOf(['tech', 'classic']).required(),
  })
  ```

- `features/onboarding/actions/completeOnboarding.ts` — server action using `actionWrapper`:
  - Authenticate user via `auth.api.getSession({ headers: await headers() })`
  - Validate input with `completeOnboardingSchema`
  - Call `prisma.user.update()` with:
    - `portfolioMode: data.mode`
    - `sectionOrder: data.mode === 'tech' ? [...TECH_DEFAULT_SECTIONS] : [...CLASSIC_DEFAULT_SECTIONS]`
    - `sectionVisibility: Object.fromEntries(sections.map(s => [s, true]))` where `sections` is the chosen mode's default sections
    - `onboardingCompleted: true`
  - `revalidatePath('/', 'layout')`
  - Return `{ payload: updatedUser, message: ONBOARDING_MESSAGES.COMPLETED }`

- `features/onboarding/utils/checkOnboarding.ts`:
  ```ts
  import { prisma } from '@/lib/prisma'
  import { redirect } from 'next/navigation'

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

**R3: Onboarding Page**

- Create `app/[locale]/(auth)/onboarding/page.tsx` — `'use client'` component
- Full-screen page with `bg-[#0A0E1A] font-mono` (same aesthetic as login/register pages)
- Layout structure:
  - Hex grid background SVG (same as login page)
  - Centered container `max-w-2xl mx-auto px-4`
  - Portfoland logo at the top (same logo component as login page — inline SVG hexagon with "P")
  - Title: `t('onboarding.title')` rendered as `<h1 className="text-2xl md:text-3xl font-mono font-bold text-foreground text-center">`
  - Subtitle: `t('onboarding.subtitle')` rendered as `<p className="text-sm font-mono text-[#94A3B8] text-center mt-2 mb-8">`
  - Two mode selection cards in a `grid grid-cols-1 sm:grid-cols-2 gap-4`:

    **Digital card:**
    ```tsx
    <button
      type="button"
      onClick={() => setSelectedMode('tech')}
      className={cn(
        "flex flex-col items-center gap-3 p-6 border rounded-sm text-center transition-all cursor-pointer",
        selectedMode === 'tech'
          ? "border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
          : "border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]"
      )}
    >
      <Terminal className="w-8 h-8 text-[#00D4FF]" />
      <span className="text-lg font-mono font-bold text-foreground">{t('onboarding.digitalTitle')}</span>
      <span className="text-xs font-mono text-[#94A3B8]">{t('onboarding.digitalDescription')}</span>
    </button>
    ```

    **Service card:**
    ```tsx
    <button
      type="button"
      onClick={() => setSelectedMode('classic')}
      className={cn(
        "flex flex-col items-center gap-3 p-6 border rounded-sm text-center transition-all cursor-pointer",
        selectedMode === 'classic'
          ? "border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
          : "border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]"
      )}
    >
      <Briefcase className="w-8 h-8 text-[#D946EF]" />
      <span className="text-lg font-mono font-bold text-foreground">{t('onboarding.serviceTitle')}</span>
      <span className="text-xs font-mono text-[#94A3B8]">{t('onboarding.serviceDescription')}</span>
    </button>
    ```

  - "Continue" button below the cards:
    ```tsx
    <TechButton
      type="button"
      variant="primary"
      className="w-full max-w-xs mx-auto mt-6 uppercase tracking-[0.2em]"
      disabled={!selectedMode || isPending}
      onClick={handleContinue}
    >
      {isPending ? <><Spinner /><span>{tCommon('loading')}</span></> : t('onboarding.continue')}
    </TechButton>
    ```

  - Small "You can change this later in settings" note below the button: `<p className="text-[10px] font-mono text-[#64748B] text-center mt-3">{t('onboarding.changeLater')}</p>`

- State: `const [selectedMode, setSelectedMode] = useState<'tech' | 'classic' | null>(null)`
- State: `const [isPending, startTransition] = useTransition()`
- `handleContinue`:
  ```ts
  startTransition(async () => {
    if (!selectedMode) return
    const result = await completeOnboarding({ mode: selectedMode })
    if (result.hasError) {
      toast.error(result.message)
    } else {
      router.push(`/${locale}/dashboard`)
    }
  })
  ```
- Imports: `completeOnboarding` from `@/features/onboarding/actions/completeOnboarding`, `TechButton`, `Spinner` from `@/features/tech`, `Terminal`, `Briefcase` from `lucide-react`, `cn` from `@/lib/utils`, `useTranslations`, `useLocale` from `next-intl`, `toast` from `sonner`, `useRouter` from `next/navigation`

**R4: Dashboard Redirect Guards**

Add onboarding check to all dashboard server pages. Each page already has an auth check pattern like:
```ts
const session = await auth.api.getSession({ headers: await headers() })
if (!session?.user?.id) { redirect(`/${locale}/login`) }
```

After the auth check, add:
```ts
await checkOnboarding(session.user.id, locale)
```

Import `checkOnboarding` from `@/features/onboarding/utils/checkOnboarding`.

**Files to modify (add the checkOnboarding call after auth check):**
1. `app/[locale]/(protected)/dashboard/page.tsx`
2. `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`
3. `app/[locale]/(dashboard)/dashboard/projects/page.tsx`
4. `app/[locale]/(dashboard)/dashboard/skills/page.tsx`
5. `app/[locale]/(dashboard)/dashboard/timeline/page.tsx`
6. `app/[locale]/(dashboard)/dashboard/services/page.tsx`
7. `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx`
8. `app/[locale]/(dashboard)/dashboard/gallery/page.tsx`

Note: The main dashboard page at `app/[locale]/(protected)/dashboard/page.tsx` currently does `if (!user) return null` instead of a redirect. Change this to also redirect to `/login` if no session, then add the onboarding check. The `locale` parameter comes from `params`.

**R5: Enhanced Mode Switcher with Confirmation**

Modify `features/portfolio/components/PortfolioModeToggle.tsx`:

- Add a `const [showConfirm, setShowConfirm] = useState(false)` state
- Change `handleToggle` to set `setShowConfirm(true)` instead of immediately calling the action
- Add a confirmation UI inline below the toggle button when `showConfirm` is true:
  ```tsx
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
  ```
- `confirmToggle` is the existing toggle logic (call `togglePortfolioMode({ mode: nextMode })` inside `startTransition`)
- The component needs to become a `<div>` wrapper instead of just a `<Button>` to accommodate the confirmation panel below it

**R6: Enhanced `togglePortfolioMode` — Also Update Sections**

Modify `features/portfolio/data/updatePortfolioMode.data.ts`:
- Accept additional parameters: `sectionOrder: string[]` and `sectionVisibility: Record<string, boolean>`
- Update the Prisma query to also set `sectionOrder` and `sectionVisibility`:
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

Modify `features/portfolio/services/portfolio.service.ts` — `updatePortfolioModeService`:
- Import `TECH_DEFAULT_SECTIONS`, `CLASSIC_DEFAULT_SECTIONS` from `../constants/sections`
- Compute section order and visibility from the mode:
  ```ts
  const sections = mode === 'tech'
    ? [...TECH_DEFAULT_SECTIONS]
    : [...CLASSIC_DEFAULT_SECTIONS]
  const sectionVisibility = Object.fromEntries(sections.map(s => [s, true]))
  return await updatePortfolioModeData(userId, mode, sections, sectionVisibility)
  ```

Modify `features/portfolio/actions/togglePortfolioMode.ts`:
- No changes needed — the action already calls the service, which now handles sections internally

**R7: i18n Strings**

Add to `messages/en.json` under top-level key `"onboarding"`:
```json
{
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
}
```

Add to `messages/es.json` under top-level key `"onboarding"`:
```json
{
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
}
```

Add to `messages/en.json` under `"dashboard" > "modeToggle"` (extend existing keys):
```json
{
  "switchWarning": "Switching modes will change your default sections and visual style. Your data (projects, skills, services, etc.) will NOT be deleted.",
  "confirm": "Confirm Switch",
  "cancel": "Cancel"
}
```

Add to `messages/es.json` under `"dashboard" > "modeToggle"` (extend existing keys):
```json
{
  "switchWarning": "Cambiar de modo cambiará tus secciones por defecto y estilo visual. Tus datos (proyectos, habilidades, servicios, etc.) NO se eliminarán.",
  "confirm": "Confirmar Cambio",
  "cancel": "Cancelar"
}
```

## Visual Design

No mockup files provided. The onboarding page follows the established dark Tech aesthetic from the login/register pages.

**Key visual reference:** `app/[locale]/(auth)/login/page.tsx` — use the same hex grid background SVG, same color palette (`bg-[#0A0E1A]`, cyan `#00D4FF`, muted `#94A3B8`, `#64748B`), same `font-mono` everywhere, same `TechButton` component for the primary CTA.

**Mode selection cards:** The two cards should be visually balanced. The Digital card uses `Terminal` icon with cyan accent (`#00D4FF`). The Service card uses `Briefcase` icon with magenta accent (`#D946EF`). The selected state for both uses cyan border + cyan background glow (consistent with the general UI language — cyan = active/selected).

## Existing Code to Leverage

**`app/[locale]/(auth)/login/page.tsx` and `register/page.tsx`**
- Canonical pattern for auth pages: full-screen dark layout, hex grid background, TechButton, TechInput, useTransition + toast pattern
- The onboarding page follows this visual language but is simpler (no form, just two clickable cards + a button)

**`features/portfolio/actions/togglePortfolioMode.ts`**
- The `actionWrapper` + Yup schema pattern to replicate for `completeOnboarding`

**`features/portfolio/constants/sections.ts`**
- `TECH_DEFAULT_SECTIONS` and `CLASSIC_DEFAULT_SECTIONS` — imported by both the onboarding action and the enhanced toggle action

**`features/portfolio/services/portfolio.service.ts`**
- `updatePortfolioModeService` — enhanced to also update sections

**`features/portfolio/data/updatePortfolioMode.data.ts`**
- The Prisma update — enhanced with additional fields

## Out of Scope

- Multi-step onboarding (username, avatar, bio) — this is only step 1 (mode selection)
- Onboarding for OAuth users (Google) — they go through the same redirect flow after first login
- Animated transitions or confetti on onboarding completion
- Analytics tracking of onboarding completion or mode choice
- A/B testing different onboarding flows or copy
- Middleware-level redirect (too complex for this scope — server page guards are sufficient)
- Tests for any of the new components
