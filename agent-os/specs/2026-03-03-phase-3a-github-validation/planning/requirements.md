# Spec Requirements: Phase 3A - GitHub Validation

## Initial Description

Connect GitHub account (OAuth already exists via Better Auth), fetch repos/languages/commit activity
from GitHub API, auto-validate skills based on repo language composition (e.g. TypeScript if repos
have >60% TS), apply 1.3x XP credibility boost for GitHub-validated skills. Part of Phase 3
"Solidify Tech Mode" in the Portfoland roadmap.

---

## Requirements Discussion

### First Round Questions

**Q1:** Better Auth stores the GitHub `accessToken` in the `Account` model already. I assumed we
read it directly from the DB via the existing Prisma `Account` record when the user triggers a sync
(using `providerId === 'github'`), and do NOT implement a separate token refresh mechanism for v1.
If the token fails, the app triggers a re-prompt modal. Is that correct?

**Answer:** Read directly from DB + simple re-prompt. No refresh rotation logic in v1. If token
fails (401), capture the error and trigger a re-prompt modal with the AIEye saying: "Enlace perdido
con la base de datos de GitHub. Reautoriza para continuar." Long-lived GitHub tokens make this
sufficient.

---

**Q2:** Which GitHub data should be fetched — repos and language breakdown, stars, commits, forks?

**Answer:**
- Repos + Language breakdown: essential for skill matching.
- Total Stars: include it — gives a "legendary achievement" feeling, will be used for display/XP.
- Commits: only if easy to get without infinite pagination — use GraphQL `contributionsCollection`
  total if possible.
- Forks: ignore them to avoid inflating XP with other people's code.

---

**Q3:** Should the feature request `repo` scope (includes private repos) or `public_repo` scope only?

**Answer:** Use `repo` scope (full access, includes private repos). Show a terminal-style notice:
`[SYS_MESSAGE]: Analizando repositorios privados... Datos procesados de forma anónima. No se
almacenarán nombres ni código fuente.`

---

**Q4:** How should skill matching from GitHub languages work? Static mapping file? Global threshold
or per-skill threshold?

**Answer:** Static mapping file `github-mappings.ts` for language aliases (C++ → cpp, Jupyter
Notebook → python, etc.). Global 60% threshold for v1. If 60%+ of language activity matches a
declared skill, it gets validated.

---

**Q5:** Should GitHub validation reuse the existing `aiValidated: boolean` field on `UserSkill`, or
get its own field?

**Answer:** New field `githubValidated: boolean` on `UserSkill`. Keep them separate. Visual goals:
- `★` (magenta) for AI-validated (existing behavior, no change).
- GitHub icon mark for GitHub-validated (new indicator on `SkillHexagonNode`).
- If BOTH are validated: "Rainbow" or "Gold" special effect on the hexagon node — this is a key
  visual reward moment and a primary delight feature.

---

**Q6:** Should the 1.3x XP boost be stored in the DB or applied on the fly at read time?

**Answer:** Apply on-the-fly at read time, NOT stored in DB. Retroactive — applies to the full
accumulated `totalXP` of the skill at the moment of display. The user feels an immediate level
"surge" when they connect GitHub. This approach makes it easy to rebalance in the future without
a DB migration.

---

**Q7:** Where does the GitHub connect / sync UI live?

**Answer:** Dedicated panel inside the `/dashboard/skills` page. Widget aesthetic: "Expansion
Module." When connected, the widget transforms into a "Sync Status Panel" showing the last sync
timestamp styled as `Last Data Upload: [TIMESTAMP]` in terminal style.

---

**Q8:** How often does re-validation happen?

**Answer:** On-demand manual sync only. No cron jobs. Display `githubSyncedAt` as
`Last Data Upload: [TIMESTAMP]` in terminal style. The timestamp is stored on the `User` model.

---

**Q9 (out of scope clarification):** What is explicitly excluded from v1?

**Answer:**
- Forks excluded from language analysis to avoid inflating XP with other people's code.
- No unlink/disconnect GitHub in v1 (user deletes account to reset; unlink deferred to v2).
- No XP boost invalidation — once a skill is GitHub-validated, the honor stays even if the token
  is later revoked.
- No automated periodic sync or background jobs.

---

**Q10 (user addition — AIEye behavior during sync):** The AIEye should react during the GitHub sync
process:
- Transition to a new `searching` AIState while the progress bar / sync is in progress.
- End with an `xp_gain` state (massive, sustained) if high-level languages are detected.
- Leverage the existing reactive state system built in TG1 of the Phase 3B visual polish spec.

**Answer:** Yes — add a new `searching` state to the `AIState` union in
`features/tech/components/crt-with-ai.tsx`. The sync flow transitions:
`thinking` → `searching` (sustained, during API call) → `xp_gain` (on success with validated
skills). This is the perfect moment to leverage TG1's reactive eye states.

---

### Existing Code to Reference

**Similar Features Identified:**

- Feature: `syncSkillsFromExperience` server action — Path: `features/skills/actions/syncSkillsFromExperience.ts`
  - Pattern to mirror: `actionWrapper` + Yup schema validation + service call + `revalidatePath`.
  - The GitHub sync action should follow this exact three-layer structure:
    `githubSyncAction` → `githubSyncService` → data layer.

- Feature: `UserSkill` model with `aiValidated` — Path: `prisma/schema.prisma` (line 220)
  - The new `githubValidated: Boolean @default(false)` field follows the same pattern as `aiValidated`.
  - The existing `SourceType` enum (`EXPERIENCE | MANUAL`) needs a new `GITHUB` variant.

- Feature: `SkillHexagonNode` AI validation visual — Path: `features/skills/components/SkillHexagonNode.tsx`
  - Currently reads `userSkill?.aiValidated` to render the magenta `★` mark and double drop-shadow.
  - Must be extended to also read `githubValidated` and render: GitHub icon mark, and the combined
    "Rainbow/Gold" effect when both flags are true.

- Feature: `CRTWithAI` / `AIEye` — Path: `features/tech/components/crt-with-ai.tsx`
  - `AIState` union (line 13) currently has: `sleeping | waking | drowsy | awake | listening |
    thinking | ready | success | xp_gain | life_loss`.
  - New `searching` state must be added to this union and handled in the `AIEye` SVG render logic.
  - `xpGainTrigger` prop (line 38) is the existing mechanism to fire the `xp_gain` eye animation —
    the GitHub sync completion should increment this trigger counter.

- Feature: Dashboard data layer — Path: `features/dashboard/data/getUserDashboardStats.data.ts`
  - Currently applies a heuristic `aiValidated ? 150 : 50` XP for dashboard display (line 82-83 in
    `getTopRunners.data.ts`). After this spec is implemented, the 1.3x GitHub boost must also be
    factored into XP display calculations across all dashboard data files.

- Feature: `TechSkills` public portfolio component — Path: `features/portfolio/components/tech/TechSkills.tsx`
  - Currently shows `★ AI Verified` badge when any skill has `aiValidated: true`.
  - Must be extended to show a GitHub validation badge and the dual-validated "Gold" state.

- Feature: `Account` model in Prisma — Path: `prisma/schema.prisma` (line 78)
  - Better Auth stores GitHub `accessToken` in `Account.accessToken` where `Account.providerId === 'github'`.
  - The service layer reads this token directly; no separate token storage needed.

---

### Follow-up Questions

None required — all critical decisions were captured in the first round.

---

## Visual Assets

### Files Provided

No visual assets provided.

### Visual Insights

Not applicable — no files found in `planning/visuals/`.

---

## Requirements Summary

### Functional Requirements

**GitHub Account Connection:**
- The user connects GitHub via an OAuth prompt scoped to `repo` (full access, including private repos).
- Better Auth already has a GitHub OAuth provider configured; the connection reuses the existing flow.
- On successful connection, the `Account` record with `providerId === 'github'` is created/updated
  by Better Auth in the existing Prisma `Account` model.
- A `githubSyncedAt: DateTime?` field is added to the `User` model to track last sync time.

**Token Handling:**
- No refresh rotation logic. GitHub personal access tokens are long-lived.
- On sync, the service reads `Account.accessToken` for the GitHub provider from the DB.
- If the API returns 401, the error is caught and a re-prompt modal is shown with the AIEye
  displaying the message: "Enlace perdido con la base de datos de GitHub. Reautoriza para continuar."
- The re-prompt modal triggers the GitHub OAuth flow again (Better Auth's connect flow).

**Data Fetching from GitHub API:**
- Fetch the authenticated user's repos via GitHub REST API: `GET /user/repos` (includes private repos).
- For each repo (excluding forks — filter `fork === false`), collect the language byte breakdown.
- Aggregate total bytes per language across all non-fork repos.
- Fetch total commit contributions using GitHub GraphQL API `contributionsCollection.totalCommitContributions`
  (single request, no pagination needed).
- Fetch total stars received across all repos (sum of `stargazers_count` per repo).
- Data points stored in the DB: `githubSyncedAt` on `User`, `githubValidated` on `UserSkill`. Raw
  GitHub stats (stars, total commits) stored in a new `githubStats` JSON field on `User` or a
  dedicated model for display purposes.

**Skill Matching Logic:**
- A static mapping file `features/github/constants/github-mappings.ts` maps GitHub language names
  to Skill slugs (e.g., `"TypeScript" → "typescript"`, `"C++" → "cpp"`,
  `"Jupyter Notebook" → "python"`, `"Shell" → "bash"`, etc.).
- The validation threshold is 60%: if a language accounts for >=60% of total bytes across all
  non-fork repos, the corresponding skill (if it exists in the user's `UserSkill` table) is marked
  `githubValidated: true`.
- Only skills already in the user's `UserSkill` table are eligible for validation. The sync does
  NOT auto-create new skills.
- The threshold is global (not per-skill) for v1.
- A new `GITHUB` variant is added to the `SourceType` enum.

**XP Boost (1.3x multiplier):**
- The boost is NOT stored in the DB. `UserSkill.totalXP` remains the raw earned XP.
- At read time, wherever XP is displayed (dashboard stats, skill tree, public portfolio), the
  effective XP is computed as: `effectiveXP = githubValidated ? Math.round(totalXP * 1.3) : totalXP`.
- This applies retroactively to the full accumulated `totalXP` of any validated skill.
- The 1.3x factor is defined as a named constant (e.g., `GITHUB_XP_MULTIPLIER = 1.3`) in
  `features/github/constants/xp.ts` to allow easy future rebalancing.
- All data layer files that currently read `UserSkill.totalXP` for XP display must apply this
  multiplier when `githubValidated` is true: `getUserDashboardStats.data.ts`,
  `getTopRunners.data.ts`, `getRecentUserActivity.data.ts`.

**Skills Dashboard UI — "GitHub Expansion Module" Widget:**
- Location: `/dashboard/skills` page, rendered as a panel inside `DashboardSkillsView`.
- Pre-connection state: Panel shows a "Connect GitHub" CTA button styled as an "Expansion Module"
  in Tech Mode aesthetic (angular borders, cyan accent, terminal-style label).
- On click: triggers the GitHub OAuth flow. On success, immediately runs first sync.
- Connected + synced state: Panel transforms into a "Sync Status Panel" displaying:
  - `Last Data Upload: [githubSyncedAt timestamp]` in terminal/monospace style.
  - Summary stats fetched from GitHub: total stars, total commits, validated skills count.
  - A "Re-Sync" button to trigger an on-demand re-validation.
- Private repo privacy notice displayed in terminal style:
  `[SYS_MESSAGE]: Analizando repositorios privados... Datos procesados de forma anónima. No se almacenarán nombres ni código fuente.`

**AIEye Integration During Sync:**
- A new `searching` state is added to the `AIState` union in `crt-with-ai.tsx`.
- The `searching` state visual: scanning orbital animation (similar to `thinking` but with a wider
  or differently styled orbit), color remains cyan, label shows `SEARCHING`.
- Sync flow state sequence:
  1. User clicks "Sync" → AIEye transitions to `thinking` briefly.
  2. GitHub API call starts → AIEye transitions to `searching` (sustained for the duration of the call).
  3. On success with validated skills → AIEye fires `xp_gain` via incrementing `xpGainTrigger`.
  4. On error → AIEye fires `life_loss` via incrementing `lifeLossTrigger`, error message shown.
- The `CRTWithAI` component must accept a new `searchingTrigger?: number` prop (or the parent
  drives `aiState` externally), consistent with the existing `xpGainTrigger` / `lifeLossTrigger`
  pattern.

**SkillHexagonNode Validation Visuals:**
- AI-validated only (`aiValidated: true`, `githubValidated: false`): existing magenta star `★`
  mark at top-right of hexagon + magenta/cyan double drop-shadow. No change.
- GitHub-validated only (`githubValidated: true`, `aiValidated: false`): GitHub icon mark at
  top-right of hexagon. A distinct color drop-shadow (e.g., white or green glow) to differentiate
  from AI validation.
- Both validated (`aiValidated: true` AND `githubValidated: true`): "Rainbow/Gold" special effect.
  The hexagon node gets a gold (`#F59E0B`) or animated rainbow gradient stroke/glow. This is the
  primary visual delight moment — the rarest and most prestigious state. Exact animation to be
  designed during implementation but must feel like a legendary/achievement unlock.

**Public Portfolio — Tech Mode Skills Section:**
- `TechSkills.tsx` badge legend extended to include GitHub Verified and Dual Validated states.
- Example legend items:
  - `★ AI Verified` (existing, magenta).
  - `⬡ GitHub Verified` (new, white or green).
  - `★⬡ Elite Verified` or `✦ Legendary` (dual validated, gold).

**Re-authorization Modal:**
- Shown when a GitHub API call returns 401.
- AIEye state: the `life_loss` animation fires when the modal appears.
- Modal message (Spanish, as requested): "Enlace perdido con la base de datos de GitHub.
  Reautoriza para continuar."
- CTA: Triggers the GitHub OAuth re-connect flow via Better Auth.

### Reusability Opportunities

- `actionWrapper` from `features/core/actions/actionWrapper.ts` — wrap the new GitHub sync action.
- `syncSkillsFromExperience` action structure as the direct pattern template for the new
  `syncGithubSkills` action.
- Existing `AIState` union and `xpGainTrigger`/`lifeLossTrigger` mechanism in `crt-with-ai.tsx`
  for the new `searching` state and sync-triggered eye animations.
- `Account` model (Better Auth) already stores the GitHub `accessToken` — no new token storage needed.
- `SkillHexagonNode.tsx` `isAIValidated` rendering block — extend in-place to handle
  `isGithubValidated` and the `isBothValidated` compound state.
- `SourceType` enum in `prisma/schema.prisma` — extend with `GITHUB` variant.

### Scope Boundaries

**In Scope:**
- New `githubValidated: Boolean @default(false)` field on `UserSkill` model.
- New `githubSyncedAt: DateTime?` field on `User` model.
- New `GITHUB` variant on `SourceType` enum.
- GitHub OAuth connect flow (reusing Better Auth's existing GitHub provider).
- GitHub REST API calls: repos list (non-forks), language breakdown, stars per repo.
- GitHub GraphQL API call: `contributionsCollection.totalCommitContributions`.
- `repo` OAuth scope (includes private repos).
- Static language → skill slug mapping file (`github-mappings.ts`).
- Global 60% language threshold for validation.
- `GITHUB_XP_MULTIPLIER = 1.3` constant applied at read time across all XP display layers.
- "Expansion Module" widget on `/dashboard/skills` (pre-connect and post-connect states).
- "Sync Status Panel" with last sync timestamp and GitHub stats summary.
- Private repo privacy notice in terminal style.
- New `searching` AIState in `CRTWithAI` + sync-triggered AIEye animations.
- `SkillHexagonNode` visual extensions: GitHub mark, dual-validated gold/rainbow effect.
- `TechSkills` public portfolio badge legend extension.
- Re-authorization modal with `life_loss` AIEye animation.
- On-demand re-sync button.
- All XP display layers updated to apply 1.3x multiplier for `githubValidated` skills.

**Out of Scope:**
- Unlink / disconnect GitHub (deferred to v2).
- XP boost invalidation if token is revoked (once validated, the honor stays).
- Automated periodic sync or background cron jobs.
- Fork repos counted in language analysis (forks are excluded).
- Auto-creating new skills from GitHub data (only validates existing user skills).
- Per-skill configurable thresholds (global 60% only for v1).
- Archived repo handling (treat as normal repos unless explicitly forked).
- Integration with any other external platforms (YouTube, Behance, etc. — those are Phase 4.5).
- Classic Mode specific UI (the "Expansion Module" widget is Tech Mode only; Classic Mode behavior
  to be defined in a future spec if needed).

### Technical Considerations

- Better Auth's `Account` model (`prisma/schema.prisma` line 78) already stores `accessToken` for
  the GitHub provider — no separate token infrastructure needed.
- GitHub REST API base URL: `https://api.github.com`. Authenticated with `Authorization: Bearer
  {accessToken}` header.
- GitHub GraphQL API: `https://api.github.com/graphql`. Authenticated the same way.
- The sync runs server-side (Next.js Server Action) to keep the token out of the client.
- Three-layer architecture: `syncGithubSkillsAction` → `syncGithubSkillsService` →
  data layer functions — mirroring `syncSkillsFromExperience`.
- `revalidatePath('/dashboard/skills')` and relevant portfolio paths after sync completes.
- `AIState` union extension is a non-breaking additive change to `crt-with-ai.tsx`.
- The `searching` state in the AIEye should be visually distinct from `thinking` (different orbit
  pattern or speed) to communicate "waiting for external data" vs. "processing internally."
- The `GITHUB_XP_MULTIPLIER` constant should be defined once and imported everywhere XP is computed
  for display, to ensure a single source of truth for future rebalancing.
- Yup validation schema for the sync action input should validate that the authenticated user has
  a linked GitHub account before proceeding.
- GitHub API rate limits: REST API allows 5,000 requests/hour for authenticated users. The sync
  is on-demand and fetches a bounded number of endpoints, so rate limiting is not a concern for v1.
