# Spec 4A: Dashboard Layout Unification

**Status:** Ready for implementation
**Branch:** `feat/phase4-ai-portfolio-os`
**Dependencies:** None (foundation spec)
**Estimated effort:** 3-4 days

---

## Problem

The AI has 3 separate entry points with no shared context:

1. **CRTWithAI** in `DashboardRow1` — only on main dashboard (`/dashboard`)
2. **Standalone CRTWithAI** — only on skills page (`/dashboard/skills`), separate instance with its own trigger state
3. **AIAssistantFloat** — all other pages (timeline, projects, portfolio, gallery, services, testimonials), inferior chat-only widget that hides on `/dashboard` and `/dashboard/skills`

This fragmentation means there is no consistent AI entry point. Spec 4B (AI Context Engine) needs a single CRT instance on every page that receives `pageContext` to know what page the user is on. Without layout unification, the AI cannot become page-aware.

Additionally, every dashboard page duplicates the same boilerplate: auth check, prisma user fetch, `checkOnboarding()`.

---

## Solution

### 1. Create `DashboardPageLayout` — shared layout wrapper

A **client component** that renders `DashboardRow1` (WelcomeCard + CRTWithAI) as a standard top row on every Tech Mode dashboard page, with page-specific content below.

```
+-------------------------------------------------------------------+
| DashboardPageLayout                                               |
|   +---------------------------+-------------------------------+   |
|   | WelcomeCard               | CRTWithAI (with pageContext)  |   |
|   +---------------------------+-------------------------------+   |
|   |                                                           |   |
|   | {children} — page-specific content                        |   |
|   |                                                           |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

For **Classic Mode**, the same component renders a clean header (greeting + profile completion indicator) instead of the CRT row.

### 2. Add `pageContext` prop chain

`pageContext` flows: `page.tsx` -> `DashboardPageLayout` -> `DashboardRow1` -> `CRTWithAI` -> chat request body -> `/api/chat` route.

The chat route reads `pageContext` and injects a system message identifying the active page. This is the foundation for Spec 4B's page-aware tool registry.

### 3. Delete `AIAssistantFloat`

After all pages use `DashboardPageLayout`, the floating widget is obsolete. Remove it from the dashboard layout and delete the file.

### 4. CRT trigger context

The skills page currently has child components (`GitHubSyncPanel`, `AssessmentWidget`) that trigger AIEye animations (xpGain, lifeLoss, searching) on the standalone CRT. With the CRT moving to `DashboardPageLayout`, these children need a way to communicate upward.

Solution: `DashboardPageLayout` exposes trigger callbacks via a **React context** (`CRTTriggerContext`). Any child component can import `useCRTTriggers()` to fire animations. This is cleaner than prop-drilling and scales to future pages.

### 5. Extract shared page data fetching

Create a helper `getDashboardPageData(userId)` that returns the user object + dashboard stats in a single call. Every page imports this instead of duplicating prisma queries.

---

## Architecture

### New files

| File | Type | Purpose |
|------|------|---------|
| `features/tech/components/dashboard-page-layout.tsx` | Client component | Shared layout wrapper (Tech: DashboardRow1 + children, Classic: header + children) |
| `features/tech/context/crt-triggers.tsx` | React context | `CRTTriggerContext` + `useCRTTriggers()` hook for child -> CRT communication |
| `features/tech/types/page-context.ts` | Types | `PageContext` type union + `DashboardPageLayoutProps` |
| `features/dashboard/data/getDashboardPageData.data.ts` | Data helper | Shared user + stats fetching for all dashboard pages |

### Modified files

| File | Change |
|------|--------|
| `features/tech/components/dashboard-row1.tsx` | Accept + forward `pageContext` prop to CRTWithAI |
| `features/tech/components/crt-with-ai.tsx` | Accept `pageContext`, send in chat request body |
| `features/tech/types/dashboard.ts` | Add `pageContext` to `DashboardRow1Props` |
| `features/tech/index.tsx` | Export new components, remove `AIAssistantFloat` export |
| `app/[locale]/(dashboard)/layout.tsx` | Remove `AIAssistantFloat` usage |
| `app/[locale]/(dashboard)/dashboard/page.tsx` | Wrap content in `DashboardPageLayout`, use `getDashboardPageData` |
| `app/[locale]/(dashboard)/dashboard/skills/page.tsx` | Use `DashboardPageLayout` with `pageContext="skills"` |
| `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` | Remove standalone CRTWithAI, use `useCRTTriggers()` for GitHubSyncPanel/AssessmentWidget callbacks |
| `app/[locale]/(dashboard)/dashboard/timeline/page.tsx` | Wrap in `DashboardPageLayout` with `pageContext="timeline"` |
| `app/[locale]/(dashboard)/dashboard/projects/page.tsx` | Wrap in `DashboardPageLayout` with `pageContext="projects"` |
| `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` | Wrap in `DashboardPageLayout` with `pageContext="portfolio"` |
| `app/[locale]/(dashboard)/dashboard/gallery/page.tsx` | Wrap in `DashboardPageLayout` with `pageContext="gallery"` |
| `app/[locale]/(dashboard)/dashboard/services/page.tsx` | Wrap in `DashboardPageLayout` with `pageContext="services"` |
| `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx` | Wrap in `DashboardPageLayout` with `pageContext="testimonials"` |
| `app/api/chat/route.ts` | Read `pageContext` from body, inject page-awareness into system prompt |

### Deleted files

| File | Reason |
|------|--------|
| `features/tech/components/ai-assistant-float.tsx` | Replaced by CRT on every page |

---

## Detailed Design

### PageContext type

```typescript
// features/tech/types/page-context.ts

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

### CRTTriggerContext

```typescript
// features/tech/context/crt-triggers.tsx

interface CRTTriggers {
  triggerXPGain: () => void
  triggerLifeLoss: () => void
  triggerSearching: () => void
}

const CRTTriggerContext = createContext<CRTTriggers | null>(null)

export function useCRTTriggers(): CRTTriggers {
  const ctx = useContext(CRTTriggerContext)
  if (!ctx) throw new Error("useCRTTriggers must be used within DashboardPageLayout")
  return ctx
}
```

`DashboardPageLayout` provides this context. It manages the xpGainTrigger / lifeLossTrigger / searchingTrigger counters internally and passes them to `DashboardRow1`.

### DashboardPageLayout

```typescript
// features/tech/components/dashboard-page-layout.tsx
"use client"

export function DashboardPageLayout({
  children,
  pageContext,
  portfolioMode,
  // WelcomeCard + CRT data
  userName, userInitial, userImage,
  level, currentXP, maxXP, streakDays, activeSkillsCount,
  translations,
  bootStats,
}: DashboardPageLayoutProps) {
  // CRT trigger state (replaces per-page duplication)
  const [xpGainTrigger, setXpGainTrigger] = useState(0)
  const [lifeLossTrigger, setLifeLossTrigger] = useState(0)
  const [searchingTrigger, setSearchingTrigger] = useState(0)

  const triggers: CRTTriggers = useMemo(() => ({
    triggerXPGain: () => setXpGainTrigger(n => n + 1),
    triggerLifeLoss: () => setLifeLossTrigger(n => n + 1),
    triggerSearching: () => setSearchingTrigger(n => n + 1),
  }), [])

  const isTech = portfolioMode === "tech"

  return (
    <CRTTriggerContext.Provider value={triggers}>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 p-2">
        {isTech ? (
          <DashboardRow1
            userName={userName}
            userInitial={userInitial}
            userImage={userImage}
            level={level}
            currentXP={currentXP}
            maxXP={maxXP}
            streakDays={streakDays}
            activeSkillsCount={activeSkillsCount}
            translations={translations}
            bootStats={bootStats}
            pageContext={pageContext}
            onXPGain={triggers.triggerXPGain}
            onLifeLoss={triggers.triggerLifeLoss}
            onSearching={triggers.triggerSearching}
          />
        ) : (
          <ClassicDashboardHeader
            userName={userName}
            pageContext={pageContext}
          />
        )}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </CRTTriggerContext.Provider>
  )
}
```

### ClassicDashboardHeader

A simple header inside `DashboardPageLayout` for Classic Mode users. Shows:
- Greeting ("Welcome, {name}")
- Page title derived from `pageContext`
- Profile completion bar (percentage based on filled fields)

No CRT, no AIEye. Classic Mode AI assistance will be addressed in Spec 4B with a clean chat panel.

### getDashboardPageData helper

```typescript
// features/dashboard/data/getDashboardPageData.data.ts

export async function getDashboardPageData(userId: string) {
  const [dbUser, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, username: true,
        image: true, portfolioMode: true, bio: true,
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

This replaces the duplicated prisma + stats queries across 8 pages. `getUserDashboardStats` is already cached via `unstable_cache`, so calling it on every page is near-zero cost.

### Chat route changes

Minimal change for 4A — just read `pageContext` from body and add a line to the system prompt:

```typescript
const { messages, locale, pageContext } = await req.json()

const pageContextLine = pageContext
  ? `\nCURRENT PAGE: The user is on the "${pageContext}" page of their dashboard.`
  : ""

const system = getSystemPrompt(locale) + pageContextLine
```

Full page-aware tool registry is Spec 4B's scope.

---

## Classic Mode Design

Classic Mode users see `ClassicDashboardHeader` instead of the CRT row:

```
+-------------------------------------------------------------------+
| ClassicDashboardHeader                                            |
|   Welcome, {name}              [Portfolio Settings]  [View Public] |
|   Page title                                                      |
|   [========= 73% complete =========                          ]    |
+-------------------------------------------------------------------+
| {children} — page-specific content                                |
+-------------------------------------------------------------------+
```

- Clean white/gray styling consistent with Classic Mode
- Profile completion bar calculates: has bio, has image, has username, has skills, has experiences, has projects (6 fields, percentage = filled / 6)
- No AI widget for now. Classic Mode AI integration is deferred to Spec 4B where a clean chat panel replaces the deleted float

---

## Migration Strategy for Skills Page

The skills page is the most complex migration because it has:
1. A standalone `CRTWithAI` instance (line 231 of DashboardSkillsView.tsx)
2. Trigger state managed inside the view component
3. `GitHubSyncPanel` and `AssessmentWidget` that fire triggers

Migration steps:
1. The server `page.tsx` wraps content in `DashboardPageLayout` with `pageContext="skills"`
2. `DashboardSkillsView` removes its standalone `CRTWithAI` import and JSX
3. `DashboardSkillsView` removes its local trigger state (`xpGainTrigger`, `lifeLossTrigger`, `searchingTrigger`)
4. `GitHubSyncPanel` callbacks use `useCRTTriggers()` context instead of prop callbacks
5. `AssessmentWidget.onAssessmentPass` uses `useCRTTriggers().triggerXPGain()` instead of local state

The CRT now lives in `DashboardPageLayout` above the skills content, with the same visual result but shared layout.

---

## Migration Strategy for Main Dashboard

The main dashboard (`/dashboard/page.tsx`) is simpler:
1. Its existing `DashboardRow1` JSX is replaced by `DashboardPageLayout` wrapping the rest of the content
2. The ROW 2 grid (HexStatGrid, missions, skill radar, etc.) becomes `{children}` inside the layout
3. Stats fetching moves to `getDashboardPageData`
4. `pageContext="dashboard"`

---

## Acceptance Criteria

1. Every Tech Mode dashboard page shows WelcomeCard + CRTWithAI in the top row
2. The CRTWithAI instance receives `pageContext` indicating which page is active
3. The `AIAssistantFloat` component is deleted and removed from all imports
4. Classic Mode pages show a clean header with page title, user greeting, and profile completion bar — no CRT
5. The CRT chat on each page includes a system message identifying the active page (e.g., "User is currently on the Skills page")
6. XP/life/searching trigger callbacks work from the skills page (GitHubSyncPanel + AssessmentWidget still trigger the correct AIEye animation via `useCRTTriggers()`)
7. No visual regression on the main dashboard page
8. No duplicate prisma user queries — all pages use `getDashboardPageData`

---

## Out of Scope

- Page-aware tool registry (Spec 4B)
- AI context loading / portfolio snapshot (Spec 4B)
- Classic Mode AI chat panel (Spec 4B)
- Persistent chat across page navigations (Spec 4B)
