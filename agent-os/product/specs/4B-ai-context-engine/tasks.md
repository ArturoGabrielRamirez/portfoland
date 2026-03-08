# Spec 4B: AI Context Engine — Tasks

**Spec:** `agent-os/product/specs/4B-ai-context-engine/SPEC.md`
**Branch:** `feat/phase4-ai-portfolio-os`

---

## Task Group 1: Context Loader Service

Create the lightweight portfolio summary service that provides context to the AI system prompt.

- [x] **TG1: Create `features/ai/services/contextLoader.service.ts`**
  - Create directory `features/ai/services/`
  - Export `PortfolioSummary` interface with fields: `name`, `bio`, `portfolioMode`, `skillCount`, `projectCount`, `experienceCount`, `hasGitHub`, `githubSyncedAt`, `assessmentsPassed`, `profileCompleteness`
  - Export `getPortfolioSummary(userId: string): Promise<PortfolioSummary>` function
  - Use `prisma.user.findUnique` for name/bio/portfolioMode/githubSyncedAt (select only needed fields)
  - Use `prisma.$transaction` with 5 parallel COUNT queries: `userSkill.count`, `project.count`, `experience.count`, `account.count({ providerId: "github" })`, `assessment.count({ passed: true })`
  - Compute `profileCompleteness` (0-100) as weighted sum:
    - Has bio (15%), Has image (10%), Has username (10%), Skills >= 5 (15%), Projects >= 2 (15%), Experiences >= 1 (10%), GitHub connected (10%), Assessment passed >= 1 (15%)
  - Export `formatSummaryForPrompt(summary: PortfolioSummary): string` that returns the text block for system prompt injection
  - Follow existing service patterns (import prisma from `@/lib/prisma`)

**Acceptance:** Function returns accurate counts. `formatSummaryForPrompt` produces a concise text block (~50 tokens).

---

## Task Group 2: Page-Aware Prompts

Create the page-specific prompt augmentations.

- [x] **TG2: Create `features/ai/constants/pagePrompts.ts`**
  - Create directory `features/ai/constants/`
  - Export `PAGE_PROMPTS: Record<string, { en: string; es: string }>` with entries for: `dashboard`, `skills`, `timeline`, `projects`, `portfolio`, `gallery`, `services`, `testimonials`
  - Each entry has bilingual (en/es) prompt text describing what the AI should help with on that page (see SPEC.md Section 5 for exact content)
  - Export `getPagePrompt(pageContext: string | undefined, locale: string): string` helper that returns the appropriate prompt text or empty string if no pageContext

**Acceptance:** `getPagePrompt("skills", "en")` returns the skills page prompt. `getPagePrompt(undefined, "en")` returns empty string.

---

## Task Group 3: Read Tools

Create the read-only tool definitions that let the AI fetch portfolio data on demand.

- [x] **TG3: Create `features/ai/tools/readTools.ts`**
  - Create directory `features/ai/tools/`
  - Import `tool` from `ai` and `z` from `zod` (required by Vercel AI SDK's `tool()` function)
  - Import data functions: `getProjectsByUserIdData`, `getExperiencesByUserId`, `getGitHubConnectionStatus`, `getAssessmentHistoryData`
  - Import `prisma` from `@/lib/prisma` for profile queries
  - Import `logger` from `@/lib/logger`
  - Define tools as factory functions that accept `userId: string` and return tool definitions:
    - `get_projects`: calls `getProjectsByUserIdData(userId)`, returns array of `{ id, title, description, technologies, status, featured, links }`
    - `get_experiences`: calls `getExperiencesByUserId(userId)`, returns `{ experiences, stats }` from the TimelineData shape
    - `get_profile`: queries `prisma.user.findUnique` selecting `name, bio, image, username, email, portfolioMode, contactLinks, sectionVisibility, sectionOrder`, returns the user profile data
    - `get_github_data`: calls `getGitHubConnectionStatus(userId)`, returns `{ isConnected, syncedAt, stats }`
    - `get_assessment_history`: calls `getAssessmentHistoryData(userId)`, returns the assessment summary record
    - `get_portfolio_health`: computes health score from prisma counts (same weighted formula as contextLoader's profileCompleteness) PLUS returns an array of specific suggestions (e.g., "Add a bio to improve your portfolio", "Connect GitHub for skill validation")
  - Each tool has a `parameters` schema with a `reason: z.string()` field (same pattern as existing tools)
  - Each tool wraps its execute in try/catch with `logger.error` on failure
  - Export `baseReadTools(userId: string)` returning `{ get_profile, get_portfolio_health }` (always available)
  - Export `projectPageTools(userId: string)` returning `{ get_projects }`
  - Export `timelinePageTools(userId: string)` returning `{ get_experiences }`
  - Export `allReadTools(userId: string)` returning all 6 tools (for cases where all are needed)

**Acceptance:** Each tool returns meaningful data when called with a valid userId. Error cases return `{ error: string }`.

---

## Task Group 4: Write Tools

Create the write tool definitions that let the AI modify portfolio data.

- [x] **TG4: Create `features/ai/tools/writeTools.ts`**
  - Import `tool` from `ai`, `z` from `zod` (required by AI SDK), `logger` from `@/lib/logger`
  - Import `updateProfileService` from `@/features/portfolio/services/portfolio.service`
  - Import `prisma` from `@/lib/prisma` for project/experience updates
  - Define tools as factory functions accepting `userId: string`:
    - `update_bio`: parameters `{ newBio: z.string() }`, calls `updateProfileService(userId, { bio: newBio })`, returns `{ success: true, bio: newBio }`
    - `update_project_description`: parameters `{ projectId: z.string(), newDescription: z.string() }`, verifies project belongs to userId, updates via `prisma.project.update`, returns `{ success: true, projectId, description: newDescription }`
    - `update_experience_description`: parameters `{ experienceId: z.string(), newDescription: z.string() }`, verifies experience belongs to userId, updates via `prisma.experience.update`, returns `{ success: true, experienceId, description: newDescription }`
    - `suggest_skills`: parameters `{ skills: z.array(z.object({ name: z.string(), reason: z.string() })) }`, returns the suggestions array WITHOUT writing to DB (AI presents them, user accepts individually via `add_skill`)
  - **Ownership checks:** `update_project_description` and `update_experience_description` MUST verify `userId` matches before updating. Return `{ error: "Not found or unauthorized" }` on mismatch.
  - Each tool wraps execute in try/catch with logger.error
  - Export `baseWriteTools(userId: string)` returning `{ update_bio }`
  - Export `projectWriteTools(userId: string)` returning `{ update_project_description }`
  - Export `timelineWriteTools(userId: string)` returning `{ update_experience_description }`
  - Export `skillWriteTools(userId: string)` returning `{ suggest_skills }`

**Acceptance:** `update_bio` successfully updates the user's bio. `update_project_description` rejects if project doesn't belong to user. `suggest_skills` returns suggestions without DB side effects.

---

## Task Group 5: Tool Registry Builder

Create the barrel export and registry builder that assembles tools based on page context.

- [x] **TG5: Create `features/ai/tools/index.ts`**
  - Import all tool exports from `readTools.ts` and `writeTools.ts`
  - Import existing tool definitions inline (extract from current `app/api/chat/route.ts` — the 4 existing tools: `add_experience`, `add_skill`, `get_portfolio_data`, `get_skill_tree`)
  - Export `existingTools(userId: string)` that returns the 4 original tools (moved from route.ts, same logic)
  - Export `buildToolRegistry(userId: string, pageContext?: string)` that:
    - Always includes: `baseReadTools(userId)` + `baseWriteTools(userId)` + `existingTools(userId)`
    - If `pageContext === "skills"`: adds `skillWriteTools(userId)`
    - If `pageContext === "timeline"`: adds `timelinePageTools(userId)` + `timelineWriteTools(userId)`
    - If `pageContext === "projects"`: adds `projectPageTools(userId)` + `projectWriteTools(userId)`
    - If `pageContext === "dashboard"`: adds `allReadTools(userId)` (dashboard gets everything for overview questions)
    - For other pages: adds `get_github_data` and `get_assessment_history` as general tools
  - Keep tool imports from their original service files (don't duplicate the service logic)

**Acceptance:** `buildToolRegistry(userId, "skills")` returns base tools + skill tools. `buildToolRegistry(userId, "dashboard")` returns all tools.

---

## Task Group 6: Update Chat Route

Refactor the API route to use context loader, page prompts, and tool registry.

- [x] **TG6: Refactor `app/api/chat/route.ts`**
  - Import `getPortfolioSummary`, `formatSummaryForPrompt` from `@/features/ai/services/contextLoader.service`
  - Import `getPagePrompt` from `@/features/ai/constants/pagePrompts`
  - Import `buildToolRegistry` from `@/features/ai/tools`
  - Remove the 4 inline tool definitions (moved to `features/ai/tools/index.ts`)
  - Remove the inline imports that were only used by those tools (`createExperienceService`, `createSkillService`, `updateProfileService`, `getUserSkillsData`, `getSelfAssessmentLevel`, `hasGitHubValidation`)
  - Update `getSystemPrompt` function:
    - Accept `summary: PortfolioSummary` as third parameter
    - Append `formatSummaryForPrompt(summary)` to the base prompt
    - Replace the generic pageContext line with `getPagePrompt(pageContext, locale)` for richer page-specific instructions
  - In the POST handler, after auth + lives check:
    - Call `const summary = await getPortfolioSummary(userId)`
    - Call `const tools = buildToolRegistry(userId, pageContext)`
    - Pass `system: getSystemPrompt(locale, pageContext, summary)` and `tools` to `streamText`
  - Keep: auth check, lives check, conversation persistence, onFinish message saving, error handling — all unchanged
  - Keep: `runtime = 'nodejs'`, Google AI provider setup, `maxSteps: 5`

**Acceptance:** Route compiles. Sends portfolio summary in system prompt. Uses page-aware tools. Existing tool functionality (add_skill, add_experience) still works.

---

## Task Group 7: Connect CRT to Real Chat

Replace the simulated handleSend in CRTWithAI with real API integration using `fetch` + `processDataStream`.

- [x] **TG7: Integrate real chat into `features/tech/components/crt-with-ai.tsx`**
  - Add import: `import { processDataStream } from "@ai-sdk/ui-utils"` (compatible with `toDataStreamResponse()` from ai@4.1.2)
  - Add `locale` prop to `CRTWithAIProps` (string, needed for API body)
  - **Note:** Used `fetch` + `processDataStream` instead of `useChat` from `ai/react` due to version mismatch between `ai@4.1.2` (route uses `toDataStreamResponse()`) and `@ai-sdk/react@3.0.0` (expects `toUIMessageStreamResponse()`). The implementation achieves identical functionality.
  - **Removed** the simulated `handleSend` function with fake `"He procesado tu comando"` response
  - **Replaced** with real `handleSend` that:
    - Sends messages to `/api/chat` via `fetch`
    - Streams response using `processDataStream` with `onTextPart` callback
    - Progressively updates the last AI message as tokens arrive
    - Manages `aiState` transitions: listening -> thinking -> success -> awake
    - Handles AbortController for cancelling in-flight requests
  - **Manages chat state** with:
    - `chatMessages` (ChatMessage[]) for display (user/ai/system roles)
    - `apiMessagesRef` (APIChatMessage[]) for API context (user/assistant roles)
    - `isStreaming` flag to prevent double-sends
  - **Handles errors**:
    - 429 responses show "ENERGY DEPLETED. Recharge tomorrow."
    - Other errors show "ERROR: AI system unavailable. Try again later."
    - Sets `aiState` to `life_loss` on error
  - **localStorage persistence**: Saves `chatMessages` + `apiMessages` to key `"crt-chat-history"` on change. Restores on mount.
  - **Updated parent components** to pass `locale` prop:
    - `features/tech/types/dashboard.ts` — added `locale?: string` to `DashboardRow1Props`
    - `features/tech/components/dashboard-row1.tsx` — passes `locale` to `CRTWithAI`
    - `features/tech/components/dashboard-page-layout.tsx` — added `locale?: string` to props, passes to `DashboardRow1`
    - All 8 dashboard page files — added `locale={locale}` to `<DashboardPageLayout>`
  - **Preserved untouched**: Boot sequence, AIEye animations, sleep/wake cycle, inactivity timer, blink logic, searching/xpGain/lifeLoss triggers, border colors, CRT visual styling

**Acceptance:**
- Typing a message and hitting Enter sends it to `/api/chat` and streams the response
- AIEye shows thinking animation during streaming, success on finish
- Boot sequence still plays on first load
- Sleep/wake mechanics still work
- Rate limit (429) shows error in CRT
- Chat history persists across page navigations via localStorage

---

## Task Group 8: Integration Testing & Polish

Manual verification of the full flow.

- [x] **TG8-A: Verify TypeScript compilation**
  - Run `npx tsc --noEmit` and confirm zero NEW errors from 4B changes
  - Fix any type errors in new files
  - **Result:** All 36 errors are pre-existing (test files, revalidateTag). Zero new errors from 4B.

- [ ] **TG8-B: Verify dev server runs** *(manual — requires running dev server)*
  - Run `npm run dev` and confirm no runtime errors on dashboard pages
  - Verify CRT loads and boot sequence plays
  - Verify typing a message triggers real API call (check Network tab)

- [ ] **TG8-C: Verify tool calls work** *(manual — requires running dev server)*
  - Test: ask "what skills do I have?" → AI calls `get_skill_tree` → returns real data
  - Test: ask "how complete is my portfolio?" → AI calls `get_portfolio_health` → returns score + suggestions
  - Test: navigate to projects page, ask "what projects do I have?" → AI calls `get_projects`

- [ ] **TG8-D: Verify page context works** *(manual — requires running dev server)*
  - On skills page: AI mentions skill-related suggestions
  - On timeline page: AI mentions experience-related suggestions
  - On dashboard: AI can access all tools

---

## Implementation Order

1. **TG1** (Context Loader) — no dependencies
2. **TG2** (Page Prompts) — no dependencies
3. **TG3** (Read Tools) — no dependencies
4. **TG4** (Write Tools) — no dependencies
5. **TG5** (Tool Registry) — depends on TG3, TG4
6. **TG6** (Chat Route) — depends on TG1, TG2, TG5
7. **TG7** (CRT Integration) — depends on TG6 (needs working API)
8. **TG8** (Testing) — depends on all above

TG1-TG4 can be implemented in parallel.
