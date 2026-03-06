# Task Breakdown: Phase 4 — AI Skill Assessment MVP

## Overview

Total Task Groups: 10
Feature: Claude-powered 5-question multiple-choice skill assessments, daily token system (separate from AI chat lives), pass/fail scoring with XP rewards, `aiAssessmentValidated` badge on the public portfolio, and a dashboard widget for starting assessments.

## Dependency Graph

```
TG1 (Schema) → TG2 (Token system) → TG4 (Actions)
TG1 → TG3 (AI engine)             → TG4
TG1 → TG5 (Constants + Types)     → TG4, TG6, TG7
TG4 → TG6 (AssessmentWidget)
TG4 → TG7 (AssessmentModal)
TG6 + TG7 → TG10 (Dashboard integration)
TG1 → TG8 (SkillHexagonNode badge)
TG1 → TG9 (Portfolio public badge)
TG8 + TG9 → TG10
```

Recommended execution order: TG5 → TG1 → TG2 → TG3 → TG4 → TG8 → TG9 → TG6 → TG7 → TG10

---

## Task List

### Constants and Types (no dependencies — create first)

#### Task Group 5: Assessment Constants and Types
**Dependencies:** None — imported by all other TGs; create first.

- [x] 5.0 Create the `features/assessment/` directory with all subdirectories: `constants/`, `types/`, `data/`, `services/`, `actions/`, `components/`
- [x] 5.1 Create `features/assessment/constants/tokens.ts`
  - Export `DEFAULT_ASSESSMENT_TOKENS = 3` (number)
  - Export `PASS_THRESHOLD = 60` (number — percentage)
  - Export `QUESTIONS_PER_ASSESSMENT = 5` (number)
  - Export `MAX_ATTEMPTS_BEFORE_COOLDOWN = 3` (number)
  - Export `COOLDOWN_HOURS = 24` (number)
- [x] 5.2 Create `features/assessment/constants/messages.ts`
  - Export `ASSESSMENT_MESSAGES` object with all string values:
    - `START_SUCCESS: 'Assessment initialized'`
    - `ALREADY_VALIDATED: 'This skill is already AI assessment validated'`
    - `NO_TOKENS: 'No assessment tokens remaining today. Come back tomorrow.'`
    - `COOLDOWN_ACTIVE: 'Maximum attempts reached. Try again in 24 hours.'`
    - `PASS: 'Assessment passed! Skill validated.'`
    - `FAIL: 'Assessment failed. Review the skill and try again.'`
    - `GENERATION_ERROR: 'Failed to generate assessment questions. Please try again.'`
- [x] 5.3 Create `features/assessment/constants/supportedSkills.ts`
  - Export `ASSESSMENT_SUPPORTED_SKILL_SLUGS: string[]` as `['react', 'javascript', 'typescript', 'python', 'nodejs']`
  - This is the single source of truth — all feature code checks eligibility against this array
- [x] 5.4 Create `features/assessment/types/assessment.ts`
  - Import and re-export Prisma types: `SkillAssessment`, `AssessmentQuestion`, `AssessmentAttempt`, `AssessmentStatus` from `@/app/generated/prisma/client`
  - Define `QuestionForClient`: picks `id`, `questionIndex`, `questionText`, `options` from `AssessmentQuestion` — deliberately excludes `correctIndex` and `explanation`
  - Define `ScoreResult`: `{ score: number; passed: boolean; correctCount: number; xpAwarded: number; attemptsUsed: number; cooldownEndsAt?: Date }`
  - Define `AssessmentState`: `'idle' | 'loading' | 'in_progress' | 'submitting' | 'result'`
  - Define `AssessmentTokenInfo`: `{ remaining: number; lastResetDate: string }`
  - Define `AssessmentWidgetProps`: `{ userSkills: UserSkillWithDetails[]; assessmentTokens: AssessmentTokenInfo }`
  - Define `AssessmentModalProps`: `{ open: boolean; onOpenChange: (open: boolean) => void; skillSlug: string; skillName: string; skillLevel: number; onPassComplete?: () => void }`
  - Use `Prisma.SkillAssessmentGetPayload` for any extended relation types; do NOT create manual interfaces for what Prisma already provides
- [x] 5.5 Create `features/assessment/index.ts` barrel file
  - Export all constants, types, service functions, and actions that external features need

**Acceptance criteria:**
- All constant files exist with correct values and TypeScript compiles without errors
- `QuestionForClient` type does NOT include `correctIndex` or `explanation`
- `ASSESSMENT_SUPPORTED_SKILL_SLUGS` contains exactly 5 entries: `react`, `javascript`, `typescript`, `python`, `nodejs`

---

### Schema (depends on TG5 constants being finalized)

#### Task Group 1: Prisma Schema Changes
**Dependencies:** TG5 types finalized (to know the shape before writing schema)

- [x] 1.0 Open `prisma/schema.prisma` and make all changes in a single edit
- [x] 1.1 Add `AssessmentStatus` enum
  ```prisma
  enum AssessmentStatus {
    PENDING
    PASSED
    FAILED
  }
  ```
- [x] 1.2 Add `aiAssessmentValidated Boolean @default(false)` field to `UserSkill` model, placed after the existing `githubValidated` field on the line immediately following it
- [x] 1.3 Create `SkillAssessment` model
  - Fields: `id String @id @default(cuid()) @map("_id")`, `userId String`, `userSkillId String`, `skillSlug String`, `skillLevel Int`, `status AssessmentStatus @default(PENDING)`, `score Int?`, `attemptNumber Int`, `startedAt DateTime @default(now())`, `completedAt DateTime?`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
  - Relations: `user User @relation(...)`, `userSkill UserSkill @relation(...)`, `questions AssessmentQuestion[]`, `attempts AssessmentAttempt[]`
  - Indexes: `@@index([userId])`, `@@index([userSkillId])`, `@@index([userId, skillSlug])`
  - `@@map("skill_assessments")`
- [x] 1.4 Create `AssessmentQuestion` model
  - Fields: `id String @id @default(cuid()) @map("_id")`, `assessmentId String`, `questionIndex Int`, `questionText String`, `options String[]`, `correctIndex Int`, `explanation String`, `createdAt DateTime @default(now())`
  - Relation: `assessment SkillAssessment @relation(...)`
  - Index: `@@index([assessmentId])`
  - `@@map("assessment_questions")`
- [x] 1.5 Create `AssessmentAttempt` model
  - Fields: `id String @id @default(cuid()) @map("_id")`, `assessmentId String`, `questionIndex Int`, `selectedIndex Int`, `isCorrect Boolean`, `answeredAt DateTime @default(now())`
  - Relation: `assessment SkillAssessment @relation(...)`
  - Index: `@@index([assessmentId])`
  - `@@map("assessment_attempts")`
- [x] 1.6 Add back-relations to existing models
  - On `User`: add `skillAssessments SkillAssessment[]`
  - On `UserSkill`: add `assessments SkillAssessment[]`
- [x] 1.7 Run `bunx prisma generate` to regenerate the Prisma client
  - Do NOT run `prisma migrate dev` — await user approval before any migration

**Acceptance criteria:**
- `prisma generate` completes without errors
- `UserSkill` has `aiAssessmentValidated: Boolean @default(false)`
- `AssessmentStatus` enum exists with `PENDING | PASSED | FAILED`
- All three new models exist with correct field types, relations, indexes, and `@@map` directives
- `User` and `UserSkill` have back-relation arrays pointing to `SkillAssessment`

---

### Token System (depends on TG1 schema)

#### Task Group 2: Assessment Token System
**Dependencies:** TG1 schema + TG5 constants

- [x] 2.1 Create `features/assessment/data/getAssessmentTokens.data.ts`
  - Function: `getAssessmentTokensData(userId: string): Promise<AssessmentTokenInfo>`
  - Query: `prisma.user.findUnique({ where: { id: userId }, select: { meta: true } })`
  - Parse `user.meta` as `{ assessmentTokens?: AssessmentTokenInfo }` — if field is absent, return `{ remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: todayISO }`
  - Import `AssessmentTokenInfo` from `features/assessment/types/assessment.ts`
  - Import `DEFAULT_ASSESSMENT_TOKENS` from `features/assessment/constants/tokens.ts`
- [x] 2.2 Create `features/assessment/services/assessmentToken.service.ts`
  - Function: `consumeAssessmentToken(userId: string): Promise<{ hasTokens: boolean; remaining: number; error?: string }>`
  - Mirror the exact two-step atomic `$runCommandRaw` `findAndModify` pattern from `features/ai-quota/services/quota.service.ts`:
    - Step 1: Reset `meta.assessmentTokens.remaining` to `DEFAULT_ASSESSMENT_TOKENS` and `meta.assessmentTokens.lastResetDate` to today if `lastResetDate !== today`
    - Step 2: Decrement `meta.assessmentTokens.remaining` by 1 only if it is `> 0`; if no document returned, return `{ hasTokens: false, remaining: 0, error: ASSESSMENT_MESSAGES.NO_TOKENS }`
  - Function: `hasAssessmentTokens(userId: string): Promise<boolean>` — reads meta without consuming; returns `true` if `remaining > 0` or `meta.isPro === true`
  - Pro bypass: at start of `consumeAssessmentToken`, check `user.meta.isPro` — if truthy, skip both `findAndModify` calls and return `{ hasTokens: true, remaining: Infinity }`
- [x] 2.3 Write 2 focused tests in `features/assessment/__tests__/tokens.test.ts`
  - Test that `DEFAULT_ASSESSMENT_TOKENS` equals `3`
  - Test that `ASSESSMENT_SUPPORTED_SKILL_SLUGS` has exactly 5 entries and includes `'typescript'`

**Acceptance criteria:**
- `consumeAssessmentToken` uses atomic `$runCommandRaw` (no plain `prisma.user.update` for the decrement)
- Pro users (`meta.isPro === true`) bypass token consumption
- `hasAssessmentTokens` reads without consuming
- Tests pass

---

### AI Engine (depends on TG1 schema)

#### Task Group 3: Claude AI Assessment Engine
**Dependencies:** TG1 schema + TG5 constants and types

- [x] 3.1 Create `features/assessment/services/generateQuestions.service.ts`
  - Import `createAnthropic` from `@ai-sdk/anthropic` and `generateText` from `ai`
  - Initialize: `const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`
  - Function: `generateQuestionsService(skillName: string, levelName: string): Promise<GeneratedQuestion[]>`
  - `GeneratedQuestion` interface (local to this file): `{ questionText: string; options: string[]; correctIndex: number; explanation: string }`
  - Prompt (system): `"You are a strict technical interviewer generating assessment questions for software developer skill validation. Return ONLY valid JSON with no markdown fencing."`
  - Prompt (user): `"Generate exactly 5 multiple-choice questions to assess a developer's knowledge of ${skillName} at the ${levelName} level. Return a JSON array of 5 objects, each with: questionText (string), options (array of exactly 4 strings), correctIndex (integer 0-3, index of the correct option), explanation (string, 1-2 sentences explaining why the answer is correct). Calibrate difficulty: Level 1 (Novice) = basic syntax/concepts, Level 2 (Apprentice) = common patterns, Level 3 (Journeyman) = architectural decisions, Level 4 (Expert) = performance/edge cases, Level 5 (Master) = internals/advanced optimization."`
  - Model: `anthropic('claude-sonnet-4-6')`
  - Parse response with `JSON.parse(result.text)` inside a try/catch; on parse failure throw `new Error(ASSESSMENT_MESSAGES.GENERATION_ERROR)` so the action wrapper catches it cleanly
  - Validate: parsed array must have exactly 5 items, each with `options.length === 4`; throw on validation failure
- [x] 3.2 Create `features/assessment/data/createAssessment.data.ts`
  - Function: `createAssessmentData(input: CreateAssessmentInput): Promise<SkillAssessment>`
  - Uses `prisma.skillAssessment.create` with nested `prisma.assessmentQuestion.createMany` inside a `prisma.$transaction`
  - `CreateAssessmentInput`: `{ userId, userSkillId, skillSlug, skillLevel, attemptNumber, questions: GeneratedQuestion[] }`
- [x] 3.3 Create `features/assessment/data/getAssessmentById.data.ts`
  - Function: `getAssessmentByIdData(assessmentId: string, userId: string): Promise<SkillAssessmentWithQuestions | null>`
  - Includes `questions` relation ordered by `questionIndex asc`
  - Validates `userId` matches to prevent unauthorized access
- [x] 3.4 Create `features/assessment/services/scoreAssessment.service.ts`
  - Function: `scoreAssessmentService(assessmentId: string, userId: string, answers: AnswerInput[]): Promise<ScoreResult>`
  - `AnswerInput`: `{ questionIndex: number; selectedIndex: number }`
  - Fetch assessment + questions via `getAssessmentByIdData`; throw if not found or not owned by userId
  - Compute `correctCount = answers.filter(a => questions[a.questionIndex].correctIndex === a.selectedIndex).length`
  - `score = Math.round((correctCount / QUESTIONS_PER_ASSESSMENT) * 100)`
  - `passed = score >= PASS_THRESHOLD`
  - Create `AssessmentAttempt` records for all 5 answers via `prisma.assessmentAttempt.createMany`
  - Update `SkillAssessment.status = passed ? 'PASSED' : 'FAILED'`, `score`, `completedAt = new Date()` via `prisma.skillAssessment.update`
  - If `passed`: call `applyAssessmentRewards.service`
  - Return `ScoreResult` with `xpAwarded: passed ? 200 : 0`
- [x] 3.5 Create `features/assessment/services/applyAssessmentRewards.service.ts`
  - Function: `applyAssessmentRewardsService(userId: string, userSkillId: string, score: number): Promise<void>`
  - Sets `UserSkill.aiAssessmentValidated = true` via `prisma.userSkill.update`
  - Creates a `SkillSource` record: `sourceType: 'MANUAL'`, `xpAmount: 200`, `metadata: { source: 'ai_assessment', score }`
  - Updates `UserSkill.totalXP` by adding 200 and recalculates `UserSkill.level` using `calculateLevelFromXP` imported from `features/skills/constants/xp.ts`

**Acceptance criteria:**
- `generateQuestionsService` uses `@ai-sdk/anthropic` with model `claude-sonnet-4-6`
- Client-facing endpoints never expose `correctIndex` or `explanation` from questions
- `scoreAssessmentService` computes score as percentage, marks assessment status correctly
- `applyAssessmentRewardsService` sets `aiAssessmentValidated: true` and adds exactly 200 XP as a new `SkillSource` record
- All throw with typed error messages from `ASSESSMENT_MESSAGES` constants

---

### Action Layer (depends on TG1, TG2, TG3, TG5)

#### Task Group 4: Server Action API
**Dependencies:** TG1, TG2, TG3, TG5

- [x] 4.1 Create `features/assessment/actions/startAssessment.action.ts`
  - `'use server'`, wraps with `actionWrapper<StartAssessmentResult>`
  - `StartAssessmentResult`: `{ assessmentId: string; questions: QuestionForClient[]; attemptsUsed: number; tokensRemaining: number }`
  - Auth check: `auth.api.getSession({ headers: await headers() })`; throw if no session
  - Yup validation schema (inline): `{ skillSlug: yup.string().required().oneOf(ASSESSMENT_SUPPORTED_SKILL_SLUGS) }`
  - Guard: if `userSkill.aiAssessmentValidated === true`, throw `ASSESSMENT_MESSAGES.ALREADY_VALIDATED`
  - Cooldown guard: query `prisma.skillAssessment.count({ where: { userId, skillSlug, status: { in: ['FAILED'] }, startedAt: { gte: 24h ago } } })` — if count >= `MAX_ATTEMPTS_BEFORE_COOLDOWN`, calculate `cooldownEndsAt` and throw `CooldownError` with the timestamp
  - Token check: call `consumeAssessmentToken(userId)` — if `!hasTokens`, throw `ASSESSMENT_MESSAGES.NO_TOKENS`
  - Determine `attemptNumber`: count prior `SkillAssessment` records for this user+skill in last 24h + 1
  - Fetch `userSkill` to get `level`; resolve `levelName` from `SKILL_LEVEL_NAMES` (import from `features/skills/constants/xp.ts`)
  - Call `generateQuestionsService(skillName, levelName)` → call `createAssessmentData` → map questions to `QuestionForClient` (strip `correctIndex` and `explanation`) → return
  - No `revalidatePath` on start (nothing visible changes until completion)
- [x] 4.2 Create `features/assessment/actions/submitAnswers.action.ts`
  - `'use server'`, wraps with `actionWrapper<ScoreResult>`
  - Auth check same pattern as above
  - Yup validation: `{ assessmentId: yup.string().required(), answers: yup.array().of(yup.object({ questionIndex: yup.number().min(0).max(4).required(), selectedIndex: yup.number().min(0).max(3).required() })).length(5).required() }`
  - Ownership check: fetch `SkillAssessment` by `id + userId`; throw `'Assessment not found'` if null
  - Status guard: if `assessment.status !== 'PENDING'`, throw `'Assessment already completed'`
  - Call `scoreAssessmentService(assessmentId, userId, answers)`
  - On success: `revalidatePath('/dashboard/skills')` and `revalidateTag(\`user-stats-${userId}\`)`
  - Return `ScoreResult` from service
- [x] 4.3 Create `features/assessment/data/getAttemptCount.data.ts`
  - Function: `getAttemptCountData(userId: string, skillSlug: string, since: Date): Promise<number>`
  - Simple `prisma.skillAssessment.count({ where: { userId, skillSlug, startedAt: { gte: since }, status: { not: 'PENDING' } } })`
  - Used by `startAssessment.action` for cooldown enforcement and attempt numbering

**Acceptance criteria:**
- `startAssessment` strips `correctIndex` and `explanation` before returning questions to client
- `startAssessment` enforces cooldown, already-validated guard, and token consumption in that order
- `submitAnswers` validates all 5 answers present (Yup `.length(5)`)
- `submitAnswers` calls `revalidatePath('/dashboard/skills')` and `revalidateTag` on success
- Both actions use `actionWrapper` and `auth.api.getSession` — no exceptions

---

### SkillHexagonNode Badge (depends on TG1 schema)

#### Task Group 8: SkillHexagonNode Assessment Badge
**Dependencies:** TG1 (schema generates `aiAssessmentValidated` field on `UserSkill`)

- [x] 8.1 Open `features/skills/components/SkillHexagonNode.tsx` and read the file before editing
- [x] 8.2 Add `isAssessmentValidated` boolean derived from `userSkill?.aiAssessmentValidated === true`, placed immediately after the existing `isBothValidated` line
- [x] 8.3 Extend the `svgFilter` / drop-shadow string block
  - After the existing `isBothValidated` gold, `isGithubOnly` green, `isAIOnly` magenta conditions, add a new condition: if `isAssessmentValidated && !isBothValidated`, append `drop-shadow(0 0 8px #00D4FF)` to the filter string
  - This is additive — assessment cyan glow only shows when not already overridden by gold dual-validation
- [x] 8.4 Add the `◆` SVG text mark
  - Inside the existing SVG marks block (alongside `★` AI star and `⬡` GitHub hex), add: when `isAssessmentValidated`, render `<text x="60" y="10" fontSize="7" fill="#00D4FF" textAnchor="middle">◆</text>`
  - Position `x="60"` `y="10"` places it at the bottom-right corner of the hexagon SVG viewBox, distinct from existing marks
- [x] 8.5 Update `ariaLabel` to include `"AI Assessment Verified"` appended to the existing label when `isAssessmentValidated` is true

**Acceptance criteria:**
- `isAssessmentValidated` reads `userSkill?.aiAssessmentValidated` (the Prisma field from TG1)
- Diamond mark `◆` renders only when `aiAssessmentValidated: true`
- Cyan drop-shadow does NOT override the existing gold dual-validation drop-shadow
- No existing validation visual logic is modified — only the new layer is added
- TypeScript compiles without errors after the edit

---

### Portfolio Badge (depends on TG1 schema)

#### Task Group 9: Public Portfolio Assessment Badge
**Dependencies:** TG1 schema (adds `aiAssessmentValidated` field)

- [x] 9.1 Open `features/portfolio/components/tech/TechSkills.tsx` and read before editing
- [x] 9.2 Add detection boolean after the existing `hasDualValidated` line:
  - `const hasAssessmentValidated = userSkills.some((s) => s.aiAssessmentValidated)`
- [x] 9.3 Add new `TechBadge` to the legend row:
  - Render `<TechBadge color="cyan">◆ Assessment Verified</TechBadge>` when `hasAssessmentValidated` is true
  - Insert after the `hasDualValidated` badge and before the `hasSelfAssessed` badge in render order
- [x] 9.4 Ensure the portfolio data query includes `aiAssessmentValidated`
  - Find the Prisma select in the portfolio data layer that fetches `userSkills` for the public portfolio
  - Add `aiAssessmentValidated: true` to the select object so the field is available to `TechSkills`
  - File is likely in `features/portfolio/data/` — read it before editing

**Acceptance criteria:**
- `hasAssessmentValidated` detects `aiAssessmentValidated: true` on any skill
- `TechBadge` with `◆ Assessment Verified` renders on the public portfolio when any skill is assessment-validated
- Portfolio data query includes `aiAssessmentValidated` in the Prisma select
- No existing badge logic modified

---

### Dashboard Widget (depends on TG4 actions, TG5 types)

#### Task Group 6: AssessmentWidget Dashboard Component
**Dependencies:** TG4 (actions), TG5 (types), TG1 (schema for `aiAssessmentValidated` field)

- [x] 6.1 Create `features/assessment/components/AssessmentWidget.tsx` as `'use client'`
- [x] 6.2 Props: `AssessmentWidgetProps` from `features/assessment/types/assessment.ts`
  - Receives `userSkills: UserSkillWithDetails[]` (pre-filtered to supported slugs by the page)
  - Receives `assessmentTokens: AssessmentTokenInfo`
  - Receives `onAssessmentPass?: () => void` (fires when an assessment is passed — wired to CRT xpGainTrigger)
- [x] 6.3 Token meter display at widget top
  - Render inside `HUDPanel` from `features/tech`
  - Display: `[ASSESSMENT_TOKENS]: {remaining}/{DEFAULT_ASSESSMENT_TOKENS}` in `font-mono text-xs`
  - Count in `text-[#00D4FF]` (cyan), label in `text-muted-foreground/50`
  - If `assessmentTokens.remaining === 0`, show `text-red-500` for the count and tooltip "Resets tomorrow"
- [x] 6.4 Skill rows — one row per eligible skill
  - Show skill name, level badge (text from `SKILL_LEVEL_NAMES`), validation icons (if `aiValidated` show `★`, if `githubValidated` show `⬡`, if `aiAssessmentValidated` show `◆`)
  - "Take Assessment" button per row
  - Button disabled + tooltip `"Already Validated"` when `aiAssessmentValidated === true`
  - Button disabled + tooltip with cooldown countdown when cooldown active (cooldown state tracked in local `useState` per skill via a `cooldownEndsAt` map updated when action returns a cooldown error)
  - Button disabled + tooltip `"No tokens remaining"` when `assessmentTokens.remaining === 0`
  - Button enabled otherwise
- [x] 6.5 On "Take Assessment" click
  - Set local state `activeSkill = { skillSlug, skillName, skillLevel }` and set `modalOpen = true`
  - Render `<AssessmentModal open={modalOpen} onOpenChange={setModalOpen} skillSlug={activeSkill.skillSlug} skillName={activeSkill.skillName} skillLevel={activeSkill.skillLevel} onPassComplete={onAssessmentPass} />`
- [x] 6.6 If `userSkills` filtered to supported slugs is empty, render empty state: `[SYS_MSG]: No supported skills found. Add React, TypeScript, JavaScript, Python, or Node.js to enable assessments.` in `font-mono text-xs text-muted-foreground/50`

**Acceptance criteria:**
- Widget renders only skills whose `skill.slug` is in `ASSESSMENT_SUPPORTED_SKILL_SLUGS`
- Token meter shows correct `remaining/DEFAULT_ASSESSMENT_TOKENS` count
- All three CTA disabled states function correctly
- `onAssessmentPass` callback fires when modal reports a pass
- `HUDPanel` from `features/tech` wraps the widget

---

### Assessment Modal (depends on TG4 actions, TG5 types)

#### Task Group 7: AssessmentModal Quiz Flow
**Dependencies:** TG4 (actions), TG5 (types), TG6 (AssessmentWidget imports it)

- [x] 7.1 Create `features/assessment/components/AssessmentModal.tsx` as `'use client'` using shadcn `Dialog`
- [x] 7.2 Internal state
  - `assessmentState: AssessmentState` — `'idle' | 'loading' | 'in_progress' | 'submitting' | 'result'`
  - `assessmentId: string | null`
  - `questions: QuestionForClient[]`
  - `currentQuestionIndex: number` (0-4)
  - `selectedAnswers: Record<number, number>` — maps `questionIndex` to `selectedIndex`
  - `scoreResult: ScoreResult | null`
  - `errorMessage: string | null`
- [x] 7.3 Loading screen (state = `'loading'`)
  - Triggered on `Dialog` `onOpenChange` when opening
  - Calls `startAssessment({ skillSlug })` inside `useTransition`
  - Show: `[INITIALIZING]: Generating assessment for {skillName}...` in `font-mono text-sm`
  - Animated loading indicator (use existing `Loader2` icon with `animate-spin` or CSS scanline animation)
  - On success: set `assessmentId`, `questions`, transition to `'in_progress'`
  - On error (cooldown, no tokens, already validated): show error in modal without transitioning; show `errorMessage` and a "Close" button
- [x] 7.4 In-progress screen (state = `'in_progress'`)
  - Progress bar: 5 segmented blocks at top — filled blocks `bg-[#00D4FF]`, empty blocks `bg-[#0A0E1A] border border-[#00D4FF]/20`
  - Question counter: `[Q {currentQuestionIndex + 1}/5]` in `font-mono text-xs text-muted-foreground`
  - Question text: `font-mono text-sm text-white` with `>` prefix
  - 4 answer options as clickable rows: `font-mono text-sm`, unselected `border border-[#00D4FF]/20 hover:bg-[#00D4FF]/10`, selected `border-l-4 border-[#00D4FF] bg-[#00D4FF]/10`
  - Option labels: `[A]`, `[B]`, `[C]`, `[D]` prefixes
  - "Next" button (disabled until an option selected): advances `currentQuestionIndex` when `currentQuestionIndex < 4`, transitions to `'submitting'` confirm state when on Q5
- [x] 7.5 Confirm screen (after Q5, before submit)
  - Show: `"Ready to submit? You answered {answeredCount}/5 questions."`
  - "Confirm & Submit" button: calls `submitAnswers({ assessmentId, answers })` inside `useTransition`, transitions state to `'submitting'` then on response to `'result'`
  - "Review Answers" button: transitions back to `'in_progress'` at Q1
- [x] 7.6 Result screen — Pass (state = `'result'`, `scoreResult.passed === true`)
  - Large `[PASS]` in `text-[#22C55E] font-mono text-2xl`
  - Score: `{score}/100` in green
  - `+200 XP AWARDED` with brief animation (use `motion.div` opacity 0→1 transition)
  - `[SKILL_VALIDATED]: aiAssessmentValidated: true` in monospace
  - "Close" button: calls `onPassComplete?.()` then closes modal and resets all state
- [x] 7.7 Result screen — Fail (state = `'result'`, `scoreResult.passed === false`)
  - `[FAIL]` in `text-red-500 font-mono text-2xl`
  - Score: `{score}/100` in red, `Correct: {correctCount}/5`
  - Attempts info: `Attempts used: {attemptsUsed} / {MAX_ATTEMPTS_BEFORE_COOLDOWN}`
  - If attempts remaining: `"Try Again"` button resets modal state to trigger a fresh `startAssessment`
  - If cooldown active (`scoreResult.cooldownEndsAt` is set): show `"Next attempt available: {formatted date}"`, only "Close" button
- [x] 7.8 Error handling throughout
  - Any action error sets `errorMessage` and shows it in `font-mono text-xs text-red-400` below the current screen content
  - Always show "Close" button when in error state
  - Modal close resets all internal state to `'idle'`

**Acceptance criteria:**
- Modal never exposes `correctIndex` to the DOM — answers are selected by position label only
- All 5 answers collected before submit action is called
- Pass screen fires `onPassComplete` callback
- Fail screen shows correct retry/cooldown logic from `ScoreResult`
- All text in modal uses `font-mono` consistent with Tech Mode aesthetic
- State resets fully on modal close

---

### Dashboard Integration (depends on all prior TGs)

#### Task Group 10: Dashboard Skills Page Integration
**Dependencies:** TG6 (AssessmentWidget), TG7 (AssessmentModal), TG8 (SkillHexagonNode), TG9 (portfolio badge), TG1 (schema)

- [x] 10.1 Open `app/[locale]/(dashboard)/dashboard/skills/page.tsx` and read before editing
  - Extend the existing user data query to include `meta: true` in the Prisma select (if not already selected) to expose assessment token data
  - Parse assessment tokens from `user.meta`: `const assessmentTokens = (user.meta as { assessmentTokens?: AssessmentTokenInfo })?.assessmentTokens ?? { remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: todayISO }`
  - Filter `supportedUserSkills` from the existing `userSkills` array: `userSkills.filter(s => ASSESSMENT_SUPPORTED_SKILL_SLUGS.includes(s.skill.slug))`
  - Add `aiAssessmentValidated: true` to the `userSkills` Prisma select if not already present
  - Pass `assessmentTokens` and `supportedUserSkills` as new props to `DashboardSkillsView`
- [x] 10.2 Open `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` and read before editing
  - Add `assessmentTokens: AssessmentTokenInfo` and `supportedUserSkills: UserSkillWithDetails[]` to the props interface
  - Add `xpGainTrigger` state management for the CRT eye (already exists for GitHub sync — read current implementation before adding)
  - Wire `onAssessmentPass` callback: `const handleAssessmentPass = () => setXpGainTrigger(prev => prev + 1)`
  - Render `<AssessmentWidget userSkills={supportedUserSkills} assessmentTokens={assessmentTokens} onAssessmentPass={handleAssessmentPass} />` below `<GitHubSyncPanel>` and above the skill tree `<section>`
- [x] 10.3 Verify end-to-end data flow
  - Confirm `aiAssessmentValidated` is selected in the user skills query
  - Confirm the `SkillHexagonNode` (via `SkillTreeView`) receives the `aiAssessmentValidated` field through the existing `userSkills` prop chain
  - Confirm the `AssessmentWidget` only lists skills that match `ASSESSMENT_SUPPORTED_SKILL_SLUGS`
  - TypeScript must compile without errors across all modified files

**Acceptance criteria:**
- `DashboardSkillsView` renders `AssessmentWidget` in the correct position (below GitHubSyncPanel, above skill tree)
- CRT AIEye plays `xp_gain` animation when an assessment is passed (via `xpGainTrigger` increment)
- `assessmentTokens` reflect the real remaining count from `User.meta` (not a hardcoded value)
- `aiAssessmentValidated` field is available in the `userSkills` data flowing to `SkillHexagonNode`
- Page Server Component passes `meta` and `aiAssessmentValidated` through to client components without type errors
