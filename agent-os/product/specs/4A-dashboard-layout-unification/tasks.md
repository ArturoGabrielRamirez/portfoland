# Spec 4A: Dashboard Layout Unification — Tasks

**Branch:** `feat/phase4-ai-portfolio-os`
**Spec:** `agent-os/product/specs/4A-dashboard-layout-unification/SPEC.md`

---

## Task 1: [DONE] Create PageContext type and CRTTriggerContext

**Files to create:**
- `features/tech/types/page-context.ts`
- `features/tech/context/crt-triggers.tsx`

### 1a. Create `features/tech/types/page-context.ts`

```typescript
import type { PortfolioMode } from "@/features/portfolio/types/portfolio"

export type PageContext =
  | "dashboard"
  | "skills"
  | "timeline"
  | "projects"
  | "portfolio"
  | "gallery"
  | "services"
  | "testimonials"
```

### 1b. Create `features/tech/context/crt-triggers.tsx`

```typescript
"use client"

import { createContext, useContext } from "react"

export interface CRTTriggers {
  triggerXPGain: () => void
  triggerLifeLoss: () => void
  triggerSearching: () => void
}

export const CRTTriggerContext = createContext<CRTTriggers | null>(null)

export function useCRTTriggers(): CRTTriggers {
  const ctx = useContext(CRTTriggerContext)
  if (!ctx) {
    // Return no-ops if not inside DashboardPageLayout (safety for Classic Mode)
    return {
      triggerXPGain: () => {},
      triggerLifeLoss: () => {},
      triggerSearching: () => {},
    }
  }
  return ctx
}
```

**Note:** Don't throw on missing context — Classic Mode pages won't have CRT triggers but child components like GitHubSyncPanel might still call them. Return no-ops instead.

**Verify:** Files compile without errors.

---

## Task 2: [DONE] Add `pageContext` to DashboardRow1 and CRTWithAI

**Files to modify:**
- `features/tech/types/dashboard.ts`
- `features/tech/components/dashboard-row1.tsx`
- `features/tech/components/crt-with-ai.tsx`

### 2a. Add `pageContext` to `DashboardRow1Props` in `features/tech/types/dashboard.ts`

Add to `DashboardRow1Props` interface:

```typescript
import type { PageContext } from "./page-context"

// Add to DashboardRow1Props:
/** Identifies which dashboard page is active (used by CRTWithAI for context-aware AI) */
pageContext?: PageContext
```

### 2b. Forward `pageContext` in `features/tech/components/dashboard-row1.tsx`

- Accept `pageContext` from props (destructure it)
- Pass `pageContext={pageContext}` to `<CRTWithAI>`

### 2c. Accept and send `pageContext` in `features/tech/components/crt-with-ai.tsx`

- Add `pageContext?: PageContext` to `CRTWithAIProps` interface (import the type)
- In the `useChat` call, add `pageContext` to the `body` object:

```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: "/api/chat",
  body: { locale, pageContext },  // <-- add pageContext here
  // ... rest unchanged
})
```

Find the existing `useChat` call in crt-with-ai.tsx (search for `useChat`) and add `pageContext` to its `body`.

**Verify:** TypeScript compiles. The main dashboard page still renders correctly (pageContext is optional, so no breaking change yet).

---

## Task 3: [DONE] Create `getDashboardPageData` helper

**File to create:**
- `features/dashboard/data/getDashboardPageData.data.ts`

```typescript
import { prisma } from "@/lib/prisma"
import { getUserDashboardStats } from "./getUserDashboardStats.data"
import type { PortfolioMode } from "@/features/portfolio/types/portfolio"
import type { DashboardStats } from "@/features/dashboard/types/dashboard"

export interface DashboardPageUser {
  id: string
  name: string
  email: string
  username: string | null
  image: string | null
  portfolioMode: PortfolioMode
  bio: string | null
}

export interface DashboardPageData {
  user: DashboardPageUser
  stats: DashboardStats
}

/**
 * Shared data fetcher for all dashboard pages.
 * Returns user profile + cached dashboard stats in a single call.
 */
export async function getDashboardPageData(userId: string): Promise<DashboardPageData> {
  const [dbUser, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        portfolioMode: true,
        bio: true,
      },
    }),
    getUserDashboardStats(userId),
  ])

  return {
    user: {
      id: userId,
      name: dbUser?.name ?? "User",
      email: dbUser?.email ?? "",
      username: dbUser?.username ?? null,
      image: dbUser?.image ?? null,
      portfolioMode: (dbUser?.portfolioMode ?? "classic") as PortfolioMode,
      bio: dbUser?.bio ?? null,
    },
    stats,
  }
}
```

**Verify:** File compiles. Import works from a test page.

---

## Task 4: [DONE] Create `DashboardPageLayout` component

**File to create:**
- `features/tech/components/dashboard-page-layout.tsx`

This is the core component. It wraps all dashboard page content.

### Implementation

```typescript
"use client"

import { useState, useMemo, type ReactNode } from "react"
import { CRTTriggerContext, type CRTTriggers } from "../context/crt-triggers"
import { DashboardRow1 } from "./dashboard-row1"
import type { PageContext } from "../types/page-context"
import type { PortfolioMode } from "@/features/portfolio/types/portfolio"

interface DashboardPageLayoutProps {
  children: ReactNode
  pageContext: PageContext
  portfolioMode: PortfolioMode
  // User data for WelcomeCard
  userName: string
  userInitial: string
  userImage?: string | null
  // Stats for WelcomeCard + CRT
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  activeSkillsCount?: number
  translations: {
    welcomeTitle: string
    welcomeSubtitle: string
    streak: string
    quickActionsTitle: string
    xpToLevel: string
  }
  bootStats?: {
    totalXP: number
    level: number
    activeSkillsCount: number
    currentStreak: number
    achievements: { current: number; total: number }
  }
}
```

**Tech Mode**: renders `DashboardRow1` (with `pageContext`) + children.
**Classic Mode**: renders `ClassicDashboardHeader` + children.

The component provides `CRTTriggerContext` so any child can call `useCRTTriggers()`.

### ClassicDashboardHeader

Inline in the same file (or extracted if > 40 lines). Shows:
- Page title (derive from `pageContext` — capitalize first letter)
- Greeting: "Welcome, {userName}"
- Minimal styling: white bg, gray border bottom, `text-gray-900`

Keep it simple — Classic Mode AI chat is deferred to 4B.

**Verify:** Component renders in isolation. Both Tech and Classic modes render without errors.

---

## Task 5: [DONE] Update barrel export

**File to modify:**
- `features/tech/index.tsx`

### Changes:
1. Add export: `export { DashboardPageLayout } from './components/dashboard-page-layout'`
2. Remove export: `export { AIAssistantFloat } from './components/ai-assistant-float'`
   - **Do NOT delete the file yet** — wait until Task 7 (all pages migrated) to avoid breaking the build.
3. Add export: `export { useCRTTriggers } from './context/crt-triggers'`

**Verify:** Barrel compiles without errors.

---

## Task 6: [DONE] Migrate main dashboard page

**File to modify:**
- `app/[locale]/(dashboard)/dashboard/page.tsx`

### Changes:

1. Import `DashboardPageLayout` from `@/features/tech`
2. Import `getDashboardPageData` from `@/features/dashboard/data/getDashboardPageData.data`
3. Replace the existing `prisma.user.findUnique` and `getUserDashboardStats` calls with a single `getDashboardPageData(user.id)` call
4. Keep `getTopRunners` call (it's page-specific, not shared)
5. Wrap the ROW 2 content (everything below the current `<DashboardRow1>`) with `<DashboardPageLayout pageContext="dashboard" ...>`
6. Remove the standalone `<DashboardRow1>` JSX — it's now inside `DashboardPageLayout`
7. Pass `portfolioMode={userData.portfolioMode}` to `DashboardPageLayout`

### Before (simplified):
```tsx
<div className="flex-1 ...">
  <DashboardRow1 ... />
  <div className="flex-1 ...">
    {/* ROW 2 grid content */}
  </div>
</div>
```

### After (simplified):
```tsx
<DashboardPageLayout
  pageContext="dashboard"
  portfolioMode={pageData.user.portfolioMode}
  userName={displayName}
  userInitial={initials}
  ...stats props...
  ...translations...
  ...bootStats...
>
  <div className="flex-1 ...">
    {/* ROW 2 grid content — unchanged */}
  </div>
</DashboardPageLayout>
```

**Verify:** Main dashboard looks identical to before. CRT works. AIEye animations work. No visual regression.

---

## Task 7: [DONE] Migrate skills page

**Files to modify:**
- `app/[locale]/(dashboard)/dashboard/skills/page.tsx`
- `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`

This is the most complex migration.

### 7a. Update `skills/page.tsx`

1. Import `getDashboardPageData` and `DashboardPageLayout`
2. Call `getDashboardPageData(session.user.id)` alongside existing data fetches
3. Wrap the `<DashboardSkillsView>` return in `<DashboardPageLayout pageContext="skills" ...>`
4. Get translations for WelcomeCard (same pattern as main dashboard page)
5. Pass all required props to `DashboardPageLayout`

```tsx
const [pageData, skills, categories, githubStatus] = await Promise.all([
  getDashboardPageData(session.user.id),
  getUserSkillsData(session.user.id).catch(() => []),
  getSkillCategoriesData(session.user.id).catch(() => []),
  getGitHubConnectionStatus(session.user.id),
])

// ... compute assessmentTokens, supportedUserSkills, assessmentHistory, stats ...

return (
  <DashboardPageLayout
    pageContext="skills"
    portfolioMode={pageData.user.portfolioMode}
    userName={displayName}
    userInitial={initials}
    userImage={pageData.user.image}
    level={pageData.stats.level}
    currentXP={pageData.stats.totalXP}
    maxXP={pageData.stats.nextLevelXP}
    streakDays={pageData.stats.currentStreak}
    activeSkillsCount={pageData.stats.activeSkillsCount}
    translations={...}
    bootStats={...}
  >
    <DashboardSkillsView
      skills={skills}
      categories={categories}
      stats={localStats}
      user={pageData.user}
      githubSyncedAt={githubStatus.syncedAt}
      githubStats={githubStatus.stats}
      isGitHubConnected={githubStatus.isConnected}
      assessmentTokens={assessmentTokens}
      supportedUserSkills={supportedUserSkills}
      assessmentHistory={assessmentHistory}
    />
  </DashboardPageLayout>
)
```

### 7b. Update `DashboardSkillsView.tsx`

1. **Remove** the `CRTWithAI` import
2. **Remove** the standalone `<CRTWithAI>` JSX block (lines ~231-237)
3. **Remove** local trigger state:
   - `const [xpGainTrigger, setXpGainTrigger] = useState(0)`
   - `const [lifeLossTrigger, setLifeLossTrigger] = useState(0)`
   - `const [searchingTrigger, setSearchingTrigger] = useState(0)`
4. **Import** `useCRTTriggers` from `@/features/tech/context/crt-triggers`
5. **Replace** GitHubSyncPanel trigger callbacks:
   ```tsx
   const { triggerXPGain, triggerLifeLoss, triggerSearching } = useCRTTriggers()

   // GitHubSyncPanel:
   onSearchingTrigger={triggerSearching}
   onXPGainTrigger={triggerXPGain}
   onLifeLossTrigger={triggerLifeLoss}
   ```
6. **Replace** `handleAssessmentPass`:
   ```tsx
   const handleAssessmentPass = useCallback(() => {
     triggerXPGain()
   }, [triggerXPGain])
   ```
7. Adjust the grid layout where the standalone CRT used to be — the GitHubSyncPanel can now take full width:
   ```tsx
   // Before: grid-cols-[1fr_280px] with GitHubSyncPanel + CRTWithAI
   // After: just GitHubSyncPanel, full width
   <div className="px-6 py-3 border-b border-[hsl(174,100%,50%,0.1)]">
     <GitHubSyncPanel ... />
   </div>
   ```

**Verify:**
- Skills page shows CRT in the top row (from DashboardPageLayout), NOT inline next to GitHubSyncPanel
- GitHub sync triggers the AIEye searching animation in the CRT above
- Assessment pass triggers the AIEye xp_gain animation
- Skill tree renders correctly below
- No console errors

---

## Task 8: [DONE] Migrate simple pages (timeline, projects, portfolio)

**Files to modify:**
- `app/[locale]/(dashboard)/dashboard/timeline/page.tsx`
- `app/[locale]/(dashboard)/dashboard/projects/page.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`

These are simpler — they don't have CRT triggers or special interactions.

### Pattern for each:

1. Import `getDashboardPageData` and `DashboardPageLayout`
2. Import `getTranslations` from `next-intl/server` (for WelcomeCard translations)
3. Replace existing `prisma.user.findUnique` with `getDashboardPageData`
4. Wrap the `<DashboardXxxView>` return in `<DashboardPageLayout pageContext="xxx" ...>`
5. Keep page-specific data fetches (experiences, projects, settings) as-is

### Template for each page:

```tsx
import { getDashboardPageData } from '@/features/dashboard/data/getDashboardPageData.data'
import { DashboardPageLayout } from '@/features/tech'
import { getTranslations } from 'next-intl/server'

export default async function DashboardXxxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) redirect(`/${locale}/login`)

  await checkOnboarding(session.user.id)

  const [pageData, specificData] = await Promise.all([
    getDashboardPageData(session.user.id),
    getSpecificData(session.user.id),
  ])

  const displayName = getDisplayName(pageData.user.name, pageData.user.email)
  const initials = getInitials(pageData.user.name, pageData.user.email)

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' })
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' })

  return (
    <DashboardPageLayout
      pageContext="xxx"
      portfolioMode={pageData.user.portfolioMode}
      userName={displayName}
      userInitial={initials}
      userImage={pageData.user.image}
      level={pageData.stats.level}
      currentXP={pageData.stats.totalXP}
      maxXP={pageData.stats.nextLevelXP}
      streakDays={pageData.stats.currentStreak}
      activeSkillsCount={pageData.stats.activeSkillsCount}
      translations={{
        welcomeTitle: tDashboard('welcome', { name: displayName }),
        welcomeSubtitle: tDashboard('welcomeSubtitle'),
        streak: tWelcome('streak', { count: pageData.stats.currentStreak }),
        quickActionsTitle: tWelcome('quickActions'),
        xpToLevel: tWelcome('xpToLevel', {
          xp: pageData.stats.xpToNextLevel,
          level: pageData.stats.level + 1,
        }),
      }}
      bootStats={{
        totalXP: pageData.stats.totalXP,
        level: pageData.stats.level,
        activeSkillsCount: pageData.stats.activeSkillsCount,
        currentStreak: pageData.stats.currentStreak,
        achievements: pageData.stats.achievements,
      }}
    >
      <DashboardXxxView
        data={specificData}
        user={pageData.user}
      />
    </DashboardPageLayout>
  )
}
```

**Note for portfolio page:** It has extra fields (`oauthImage`, `portfolioSettings`). Keep those fetches — just replace the user fetch with `getDashboardPageData`.

**Note:** The `getDisplayName` and `getInitials` helpers are currently defined locally in `dashboard/page.tsx`. Either:
- Copy them into each page (quick but duplicated), OR
- Extract them into `features/dashboard/utils/userHelpers.ts` (cleaner)

Recommendation: **Extract to shared utils** since they'll be used in 8 pages.

### 8a. Create `features/dashboard/utils/userHelpers.ts`

```typescript
export function getDisplayName(name: string | null, email: string): string {
  if (name) return name.split(" ")[0]
  return email.split("@")[0]
}

export function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }
  return email[0].toUpperCase()
}
```

### 8b-d. Migrate timeline, projects, portfolio pages

Apply the template pattern above. Each page keeps its own page-specific data.

**Verify per page:** Page renders with CRT in top row (Tech) or clean header (Classic). Page content unchanged.

---

## Task 9: [DONE] Migrate Classic-only pages (gallery, services, testimonials)

**Files to modify:**
- `app/[locale]/(dashboard)/dashboard/gallery/page.tsx`
- `app/[locale]/(dashboard)/dashboard/services/page.tsx`
- `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx`

Same pattern as Task 8. These pages use `modeClasses(portfolioMode)` in their view components for mode-aware styling. `DashboardPageLayout` handles the mode differentiation in the top row.

**Verify:** Each page renders correctly in both Tech and Classic modes.

---

## Task 10: [DONE] Update chat route to read `pageContext`

**File to modify:**
- `app/api/chat/route.ts`

### Changes:

1. Destructure `pageContext` from the request body alongside `messages` and `locale`:
   ```typescript
   const { messages, locale, pageContext } = await req.json()
   ```

2. Add page context to the system prompt:
   ```typescript
   function getSystemPrompt(locale?: string, pageContext?: string): string {
     const base = locale === 'es' ? TECH_SYSTEM_PROMPT_ES : TECH_SYSTEM_PROMPT_EN
     if (!pageContext) return base

     const pageContextLine = locale === 'es'
       ? `\nPAGINA ACTUAL: El usuario esta en la pagina "${pageContext}" de su dashboard. Adapta tus sugerencias al contexto de esta pagina.`
       : `\nCURRENT PAGE: The user is on the "${pageContext}" page of their dashboard. Adapt your suggestions to this page's context.`

     return base + pageContextLine
   }
   ```

3. Update the `streamText` call:
   ```typescript
   system: getSystemPrompt(locale, pageContext),
   ```

**Verify:** Chat messages include page awareness. Ask "where am I?" and the AI should reference the current page.

---

## Task 11: [DONE] Delete AIAssistantFloat and clean up

**Files to modify/delete:**
- DELETE `features/tech/components/ai-assistant-float.tsx`
- Modify `app/[locale]/(dashboard)/layout.tsx` — remove `AIAssistantFloat` import and usage
- Modify `features/tech/index.tsx` — remove the export (if not done in Task 5)

### 11a. Update dashboard layout

In `app/[locale]/(dashboard)/layout.tsx`:
1. Remove `AIAssistantFloat` from the import:
   ```typescript
   // Before:
   import { DashboardNav, AIAssistantFloat } from '@/features/tech'
   // After:
   import { DashboardNav } from '@/features/tech'
   ```
2. Remove `<AIAssistantFloat portfolioMode={user.portfolioMode} locale={locale} />` from the JSX

### 11b. Delete the file

Delete `features/tech/components/ai-assistant-float.tsx`.

### 11c. Clean up barrel export

Ensure `features/tech/index.tsx` no longer exports `AIAssistantFloat`.

**Verify:** Full build succeeds. No broken imports referencing `AIAssistantFloat` anywhere:
```bash
grep -r "AIAssistantFloat" --include="*.tsx" --include="*.ts" app/ features/
```
Should return zero results.

---

## Task 12: Final verification

### Checklist:

- [ ] **Tech Mode - Dashboard:** WelcomeCard + CRT visible in top row. ROW 2 content unchanged. AIEye animations work.
- [ ] **Tech Mode - Skills:** CRT in top row (NOT inline). GitHub sync triggers searching animation. Assessment pass triggers xp_gain animation.
- [ ] **Tech Mode - Timeline:** CRT in top row. Page content renders below.
- [ ] **Tech Mode - Projects:** CRT in top row. Page content renders below.
- [ ] **Tech Mode - Portfolio:** CRT in top row. Page content renders below.
- [ ] **Tech Mode - Gallery:** CRT in top row. Page content renders below.
- [ ] **Tech Mode - Services:** CRT in top row. Page content renders below.
- [ ] **Tech Mode - Testimonials:** CRT in top row. Page content renders below.
- [ ] **Classic Mode - All pages:** Clean header visible. No CRT. No AIAssistantFloat. Page content renders.
- [ ] **AIAssistantFloat:** Deleted. No references in codebase.
- [ ] **Chat route:** Receives `pageContext` and includes it in system prompt.
- [ ] **Build:** `npm run build` passes with no errors.
- [ ] **No regressions:** Side-by-side comparison of main dashboard before/after.

---

## Implementation Order Summary

```
Task 1  → Types + Context (foundation, no risk)
Task 2  → pageContext prop chain (non-breaking additions)
Task 3  → getDashboardPageData helper (new file, no impact)
Task 4  → DashboardPageLayout component (new file, no impact)
Task 5  → Barrel export update (prep for migration)
Task 6  → Migrate main dashboard (first real migration)
Task 7  → Migrate skills page (most complex)
Task 8  → Migrate simple pages (timeline, projects, portfolio)
Task 9  → Migrate Classic-only pages (gallery, services, testimonials)
Task 10 → Chat route pageContext (enables AI page awareness)
Task 11 → Delete AIAssistantFloat (cleanup after all migrations)
Task 12 → Final verification
```

Tasks 1-5 can be done in a single commit (foundation).
Tasks 6-9 are one commit per page or grouped (migrations).
Tasks 10-11 are a final cleanup commit.
