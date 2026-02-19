# Task Breakdown: Phase 1 -- Rebrand & Unification

## Overview
Total Tasks: 7 Task Groups, ~45 sub-tasks

**Strategy:** This is a codebase-wide rename/refactor. The "canary" approach is used -- change types and constants first so TypeScript strict mode surfaces every remaining old reference as a compile error. File renames come second, then logic updates, then independent concerns (AI prompts, routing, migration), and tests last.

## Task List

### Core Types & Constants

#### Task Group 1: Type System & Constants (The Canary)
**Dependencies:** None
**Spec Reference:** Req 1A, 1B, 1C, 1D, 1E

After completing this group, run `npx tsc --noEmit` to get a full list of compile errors. This list becomes the checklist for Task Groups 2-4.

- [x] 1.0 Complete type system and constants renaming
  - [x] 1.1 Update Prisma schema default value
    - File: `prisma/schema.prisma` line 32
    - Change: `@default("professional")` --> `@default("classic")`
    - Run `npx prisma generate` after change (do NOT run migrate -- this is just a default value change on a String field, not a schema migration)
  - [x] 1.2 Update TypeScript `PortfolioMode` union type
    - File: `features/portfolio/types/portfolio.ts` line 19
    - Change: `export type PortfolioMode = 'professional' | 'gaming';` --> `export type PortfolioMode = 'classic' | 'tech';`
  - [x] 1.3 Update `PORTFOLIO_MODES` constants object
    - File: `features/portfolio/constants/messages.ts` lines 15-18
    - Change keys and values: `PROFESSIONAL: 'professional'` --> `CLASSIC: 'classic'`, `GAMING: 'gaming'` --> `TECH: 'tech'`
  - [x] 1.4 Update validation schema
    - File: `features/portfolio/schemas/portfolio.schema.ts` line 10
    - Update references to use `PORTFOLIO_MODES.CLASSIC` and `PORTFOLIO_MODES.TECH`
  - [x] 1.5 Update service layer type annotations
    - File: `features/portfolio/services/portfolio.service.ts` line 27
    - Change: `mode: "gaming" | "professional"` --> `mode: "tech" | "classic"`
    - Line 13: Update `VALID_MODES` array to use new constant keys
  - [x] 1.6 Run TypeScript compiler to get full error list
    - Run: `npx tsc --noEmit 2>&1 | head -100`
    - Save or note the error list -- this is the roadmap for remaining tasks

**Acceptance Criteria:**
- `PortfolioMode` type is `'classic' | 'tech'`
- `PORTFOLIO_MODES` keys are `CLASSIC` and `TECH`
- Prisma generates successfully with new default
- TypeScript compiler errors are expected at this stage (they confirm the canary worked)

---

### File & Folder Renames

#### Task Group 2: Component File & Folder Renaming
**Dependencies:** Task Group 1
**Spec Reference:** Req 2A, 2B, 2C, 2D

**IMPORTANT:** Use `git mv` for all renames to preserve git history.

- [x] 2.0 Complete all file and folder renames
  - [x] 2.1 Rename `features/gaming/` folder to `features/tech/`
    - Run: `git mv features/gaming features/tech`
    - Update barrel file `features/tech/index.tsx`:
      - Update file header comment from "Cyberpunk/gaming-themed" to "Tech Mode UI components"
      - Rename all exported components: `GamingButton` --> `TechButton`, `GamingInput` --> `TechInput`, `GamingCard` --> `TechCard`, `GamingCardHeader` --> `TechCardHeader`, `GamingCardTitle` --> `TechCardTitle`, `GamingCardContent` --> `TechCardContent`, `GamingAvatar` --> `TechAvatar`, `GamingBadge` --> `TechBadge`
  - [x] 2.2 Rename `features/portfolio/components/gaming/` folder to `features/portfolio/components/tech/`
    - Run: `git mv features/portfolio/components/gaming features/portfolio/components/tech`
    - Then rename each file inside (7 files renamed)
    - Inside each renamed file: update export name, mode prop, imports
  - [x] 2.3 Rename `features/portfolio/components/professional/` folder to `features/portfolio/components/classic/`
    - Run: `git mv features/portfolio/components/professional features/portfolio/components/classic`
    - Then rename each file inside (7 files renamed)
    - Inside each renamed file: update export name and mode prop values
  - [x] 2.4 Update barrel exports in `features/portfolio/index.ts`
    - Updated all 14 export paths and names (7 Classic + 7 Tech)
  - [x] 2.5 Update `PortfolioLayout.tsx` imports and logic
    - Updated all imports, renamed sections vars, `isProfessional` --> `isClassic`
  - [x] 2.6 Update all consumer files that import from `@/features/gaming`
    - Updated 19 files total (11 listed + 6 extra in features/skills + app/[locale]/page.tsx + app/[locale]/[username] area)
  - [x] 2.7 Run TypeScript compiler to verify renames resolved errors
    - Remaining errors are TG3 (type casts), TG7 (tests), and pre-existing unrelated bugs

**Acceptance Criteria:**
- All folders and files renamed using `git mv`
- All import paths updated from `@/features/gaming` to `@/features/tech`
- All component names updated (Gaming* --> Tech*, Professional* --> Classic*)
- `PortfolioLayout.tsx` uses `isClassic` and `techSections`/`classicSections`
- Barrel file `features/portfolio/index.ts` exports all 14 renamed components

---

### Conditional Logic & Dashboard Updates

#### Task Group 3: Conditional Logic, Dashboard Pages & Mode Toggle
**Dependencies:** Task Groups 1 and 2
**Spec Reference:** Req 3A, 3B, 3C, 3D, 3E, 3F, 3G

- [x] 3.0 Complete all conditional logic updates
  - [x] 3.1 Update dashboard page type casts
    - Change `as 'professional' | 'gaming'` --> `as 'classic' | 'tech'` in:
      - `app/[locale]/(protected)/dashboard/page.tsx` line 103
      - `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` line 61
      - `app/[locale]/(dashboard)/dashboard/projects/page.tsx` line 47
      - `app/[locale]/(dashboard)/dashboard/timeline/page.tsx` line 50
      - `app/[locale]/(dashboard)/dashboard/skills/page.tsx` line 71
  - [x] 3.2 Update protected layout fallback
    - File: `app/[locale]/(protected)/layout.tsx` line 71
    - Change: `portfolioMode: dbUser?.portfolioMode ?? 'professional'` --> `?? 'classic'`
  - [x] 3.3 Update `PortfolioModeToggle` component
    - File: `features/portfolio/components/PortfolioModeToggle.tsx`
    - Line 13: Change `Gamepad2` icon import to `Terminal` (from lucide-react)
    - Line 49+: `isProfessional` --> `isClassic`, reference new constant keys
    - Lines 71-72: Update i18n keys `t('modeToggle.professional')` / `t('modeToggle.gaming')` --> `t('modeToggle.classic')` / `t('modeToggle.tech')`
    - Line 94: Replace `<Gamepad2>` with `<Terminal>` icon
  - [x] 3.4 Update `togglePortfolioMode` action
    - File: `features/portfolio/actions/togglePortfolioMode.ts`
    - Line 19: Update JSDoc comment to say "tech and classic" instead of "professional and gaming"
    - Lines 48-49: Replace `revalidatePath('/en/${username}')` and `revalidatePath('/es/${username}')` with `revalidatePath('/', 'layout')` (subdomain routing means path is always `/`)
  - [x] 3.5 Update `ProjectDetailModal` mode comparison
    - File: `features/projects/components/ProjectDetailModal.tsx` line 366
    - Change: `mode === 'professional'` --> `mode === 'classic'`
  - [x] 3.6 Update hardcoded mode props
    - `features/projects/components/ProjectForm.tsx` line 250: `mode="gaming"` --> `mode="tech"`
    - `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` line 250: `mode="gaming"` --> `mode="tech"`
    - Also fixed: `features/ai/components/ImproveDescriptionButton.tsx` and `ImproveBioButton.tsx` mode prop types (`'gaming' | 'professional'` --> `'tech' | 'classic'`)
  - [x] 3.7 Update dashboard components using `t('gaming.*')` i18n keys
    - `features/dashboard/components/optimized/OptimizedDashboardLayout.tsx` lines 81, 94, 107, 120, 163-197: Change all `t('gaming.stats.*')` and `t('gaming.quickActions.*')` --> `t('tech.stats.*')` and `t('tech.quickActions.*')`
    - `features/dashboard/components/CyberpunkScreen.tsx` lines 254, 265, 276, 287: Same pattern
  - [x] 3.8 Run TypeScript compiler to verify
    - Run: `npx tsc --noEmit 2>&1 | head -50`
    - Remaining errors: only test files (TG7) and pre-existing bugs (selfAssessmentLevel, proxy-subdomain._type, Prisma scripts) — no production code errors from this rebrand

**Acceptance Criteria:**
- All `'professional'` comparisons changed to `'classic'`
- All `'gaming'` comparisons changed to `'tech'`
- Mode toggle uses `Terminal` icon instead of `Gamepad2`
- Dashboard i18n key references updated to `tech.*`
- `revalidatePath` calls updated for subdomain routing

---

### i18n Updates

#### Task Group 4: i18n Key & Label Renaming
**Dependencies:** Task Group 3 (so component i18n key references match the new keys)
**Spec Reference:** Req 4A, 4B, 4C

- [x] 4.0 Complete i18n key and label renaming
  - [x] 4.1 Rename keys in `messages/en.json`
    - Renamed all `"gaming"` keys --> `"tech"` and all `"professional"` keys --> `"classic"` in all namespaces
  - [x] 4.2 Update display label VALUES in `messages/en.json`
    - `"Gaming"` --> `"Tech"`, `"Gaming Mode"` --> `"Tech Mode"`, `"Choose Gaming"` --> `"Choose Tech Mode"`
    - `"Professional"` --> `"Classic"`, `"Professional Mode"` --> `"Classic Mode"`, `"Choose Professional"` --> `"Choose Classic Mode"`
    - `"CREATE CHARACTER"` --> `"CREATE PROFILE"`, `"Cyborg Profile"` --> `"Tech Profile"`
    - `"PLAYER PROFILE"` --> `"TECH PROFILE"`, `"QUEST LOG"` --> `"WORK LOG"`, `"MISSIONS"` --> `"PROJECTS"`
    - auth.login.tech: heroTitle "INITIALIZE YOUR PROFILE", submitButton "LAUNCH SESSION"
    - auth.register.tech: heroTitle "BEGIN YOUR MISSION"
    - landing.modes.tech: subtitle "For developers and tech professionals", feature1 "Visual career timeline"
  - [x] 4.3 Apply same key renames in `messages/es.json`
    - All key renames applied, Spanish labels updated: `"Clasico"`, `"Modo Clasico"`, `"Modo Tech"`, `"CREAR PERFIL"`, `"PERFIL TECH"`, `"REGISTRO DE TRABAJO"`, `"PROYECTOS"`
  - [x] 4.4 Verify i18n keys match component references
    - Grep confirms zero remaining `gaming.|professional.` key references in component t() calls

**Acceptance Criteria:**
- All i18n keys renamed from gaming/professional to tech/classic
- Display labels updated in both English and Spanish
- No "missing translation" warnings in dev console
- UI shows "Tech Mode" and "Classic Mode" everywhere

---

### AI Prompts

#### Task Group 5: AI Prompt & API Route Updates
**Dependencies:** Task Group 1 (needs new mode values in place)
**Spec Reference:** Req 5A, 5B, 5C, 5D

This group can run in parallel with Task Groups 3-4 since AI routes are independent of UI components.

- [ ] 5.0 Complete AI prompt and API route updates
  - [ ] 5.1 Rewrite chat route system prompts
    - File: `app/api/chat/route.ts` lines 22-60
    - Rename constants: `RPG_MASTER_PROMPT_EN` --> `TECH_SYSTEM_PROMPT_EN`, `RPG_MASTER_PROMPT_ES` --> `TECH_SYSTEM_PROMPT_ES`
    - Replace "RPG Master" with "Mission Commander" or "AI Overseer"
    - Replace "Gaming Mode (Default)" with "Tech Mode"
    - Remove RPG terminology ("Character", "Quest", "Alchemist")
    - Use tech-futurista terminology: "DEPLOYING", "INITIALIZING", "SYSTEM SCAN", "NODE ACTIVATION"
    - Keep the same CORE TASKS and STRICT RULES -- only change the wrapper language
  - [ ] 5.2 Update improve-bio route prompt functions
    - File: `app/api/ai/improve-bio/route.ts`
    - Line 65: Rename `function getGamingPrompt(...)` --> `function getTechPrompt(...)`
    - Line 115: Rename `function getProfessionalPrompt(...)` --> `function getClassicPrompt(...)`
    - Line 217: Change `mode === 'gaming'` --> `mode === 'tech'`
  - [ ] 5.3 Update narrate-portfolio route
    - File: `app/api/ai/narrate-portfolio/route.ts`
    - Line 177: Change default fallback `'gaming'` --> `'tech'`
  - [ ] 5.4 Update OG image route
    - File: `app/api/og/route.tsx`
    - Line 26: Fallback `'professional'` --> `'classic'`
    - Line 27: `const isGaming = mode === 'gaming'` --> `const isTech = mode === 'tech'`
    - Line 28: `isGaming ? 'Player' : 'Professional'` --> `isTech ? 'Developer' : 'Professional'`
    - Line 37: `gamingFont` --> `techFont`
    - Line 57: `isGaming` --> `isTech`
    - Line 61: Comment `GAMING TEMPLATE` --> `TECH TEMPLATE`
    - Line 102: Hardcoded `Player Profile` --> `Tech Profile`
    - Line 134: Comment `PROFESSIONAL TEMPLATE` --> `CLASSIC TEMPLATE`
    - Line 211: `name: 'GamingFont'` --> `name: 'TechFont'`

**Acceptance Criteria:**
- All AI prompts use tech-futurista language instead of RPG/arcade language
- All mode comparisons in API routes use `'tech'` and `'classic'`
- OG image route generates correct labels for both modes
- Prompt function names updated (getTechPrompt, getClassicPrompt)

---

### Subdomain Routing & Migration

#### Task Group 6: Subdomain Routing Unification & MongoDB Migration
**Dependencies:** Task Groups 1-5 (all code changes should be complete before migration script is finalized)
**Spec Reference:** Req 1F, 6A, 6B, 8

- [ ] 6.0 Complete subdomain routing and migration script
  - [ ] 6.1 Convert `[username]` page route to redirect
    - File: `app/[locale]/[username]/page.tsx`
    - Replace entire content with redirect logic:
      ```tsx
      import { redirect } from 'next/navigation';
      export default async function UsernameRedirect({ params }) {
        const { username } = await params;
        const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'portfoland.com';
        redirect(`https://${username}.${domain}`);
      }
      ```
  - [ ] 6.2 Delete `[username]` layout and sub-routes
    - Delete: `app/[locale]/[username]/layout.tsx`
    - Delete: `app/[locale]/[username]/skills/` directory (entire folder)
  - [ ] 6.3 Convert timeline username route to redirect
    - File: `app/[locale]/timeline/[username]/page.tsx`
    - Replace with redirect to `username.portfoland.com/timeline`
    - Delete: `app/[locale]/timeline/[username]/layout.tsx`
    - Delete: any `PublicTimelineView.tsx` in that directory
  - [ ] 6.4 Create MongoDB migration script
    - Create file: `scripts/migrate-portfolio-modes.ts`
    - Use Prisma's `$runCommandRaw` to run bulk `updateMany` operations:
      - `portfolioMode: "professional"` --> `portfolioMode: "classic"`
      - `portfolioMode: "gaming"` --> `portfolioMode: "tech"`
      - `$unset` all `meta.aiNarrative_gaming_*` and `meta.aiNarrative_professional_*` keys (stale narrative cache)
    - Script must be idempotent (safe to run multiple times)
    - Print count of updated documents
    - Import prisma from `@/features/core` (per project standards)
  - [ ] 6.5 Verify TypeScript compiles cleanly
    - Run: `npx tsc --noEmit`
    - Should have zero errors (excluding test files if tests are in a separate tsconfig)

**Acceptance Criteria:**
- `/[locale]/[username]` routes redirect to subdomain URLs
- Deleted layout files and sub-routes no longer exist
- Migration script is idempotent and handles both mode values + cache cleanup
- TypeScript compiles with zero errors on production code

---

### Test Updates

#### Task Group 7: Test File Updates & Verification
**Dependencies:** Task Groups 1-6 (all production code must be complete)
**Spec Reference:** Req 7

- [ ] 7.0 Complete test file updates
  - [ ] 7.1 Rename test files
    - `git mv features/portfolio/__tests__/portfolio-professional.test.tsx features/portfolio/__tests__/portfolio-classic.test.tsx`
    - `git mv features/portfolio/__tests__/portfolio-gaming.test.tsx features/portfolio/__tests__/portfolio-tech.test.tsx`
  - [ ] 7.2 Update mode string literals in all test files
    - In every file listed below, replace `'professional'` --> `'classic'` and `'gaming'` --> `'tech'`
    - Also replace `mode="gaming"` --> `mode="tech"` and `mode="professional"` --> `mode="classic"` in JSX props
    - Files:
      - `features/portfolio/__tests__/portfolio-route-navigation.test.tsx`
      - `features/portfolio/__tests__/portfolio-responsive.test.tsx`
      - `features/portfolio/__tests__/portfolio-project-cards.test.tsx`
      - `features/portfolio/__tests__/portfolio-classic.test.tsx` (renamed in 7.1)
      - `features/portfolio/__tests__/portfolio-locale-cookie.test.tsx`
      - `features/portfolio/__tests__/portfolio-layout-links.test.tsx`
      - `features/portfolio/__tests__/portfolio-tech.test.tsx` (renamed in 7.1)
      - `features/portfolio/__tests__/portfolio-data.test.ts`
      - `features/portfolio/__tests__/portfolio-actions.test.ts`
      - `features/portfolio/__tests__/portfolio-toggle.test.tsx`
      - `features/portfolio/data/getPortfolio.test.ts`
      - `features/portfolio/api/og.test.ts`
      - `features/portfolio/utils/seo.test.ts`
      - `features/projects/__tests__/project-i18n.test.tsx`
      - `features/projects/__tests__/project-detail-modal.test.tsx`
      - `features/projects/__tests__/project-form.test.tsx`
  - [ ] 7.3 Update component imports in test files
    - Change `@/features/gaming` --> `@/features/tech` in all test imports
    - Change component names: `GamingHero` --> `TechHero`, `ProfessionalHero` --> `ClassicHero`, etc.
    - Update test descriptions/names if they reference "Gaming" or "Professional" (e.g., `describe('GamingHero')` --> `describe('TechHero')`)
  - [ ] 7.4 Update variable names in OG and SEO tests
    - `features/portfolio/api/og.test.ts`: Update `gamingFont` --> `techFont`, `isGaming` --> `isTech`, `Player Profile` --> `Tech Profile`
    - `features/portfolio/utils/seo.test.ts`: Update mode value assertions
  - [ ] 7.5 Run all feature-specific tests
    - Run: `npx jest --testPathPattern="features/portfolio|features/projects" --no-coverage`
    - Verify all tests pass
    - If any fail, fix the remaining old references
  - [ ] 7.6 Run full test suite
    - Run: `npx jest --no-coverage`
    - Verify no regressions across the entire codebase

**Acceptance Criteria:**
- All 16+ test files updated with new mode values
- Test file names reflect new naming (portfolio-classic, portfolio-tech)
- All component imports in tests use new paths and names
- Full test suite passes with zero failures

---

## Execution Order

```
Task Group 1: Types & Constants (canary)
    |
    v
Task Group 2: File & Folder Renames
    |
    +---> Task Group 3: Conditional Logic & Dashboard
    |         |
    |         v
    |     Task Group 4: i18n Keys & Labels
    |
    +---> Task Group 5: AI Prompts (parallel with 3-4)
    |
    v
Task Group 6: Subdomain Routing & Migration Script
    |
    v
Task Group 7: Test Updates & Verification
```

**Recommended implementation sequence:**
1. **Task Group 1** -- Types & Constants (15 min) -- creates compile errors that guide all subsequent work
2. **Task Group 2** -- File & Folder Renames (30 min) -- resolves import path errors
3. **Task Group 3** -- Conditional Logic (20 min) -- resolves remaining compile errors
4. **Task Group 4** -- i18n Keys (20 min) -- runtime string changes, no compile errors
5. **Task Group 5** -- AI Prompts (15 min) -- can be done in parallel with 3-4
6. **Task Group 6** -- Routing & Migration (20 min) -- depends on all code changes being done
7. **Task Group 7** -- Tests (25 min) -- must be last

## Post-Completion Checklist

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx jest --no-coverage` passes with zero failures
- [ ] Dev server starts without errors (`npx next dev`)
- [ ] UI shows "Tech Mode" and "Classic Mode" labels
- [ ] Mode toggle works correctly (stores `'tech'` / `'classic'`)
- [ ] `/en/username` redirects to `username.portfoland.com`
- [ ] Migration script runs successfully against dev database
- [ ] No remaining references to "gaming" or "professional" as mode values (search: `grep -r "gaming\|professional" --include="*.ts" --include="*.tsx" --include="*.json" features/ app/ messages/` -- should only match CSS class names, comments about the rename, or unrelated strings)
