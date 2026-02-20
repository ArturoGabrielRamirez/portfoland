# Specification: Phase 1 — Rebrand & Unification

## Goal

Rename "Gaming Mode" to "Tech Mode" and "Professional Mode" to "Classic Mode" across the entire codebase (DB, types, constants, components, i18n, AI prompts, tests), rename the `features/gaming/` folder to `features/tech/`, convert `/[locale]/[username]` routes into redirects to subdomain URLs, and update AI system prompts to use tech-futurista terminology instead of arcade/RPG language.

## User Stories

- As a visitor, I see "Tech Mode" and "Classic Mode" labels in the UI, never "Gaming" or "Professional".
- As a user, when I toggle my portfolio mode, the system stores `"tech"` or `"classic"` (not `"gaming"` / `"professional"`).
- As a visitor accessing `portfoland.com/en/username`, I get redirected to `username.portfoland.com`.
- As a user interacting with the AI chat, the tone is "Mission Briefing / tech-futurista", not "RPG Master / arcade".

## Specific Requirements

---

### Req 1: Core Type & Value Renaming

**1A. Prisma Schema Default**
- File: `prisma/schema.prisma` line 32
- Change: `@default("professional")` → `@default("classic")`
- No Prisma enum exists — it's a plain `String` field, so no enum migration needed.

**1B. TypeScript PortfolioMode Union**
- File: `features/portfolio/types/portfolio.ts` line 19
- Change: `export type PortfolioMode = 'professional' | 'gaming';` → `export type PortfolioMode = 'classic' | 'tech';`

**1C. Constants Object**
- File: `features/portfolio/constants/messages.ts` lines 15-18
- Change:
  ```ts
  // Before
  export const PORTFOLIO_MODES = {
    PROFESSIONAL: 'professional',
    GAMING: 'gaming',
  } as const;
  // After
  export const PORTFOLIO_MODES = {
    CLASSIC: 'classic',
    TECH: 'tech',
  } as const;
  ```
- All consumers of `PORTFOLIO_MODES.PROFESSIONAL` and `PORTFOLIO_MODES.GAMING` must update to `PORTFOLIO_MODES.CLASSIC` and `PORTFOLIO_MODES.TECH`.

**1D. Validation Schema**
- File: `features/portfolio/schemas/portfolio.schema.ts` line 10
- Update references to use new constant key names (`PORTFOLIO_MODES.CLASSIC`, `PORTFOLIO_MODES.TECH`).

**1E. Service Layer**
- File: `features/portfolio/services/portfolio.service.ts` line 27
- Change: `mode: "gaming" | "professional"` → `mode: "tech" | "classic"`
- Line 13: Update `VALID_MODES` array to use new constant keys.

**1F. MongoDB Migration Script**
- Create: `scripts/migrate-portfolio-modes.ts`
- This script updates ALL existing users in MongoDB:
  - `portfolioMode: "professional"` → `portfolioMode: "classic"`
  - `portfolioMode: "gaming"` → `portfolioMode: "tech"`
  - Clear stale narrative cache keys: `$unset` all `meta.aiNarrative_gaming_*` and `meta.aiNarrative_professional_*` keys
- Use Prisma's `$runCommandRaw` to run bulk `updateMany` operations.
- The script must be idempotent (safe to run multiple times).
- Print count of updated documents.

---

### Req 2: Component File & Folder Renaming

**2A. Rename `features/gaming/` → `features/tech/`**
- Rename the entire folder.
- Update the barrel file `features/tech/index.tsx` (formerly `features/gaming/index.tsx`):
  - Update file header comment from "Cyberpunk/gaming-themed" to "Tech Mode UI components".
  - Rename all `Gaming*` exports to `Tech*`: `GamingButton` → `TechButton`, `GamingInput` → `TechInput`, `GamingCard` → `TechCard`, `GamingCardHeader` → `TechCardHeader`, `GamingCardTitle` → `TechCardTitle`, `GamingCardContent` → `TechCardContent`, `GamingAvatar` → `TechAvatar`, `GamingBadge` → `TechBadge`.
- Update ALL ~20 consumer files that import from `@/features/gaming` → `@/features/tech`. Full list:

| Consumer file | Import to update |
|---|---|
| `features/portfolio/components/gaming/GamingTimeline.tsx` | `@/features/gaming` → `@/features/tech` |
| `features/portfolio/components/gaming/GamingAbout.tsx` | same |
| `features/portfolio/components/gaming/GamingContact.tsx` | same |
| `features/portfolio/components/gaming/GamingSkills.tsx` | same |
| `features/portfolio/components/gaming/GamingHero.tsx` | same |
| `features/portfolio/components/gaming/GamingAI.tsx` | same |
| `features/portfolio/components/gaming/GamingProjects.tsx` | same |
| `features/projects/components/ProjectDetailModal.tsx` | same |
| `features/dashboard/components/ConsolePanelCard.tsx` | same |
| `features/dashboard/components/GiantFlipCard.tsx` | same |
| `features/dashboard/components/optimized/OptimizedDashboardLayout.tsx` | same |
| `app/[locale]/(auth)/register/page.tsx` | same |
| `app/[locale]/(auth)/login/page.tsx` | same |
| `app/[locale]/(protected)/dashboard/page.tsx` | same |
| `app/[locale]/(dashboard)/dashboard/projects/DashboardProjectsView.tsx` | same |
| `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx` | same |
| `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` | same |
| `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` | same |

**2B. Rename Portfolio Section Component Files**

Rename folder `features/portfolio/components/gaming/` → `features/portfolio/components/tech/`:
- `GamingHero.tsx` → `TechHero.tsx` (export `TechHero`)
- `GamingAbout.tsx` → `TechAbout.tsx` (export `TechAbout`)
- `GamingTimeline.tsx` → `TechTimeline.tsx` (export `TechTimeline`)
- `GamingSkills.tsx` → `TechSkills.tsx` (export `TechSkills`)
- `GamingProjects.tsx` → `TechProjects.tsx` (export `TechProjects`)
- `GamingContact.tsx` → `TechContact.tsx` (export `TechContact`)
- `GamingAI.tsx` → `TechAI.tsx` (export `TechAI`)

Rename folder `features/portfolio/components/professional/` → `features/portfolio/components/classic/`:
- `ProfessionalHero.tsx` → `ClassicHero.tsx` (export `ClassicHero`)
- `ProfessionalAbout.tsx` → `ClassicAbout.tsx` (export `ClassicAbout`)
- `ProfessionalTimeline.tsx` → `ClassicTimeline.tsx` (export `ClassicTimeline`)
- `ProfessionalSkills.tsx` → `ClassicSkills.tsx` (export `ClassicSkills`)
- `ProfessionalProjects.tsx` → `ClassicProjects.tsx` (export `ClassicProjects`)
- `ProfessionalContact.tsx` → `ClassicContact.tsx` (export `ClassicContact`)
- `ProfessionalAI.tsx` → `ClassicAI.tsx` (export `ClassicAI`)

Inside each renamed component:
- Update the `mode` prop value passed to hooks/children (e.g., `mode: 'gaming'` → `mode: 'tech'`).
- Update i18n key paths (e.g., `t('sections.timeline.gaming.title')` → `t('sections.timeline.tech.title')`).
- Update import references to renamed `@/features/tech` components (e.g., `GamingCard` → `TechCard`).

**2C. Update Barrel Exports**
- File: `features/portfolio/index.ts`
- Lines 36-52: Update all exports from old paths/names to new:
  ```ts
  // Classic Mode Components
  export { ClassicHero } from './components/classic/ClassicHero';
  // ... etc
  // Tech Mode Components
  export { TechHero } from './components/tech/TechHero';
  // ... etc
  ```

**2D. Update PortfolioLayout Imports & Logic**
- File: `features/portfolio/components/PortfolioLayout.tsx`
- Lines 21-37: Update all imports to use new paths and component names.
- Lines 43-61: Rename `professionalSections` → `classicSections`, `gamingSections` → `techSections`.
- Line 103: `const isProfessional = mode === 'professional';` → `const isClassic = mode === 'classic';`
- Line 104: `const sections = isProfessional ? professionalSections : gamingSections;` → `const sections = isClassic ? classicSections : techSections;`
- Lines 124, 129: Update all `isProfessional` references to `isClassic`.

---

### Req 3: Conditional Logic Updates (Dashboard & Protected Pages)

**3A. Dashboard page type casts** — Update `as 'professional' | 'gaming'` to `as 'classic' | 'tech'` in:
- `app/[locale]/(protected)/dashboard/page.tsx` line 103
- `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` line 61
- `app/[locale]/(dashboard)/dashboard/projects/page.tsx` line 47
- `app/[locale]/(dashboard)/dashboard/timeline/page.tsx` line 50
- `app/[locale]/(dashboard)/dashboard/skills/page.tsx` line 71

**3B. Protected layout fallback**
- File: `app/[locale]/(protected)/layout.tsx` line 71
- Change: `portfolioMode: dbUser?.portfolioMode ?? 'professional'` → `?? 'classic'`

**3C. PortfolioModeToggle**
- File: `features/portfolio/components/PortfolioModeToggle.tsx`
- Line 13: Change `Gamepad2` icon import to `Terminal` (from lucide-react).
- Line 49+: `isProfessional` → `isClassic`, referencing new constant keys.
- Lines 71-72: Update i18n keys `t('modeToggle.professional')` / `t('modeToggle.gaming')` → `t('modeToggle.classic')` / `t('modeToggle.tech')`.
- Line 94: Replace `<Gamepad2>` with `<Terminal>` icon.

**3D. togglePortfolioMode action**
- File: `features/portfolio/actions/togglePortfolioMode.ts`
- Lines 48-49: The `revalidatePath` calls reference `/en/${username}` and `/es/${username}`. After subdomain unification these paths won't exist. Replace with `revalidatePath('/', 'layout')` to revalidate the root (subdomain routing means the path is always `/`). Or remove entirely if no longer needed.
- Line 19: Update JSDoc comment to say "tech and classic" instead of "professional and gaming".

**3E. ProjectDetailModal mode comparison**
- File: `features/projects/components/ProjectDetailModal.tsx` line 366
- Change: `mode === 'professional'` → `mode === 'classic'`

**3F. Hardcoded mode props**
- `features/projects/components/ProjectForm.tsx` line 250: `mode="gaming"` → `mode="tech"`
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` line 250: `mode="gaming"` → `mode="tech"`

**3G. Dashboard components using `t('gaming.*')` i18n keys**
- `features/dashboard/components/optimized/OptimizedDashboardLayout.tsx` lines 81, 94, 107, 120, 163-197: Update all `t('gaming.stats.*')` and `t('gaming.quickActions.*')` → `t('tech.stats.*')` and `t('tech.quickActions.*')`
- `features/dashboard/components/CyberpunkScreen.tsx` lines 254, 265, 276, 287: Same pattern.

---

### Req 4: i18n Key Renaming

**4A. Rename keys in `messages/en.json`:**

All `"gaming"` keys → `"tech"`, all `"professional"` keys → `"classic"`. Affected namespaces:

| Namespace | Key path changes |
|---|---|
| `auth.login` | `gaming` → `tech` |
| `auth.register` | `gaming` → `tech` |
| `dashboard.modeToggle` | `professional` → `classic`, `gaming` → `tech` |
| `dashboard` | `gaming` → `tech` (entire sub-object) |
| `portfolio.modes` | `professional` → `classic`, `gaming` → `tech` |
| `portfolio.sections.hero` | `professional` → `classic`, `gaming` → `tech` |
| `portfolio.sections.about` | same pattern |
| `portfolio.sections.timeline` | same pattern |
| `portfolio.sections.skills` | same pattern |
| `portfolio.sections.projects` | same pattern |
| `portfolio.sections.contact` | same pattern |
| `portfolio.sections.ai` | same pattern |
| `landing.modes` | `professional` → `classic`, `gaming` → `tech` |
| `Seo.modes` | `gaming` → `tech`, `professional` → `classic` |

**4B. Update display label VALUES (not just keys):**
- `"Gaming"` → `"Tech"` / `"Tech Mode"`
- `"Professional"` → `"Classic"` / `"Classic Mode"`
- `"Gaming Mode"` → `"Tech Mode"`
- `"Professional Mode"` → `"Classic Mode"`
- `"Choose Gaming"` → `"Choose Tech Mode"`
- `"Choose Professional"` → `"Choose Classic Mode"`
- `"CREATE CHARACTER"` (auth register) → `"BUILD PROFILE"` or `"CREATE PROFILE"`
- `"Cyborg Profile"` (SEO) → `"Tech Profile"`
- `"Player"` → `"Developer"` (in context-appropriate places)

**4C. Same changes in `messages/es.json`:**
- Same key renames as 4A.
- Spanish display labels: `"Gaming"` → `"Tech"`, `"Profesional"` → `"Clásico"` / `"Modo Clásico"`, `"Modo Gaming"` → `"Modo Tech"`.

---

### Req 5: AI Prompt Updates

**5A. Chat route system prompts**
- File: `app/api/chat/route.ts` lines 22-60
- Rewrite `RPG_MASTER_PROMPT_EN` and `RPG_MASTER_PROMPT_ES`:
  - Replace "RPG Master" with "Mission Commander" or "AI Overseer"
  - Replace "Gaming Mode (Default)" with "Tech Mode"
  - Keep the mission briefing tone but remove RPG terminology ("Character", "Quest", "Alchemist")
  - Use tech-futurista terminology: "DEPLOYING", "INITIALIZING", "SYSTEM SCAN", "NODE ACTIVATION"
  - Keep the same CORE TASKS and STRICT RULES — only change the wrapper language
- Rename the constants: `RPG_MASTER_PROMPT_EN` → `TECH_SYSTEM_PROMPT_EN`, `RPG_MASTER_PROMPT_ES` → `TECH_SYSTEM_PROMPT_ES`

**5B. Improve-bio route prompt functions**
- File: `app/api/ai/improve-bio/route.ts`
- Line 65: `function getGamingPrompt(...)` → `function getTechPrompt(...)`
- Line 115: `function getProfessionalPrompt(...)` → `function getClassicPrompt(...)`
- Line 217: `mode === 'gaming'` → `mode === 'tech'`

**5C. Narrate-portfolio route**
- File: `app/api/ai/narrate-portfolio/route.ts`
- Line 177: Default fallback `'gaming'` → `'tech'`
- Line 204: Cache key format will naturally update since it uses the `mode` variable. Existing stale keys handled by migration script (Req 1F).

**5D. OG image route**
- File: `app/api/og/route.tsx`
- Line 26: Fallback `'professional'` → `'classic'`
- Line 27: `const isGaming = mode === 'gaming'` → `const isTech = mode === 'tech'`
- Line 28: `isGaming ? 'Player' : 'Professional'` → `isTech ? 'Developer' : 'Professional'`
- Line 37: `gamingFont` → `techFont`
- Line 57: `isGaming` → `isTech`
- Line 61: Comment `GAMING TEMPLATE` → `TECH TEMPLATE`
- Line 134: Comment `PROFESSIONAL TEMPLATE` → `CLASSIC TEMPLATE`
- Line 102: Hardcoded `Player Profile` → `Tech Profile`
- Line 211: `name: 'GamingFont'` → `name: 'TechFont'`

---

### Req 6: Subdomain Routing Unification

**6A. Convert `/[locale]/[username]/` routes to redirects**

Instead of deleting the `[username]` route files entirely (which would break existing links and bookmarks), convert them to redirect:

- File: `app/[locale]/[username]/page.tsx` — Replace content with a redirect:
  ```tsx
  import { redirect } from 'next/navigation';
  export default async function UsernameRedirect({ params }) {
    const { username } = await params;
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'portfoland.com';
    redirect(`https://${username}.${domain}`);
  }
  ```
- Delete `app/[locale]/[username]/layout.tsx` (the redirect page doesn't need a layout).
- Delete `app/[locale]/[username]/skills/` directory (redirect handles all paths).
- Convert `app/[locale]/timeline/[username]/page.tsx` to similar redirect targeting `username.portfoland.com/timeline`.
- Delete `app/[locale]/timeline/[username]/layout.tsx` and `PublicTimelineView.tsx`.

**6B. Update revalidatePath calls**
- File: `features/portfolio/actions/togglePortfolioMode.ts` lines 48-49
- Remove or update the `revalidatePath('/en/${username}')` calls since those paths are now just redirects.

**6C. Verify subdomain proxy configuration**
- The subdomain proxy (Caddy/nginx config) must continue to set the `x-subdomain` header. This is infrastructure — out of scope for code changes but should be verified manually.

---

### Req 7: Test File Updates

Update all test files that reference old mode values. These should be updated LAST, after all production code changes are complete:

| Test file | What to change |
|---|---|
| `features/portfolio/__tests__/portfolio-route-navigation.test.tsx` | `'professional'` → `'classic'`, `'gaming'` → `'tech'`, `mode="gaming"` → `mode="tech"`, `mode="professional"` → `mode="classic"` |
| `features/portfolio/__tests__/portfolio-responsive.test.tsx` | Same pattern |
| `features/portfolio/__tests__/portfolio-project-cards.test.tsx` | `'professional'` → `'classic'` |
| `features/portfolio/__tests__/portfolio-professional.test.tsx` | `'professional'` → `'classic'`, rename test file to `portfolio-classic.test.tsx` |
| `features/portfolio/__tests__/portfolio-locale-cookie.test.tsx` | `'professional'` → `'classic'` |
| `features/portfolio/__tests__/portfolio-layout-links.test.tsx` | `'professional'` → `'classic'` |
| `features/portfolio/__tests__/portfolio-gaming.test.tsx` | `'gaming'` → `'tech'`, rename test file to `portfolio-tech.test.tsx` |
| `features/portfolio/__tests__/portfolio-data.test.ts` | Both mode values |
| `features/portfolio/__tests__/portfolio-actions.test.ts` | Both mode values |
| `features/portfolio/__tests__/portfolio-toggle.test.tsx` | Both mode values |
| `features/portfolio/data/getPortfolio.test.ts` | Both mode values |
| `features/portfolio/api/og.test.ts` | Mode values + variable names |
| `features/portfolio/utils/seo.test.ts` | Both mode values |
| `features/projects/__tests__/project-i18n.test.tsx` | Mode values |
| `features/projects/__tests__/project-detail-modal.test.tsx` | Mode values |
| `features/projects/__tests__/project-form.test.tsx` | Mode values + description text |

Also update component imports in tests (e.g., `GamingHero` → `TechHero`, `ProfessionalHero` → `ClassicHero`, `@/features/gaming` → `@/features/tech`).

---

### Req 8: Username Layout Conditional Logic

**Note:** The `[username]/layout.tsx` file will be deleted as part of Req 6A (subdomain redirect conversion). However, the same `isProfessional` → `isClassic` pattern exists in the subdomain-served layout. If the subdomain proxy reuses this layout (via rewrites), ensure the rewritten layout also uses the new variable name and mode comparison.

- `app/[locale]/[username]/layout.tsx` line 41: `=== 'professional'` → `=== 'classic'` (if this file is kept; otherwise moot since it's deleted).

---

## Visual Design

No visual assets needed. This is a renaming/refactoring spec with no UI design changes. The visual appearance of both modes remains identical — only the internal naming changes.

## Existing Code to Leverage

**`features/portfolio/types/portfolio.ts`** — Central type definition. Changing `PortfolioMode` here propagates type errors to all consumers, making it easy to find remaining references.

**`features/portfolio/constants/messages.ts`** — The `PORTFOLIO_MODES` constant is used throughout. Changing it triggers compile errors at all usage sites.

**`features/portfolio/index.ts`** — Barrel file that re-exports all portfolio components. Single place to update export paths.

**`features/gaming/index.tsx`** — Barrel file for all Tech Mode UI components. ~650 lines defining `GamingButton`, `GamingCard`, etc.

**`features/portfolio/hooks/usePortfolioNarrative.ts`** — Shared hook extracted in Phase 0 that accepts `mode` parameter. Update the type annotation.

## Out of Scope

- Changing the visual appearance of either mode (colors, layout, animations)
- Renaming internal component names that don't contain "Gaming" or "Professional" (e.g., `HUDPanel`, `CRTMonitor`, `HexBadge` stay as-is — they're descriptive of the component, not the mode)
- Adding new features or sections
- Changing the number of modes or adding new modes
- Infrastructure changes to the subdomain proxy (Caddy/nginx config)
- Renaming `CyberpunkScreen`, `CyberpunkNav`, `useCyberpunkToast` — these names describe the aesthetic, not the mode; they can be renamed in Phase 3B (Visual Polish) if desired
- Creating new middleware (rate limiting middleware was done in Phase 0)
- Modifying the AI prompt content beyond terminology changes (e.g., no new tools, no new tasks)
- Renaming the `usePortfolioNarrative` hook's internal logic (only its mode type annotation)
