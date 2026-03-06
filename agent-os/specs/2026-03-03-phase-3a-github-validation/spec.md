# Specification: Phase 3A — GitHub Validation

## Goal

Connect the user's GitHub account (via the existing Better Auth OAuth provider) to automatically validate skills in the skill tree based on repository language composition, applying a 1.3x XP credibility multiplier to GitHub-validated skills at read time. This delivers a key visual delight moment — the dual-validated "Gold" hexagon — and anchors the Portfoland credibility system in real, verifiable code output.

## User Stories

- As a user with a GitHub account, I want to connect GitHub and have my coding skills automatically validated so that my skill tree reflects verified, real-world activity rather than self-assessment alone.
- As a portfolio visitor, I want to see a visual distinction between self-assessed, AI-validated, and GitHub-validated skills so that I can immediately gauge the credibility of each skill.
- As a user, I want to sync my GitHub data on demand and see a live update of validated skills and XP boost so that reconnecting GitHub feels like a rewarding achievement unlock.

## Specific Requirements

**TG1 — Prisma Schema Changes**
- Add `githubValidated: Boolean @default(false)` field to the `UserSkill` model in `prisma/schema.prisma`, mirroring the existing `aiValidated: Boolean @default(false)` pattern on line 228.
- Add `githubSyncedAt: DateTime?` field to the `User` model in `prisma/schema.prisma`, alongside existing nullable date fields.
- Add `githubStats: Json?` field to the `User` model to persist summary stats from GitHub (total stars, total commits) for display in the Sync Status Panel; avoids re-fetching the API on every dashboard load.
- Add `GITHUB` variant to the `SourceType` enum (`EXPERIENCE | MANUAL | GITHUB`) in `prisma/schema.prisma`.
- Run `prisma generate` after schema changes; no data migration is needed because new boolean fields default to `false` and new nullable fields default to `null`.
- The `hasGitHubValidation` stub function in `features/skills/types/skill.ts` (line 140) must be updated to read `userSkill.githubValidated` from the Prisma model now that the field exists on the schema.

**TG2 — GitHub API Layer**
- Create `features/github/api/github.api.ts` — all raw GitHub REST and GraphQL API calls live here; no business logic.
- REST: `GET https://api.github.com/user/repos?per_page=100&type=owner` — fetch all owner (non-fork) repos; filter client-side on `fork === false`.
- REST: For each non-fork repo, call `GET https://api.github.com/repos/{owner}/{repo}/languages` to get language byte counts; aggregate bytes per language across all repos.
- REST: Sum `stargazers_count` from the repos list response (no extra API call needed).
- GraphQL: `POST https://api.github.com/graphql` with query `{ viewer { contributionsCollection { totalCommitContributions } } }` to get total lifetime commits.
- All requests send `Authorization: Bearer {accessToken}` and `Accept: application/vnd.github+json` headers.
- On HTTP 401, throw a typed `GitHubAuthError` so the service layer can distinguish auth failure from generic errors.
- Create `features/github/data/getGitHubToken.data.ts` — single Prisma query: `prisma.account.findFirst({ where: { userId, providerId: 'github' }, select: { accessToken: true } })`.

**TG3 — GitHub Sync Service and Action**
- Create `features/github/services/syncGitHub.service.ts` — orchestrates the full sync: read token → call GitHub API → run skill matching → write `githubValidated` flags and `githubSyncedAt` + `githubStats` to DB.
- Skill matching logic lives entirely in the service: (1) load the user's `UserSkill` records with their `skill.slug`, (2) compute each language's percentage of total bytes, (3) for each language ≥ 60% of total bytes, look up its slug in the mapping file, (4) if a matching `UserSkill` exists, set `githubValidated: true` via `prisma.userSkill.update`.
- Import `GITHUB_LANGUAGE_MAP` from `features/github/constants/github-mappings.ts` for slug resolution.
- Import `GITHUB_XP_MULTIPLIER` from `features/github/constants/xp.ts`; the constant is defined here but the multiplier is NOT applied in DB writes — only used in read-time data functions.
- After all DB writes, update `User.githubSyncedAt = new Date()` and `User.githubStats = { stars, totalCommits, validatedSkillsCount }`.
- Create `features/github/actions/syncGitHub.action.ts` — `'use server'`, wraps with `actionWrapper`, validates session with `auth.api.getSession`, validates that the user has a linked GitHub account (throws if `getGitHubToken.data.ts` returns null), calls the service, then calls `revalidatePath('/dashboard/skills')` and `revalidateTag(\`user-stats-${userId}\`)`.
- The action returns a typed `SyncGitHubResponse` payload: `{ validatedSkillsCount: number; stars: number; totalCommits: number }`.
- Mirror the exact three-layer structure and `actionWrapper` usage from `features/skills/actions/syncSkillsFromExperience.ts`.

**TG4 — Language Mapping and XP Constant Files**
- Create `features/github/constants/github-mappings.ts` — export `GITHUB_LANGUAGE_MAP: Record<string, string>`, a static object mapping GitHub language names to Portfoland skill slugs.
- Required entries: `TypeScript → typescript`, `JavaScript → javascript`, `Python → python`, `Jupyter Notebook → python`, `Shell → bash`, `C++ → cpp`, `C → c`, `Go → go`, `Rust → rust`, `Java → java`, `Kotlin → kotlin`, `Swift → swift`, `Ruby → ruby`, `PHP → php`, `CSS → css`, `HTML → html`, `Vue → vue`, `Svelte → svelte`, `Dart → dart`.
- Create `features/github/constants/xp.ts` — export `GITHUB_XP_MULTIPLIER = 1.3` as a named constant; this is the single source of truth for future rebalancing.
- Create `features/github/constants/messages.ts` — export `GITHUB_MESSAGES` with `SYNC_SUCCESS`, `SYNC_ERROR`, `AUTH_ERROR` constants following the same pattern as `SKILL_MESSAGES_EN` in `features/skills/constants/messages.ts`.

**TG5 — XP Read-Time Multiplier Across Data Layer**
- In `features/dashboard/data/getUserDashboardStats.data.ts`: expand the `userSkills` Prisma select to include `githubValidated: true`. In `skillXPs`, compute `effectiveXP = githubValidated ? Math.round(totalXP * GITHUB_XP_MULTIPLIER) : totalXP` for each skill. Import `GITHUB_XP_MULTIPLIER` from `features/github/constants/xp.ts`.
- In `features/dashboard/data/getTopRunners.data.ts`: add `githubValidated: true` to the `userSkills` select. In the per-user XP reduction, change from the current heuristic (`aiValidated ? 150 : 50`) to use actual `totalXP * GITHUB_XP_MULTIPLIER` when `githubValidated` is true. This requires selecting `totalXP` in addition to `aiValidated` and `githubValidated`.
- In `features/dashboard/data/getRecentUserActivity.data.ts`: add `githubValidated: true` to the `userSkills` select. In the skill event mapping, update `xp` to `githubValidated ? Math.round(userSkill.totalXP * GITHUB_XP_MULTIPLIER) : (userSkill.aiValidated ? 150 : 50)`. Also add a `'skill_github'` event type for GitHub-validated skills.

**TG6 — New `searching` AIEye State**
- In `features/tech/components/crt-with-ai.tsx`: add `"searching"` to the `AIState` union type on line 13 (additive, non-breaking change). Export the updated type.
- Add `"searching"` to the `TRANSIENT_STATES` array alongside `"xp_gain"` and `"life_loss"` so it auto-returns to `prevStateRef.current` after use.
- Add `isSearching` flag in `AIEye` component alongside the existing `isThinking`, `isXPGain`, etc. flags.
- `searching` visual: amber/orange color `hsl(38,100%,55%)`, iris moves left-right rhythmically (scan pattern), use a wider orbit ring (r=38, dashed) that rotates slower than `thinking`'s orbit. Label displays `SEARCHING`. This communicates "waiting for external data" vs. `thinking`'s "processing internally."
- Add `searchingTrigger?: number` prop to `CRTWithAIProps` alongside `xpGainTrigger` and `lifeLossTrigger`. When this counter changes: set state to `"searching"` (sustained — do NOT auto-return like other transients); the `GitHubSyncPanel` drives the return transition by incrementing `xpGainTrigger` (success) or `lifeLossTrigger` (error) after the action resolves.
- Add `searching` to all color-switch expressions in the component (border color, status label color, status dot color) using the amber color `hsl(38,100%,55%)`.

**TG7 — SkillHexagonNode Visual Extensions**
- In `features/skills/components/SkillHexagonNode.tsx`: read `userSkill?.githubValidated` (the field now exists on the Prisma model after TG1). Derive three compound state booleans: `isAIOnly = isAIValidated && !isGithubValidated`, `isGithubOnly = isGithubValidated && !isAIValidated`, `isBothValidated = isAIValidated && isGithubValidated`.
- GitHub-only drop-shadow: `drop-shadow(0 0 10px #22C55E) drop-shadow(0 0 5px #16A34A)` (green glow).
- Gold dual-validated drop-shadow: `drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 6px #FFA500)` — overrides both single-validation styles; this is the primary delight moment.
- SVG marks: keep the magenta `★` mark when `isAIValidated` is true. Add a small `⬡` mark (cyan or white, `fontSize="8"`) at a distinct position (e.g., `x="8"`, `y="10"`) when `isGithubValidated` is true. When `isBothValidated`, render both marks and apply the gold drop-shadow.
- Add a `motion.div` animated pulsing ring when `isBothValidated` using gold color `#FFD700` — similar to the existing L4/L5 pulsing ring but gold-tinted; animates `scale: [1, 1.3, 1]`, `opacity: [0.8, 0, 0.8]` with `duration: 1.5, repeat: Infinity`.
- Update the `ariaLabel` string to include validation state: `"${skillName} - Level ${level} - AI & GitHub Verified"` when `isBothValidated`.

**TG8 — GitHubSyncPanel Component**
- Create `features/github/components/GitHubSyncPanel.tsx` as a `'use client'` component.
- Props interface defined in `features/github/types/github.ts`: `GitHubSyncPanelProps { githubSyncedAt: Date | null; githubStats: { stars: number; totalCommits: number; validatedSkillsCount: number } | null; onSearchingStateChange?: (active: boolean) => void; xpGainTriggerRef?: React.MutableRefObject<number>; }`.
- Pre-connection state (when `githubSyncedAt === null`): render an "Expansion Module" panel with angular Tech Mode borders (cyan), terminal-style label `[EXPANSION_MODULE]: github_validator.exe`, and a "Connect GitHub" CTA button. On click, trigger the GitHub OAuth connect flow via Better Auth's client-side `connectAccount('github')` method (or equivalent Better Auth client hook).
- Post-connection state: render a "Sync Status Panel" showing: `Last Data Upload: [githubSyncedAt formatted as ISO or locale string]` in monospace terminal style; stats row with `REPOS_ANALYZED`, `SKILLS_VALIDATED: {validatedSkillsCount}`, `STARS_TOTAL: {stars}`, `COMMITS_TOTAL: {totalCommits}`.
- Privacy notice always visible when connected: `[SYS_MESSAGE]: Analizando repositorios privados... Datos procesados de forma anónima. No se almacenarán nombres ni código fuente.` rendered in `text-[9px] font-mono text-muted-foreground/50`.
- "Re-Sync" button: on click, calls `useTransition` → `syncGitHubAction()` → on success, fire `xpGainTrigger` increment via parent prop; on error, fire `lifeLossTrigger` increment via parent prop and show toast.
- During the action call, `onSearchingStateChange(true)` drives the AIEye to `searching`; on resolution, `onSearchingStateChange(false)` and the trigger props fire the correct terminal animation.
- Use `useTransition` + server action + `toast` (sonner) pattern. Use shadcn `Button` and `Card` components.

**TG9 — DashboardSkillsView and Portfolio Integration**
- In `DashboardSkillsView.tsx` (`app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`): add `githubSyncedAt`, `githubStats`, and `githubConnected` props. Render `GitHubSyncPanel` above the skill tree section. Wire `onSearchingStateChange`, `xpGainTrigger`, and `lifeLossTrigger` between `GitHubSyncPanel` and `CRTWithAI` via state lifted into `DashboardSkillsView`. Pass down `user.githubSyncedAt` and `user.githubStats` from the page server component.
- Update `app/[locale]/(dashboard)/dashboard/skills/page.tsx` to select `githubSyncedAt` and `githubStats` from the user query and pass them as props to `DashboardSkillsView`.
- In `features/portfolio/components/tech/TechSkills.tsx`: extend the badge legend section. Render three badges depending on which validation states are present in `userSkills`: `★ AI Verified` (magenta, existing), `⬡ GitHub Verified` (green, new — show when any skill has `githubValidated: true`), `✦ Elite Verified` (gold color `#FFD700`, new — show when any skill has both `aiValidated` and `githubValidated` true). Use the existing `TechBadge` component from `@/features/tech`.
- The portfolio data query for `TechSkills` must include `githubValidated` in the `userSkills` select so the component and `SkillHexagonNode` receive the field.

**TG10 — Re-authorization Modal**
- Create `features/github/components/GitHubReauthModal.tsx` as a `'use client'` component.
- Shown when the `syncGitHubAction` returns an error with a `GitHubAuthError` type (the action should include an `errorType: 'auth' | 'api' | 'generic'` discriminator in the error response).
- Modal message: `"Enlace perdido con la base de datos de GitHub. Reautoriza para continuar."` in terminal monospace style.
- CTA button: "Reconectar GitHub" — triggers the Better Auth re-connect flow.
- Parent (`GitHubSyncPanel`) fires `lifeLossTrigger` increment when this modal is opened so the AIEye plays the `life_loss` animation concurrently.
- Use shadcn `Dialog` component.

## Visual Design

No visual assets provided. All visual decisions are derived from the existing Tech Mode design language.

## Existing Code to Leverage

**`features/skills/actions/syncSkillsFromExperience.ts` — three-layer action pattern**
- The exact template for the new `syncGitHubAction`: `'use server'`, `actionWrapper`, `auth.api.getSession` for auth, Yup validation, service call, then `revalidatePath` and `revalidateTag`.
- The response shape `{ payload: { ... }, message: CONSTANT }` must be replicated.

**`features/tech/components/crt-with-ai.tsx` — `xpGainTrigger` / `lifeLossTrigger` counter pattern**
- `CRTWithAIProps` already accepts `xpGainTrigger?: number` and `lifeLossTrigger?: number`; new `searchingTrigger?: number` prop follows the same shape.
- `TRANSIENT_STATES` array and `prevStateRef` auto-return mechanism must be extended for `searching` (but `searching` is NOT auto-returning — the panel drives the return manually via the XP/life triggers).
- All existing `mainColor` switch expressions, border color expressions, and status label color expressions in `AIEye` and `CRTWithAI` must include the `isSearching` amber branch.

**`features/skills/components/SkillHexagonNode.tsx` — AI validation visual block**
- Lines 62–88 define the `isAIValidated` boolean and the `svgFilter` string; the GitHub and dual-validation states must be added to this exact block using the same conditional string-building pattern.
- The inline SVG `<text>` mark at lines 176–188 is the pattern for adding the `⬡` GitHub mark.
- The `motion.div` pulsing ring (lines 253–270) is the pattern for the gold dual-validated pulsing ring.

**`features/dashboard/data/getUserDashboardStats.data.ts` — XP computation pattern**
- The `skillXPs` array (line 77) maps `userSkills` to XP values; add the `GITHUB_XP_MULTIPLIER` multiplication here and in the parallel files `getTopRunners.data.ts` and `getRecentUserActivity.data.ts`.
- `unstable_cache` with `tags: [\`user-stats-${userId}\`]` is the cache pattern; the sync action must call `revalidateTag(\`user-stats-${userId}\`)` to bust this cache after a successful sync.

**`prisma/schema.prisma` `Account` model (line 78)**
- `Account.accessToken` where `Account.providerId === 'github'` is the token source; no new storage infrastructure is needed.
- `getGitHubToken.data.ts` issues a single `prisma.account.findFirst` against this model.

**`app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` — skills page layout**
- The stats grid (lines 114–151) and legend row (lines 154–179) show the layout slot where `GitHubSyncPanel` should be inserted as a new section above the `<section>` wrapping `SkillTreeView`.
- The existing `useTransition` + `handleAddSkill` pattern is the model for the Re-Sync button's `isPending` state in `GitHubSyncPanel`.

## Out of Scope

- GitHub account unlink / disconnect UI (deferred to v2; users delete their account to reset).
- XP boost invalidation when GitHub token is revoked (once validated, status persists).
- Automated or scheduled periodic sync (cron jobs, background jobs).
- Forked repositories counted in language analysis (excluded via `fork === false` filter).
- Auto-creation of new skills from GitHub language data (only validates skills that already exist in the user's `UserSkill` table).
- Per-skill configurable thresholds (global 60% only for v1).
- Classic Mode UI for GitHub sync (the "Expansion Module" panel is Tech Mode only).
- Integration with any external platform other than GitHub (YouTube, Behance, etc. are Phase 4.5).
- GitHub token refresh rotation logic (GitHub tokens are long-lived; re-prompt on 401 is sufficient).
- Archived repo special handling (treated identically to active repos unless explicitly forked).
- Pagination for users with more than 100 repos (the `per_page=100` single-page fetch is sufficient for v1).
