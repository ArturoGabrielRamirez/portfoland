# Spec 4B: AI Context Engine

**Status:** Ready for implementation
**Branch:** `feat/phase4-ai-portfolio-os`
**Dependencies:** Spec 4A (completed)
**Estimated effort:** 5-7 days

---

## Problem

The CRT is now on every dashboard page (Spec 4A), but it has two critical issues:

1. **Simulated chat**: CRTWithAI uses a hardcoded `handleSend` that returns a fake response (`"He procesado tu comando..."`). It does NOT connect to `/api/chat`. The real chat API was only used by the now-deleted `AIAssistantFloat` via `useChat`.

2. **Limited AI context**: The `/api/chat` route has only 4 tools:
   - `add_experience` — create experience (write)
   - `add_skill` — create skill (write)
   - `get_portfolio_data` — returns skills only (read)
   - `get_skill_tree` — returns skills with detail (read)

   The AI **cannot**: read projects, experiences, bio, GitHub data, assessment results, portfolio settings. It cannot update existing records. It doesn't know what page the user is on (pageContext flows to the route now from 4A, but no page-specific behavior exists yet).

3. **Disconnected AI features**: `improve-bio` and `improve-description` API routes exist separately but are not integrated into the chat. The AI chat and the "Improve with AI" buttons are completely separate systems.

---

## Solution

### 1. Connect CRT to real chat API

Replace the simulated `handleSend` in CRTWithAI with `useChat` from the Vercel AI SDK (`ai/react`). This gives real-time streaming, proper message history, and tool call support.

### 2. Build a context loader

Create `features/ai/services/contextLoader.service.ts` that aggregates a lightweight portfolio summary for injection into the system prompt. This gives the AI awareness of the user's data without dumping everything into every request.

### 3. Expand the tool registry

Add read tools for all portfolio data types, plus write tools for updating existing content. Tools are organized into:
- **Base tools** (always available): portfolio summary, profile
- **Page-specific tools** (loaded based on `pageContext`): skill tools on skills page, experience tools on timeline page, etc.

### 4. Page-aware system prompt

Augment the system prompt based on `pageContext` with specific instructions about what the AI should proactively help with on each page.

---

## Architecture

### New files

| File | Type | Purpose |
|------|------|---------|
| `features/ai/services/contextLoader.service.ts` | Service | Aggregates lightweight portfolio summary for system prompt |
| `features/ai/constants/pagePrompts.ts` | Constants | Page-specific system prompt augmentations |
| `features/ai/tools/readTools.ts` | Tools | Read-only tool definitions (projects, experiences, profile, github, assessments) |
| `features/ai/tools/writeTools.ts` | Tools | Write tool definitions (update bio, project description, experience description) |
| `features/ai/tools/index.ts` | Barrel | Exports tool registry builder |

### Modified files

| File | Change |
|------|--------|
| `features/tech/components/crt-with-ai.tsx` | Replace simulated `handleSend` with `useChat` from `ai/react` |
| `app/api/chat/route.ts` | Integrate context loader, page-aware prompts, expanded tool registry |

---

## Detailed Design

### 1. CRT Real Chat Integration

**File:** `features/tech/components/crt-with-ai.tsx`

Replace the simulated chat with `useChat`:

```typescript
import { useChat } from "ai/react"

// Inside the component:
const { messages: chatMessages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
  api: "/api/chat",
  body: { locale, pageContext },
  onResponse: () => {
    setAIState("thinking")
  },
  onFinish: () => {
    setAIState("success")
    setTimeout(() => setAIState("awake"), 2500)
  },
  onError: () => {
    setAIState("life_loss")
  },
})
```

Key changes:
- Remove the simulated `handleSend` function entirely
- Map `useChat` messages to the existing `ChatMessage` display format (`role: "user" | "ai"`)
- Drive AIState transitions from `useChat` callbacks: `onResponse` -> thinking, `onFinish` -> success, `onError` -> life_loss
- Keep the existing boot sequence, AIEye animations, and sleep/wake mechanics untouched
- The `message` state + input field connects to `useChat`'s `input`/`handleInputChange`
- Keep localStorage persistence but migrate to `useChat`'s `initialMessages` pattern
- Show streaming text in real-time (useChat provides this automatically)

**AIState mapping with useChat:**
- User types + hits Enter: `"listening"` (brief, while request starts)
- `onResponse` fires: `"thinking"` (streaming starts)
- `onFinish` fires: `"ready"` -> `"success"` -> `"awake"` (same sequence as before)
- `onError` fires: `"life_loss"` (shows error state)

### 2. Context Loader

**File:** `features/ai/services/contextLoader.service.ts`

Aggregates a **lightweight summary** for the system prompt. NOT the full data — that comes from tool calls.

```typescript
export interface PortfolioSummary {
  name: string
  bio: string | null
  portfolioMode: string
  skillCount: number
  projectCount: number
  experienceCount: number
  hasGitHub: boolean
  githubSyncedAt: Date | null
  assessmentsPassed: number
  profileCompleteness: number  // 0-100
}

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary>
```

This uses lightweight count queries, NOT full data fetches:

```typescript
const [user, counts] = await Promise.all([
  prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, bio: true, portfolioMode: true, githubSyncedAt: true },
  }),
  prisma.$transaction([
    prisma.userSkill.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.experience.count({ where: { userId } }),
    prisma.account.count({ where: { userId, providerId: "github" } }),
    prisma.assessment.count({ where: { userId, passed: true } }),
  ]),
])
```

Injected into system prompt as:
```
USER PORTFOLIO SUMMARY:
- Name: {name}
- Bio: {bio ? "Set" : "Not set"}
- Mode: {portfolioMode}
- Skills: {skillCount}, Projects: {projectCount}, Experiences: {experienceCount}
- GitHub: {hasGitHub ? "Connected, last synced " + syncedAt : "Not connected"}
- Assessments passed: {assessmentsPassed}
- Profile completeness: {profileCompleteness}%
```

This costs ~50 extra tokens per request. Tool calls for detailed data are free (no extra AI call).

### 3. Read Tools

**File:** `features/ai/tools/readTools.ts`

New tools that let the AI read portfolio data on demand:

| Tool | Description | Data source |
|------|-------------|-------------|
| `get_projects` | All user projects with details | `getProjectsByUserIdData` |
| `get_experiences` | All experiences with descriptions | `getExperiencesByUserId` |
| `get_profile` | Bio, headline, image, social links | prisma user query |
| `get_github_data` | GitHub connection status, repos, languages | `getGitHubConnectionStatus` |
| `get_assessment_history` | Per-skill assessment results | `getAssessmentHistoryData` |
| `get_portfolio_health` | Computed score + suggestions | New: calculates from summary |

`get_portfolio_health` is computed, not stored:
```typescript
// Score = weighted sum of:
// - Has bio (15%)
// - Has image (10%)
// - Has username (10%)
// - Skills >= 5 (15%)
// - Projects >= 2 (15%)
// - Experiences >= 1 (10%)
// - GitHub connected (10%)
// - Assessment passed >= 1 (15%)
```

### 4. Write Tools

**File:** `features/ai/tools/writeTools.ts`

Tools that modify portfolio data. These require **user confirmation** in the chat UI before executing.

| Tool | Description | Service |
|------|-------------|---------|
| `update_bio` | Update user bio text | `updateProfileService` |
| `update_project_description` | Edit a project's description | `updateProject.data.ts` |
| `update_experience_description` | Edit an experience's description | `updateExperience.data.ts` |
| `suggest_skills` | Return AI-suggested skills (user accepts/rejects) | returns suggestions, no DB write |

**User confirmation pattern:** Write tools return a `{ requiresConfirmation: true, preview: "..." }` response. The AI then asks the user to confirm. On confirmation, the AI calls the tool again with `confirmed: true`.

Actually, simpler approach for MVP: The AI SDK's `maxSteps: 5` means the AI can call a tool and then continue the conversation. The AI naturally describes what it's about to do ("I'll update your bio to: ...") and executes. If the user says "no", the conversation continues. This is sufficient for MVP — explicit confirmation UI is Phase 5.

### 5. Page-Aware Prompts

**File:** `features/ai/constants/pagePrompts.ts`

```typescript
export const PAGE_PROMPTS: Record<string, { en: string; es: string }> = {
  dashboard: {
    en: "User is on their main dashboard. Suggest portfolio improvements, highlight incomplete sections, or help them plan next steps.",
    es: "El usuario esta en su dashboard principal. Sugiere mejoras al portfolio, destaca secciones incompletas o ayuda a planificar proximos pasos.",
  },
  skills: {
    en: "User is viewing their skill tree. Help add new skills, suggest related technologies, or discuss skill levels and validation.",
    es: "El usuario esta viendo su arbol de skills. Ayuda a agregar nuevas skills, sugiere tecnologias relacionadas o discute niveles y validacion.",
  },
  timeline: {
    en: "User is editing their work history. Help improve experience descriptions, suggest better bullet points, or add missing experiences.",
    es: "El usuario esta editando su historial laboral. Ayuda a mejorar descripciones, sugiere mejores bullet points o agrega experiencias faltantes.",
  },
  projects: {
    en: "User is managing their projects. Help improve project descriptions, suggest tech stacks to highlight, or add new projects.",
    es: "El usuario esta gestionando sus proyectos. Ayuda a mejorar descripciones, sugiere tech stacks a destacar o agrega nuevos proyectos.",
  },
  portfolio: {
    en: "User is customizing their public portfolio settings. Help with bio, profile image, section visibility, and theme selection.",
    es: "El usuario esta personalizando su portfolio publico. Ayuda con bio, imagen de perfil, visibilidad de secciones y seleccion de tema.",
  },
  gallery: {
    en: "User is managing their gallery. Help with image descriptions and portfolio presentation.",
    es: "El usuario esta gestionando su galeria. Ayuda con descripciones de imagenes y presentacion del portfolio.",
  },
  services: {
    en: "User is managing their services. Help write compelling service descriptions and pricing strategies.",
    es: "El usuario esta gestionando sus servicios. Ayuda a escribir descripciones atractivas y estrategias de precios.",
  },
  testimonials: {
    en: "User is managing testimonials. Help request testimonials or suggest improvements.",
    es: "El usuario esta gestionando testimonios. Ayuda a solicitar testimonios o sugiere mejoras.",
  },
}
```

### 6. Tool Registry Builder

**File:** `features/ai/tools/index.ts`

```typescript
export function buildToolRegistry(userId: string, pageContext?: string) {
  // Base tools — always available
  const tools = {
    ...baseReadTools(userId),      // get_portfolio_health, get_profile
    ...baseWriteTools(userId),     // update_bio
    ...existingTools(userId),      // add_experience, add_skill, get_skill_tree, get_portfolio_data
  }

  // Page-specific tools
  if (pageContext === "skills") {
    Object.assign(tools, skillPageTools(userId))    // suggest_skills
  }
  if (pageContext === "timeline") {
    Object.assign(tools, timelinePageTools(userId))  // get_experiences, update_experience_description
  }
  if (pageContext === "projects") {
    Object.assign(tools, projectPageTools(userId))   // get_projects, update_project_description
  }
  // ... etc

  return tools
}
```

### 7. Updated Chat Route

**File:** `app/api/chat/route.ts`

```typescript
import { getPortfolioSummary } from "@/features/ai/services/contextLoader.service"
import { getPagePrompt } from "@/features/ai/constants/pagePrompts"
import { buildToolRegistry } from "@/features/ai/tools"

export async function POST(req: Request) {
  // ... auth, lives check ...

  const { messages, locale, pageContext } = await req.json()

  // Load lightweight context
  const summary = await getPortfolioSummary(userId)

  // Build system prompt with context + page awareness
  const system = buildSystemPrompt(locale, pageContext, summary)

  // Build page-aware tool registry
  const tools = buildToolRegistry(userId, pageContext)

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages,
    system,
    maxSteps: 5,
    tools,
    // ... onFinish unchanged
  })

  return result.toDataStreamResponse()
}
```

---

## Performance Considerations

1. **Context loader uses COUNT queries** — no full data in system prompt. ~2ms per count, 5 counts = ~10ms total.
2. **Tool calls are on-demand** — detailed data only fetched when the AI decides to call a tool.
3. **Page-specific tools reduce prompt size** — fewer tool definitions = less token usage = faster responses.
4. **Existing data functions are cached** — `getUserSkillsData`, `getUserDashboardStats` use `unstable_cache`.

**Cost estimate:**
- Current: ~$0.002/message (Gemini Flash)
- With summary (~50 tokens extra): ~$0.003/message
- Tool calls: free (DB reads, no extra AI call)

---

## CRT Chat UX Details

The CRT terminal aesthetic stays. Messages render as:

```
> [AI] SYSTEM SCAN COMPLETE. You have 12 skills, 3 projects...
$ [User] how complete is my portfolio?
> [AI] RUNNING DIAGNOSTICS...
> Portfolio completeness: 73%
> Missing: GitHub connection, profile image, 2+ more projects
> Recommendation: Connect GitHub to validate your skills.
```

The `>` prefix for AI, `$` prefix for user stays from the current CRT design. Streaming text appears character by character (useChat provides streaming, we render progressively).

---

## Classic Mode Chat (Future — documented for 4B+)

Classic Mode currently shows `ClassicDashboardHeader` with no chat (from 4A). A future enhancement (documented in ROADMAP_V4.md) will add a WhatsApp/Messenger-style chat panel for Classic Mode users. This is NOT in 4B scope but the backend (`/api/chat`) is mode-agnostic and will work for both.

---

## Acceptance Criteria

1. CRT chat sends real messages to `/api/chat` and displays streaming responses
2. AI can answer "what skills do I have?" by calling `get_skill_tree` (already works)
3. AI can answer "what projects do I have?" by calling `get_projects` (NEW)
4. AI can answer "how complete is my portfolio?" by calling `get_portfolio_health` (NEW)
5. AI can update bio text via `update_bio` tool (NEW)
6. AI can improve a project description via `update_project_description` tool (NEW)
7. AI knows the current page and adapts suggestions (pageContext in system prompt)
8. AI references the portfolio summary in its responses (knows skill count, project count, etc.)
9. AIEye state transitions work with real streaming (thinking while streaming, success on finish)
10. Boot sequence and sleep/wake mechanics are preserved
11. Chat history persists in localStorage across page navigations
12. Error states (rate limit, API errors) show appropriate messages in CRT

---

## Out of Scope

- Classic Mode chat UI (WhatsApp-style panel)
- Persistent chat across sessions (DB-stored conversation history)
- Custom AI personality per user
- Voice input/output
- `improve-bio` / `improve-description` route integration (these stay separate for now)
