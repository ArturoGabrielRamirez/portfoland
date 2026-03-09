# Spec 4D: Skill Enhancement System — Tasks

**Spec:** `agent-os/product/specs/4D-skill-enhancement/SPEC.md`
**Branch:** `feat/phase4-ai-portfolio-os`

---

## Task Group 1: Types + Schema

Foundation types and validation schema.

- [x] **TG1-A: Create enhancement types**
  - Create `features/skill-enhancement/types/enhancement.ts`
  - Export interfaces:
    - `RelatedSkill`: `{ name, category, reason, priority: 'high'|'medium'|'low', alreadyAdded: boolean }`
    - `LearningResource`: `{ title, type: 'video'|'article'|'course'|'documentation'|'practice', url, duration, cost: 'free'|'paid', why }`
    - `SkillEnhancement`: `{ skillName, currentLevel, nextLevelFocus, relatedSkills: RelatedSkill[], resources: LearningResource[], validationStatus: { githubConnected, assessmentAvailable, assessmentPassed } }`

- [x] **TG1-B: Create enhancement schema**
  - Create `features/skill-enhancement/schemas/enhancement.schema.ts`
  - Export `suggestEnhancementsSchema` (Yup): `{ skillName: string (required), skillLevel: number (1-5), category: string (required), locale: string (default 'en') }`

**Acceptance:** Types compile. Schema validates correct inputs and rejects invalid ones.

---

## Task Group 2: Enhancement Service

The AI service that generates suggestions.

- [x] **TG2: Create `features/skill-enhancement/services/suggestEnhancements.service.ts`**
  - Imports: `generateObject` from `ai`, `createGoogleGenerativeAI` from `@ai-sdk/google`, `z` from `zod`
  - Imports: `consumeLifeService` from `@/features/ai-quota`, `logger` from `@/lib/logger`
  - Imports: `getUserSkillsData` from `@/features/skills/data/getUserSkills.data`
  - Imports: `getGitHubConnectionStatus` from `@/features/github/data/getGitHubConnectionStatus.data`
  - Imports: `prisma` from `@/lib/prisma`
  - Export `suggestEnhancementsService(userId, skillName, skillLevel, category, locale?)`:
    1. Check and consume a life via `consumeLifeService`
    2. Fetch in parallel: `getUserSkillsData(userId)` (to know existing skills), `getGitHubConnectionStatus(userId)`
    3. Check if skill is assessment-eligible: query `prisma.skillAssessment.findFirst({ where: { userId, skill: { name: skillName } } })` — if it exists, check its status
    4. Build prompt string: include skillName, skillLevel (1-5), category, user's existing skill names (comma-separated), locale
    5. Call `generateObject` with `model: google('gemini-2.0-flash')`, Zod schema:
       ```
       z.object({
         nextLevelFocus: z.string(),
         relatedSkills: z.array(z.object({
           name: z.string(),
           category: z.string(),
           reason: z.string(),
           priority: z.enum(['high', 'medium', 'low']),
         })).max(5),
         resources: z.array(z.object({
           title: z.string(),
           type: z.enum(['video', 'article', 'course', 'documentation', 'practice']),
           url: z.string(),
           duration: z.string(),
           cost: z.enum(['free', 'paid']),
           why: z.string(),
         })).max(5),
       })
       ```
    6. Post-process: for each relatedSkill, set `alreadyAdded = userSkillNames.includes(relatedSkill.name)`
    7. Attach `validationStatus: { githubConnected, assessmentAvailable, assessmentPassed }`
    8. Return `SkillEnhancement`
  - **Prompt details (bilingual):**
    - If locale === 'es': prompt in Spanish, prefer Spanish resource titles but include English ones if no good Spanish alternative
    - Level 1-2: beginner-friendly resources
    - Level 3: intermediate resources
    - Level 4-5: advanced/expert resources
    - Do NOT suggest skills the user already has (they are in the existing skill names list)
    - Generate realistic URLs (official docs, YouTube channels like Fireship, Kevin Powell, official courses, MDN, etc.)

**Acceptance:** Given a skill name, level, and category, returns a complete `SkillEnhancement` with related skills and resources. Consumes 1 life.

---

## Task Group 3: Server Action

- [x] **TG3: Create `features/skill-enhancement/actions/suggestEnhancements.action.ts`**
  - `'use server'`
  - Use `actionWrapper` from `@/features/core`
  - Use `suggestEnhancementsSchema` for validation
  - Get authenticated user via `auth.api.getSession({ headers: await headers() })`
  - Call `suggestEnhancementsService(userId, skillName, skillLevel, category, locale)`
  - Return `{ success: true, data: SkillEnhancement }`

**Acceptance:** Action compiles. Returns proper `SkillEnhancement` or error on validation failure.

---

## Task Group 4: Sub-components

Build the display components for the enhancement panel.

- [x] **TG4-A: Create `features/skill-enhancement/components/RelatedSkillCard.tsx`**
  - `'use client'`
  - Props: `{ skill: RelatedSkill, onAdd: (name: string) => void, isAdding: boolean }`
  - Display: skill name, category label, reason text, priority badge (high=green/cyan, medium=yellow, low=gray)
  - If `skill.alreadyAdded`: show ✓ checkmark in cyan, no add button
  - If not added: show `+ Add` button (calls `onAdd`, disabled + spinner when `isAdding`)
  - Use Tech Mode colors: bg `#0A0E1A`, borders `#1E293B`, cyan `#00D4FF`

- [x] **TG4-B: Create `features/skill-enhancement/components/LearningResourceCard.tsx`**
  - `'use client'`
  - Props: `{ resource: LearningResource }`
  - Type icons: video=▶, article=📄, course=🎓, documentation=📖, practice=💻
  - Display: icon + title, duration, cost badge (Free=green, Paid=yellow)
  - One-line `why` text in muted gray
  - Entire card is a link (`<a href={resource.url} target="_blank" rel="noopener noreferrer">`)
  - Small "⚠ Verify link" text on hover (tooltip or title attribute)
  - Use Tech Mode styling consistent with `TechCard`

- [x] **TG4-C: Create `features/skill-enhancement/components/SkillEnhancementPanel.tsx`**
  - `'use client'`
  - Props: `{ enhancement: SkillEnhancement, onAddSkill: (skillName: string) => void, addingSkill: string | null, locale: string }`
  - Sections:
    1. **Next Level Focus** (if `currentLevel < 5`): heading + paragraph with `nextLevelFocus` text
    2. **Validation CTAs**: if not `githubConnected`, show "Connect GitHub" button linking to `/dashboard/profile` (or skill connect page); if `assessmentAvailable` and not `assessmentPassed`, show "Take Assessment" button (links to skills page assessment trigger)
    3. **Related Skills**: grid of `RelatedSkillCard` components
    4. **Learning Resources**: list of `LearningResourceCard` components
  - All section headings with Sparkles/BookOpen/etc lucide icons
  - Consistent with Tech Mode dark palette

**Acceptance:** All three components render correctly with mock data. No TypeScript errors.

---

## Task Group 5: SkillDetailCard Refactor + Enhancement Integration

Refactor the existing SkillDetailCard from flip-card to tab system, then add the Enhancement tab.

- [x] **TG5: Refactor `features/skills/components/SkillDetailCard.tsx`**
  - Replace `isFlipped` state with `activeTab: 'stats' | 'xp' | 'enhance'` state
  - Remove the 3D flip animation (`rotateY`, `preserve-3d`, `backface-hidden`, `perspective`) — this removes complex CSS that was adding maintenance burden
  - Keep the same slide-in animation (`motion.div` from right, spring transition)
  - Keep the same card container structure (`AnimatePresence`, fixed overlay, click-outside close, Escape close)
  - Add tab bar below the skill header (after the XP bar section):
    - Tab "Stats": shows the existing XP progress content (current content from front side)
    - Tab "XP": shows the `XPSourceList` (current content from back side)
    - Tab "✨ Enhance": shows either:
      a. If no enhancement loaded: a "Get AI Suggestions" button (with Sparkles icon) + a note "Costs 1 life"
      b. If loading: spinner + "Getting suggestions..."
      c. If loaded: `<SkillEnhancementPanel />`
  - Add state: `enhancement: SkillEnhancement | null`, `isLoadingEnhancement: boolean`
  - Add `handleGetEnhancement` function: calls `suggestEnhancementsAction`, sets enhancement result
  - Add `handleAddRelatedSkill(skillName: string)`: calls `createSkillService` or the existing add_skill mechanism (see note below)
  - Add `addingSkill: string | null` state to track which skill is being added
  - Reset `activeTab` to 'stats' when card closes (`!isOpen` effect)
  - Keep all existing props unchanged: `{ userSkill, isOpen, onClose, onEdit, onDelete, isEditable, className }`
  - Add optional prop: `githubConnected?: boolean` (passed from parent, defaults to false)
  - Add optional prop: `locale?: string` (defaults to 'en')

  **Note on addRelatedSkill:** The SkillDetailCard is client-only. To add a skill, import and call `createSkillAction` from `@/features/skills/actions` (the existing server action for creating a skill) using `useTransition` + toast (sonner) pattern. The skill will be added with level 1 and the skill name from the suggestion.

**Acceptance:** SkillDetailCard renders with 3 tabs. Stats and XP tabs show existing content. Enhance tab shows the enhancement flow. No 3D CSS. TypeScript compiles.

---

## Task Group 6: Propagate Props to SkillDetailCard

The SkillDetailCard needs `githubConnected` and `locale` from its parent. Update the call sites.

- [x] **TG6: Update `DashboardSkillsView.tsx` to pass new props**
  - File: `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`
  - The component already receives `githubConnectionStatus` and `locale` as props (from the skills page server component)
  - Find where `<SkillDetailCard />` is rendered and pass:
    - `githubConnected={githubConnectionStatus?.isConnected ?? false}`
    - `locale={locale}`
  - Also check `features/skills/components/SkillTreeView.tsx` or wherever `SkillDetailCard` is instantiated — pass the same props

**Acceptance:** SkillDetailCard receives and uses `githubConnected` and `locale` correctly.

---

## Task Group 7: CRT AI Tool

Add `suggest_learning_path` to the AI tool registry.

- [x] **TG7: Add `suggest_learning_path` to `features/ai/tools/readTools.ts`**
  - Add to the `allReadTools(userId)` function
  - Tool definition:
    ```typescript
    suggest_learning_path: tool({
      description: "Suggest learning resources and related technologies for a specific skill the user has. Returns next level focus, related skills, and curated resources.",
      parameters: z.object({
        skillName: z.string().describe("The skill to get improvement suggestions for (e.g., 'React', 'TypeScript')"),
        skillLevel: z.number().min(1).max(5).optional().describe("Current skill level 1-5, if known"),
        locale: z.string().optional().describe("Language for suggestions ('en' or 'es')"),
      }),
      execute: async ({ skillName, skillLevel = 3, locale = 'en' }) => {
        logger.debug('TOOL: suggest_learning_path', { skillName, skillLevel })
        try {
          // Fetch user skills to get category and level
          const userSkills = await getUserSkillsData(userId)
          const matchedSkill = userSkills.find(
            us => us.skill.name.toLowerCase() === skillName.toLowerCase()
          )
          const actualLevel = matchedSkill ? (matchedSkill.level ?? skillLevel) : skillLevel
          const category = matchedSkill?.skill?.category?.name ?? 'General'
          const userSkillNames = userSkills.map(us => us.skill.name)

          // Import suggestEnhancementsService (do NOT consume life — chat already charged)
          // Call a lightweight version: pass empty userId for no life check, OR
          // create a separate suggestEnhancementsForTool() that skips consumeLifeService
          // IMPLEMENTATION NOTE: extract a pure `getEnhancementSuggestions()` helper
          // from the service that does NOT call consumeLifeService, then use that here.

          const { generateObject } = await import('ai')
          const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
          const { z: zod } = await import('zod')

          const googleAI = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
          })

          const prompt = locale === 'es'
            ? `Sugiere recursos de aprendizaje y habilidades relacionadas para alguien con nivel ${actualLevel}/5 en ${skillName} (categoría: ${category}). Sus habilidades actuales: ${userSkillNames.join(', ')}. No sugieras habilidades que ya tiene. Genera 3-4 recursos realistas con URLs reales.`
            : `Suggest learning resources and related skills for someone at level ${actualLevel}/5 in ${skillName} (category: ${category}). Their current skills: ${userSkillNames.join(', ')}. Do not suggest skills they already have. Generate 3-4 realistic resources with real URLs.`

          const result = await generateObject({
            model: googleAI('gemini-2.0-flash'),
            prompt,
            schema: zod.object({
              nextLevelFocus: zod.string(),
              relatedSkills: zod.array(zod.object({ name: zod.string(), reason: zod.string() })).max(4),
              resources: zod.array(zod.object({
                title: zod.string(),
                type: zod.enum(['video', 'article', 'course', 'documentation', 'practice']),
                url: zod.string(),
                duration: zod.string(),
                cost: zod.enum(['free', 'paid']),
              })).max(4),
            }),
          })

          return {
            skill: skillName,
            level: actualLevel,
            nextLevelFocus: result.object.nextLevelFocus,
            relatedSkills: result.object.relatedSkills,
            resources: result.object.resources,
            tip: `Visit /dashboard/skills and click on ${skillName} for the full enhancement panel with add buttons.`,
          }
        } catch (err: any) {
          logger.error('TOOL_ERROR (suggest_learning_path):', err)
          return { error: 'Failed to generate suggestions', details: err.message }
        }
      },
    }),
    ```

**Acceptance:** CRT AI can answer "how do I improve my React skills?" and return structured suggestions. No double life charge.

---

## Task Group 8: Translations

- [x] **TG8: Add skill enhancement translations**
  - Add to `messages/en.json` under key `"skillEnhancement"`:
    ```json
    {
      "tab": "Enhance",
      "tabStats": "Stats",
      "tabXP": "XP",
      "toNextLevel": "To reach next level:",
      "relatedSkills": "Related Skills",
      "resources": "Learning Resources",
      "alreadyAdded": "Added",
      "addSkill": "Add",
      "loadingSuggestions": "Getting AI suggestions...",
      "getSuggestions": "Get AI Suggestions",
      "getSuggestionsHint": "Costs 1 life",
      "connectGithub": "Connect GitHub",
      "connectGithubHint": "Validate your skills with real code",
      "takeAssessment": "Take Assessment",
      "takeAssessmentHint": "Earn a Verified badge",
      "resourceTypes": {
        "video": "Video",
        "article": "Article",
        "course": "Course",
        "documentation": "Docs",
        "practice": "Practice"
      },
      "costFree": "Free",
      "costPaid": "Paid",
      "verifyLink": "AI-generated link — verify before using",
      "masterLevel": "You've reached Master level! Focus on teaching and open source contributions.",
      "noGithub": "Not connected",
      "assessmentAvailable": "Assessment available",
      "assessmentPassed": "Assessment passed ✓"
    }
    ```
  - Add same keys to `messages/es.json` in Spanish

**Acceptance:** Keys exist in both locale files. No missing translation warnings.

---

## Task Group 9: TypeScript + Integration Verification

- [x] **TG9-A: Verify TypeScript compilation**
  - Run `npx tsc --noEmit`
  - Confirm zero NEW errors from 4D changes

- [x] **TG9-B: Verify end-to-end flow** *(manual)*
  - Click a skill hexagon on the skills dashboard
  - Click the "Enhance" tab
  - Click "Get AI Suggestions"
  - Verify: loading state shows, enhancement panel renders with related skills and resources
  - Click "+ Add" on a related skill that is not yet in the tree
  - Verify: skill is added with toast confirmation

- [ ] **TG9-C: Verify CRT integration** *(manual)*
  - Ask CRT: "how do I improve my TypeScript skills?"
  - Verify: AI calls `suggest_learning_path` tool and returns structured suggestions
  - Verify: response includes next level focus, related skills, resources

---

## Implementation Order

1. **TG1** (Types + Schema) — foundation, no dependencies
2. **TG2** (Service) — depends on TG1
3. **TG3** (Action) — depends on TG1, TG2
4. **TG4** (Sub-components) — depends on TG1 (types only)
5. **TG5** (SkillDetailCard refactor) — depends on TG3, TG4
6. **TG6** (Prop propagation) — depends on TG5
7. **TG7** (CRT tool) — depends on TG1 (parallel with TG4-6)
8. **TG8** (Translations) — can be parallelized with everything
9. **TG9** (Testing) — depends on all above

TG1 is the critical path. TG4 and TG7 can be parallelized after TG1.
