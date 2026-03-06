# Specification: Phase 4 — AI Skill Assessment MVP

## Goal

Give users a way to prove — not just declare — their skill proficiency via a Claude-powered 5-question multiple-choice quiz per skill. A passing score marks the skill `aiAssessmentValidated: true`, awards a visible badge on the public portfolio, and grants a one-time XP boost. The feature is gated by a daily "Assessment Token" system that is architecturally separate from the AI chat lives system.

## User Stories

- As a developer user, I want to take an AI-generated skill quiz so that my profile shows a credible "AI Validated" badge that visitors can trust rather than a self-declared level.
- As a portfolio visitor, I want to see an AI Assessment score badge on validated skills so that I can immediately gauge how deeply someone knows their technology.

## Specific Requirements

**TG1 — Prisma Schema: New Models and Field Additions**
- Add `aiAssessmentValidated: Boolean @default(false)` to `UserSkill` model alongside the existing `aiValidated` and `githubValidated` fields.
- Add `assessmentTokens` JSON field to `User` model stored under `meta` key (do NOT add a separate top-level column) with shape `{ remaining: number; lastResetDate: string }` — mirrors the `remainingLives` / `lastResetDate` pattern used by `ai-quota` feature stored in `User.meta`.
- Create `SkillAssessment` model: `id`, `userId`, `userSkillId`, `skillSlug` (String), `skillLevel` (Int 1-5), `status` (enum: `PENDING | PASSED | FAILED`), `score` (Int?, nullable until completed), `attemptNumber` (Int, 1-3), `startedAt` (DateTime default now), `completedAt` (DateTime?), `createdAt`, `updatedAt`. Relations: belongs to `User` and `UserSkill`. `@@map("skill_assessments")`.
- Create `AssessmentQuestion` model: `id`, `assessmentId`, `questionIndex` (Int 0-4), `questionText` (String), `options` (String[] — 4 elements), `correctIndex` (Int 0-3), `explanation` (String), `createdAt`. Relation: belongs to `SkillAssessment`. `@@map("assessment_questions")`.
- Create `AssessmentAttempt` model: `id`, `assessmentId`, `questionIndex` (Int 0-4), `selectedIndex` (Int 0-3), `isCorrect` (Boolean), `answeredAt` (DateTime default now). Relation: belongs to `SkillAssessment`. `@@map("assessment_attempts")`.
- Create `AssessmentStatus` enum with values `PENDING | PASSED | FAILED` in schema.
- Run `prisma generate` after all schema changes; no data migration needed (all new models, new boolean defaults to false).

**TG2 — Assessment Token System**
- Token data lives in `User.meta.assessmentTokens` (JSON field, same pattern as `ai-quota` feature's `User.meta.remainingLives`).
- Create `features/assessment/data/getAssessmentTokens.data.ts` — reads `user.meta` and returns `{ remaining: number; lastResetDate: string }`, defaulting to `{ remaining: 3, lastResetDate: today }` if absent.
- Create `features/assessment/services/assessmentToken.service.ts` — `consumeAssessmentToken(userId)` uses atomic `$runCommandRaw` `findAndModify` (two-step: reset if date differs, then decrement if remaining > 0) — exact same MongoDB atomic pattern as `consumeLifeService` in `features/ai-quota/services/quota.service.ts`.
- Free tier: 3 tokens/day. Pro tier: unlimited (check `User.meta.isPro` boolean; if true, skip token consumption and return success immediately).
- Export `hasAssessmentTokens(userId): Promise<boolean>` function that reads meta without consuming.
- `DEFAULT_ASSESSMENT_TOKENS = 3` constant in `features/assessment/constants/tokens.ts`.

**TG3 — Assessment Engine Service (Claude AI)**
- Create `features/assessment/services/generateQuestions.service.ts` — calls `@ai-sdk/anthropic` with `generateText` (same SDK already used in project) to generate exactly 5 multiple-choice questions for a given skill + level.
- Prompt instructs Claude to return a JSON array of 5 objects each with: `questionText`, `options` (array of 4 strings), `correctIndex` (0-3), `explanation`. Prompt also passes the skill name (e.g., "TypeScript") and level name (e.g., "Journeyman / Level 3") for difficulty calibration.
- Parse and validate the JSON response; if parsing fails, throw a typed `AssessmentGenerationError` so the action can surface a user-friendly fallback message.
- Create `features/assessment/services/scoreAssessment.service.ts` — takes `assessmentId` and array of `{ questionIndex, selectedIndex }` answers, computes score as `(correctCount / 5) * 100`, determines `passed = score >= 60`, updates `SkillAssessment.status`, `SkillAssessment.score`, `SkillAssessment.completedAt` via Prisma, creates `AssessmentAttempt` records for each answer.
- On pass: call `features/assessment/services/applyAssessmentRewards.service.ts` which sets `UserSkill.aiAssessmentValidated = true` and adds `+200 XP` via a new `SkillSource` record with `sourceType: MANUAL` and `metadata: { source: 'ai_assessment', score }`.
- Model used: `claude-sonnet-4-5` via `createAnthropic` from `@ai-sdk/anthropic`. Use `process.env.ANTHROPIC_API_KEY`.

**TG4 — Three-Layer Action API**
- Create `features/assessment/actions/startAssessment.action.ts` — `'use server'`, `actionWrapper`, auth check, Yup validation (skillSlug: string required), calls `consumeAssessmentToken`, calls `generateQuestions.service`, persists `SkillAssessment` + `AssessmentQuestion` records, returns `{ assessmentId, questions: QuestionForClient[] }` where `QuestionForClient` omits `correctIndex` and `explanation` (never expose answers to client).
- Create `features/assessment/actions/submitAnswers.action.ts` — `'use server'`, `actionWrapper`, auth check, Yup validation (assessmentId: string, answers: array of `{ questionIndex: number, selectedIndex: number }`), calls `scoreAssessment.service`, returns `ScoreResult { score, passed, correctCount, xpAwarded, attempts }`.
- On `submitAnswers`: after scoring, call `revalidatePath('/dashboard/skills')` and `revalidateTag(\`user-stats-${userId}\`)` (same cache invalidation pattern as GitHub sync action).
- No `submitAnswer` per-question endpoint — answers are submitted all at once at the end of the quiz flow. The UI stores answers in local React state until the user confirms submission.
- Cooldown enforcement in `startAssessment.action.ts`: check `SkillAssessment` table for this `userId + skillSlug` — if 3 attempts exist with `status !== PENDING` within the last 24h and all are `FAILED`, throw a typed `CooldownError` with `cooldownEndsAt` timestamp.

**TG5 — Assessment Feature Constants and Types**
- Create `features/assessment/constants/tokens.ts` — `DEFAULT_ASSESSMENT_TOKENS = 3`, `PASS_THRESHOLD = 60`, `QUESTIONS_PER_ASSESSMENT = 5`, `MAX_ATTEMPTS_BEFORE_COOLDOWN = 3`, `COOLDOWN_HOURS = 24`.
- Create `features/assessment/constants/messages.ts` — `ASSESSMENT_MESSAGES` object with keys: `START_SUCCESS`, `ALREADY_VALIDATED`, `NO_TOKENS`, `COOLDOWN_ACTIVE`, `PASS`, `FAIL`, `GENERATION_ERROR`.
- Create `features/assessment/constants/supportedSkills.ts` — `ASSESSMENT_SUPPORTED_SKILL_SLUGS: string[]` array with exactly 5 initial values: `['react', 'javascript', 'typescript', 'python', 'nodejs']`.
- Create `features/assessment/types/assessment.ts` — re-export Prisma types `SkillAssessment`, `AssessmentQuestion`, `AssessmentAttempt`; define `QuestionForClient` (omitting `correctIndex` and `explanation`), `ScoreResult`, `AssessmentState` (for UI state machine: `'idle' | 'loading' | 'in_progress' | 'submitting' | 'result'`), and component prop interfaces `AssessmentModalProps`, `AssessmentWidgetProps`.

**TG6 — Dashboard Widget: AssessmentWidget**
- Create `features/assessment/components/AssessmentWidget.tsx` as `'use client'` component rendered inside the skills dashboard view, below the GitHub Sync Panel.
- For each skill in the user's `UserSkill` list that matches `ASSESSMENT_SUPPORTED_SKILL_SLUGS`, render one row showing: skill name, current level badge, validation status icons (AI-validated star, GitHub hex), and a "Take Assessment" CTA button.
- CTA button states: enabled (no prior pass, tokens available), disabled with tooltip "Already Validated" (if `aiAssessmentValidated: true`), disabled with tooltip showing cooldown countdown (if cooldown active), disabled with tooltip "No tokens remaining" (if `assessmentTokens.remaining === 0`).
- Show token meter at top of widget: `[ASSESSMENT_TOKENS]: [2/3] remaining today` in monospace Tech Mode style with cyan accent.
- On "Take Assessment" click, open `AssessmentModal` passing the `skillSlug`.
- Props interface in `features/assessment/types/assessment.ts`. Widget receives `userSkills` (filtered to supported slugs) and `assessmentTokens` as props passed from the page/parent server component.

**TG7 — Assessment Modal Flow: AssessmentModal**
- Create `features/assessment/components/AssessmentModal.tsx` as `'use client'` using shadcn `Dialog`.
- Internal state machine controlled by `assessmentState: AssessmentState` (`'idle' | 'loading' | 'in_progress' | 'submitting' | 'result'`).
- Loading screen: calls `startAssessment` action on open, shows terminal-style spinner animation, message `[INITIALIZING]: Generating assessment for {skillName}...`.
- In-progress screen: shows question text, 4 radio-button answer options styled as terminal selection rows (`> [A]`, `> [B]`), progress bar `[Q 1/5]` at top, token display in corner. User selects one option per question, clicks "Next" to advance (answers stored in local state).
- Confirm screen: after Q5, show "Submit Assessment?" confirmation with answer summary count, "Confirm & Submit" button triggers `submitAnswers` action.
- Result screen — Pass: show score `87/100`, large `[PASS]` in green with terminal animation, XP boost message `+200 XP awarded`, badge confirmation `aiAssessmentValidated: true`, "Close" button.
- Result screen — Fail: show score in red, `[FAIL]` terminal style, correct count, attempts remaining or cooldown message, "Try Again" (if attempts left) or "Close" (if cooldown active).
- All screens use Tech Mode aesthetics (monospace font, cyan borders, angular HUD-panel style from `features/tech`).

**TG8 — SkillHexagonNode: AI Assessment Badge**
- Extend `SkillHexagonNode` in `features/skills/components/SkillHexagonNode.tsx` to read `userSkill?.aiAssessmentValidated`.
- Add new compound state `isAssessmentValidated = userSkill?.aiAssessmentValidated === true`.
- SVG mark: render a small `◆` diamond mark (color: `#00D4FF` cyan, `fontSize="7"`) at position `x="60"`, `y="10"` (bottom-right corner, distinct from AI star top-right and GitHub hex top-left) when `isAssessmentValidated` is true.
- Drop-shadow extension: when `isAssessmentValidated && !isBothValidated`, add `drop-shadow(0 0 8px #00D4FF)` to the existing filter string (additive, does not override GitHub or dual-validation gold).
- Update `ariaLabel` to include `"AI Assessment Verified"` when `isAssessmentValidated`.
- Do NOT change any existing validation visual logic — only add the new `isAssessmentValidated` layer on top.

**TG9 — Public Portfolio Badge: Assessment Display**
- In `features/portfolio/components/tech/TechSkills.tsx`, add detection: `const hasAssessmentValidated = userSkills.some((s) => s.aiAssessmentValidated)`.
- Render new `TechBadge` in the legend row: `◆ Assessment Verified` with color `cyan` when `hasAssessmentValidated` is true.
- The `userSkills` data query in the portfolio data layer must include `aiAssessmentValidated: true` in the Prisma select so the field flows through to the component.
- Show on public portfolio skill tooltip (if implemented): `"AI Assessment: {score}/100"` next to the badge when `aiAssessmentValidated` is true and `score` is stored on the latest `PASSED` `SkillAssessment` record.

**TG10 — Dashboard Skills Page Integration**
- In `app/[locale]/(dashboard)/dashboard/skills/page.tsx`: extend the existing user data query to include `meta` (for assessment token extraction) and `userSkills` (already fetched — add `aiAssessmentValidated: true` to the select).
- Pass `assessmentTokens` (parsed from `user.meta`) and filtered `supportedUserSkills` as props to `DashboardSkillsView`.
- In `DashboardSkillsView.tsx`: render `<AssessmentWidget>` below `<GitHubSyncPanel>` and above the skill tree section. Wire `onAssessmentComplete` callback to increment `xpGainTrigger` (reuse existing CRT eye trigger pattern) so the AIEye plays `xp_gain` animation when an assessment is passed.

## Visual Design

No visual mockups provided. All UI follows the existing Tech Mode design language.

**Tech Mode Assessment UI Design Rules**
- Use `HUDPanel` from `features/tech` for the widget container.
- Modal uses shadcn `Dialog` with `cn()` overrides for dark background `#0A0E1A` and cyan border `border-[#00D4FF]/30`.
- Question option rows: `font-mono text-sm`, hover state `bg-[#00D4FF]/10 border-l-2 border-[#00D4FF]`.
- Progress bar: segmented into 5 blocks, filled blocks `bg-[#00D4FF]`, empty blocks `bg-[#0A0E1A] border border-[#00D4FF]/20`.
- Pass result accent: `text-[#22C55E]` green. Fail result accent: `text-red-500`.
- Token meter: `text-[#00D4FF]` for count, `text-muted-foreground/50` for label, `font-mono text-xs`.

## Existing Code to Leverage

**`features/ai-quota/services/quota.service.ts` — atomic `$runCommandRaw` token pattern**
- `consumeLifeService` uses two-step `findAndModify`: reset if date differs, then decrement if remaining > 0. Copy this exact pattern for `consumeAssessmentToken` in the new assessment feature, targeting `meta.assessmentTokens.remaining` and `meta.assessmentTokens.lastResetDate` fields in the `users` collection.

**`features/github/services/syncGitHub.service.ts` and `actions/syncGitHub.action.ts` — three-layer action pattern**
- The `startAssessment` and `submitAnswers` actions must follow the exact same structure: `actionWrapper` + `auth.api.getSession` + Yup validation + service call + `revalidatePath` / `revalidateTag`.

**`features/skills/components/SkillHexagonNode.tsx` — validation visual extension block (lines 62–100)**
- The `isAIOnly`, `isGithubOnly`, `isBothValidated` compound booleans and the `svgFilter` string-building pattern are the template for adding the `isAssessmentValidated` layer in TG8.
- The inline SVG `<text>` mark pattern (existing `★` and `⬡` marks) is the pattern for the new `◆` diamond mark.

**`features/portfolio/components/tech/TechSkills.tsx` — validation badge legend pattern**
- The `hasAIValidated`, `hasGitHubValidated`, `hasDualValidated` detection block and `TechBadge` render pattern is the direct template for the `hasAssessmentValidated` addition in TG9.

**`features/tech/components/crt-with-ai.tsx` — `xpGainTrigger` counter pattern**
- `AssessmentModal` onClose (on pass) increments the same `xpGainTrigger` prop that `GitHubSyncPanel` uses, wired through `DashboardSkillsView`. No new trigger prop needed.

## Out of Scope

- Code snippet / find-the-bug question types (multiple choice only in MVP).
- Hints system (no hints, no partial credit).
- Per-question hint that costs 0.5 tokens (Phase 5 Quest System).
- Adaptive difficulty (all questions calibrated to the user's current UserSkill level but not dynamically adjusted mid-quiz).
- Classic Mode UI for the assessment widget (Tech Mode only in Phase 4).
- Assessment for skills outside the 5 supported slugs (`react`, `javascript`, `typescript`, `python`, `nodejs`).
- Pro tier subscription billing flow (token gate references `isPro` flag on `User.meta` but the billing feature itself is out of scope).
- Leaderboard or social sharing of assessment scores.
- Assessment retake with different questions (retry uses the same 24h cooldown, fresh questions are always generated per attempt).
- Email notifications on assessment pass.
- GitHub + Assessment combined "Elite Validated" tier (the gold dual-validation badge already handles GitHub + AI; assessment is a separate independent badge).
- Quest System RPG mechanics, HP bars, combat (Phase 5).
