# Spec 4D: Skill Enhancement System

**Status:** Ready for implementation
**Branch:** `feat/phase4-ai-portfolio-os`
**Dependencies:** Spec 4B (completed), Spec 4A (completed)
**Estimated effort:** 5-7 days

---

## Problem

The skill tree is a beautiful visualization, but it is passive. After a user adds a skill or passes an assessment, there is no guidance on what to do next. The `SkillDetailCard` shows XP breakdown, but gives no direction for growth. Users open the card, see their level, and close it. The product has the data to give personalized learning guidance — skill level, GitHub validation status, assessment history, related tech — but none of it drives action.

---

## Solution

When a user clicks a skill hexagon and opens the `SkillDetailCard`, add an **Enhancement tab** that shows:

1. **Validation CTAs** — "Connect GitHub" if not connected; "Take Assessment" if assessment-eligible
2. **Related Skills** (AI-generated) — 3-5 technologies the user should consider adding
3. **Learning Resources** (AI-generated) — 3-5 resources (video/article/course) to level up
4. **Next Level Focus** — what specifically to practice to reach the next skill level

Additionally, add a `suggest_learning_path` tool to the CRT AI so users can ask "how do I improve my React skills?" and get a personalized answer.

---

## Architecture

### New feature folder

```
features/skill-enhancement/
  types/
    enhancement.ts                    — SkillEnhancement, RelatedSkill, LearningResource types
  services/
    suggestEnhancements.service.ts    — single AI call returning all suggestions
  actions/
    suggestEnhancements.action.ts     — server action wrapper
  components/
    SkillEnhancementPanel.tsx         — renders the enhancement tab content
    RelatedSkillCard.tsx              — card for a related skill suggestion (with add button)
    LearningResourceCard.tsx          — card for a learning resource
```

### Modified files

| File | Change |
|------|--------|
| `features/skills/components/SkillDetailCard.tsx` | Add Enhancement tab that renders `SkillEnhancementPanel` |
| `features/skills/types/skill.ts` | Add `SkillDetailCardProps` tab support (if needed) |
| `features/ai/tools/readTools.ts` | Add `suggest_learning_path` tool |
| `messages/en.json` + `messages/es.json` | Add skill enhancement translation keys |

---

## Detailed Design

### 1. Types

```typescript
// features/skill-enhancement/types/enhancement.ts

export interface RelatedSkill {
  name: string
  category: string
  reason: string          // Why this skill complements the current one
  priority: 'high' | 'medium' | 'low'
  alreadyAdded: boolean   // True if user already has this skill
}

export interface LearningResource {
  title: string
  type: 'video' | 'article' | 'course' | 'documentation' | 'practice'
  url: string             // AI-generated URL (best-effort, may need verification)
  duration: string        // e.g. "45 min", "2 hours", "self-paced"
  cost: 'free' | 'paid'
  why: string             // One-sentence relevance explanation
}

export interface SkillEnhancement {
  skillName: string
  currentLevel: number    // 1-5
  nextLevelFocus: string  // What to practice to reach next level
  relatedSkills: RelatedSkill[]
  resources: LearningResource[]
  validationStatus: {
    githubConnected: boolean
    assessmentAvailable: boolean
    assessmentPassed: boolean
  }
}
```

### 2. Enhancement Service

**File:** `features/skill-enhancement/services/suggestEnhancements.service.ts`

Single AI call using `generateObject` (structured output) to return all suggestions in one request:

```typescript
export async function suggestEnhancementsService(
  userId: string,
  skillName: string,
  skillLevel: number,   // 1-5
  category: string,
  userSkillNames: string[],   // to detect alreadyAdded
  locale: string = 'en'
): Promise<SkillEnhancement>
```

**Steps:**
1. Check and consume a life via `consumeLifeService`
2. Fetch GitHub connection status and assessment history for this skill
3. Build a prompt with: skill name, level, category, user's existing skills (for context), locale
4. Call `generateObject` (Gemini 2.0 Flash) with a Zod schema matching `SkillEnhancement`
5. Post-process: mark `alreadyAdded = true` for any related skill already in userSkillNames
6. Return the full `SkillEnhancement` object

**Prompt strategy:**
- Include the user's current skill list so AI avoids suggesting skills they already have (or marks them as such)
- Include skill level so resources are appropriate (beginner resources for level 1-2, advanced for 4-5)
- Bilingual: if locale = 'es', generate resources with Spanish labels, prefer Spanish content where available but include English quality resources
- Instructions for URLs: generate realistic, well-known URLs (official docs, YouTube channels, popular courses)

**Cost:** ~$0.005 per call (small context, focused output)

### 3. Server Action

**File:** `features/skill-enhancement/actions/suggestEnhancements.action.ts`

- Uses `actionWrapper` pattern with Yup validation
- Input: `{ skillName, skillLevel, category, locale }`
- Returns: `{ success, data: SkillEnhancement }`

### 4. UI: SkillDetailCard Enhancement Tab

**Modified file:** `features/skills/components/SkillDetailCard.tsx`

Add a tab system to the existing card:
- Tab 1: **"Stats"** — existing XP/level content (current front/back flip becomes this)
- Tab 2: **"Enhance"** (✨) — renders `SkillEnhancementPanel`

The Enhance tab loads lazily: first click triggers the action call, shows a loading state, then renders the panel. Subsequent opens use the cached result (stored in component state — ephemeral, not DB-persisted).

**Tab design:**
```
┌─────────────────────────────────────────┐
│  React  ⚡ Journeyman (Level 3)          │
│                                         │
│  [Stats] [✨ Enhance]                   │
├─────────────────────────────────────────┤
│  ✨ Enhance your React skills           │
│                                         │
│  📈 To reach Level 4 (Expert):          │
│  Focus on performance optimization,     │
│  custom hooks, and Server Components.   │
│                                         │
│  🔗 Related Skills                      │
│  [Next.js +add] [TypeScript ✓] [Vitest +add] │
│                                         │
│  📚 Resources                           │
│  ▶ React Advanced Patterns (45 min)    │
│  📄 Server Components Deep Dive        │
│  🎓 Epic React (paid)                  │
│                                         │
│  [🐙 Connect GitHub] [📝 Take Assessment]│
└─────────────────────────────────────────┘
```

### 5. RelatedSkillCard Component

**File:** `features/skill-enhancement/components/RelatedSkillCard.tsx`

- Shows skill name, category, reason, priority badge
- If `alreadyAdded = true`: show ✓ checkmark, no add button
- If not added: show "+ Add" button that calls the existing `add_skill` or `createSkillService`
- Priority badge: high = green, medium = yellow, low = gray

### 6. LearningResourceCard Component

**File:** `features/skill-enhancement/components/LearningResourceCard.tsx`

- Icon based on type: ▶ (video), 📄 (article), 🎓 (course), 📖 (docs), 💻 (practice)
- Title, duration, cost badge (Free/Paid)
- One-line "why" text
- Click opens URL in new tab
- Note: URLs are AI-generated best-effort — add a small "⚠ Verify link" disclaimer on hover

### 7. CRT AI Tool

**File:** `features/ai/tools/readTools.ts` (add to existing)

```typescript
suggest_learning_path: tool({
  description: "Suggest learning resources and related skills for a specific skill the user has.",
  parameters: z.object({
    skillName: z.string().describe("The skill to get suggestions for"),
    targetLevel: z.number().optional().describe("Target level to reach (1-5)"),
  }),
  execute: async ({ skillName, targetLevel }) => {
    // Call suggestEnhancementsService without consuming a life (tool call = already paid via chat life)
    // Return formatted suggestions
  }
})
```

**Note:** When called via CRT tool, do NOT call `consumeLifeService` again — the chat message already consumed a life. The tool is a data operation only.

### 8. Translations

Add to `messages/en.json` and `messages/es.json`:

```json
// en.json additions
"skillEnhancement": {
  "tab": "Enhance",
  "toNextLevel": "To reach Level {{level}} ({{name}}):",
  "relatedSkills": "Related Skills",
  "resources": "Learning Resources",
  "alreadyAdded": "Already added",
  "addSkill": "Add",
  "loadingSuggestions": "Getting AI suggestions...",
  "getSuggestions": "Get AI Suggestions",
  "connectGithub": "Connect GitHub",
  "takeAssessment": "Take Assessment",
  "resourceTypes": {
    "video": "Video",
    "article": "Article",
    "course": "Course",
    "documentation": "Docs",
    "practice": "Practice"
  },
  "costFree": "Free",
  "costPaid": "Paid",
  "verifyLink": "Verify link before using",
  "noSuggestions": "No suggestions available"
}
```

---

## Integration with SkillDetailCard

The existing `SkillDetailCard` has a "flip" mechanic (front = stats, back = XP sources). This needs to be refactored to a tab system to accommodate the Enhancement tab cleanly.

**Refactor plan:**
- Replace the flip animation with simple tab navigation (3 tabs: Stats, XP, Enhance)
- Keep the same visual style (TechCard wrapper, same colors)
- Tabs use the existing `TechBadge` component for styling
- The flip card animation is removed (it was technically complex and added maintenance burden)

This refactor is contained within `SkillDetailCard.tsx` — no other component is affected.

---

## Performance Considerations

1. **Lazy loading:** Enhancement suggestions are only fetched on explicit user action ("Get AI Suggestions" button click or tab click)
2. **Ephemeral cache:** Results cached in component state — no DB writes. If user closes and reopens the card, they can re-fetch (costs another life). Acceptable for MVP.
3. **Single AI call:** All suggestions (related skills + resources + next level focus) come from one `generateObject` call — efficient.
4. **No streaming:** `generateObject` returns all at once — no streaming needed. Loading state is a simple spinner.

---

## Acceptance Criteria

1. Clicking a skill hexagon opens `SkillDetailCard` with a new "Enhance" tab
2. Clicking the Enhance tab (or "Get AI Suggestions" button) fetches and shows enhancement panel
3. Enhancement panel shows: next level focus text, 3-5 related skills, 3-5 learning resources
4. Related skills already in user's tree are marked with ✓ (not shown as addable)
5. Clicking "+ Add" on a related skill adds it to the user's skill tree
6. Learning resources show: type icon, title, duration, cost, one-line description, external link
7. If GitHub is not connected: show "Connect GitHub" CTA linking to `/dashboard/profile` or GitHub connect flow
8. If skill is assessment-eligible and not yet passed: show "Take Assessment" CTA
9. CRT AI can answer "how do I improve my [skill] skills?" with personalized suggestions
10. Both Tech Mode and Classic Mode users can access skill enhancement (panel renders correctly in both)
11. All text is bilingual (en/es) based on user locale

---

## Out of Scope

- Persisting enhancement results to DB (ephemeral only for MVP)
- YouTube Data API verification of video URLs
- Curated resource database
- "Learning Queue" / bookmarking resources
- Progress tracking per resource
- Skill roadmap visualization (separate future spec)
