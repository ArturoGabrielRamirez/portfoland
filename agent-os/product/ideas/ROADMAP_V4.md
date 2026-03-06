# Portfoland Roadmap V4 -- Phase 4: AI-Centered Portfolio OS

**Fecha:** 2026-03-06
**Estado:** Activo -- Reemplaza ROADMAP_V2.md como documento rector
**Origen:** Audit Opus post-Phase 3A, health check 2026-03-05, analisis de idea docs acumulados
**Branch base:** `feat/phase3-solidify-tech-mode`

---

## Executive Summary

Portfoland has completed Phases 0 through 3A-C. The product is functional: a user can sign up, choose Tech or Classic mode, add skills/projects/experiences, connect GitHub for validation, take AI skill assessments, and publish a portfolio on `user.portfoland.com`. The two-mode strategy works. The data layer is solid. The assessment engine is the cleanest code in the repo.

But the product has a coherence problem. AI features exist in isolation: the chat assistant (`/api/chat`) has tools to read skills and add experiences but lives behind a floating widget with no visual integration into the page the user is on. The CRT with AIEye is the most distinctive UI element in the product, but it only appears on the main dashboard and the skills page -- every other page gets the inferior float widget. The assessment system is disconnected from the chat. The CV generation, portfolio health check, and skill enhancement ideas from the idea docs have never been built. The result is a product that has pieces of a Portfolio OS but presents them as disconnected widgets.

Phase 4 changes the mental model. The AI stops being a sidebar feature and becomes the operating system's kernel. Every dashboard page gets the CRT as a standard layout element. The AI gets real context about what the user is currently editing. The CV generator, skill enhancement, and quest system turn the product from "a place to list your skills" into "a system that actively helps you grow your career." The differentiator is no longer just hexagons and CRT aesthetics -- it is an AI that knows your portfolio, can modify it with your permission, and proactively suggests what to improve.

---

## The Big Shift: From Feature Set to Portfolio OS

### What we have now

```
User --> Dashboard (CRT + stats)
     --> Skills page (hexagon tree + assessment widget + GitHub sync)
     --> Timeline page (experience list)
     --> Projects page (project cards)
     --> Portfolio page (settings)
     --> Gallery/Services/Testimonials (Classic mode)

AI lives in:
  - CRTWithAI (dashboard home, skills page only)
  - AIAssistantFloat (all other pages, inferior chat-only widget)
  - Assessment engine (isolated modal, skills page only)
  - improve-bio / improve-description (isolated API routes, no chat integration)
```

The AI has four separate entry points with no shared context. The CRT chat can call `get_skill_tree` and `add_skill` tools, but it cannot read projects, experiences, bio, GitHub data, or assessment results. It cannot suggest edits to the page the user is currently viewing. The float widget is a workaround, not a solution.

### What Phase 4 builds

```
User --> Any Dashboard Page
           |
           +-- DashboardPageLayout (standard)
           |     +-- PageHeader (title, actions)
           |     +-- DashboardRow1 (WelcomeCard + CRTWithAI) <-- ALWAYS PRESENT
           |     +-- PageContent (varies by page)
           |
           +-- CRTWithAI
                 |
                 +-- AI Context Engine (reads current page + user portfolio data)
                 +-- Tool registry (page-aware: on Skills page = skill tools,
                 |                  on Timeline = experience tools, etc.)
                 +-- Persistent conversation (across pages)
```

The CRT becomes the brain. It knows where you are. It knows your data. It can act.

---

## Architecture Decision: CRT-Centric Dashboard Layout

### Current state

- `DashboardRow1` (WelcomeCard + CRTWithAI) exists in `features/tech/components/dashboard-row1.tsx`
- Only used in `app/[locale]/(dashboard)/dashboard/page.tsx` (main dashboard)
- Skills page (`DashboardSkillsView.tsx`) has its OWN standalone `CRTWithAI` instance -- no WelcomeCard, separate trigger state
- All other pages (timeline, projects, portfolio settings, gallery, services, testimonials) have NO CRT -- they get the `AIAssistantFloat` widget from the layout
- The float widget hides itself on `/dashboard` and `/dashboard/skills` via the `SKIP_SEGMENTS` array

### Target state

Every Tech Mode dashboard page uses a shared `DashboardPageLayout` component:

```tsx
// features/tech/components/dashboard-page-layout.tsx
export function DashboardPageLayout({
  children,           // page-specific content
  pageContext,        // string identifier: "skills" | "timeline" | "projects" | etc.
  userName,
  userStats,          // level, XP, streak -- from getUserDashboardStats
  bootStats,
}: DashboardPageLayoutProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 p-2">
      <DashboardRow1
        userName={userName}
        {...userStats}
        bootStats={bootStats}
      />
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  )
}
```

The `AIAssistantFloat` component is REMOVED. The CRT in `DashboardRow1` is the single AI entry point for all pages. The `pageContext` prop tells the AI Context Engine what tools and system prompt augmentations to apply.

### Files to modify

| File | Change |
|------|--------|
| `features/tech/components/dashboard-page-layout.tsx` | NEW: shared layout wrapper |
| `features/tech/components/dashboard-row1.tsx` | Add `pageContext` prop, pass to CRTWithAI |
| `features/tech/components/crt-with-ai.tsx` | Accept `pageContext`, inject into chat body |
| `features/tech/components/ai-assistant-float.tsx` | DELETE after migration |
| `app/[locale]/(dashboard)/dashboard/page.tsx` | Wrap content in DashboardPageLayout |
| `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` | Remove standalone CRT, use DashboardPageLayout |
| `app/[locale]/(dashboard)/dashboard/skills/page.tsx` | Pass pageContext="skills" |
| All other dashboard pages (timeline, projects, portfolio, gallery, services, testimonials) | Wrap in DashboardPageLayout |
| `app/api/chat/route.ts` | Read `pageContext` from body, adjust tools and system prompt |

### Classic Mode consideration

Classic Mode pages do NOT show the CRT. The `DashboardPageLayout` checks `portfolioMode` and renders either the CRT row (Tech) or a simpler header (Classic). Classic Mode users still get AI assistance, but through a clean chat panel integrated into the page layout -- not a floating widget. This is a separate, simpler variant of the same layout component.

---

## Phase 4 Specs (Prioritized)

---

### Spec 4A: Dashboard Layout Unification

**Objective:** Every Tech Mode dashboard page renders `DashboardRow1` (WelcomeCard + CRTWithAI) as a standard element. Remove `AIAssistantFloat`. Classic Mode gets a clean equivalent layout.

**Priority:** HIGHEST -- This is the foundation for all subsequent specs. Without layout unification, the AI Context Engine (4B) has no consistent entry point.

**Effort estimate:** 3-4 days

**Key files to create:**
- `features/tech/components/dashboard-page-layout.tsx` -- shared layout wrapper
- `features/classic/components/dashboard-page-layout.tsx` -- Classic Mode equivalent (simple header + optional AI panel)

**Key files to modify:**
- `features/tech/components/dashboard-row1.tsx` -- accept `pageContext` prop
- `features/tech/components/crt-with-ai.tsx` -- accept and forward `pageContext` to chat
- `app/[locale]/(dashboard)/dashboard/page.tsx` -- refactor to use DashboardPageLayout
- `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` -- remove standalone CRT instance, receive trigger callbacks from parent layout
- `app/[locale]/(dashboard)/dashboard/skills/page.tsx` -- use DashboardPageLayout
- `app/[locale]/(dashboard)/dashboard/timeline/page.tsx` -- wrap in DashboardPageLayout
- `app/[locale]/(dashboard)/dashboard/projects/page.tsx` -- wrap in DashboardPageLayout
- `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` -- wrap in DashboardPageLayout
- `app/[locale]/(dashboard)/dashboard/gallery/page.tsx` -- wrap in DashboardPageLayout (Classic)
- `app/[locale]/(dashboard)/dashboard/services/page.tsx` -- wrap in DashboardPageLayout (Classic)
- `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx` -- wrap in DashboardPageLayout (Classic)

**Key file to delete:**
- `features/tech/components/ai-assistant-float.tsx`
- Remove `AIAssistantFloat` usage from dashboard layout file

**Data requirements:** Each page's server component must call `getUserDashboardStats(userId)` and pass stats to `DashboardPageLayout`. This call is already cached via `unstable_cache` with tag invalidation, so the cost of calling it on every page is near-zero after first load.

**Acceptance criteria:**
1. Every Tech Mode dashboard page shows WelcomeCard + CRTWithAI in the top row
2. The CRTWithAI instance receives `pageContext` indicating which page is active
3. The AIAssistantFloat component is deleted
4. Classic Mode pages show a clean header with page title, user greeting, and profile completion bar -- no CRT
5. The CRT chat on each page includes a system message identifying the active page (e.g., "User is currently on the Skills page")
6. XP/life/searching trigger callbacks work from any page (e.g., GitHub sync on skills page still triggers the correct AIEye animation)
7. No visual regression on the main dashboard page (which already has DashboardRow1)

**Dependencies:** None -- this is the foundation.

---

### Spec 4B: AI Context Engine

**Objective:** Give the AI real-time context about the user's portfolio data and the page they are on. Enable the AI to read AND write portfolio data through tool calls.

**Priority:** HIGH -- This transforms the AI from a generic chatbot into a portfolio assistant.

**Effort estimate:** 5-7 days

**The problem today:**

The `/api/chat` route has four tools:
1. `add_experience` -- can add a new experience
2. `add_skill` -- can add a new skill
3. `get_portfolio_data` -- retrieves skills only (not projects, bio, experiences, GitHub data)
4. `get_skill_tree` -- retrieves skills with detail

The AI cannot:
- Read the user's bio, projects, or experiences
- Read GitHub sync data (repos, languages, commit activity)
- Read assessment results
- Update or edit existing records (only create)
- Suggest edits to existing content (e.g., "your React project description could be more impactful")
- Know what page the user is on

**Architecture:**

```
app/api/chat/route.ts
  |
  +-- Context Loader (new)
  |     Reads user's full portfolio snapshot:
  |     - bio, name, headline
  |     - skills (with levels, GitHub validation, assessment results)
  |     - projects (with descriptions, tech stack, URLs)
  |     - experiences (with dates, companies, descriptions)
  |     - GitHub data (repos, languages, sync date)
  |     - assessment history (passed skills, scores)
  |     - portfolio settings (mode, sections, theme)
  |
  +-- Page-Aware System Prompt (new)
  |     Base prompt + page-specific instructions:
  |     - Skills page: "User is viewing their skill tree. Suggest new skills, learning resources."
  |     - Timeline page: "User is editing their work history. Help improve descriptions."
  |     - Projects page: "User is managing projects. Suggest descriptions, tech stacks."
  |     - Portfolio page: "User is customizing their public portfolio. Suggest layout improvements."
  |
  +-- Extended Tool Registry (new)
        Existing:
        - add_skill, add_experience, get_skill_tree, get_portfolio_data
        New read tools:
        - get_projects: all user projects with details
        - get_experiences: all experiences with descriptions
        - get_profile: bio, headline, image, social links
        - get_github_data: repos, languages, validation results
        - get_assessment_history: per-skill assessment results
        - get_portfolio_health: computed score + suggestions
        New write tools:
        - update_bio: update user bio text
        - update_project_description: edit a specific project's description
        - update_experience_description: edit a specific experience's description
        - suggest_skills: return AI-suggested skills for user to accept/reject
```

**Key files to create:**
- `features/ai/services/contextLoader.service.ts` -- aggregates full user portfolio snapshot
- `features/ai/constants/pagePrompts.ts` -- page-specific system prompt augmentations
- `features/ai/tools/readTools.ts` -- new read-only tool definitions
- `features/ai/tools/writeTools.ts` -- new write tool definitions (update operations)

**Key files to modify:**
- `app/api/chat/route.ts` -- integrate context loader, page-aware prompts, extended tool registry
- `features/tech/components/crt-with-ai.tsx` -- send `pageContext` in chat body

**Data files to leverage (already exist):**
- `features/skills/data/getUserSkills.data.ts`
- `features/dashboard/data/getUserDashboardStats.data.ts`
- `features/portfolio/data/getPortfolioData.data.ts`
- `features/github/data/getGitHubData.data.ts`

**Performance consideration:** The context loader should NOT dump all portfolio data into every system prompt. That wastes tokens. Instead:
1. A lightweight summary (skill count, project count, completion %) goes into the system prompt always
2. Detailed data is retrieved on-demand via tool calls
3. The page context tells the AI which tools are most relevant, reducing unnecessary tool calls

**Cost estimation:**
- Current chat cost per message: ~$0.002 (Gemini 2.0 Flash)
- With context summary in system prompt: ~$0.003 per message (50% more tokens)
- Tool calls are free (no extra AI call, just DB reads)
- Budget impact: negligible at current scale

**Acceptance criteria:**
1. AI can answer "what skills do I have?" by calling `get_skill_tree` (already works)
2. AI can answer "what projects do I have?" by calling `get_projects` (NEW)
3. AI can answer "how complete is my portfolio?" by calling `get_portfolio_health` (NEW)
4. AI can say "your React project description could be more impactful, want me to rewrite it?" and execute `update_project_description` with user confirmation (NEW)
5. AI knows the current page and adjusts its suggestions accordingly
6. AI references GitHub validation data when discussing skills
7. AI references assessment results when suggesting learning paths
8. Write operations require explicit user confirmation in the chat before executing

**Dependencies:** Spec 4A (layout unification provides the `pageContext` channel)

---

### Spec 4C: CV Generator

**Objective:** Generate downloadable CVs/resumes from portfolio data, optimized for specific job descriptions.

**Priority:** HIGH -- This is the single feature that most clearly converts "portfolio builder" into "career tool." Every user who has filled out their portfolio has enough data to generate a CV. This creates immediate tangible value.

**Effort estimate:** 7-10 days

**User flow:**

```
Dashboard --> CV Generator page (new)
  1. User sees their portfolio data pre-loaded
  2. User optionally pastes a job description (for ATS optimization)
  3. User clicks "Generate CV"
  4. AI generates a structured CV using portfolio data + CV improvement prompts
  5. User previews the CV
  6. User can request specific improvements:
     - "Make bullets more impactful" (prompt #3 from CV_IMPROVEMENT_PROMPTS.md)
     - "Optimize for ATS" (prompt #2)
     - "Find keyword gaps" (prompt #4)
     - "Detect weaknesses" (prompt #5)
     - "Highlight my competitive advantage" (prompt #6)
  7. User downloads as PDF
  8. User can save multiple CV versions (per target job)
```

**Architecture:**

```
New page: app/[locale]/(dashboard)/dashboard/cv/page.tsx

Data layer:
  - model CVDocument in Prisma (userId, title, targetJob, content JSON, jobDescription, createdAt, updatedAt)
  - features/cv/data/getCVs.data.ts
  - features/cv/data/createCV.data.ts

Service layer:
  - features/cv/services/generateCV.service.ts -- orchestrates AI generation from portfolio data
  - features/cv/services/analyzeCV.service.ts -- runs improvement prompts (from CV_IMPROVEMENT_PROMPTS.md)
  - features/cv/services/exportCV.service.ts -- renders CV to PDF (using @react-pdf/renderer or similar)

Action layer:
  - features/cv/actions/generateCV.action.ts
  - features/cv/actions/analyzeCV.action.ts
  - features/cv/actions/deleteCV.action.ts

Components:
  - features/cv/components/CVGeneratorView.tsx -- main client component
  - features/cv/components/CVPreview.tsx -- rendered CV preview
  - features/cv/components/CVAnalysisPanel.tsx -- shows improvement suggestions
  - features/cv/components/JobDescriptionInput.tsx -- paste target JD
```

**AI prompts (from CV_IMPROVEMENT_PROMPTS.md, already curated):**
1. Reality Check -- "why am I not getting interviews?"
2. ATS Optimization -- keyword integration for applicant tracking systems
3. Impact Improvement -- convert responsibilities to measurable achievements
4. Keyword Gap Analysis -- compare CV vs job description
5. Weakness Detection -- employment gaps, red flags, inconsistencies
6. Competitive Differentiation -- unique value proposition

**Integration with existing data:**
- Bio -> CV Professional Summary
- Skills (filtered by validation/assessment) -> CV Skills section, sorted by credibility
- Experiences -> CV Work Experience section, with AI-improved bullet points
- Projects -> CV Projects section (top 3-5)
- GitHub data -> can mention "X repos, Y stars, Z contributions" in summary

**Key decision: PDF generation.**
Options:
1. `@react-pdf/renderer` -- React component-based PDF generation, server-side
2. Puppeteer/Playwright -- render HTML to PDF (heavier but more flexible)
3. Client-side `html2pdf.js` -- simpler but less control

Recommendation: `@react-pdf/renderer` for MVP. It runs server-side, produces clean PDFs, and the CV template is a React component (easy to maintain).

**Cost estimation:**
- CV generation (full portfolio -> structured CV): ~$0.01 per generation
- Each improvement analysis: ~$0.016 per analysis (from CV_IMPROVEMENT_PROMPTS.md estimates)
- Total per user per CV: ~$0.05-0.10
- For 1000 users generating 2 CVs/month: ~$100-200/month

**Acceptance criteria:**
1. User can generate a CV from their portfolio data with one click
2. CV includes: Professional Summary, Skills, Work Experience, Projects, Education
3. User can paste a job description and get an ATS-optimized version
4. At least 3 improvement analyses are available (Impact, ATS, Keyword Gap)
5. User can download the CV as PDF
6. User can save multiple CV versions with different target jobs
7. CV uses real validated skills (GitHub + assessment results affect which skills are highlighted)
8. Classic Mode users can also generate CVs (different template styling)
9. CRT AI integration: user can ask "generate a CV for a Senior React role" in the chat and the AI initiates the flow

**Dependencies:** Spec 4B (AI Context Engine provides the portfolio data aggregation that CV generation needs). However, the data aggregation portion can be built in parallel.

---

### Spec 4D: Skill Enhancement System

**Objective:** When the AI detects a low-level or unvalidated skill, proactively suggest learning resources, related technologies, and documentation. Turn the skill tree from a static display into an active learning guide.

**Priority:** MEDIUM-HIGH -- This is the feature that creates daily return visits. A static portfolio is visited once and forgotten. A portfolio that tells you "here is how to get better at React -- and here are 3 resources" brings users back.

**Effort estimate:** 5-7 days

**Concept:**

```
User has: React (Intermediate, self-assessed, no GitHub validation)

AI suggests:
  1. "Validate your React skills by connecting GitHub" (if not connected)
  2. "Take the React assessment to earn a Verified badge" (if assessment available)
  3. "Related skills you might want to add: Next.js, TypeScript, Testing Library"
  4. "Resources to level up React:"
     - Video: "React Patterns 2026" (YouTube, 45 min)
     - Article: "Advanced React Patterns" (Kent C. Dodds)
     - Course: "Epic React" (epicreact.dev)
  5. "Your React level is Intermediate. To reach Advanced, focus on:
     performance optimization, custom hooks architecture, server components."
```

**Architecture:**

```
features/skill-enhancement/
  services/
    suggestRelatedSkills.service.ts    -- AI suggests related technologies
    suggestResources.service.ts        -- AI suggests learning resources
    analyzeSkillGaps.service.ts        -- compare user skills to market trends
  components/
    SkillEnhancementPanel.tsx          -- shows suggestions for selected skill
    RelatedSkillsCarousel.tsx          -- horizontal scroll of related skill cards
    LearningResourceCard.tsx           -- resource card (video/article/course)
  types/
    enhancement.ts                     -- SkillSuggestion, LearningResource types
```

**Integration points:**
- Skills dashboard page: show `SkillEnhancementPanel` when user clicks a skill hexagon
- CRT AI chat: tool `suggest_learning_path` that returns personalized recommendations
- Assessment results page: after passing/failing, show related resources

**AI approach:**
- Use Gemini to generate suggestions on-demand (not pre-cached)
- System prompt includes user's current skill tree for context
- Suggestions are ephemeral (not stored in DB) but can be saved to a "Learning Queue" (future feature)

**Resource sourcing:**
- MVP: AI generates resource suggestions from its training data (URLs may not be current)
- V2: Integrate with YouTube Data API to verify video URLs exist
- V3: Curated resource database maintained by the team

**Cost estimation:**
- Per skill enhancement request: ~$0.005 (small prompt, Gemini Flash)
- Users typically check 2-3 skills per session
- For 1000 users, 3x/week: ~$60-90/month

**Acceptance criteria:**
1. Clicking a skill hexagon shows an enhancement panel with: validation status, related skills, and learning resources
2. AI suggests 3-5 related technologies for any given skill
3. AI suggests 3-5 learning resources (mix of free and paid)
4. Resources include type (video/article/course), estimated time, and why it is relevant
5. CRT AI chat can answer "how do I improve my React skills?" with personalized suggestions
6. Enhancement panel shows assessment CTA if the skill is assessment-eligible
7. Enhancement panel shows GitHub validation CTA if GitHub is not connected

**Dependencies:** Spec 4A (layout unification), Spec 4B (AI Context Engine for skill tree access). Can be developed in parallel with 4C.

---

### Spec 4E: Quest System

**Objective:** Extend the assessment concept into a broader "quest" system with daily/weekly missions that guide users to improve their portfolio and skills.

**Priority:** MEDIUM -- This builds retention but requires the foundation from 4A-4D to be meaningful. A quest system without AI context or skill enhancement is just a todo list.

**Effort estimate:** 7-10 days

**Concept:**

The current `ActiveMissionsPanel` on the dashboard is hardcoded placeholder data. This spec replaces it with a real quest engine.

**Quest types:**

```typescript
type QuestCategory =
  | "portfolio_completion"   // Fill out your bio, add 3 projects, etc.
  | "skill_validation"       // Connect GitHub, take assessment, add related skill
  | "content_improvement"    // Improve a project description, add metrics to experience
  | "consistency"            // Login streak, update portfolio weekly
  | "exploration"            // Try a new feature, visit your public portfolio

interface Quest {
  id: string
  category: QuestCategory
  title: string          // "Complete your About section"
  description: string    // "Write a 2-3 sentence bio..."
  xpReward: number       // 50-300 XP
  difficulty: "easy" | "medium" | "hard"
  type: "daily" | "weekly" | "one_time"
  condition: QuestCondition  // programmatic check for completion
  expiresAt?: Date       // for daily/weekly quests
}
```

**Quest generation:**
- One-time quests: generated from portfolio completion gaps (no bio? quest to write one)
- Daily quests: 3 per day, drawn from a pool, weighted by what the user has NOT done
- Weekly quests: 1 per week, more substantial (e.g., "take an assessment", "improve 3 project descriptions")

**Architecture:**

```
features/quests/
  constants/
    questPool.ts               -- static pool of quest templates
  data/
    getActiveQuests.data.ts     -- fetch user's current quests
    getCompletedQuests.data.ts  -- history
  services/
    questEngine.service.ts      -- generates quests based on user state
    checkQuestCompletion.service.ts  -- evaluates conditions
    completeQuest.service.ts    -- awards XP, marks complete
  actions/
    refreshQuests.action.ts     -- triggers daily quest rotation
    claimQuestReward.action.ts  -- user claims XP for completed quest
  components/
    QuestPanel.tsx              -- replaces ActiveMissionsPanel
    QuestCard.tsx               -- individual quest display
    QuestCompletionToast.tsx    -- celebration on completion
  types/
    quest.ts
```

**DB model:**

```prisma
model Quest {
  id          String   @id @default(cuid()) @map("_id")
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  templateId  String
  type        String   // "daily" | "weekly" | "one_time"
  status      String   @default("active")  // "active" | "completed" | "expired"
  xpReward    Int
  completedAt DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())

  @@index([userId, status])
  @@map("quests")
}
```

**Integration with existing systems:**
- `ActiveMissionsPanel` (currently hardcoded) -> replaced by `QuestPanel`
- XP system (from Phase 3C) -> quests award XP on completion
- Assessment system -> "Take a React assessment" is a quest type
- GitHub sync -> "Connect GitHub and validate 3 skills" is a quest type
- CRT AI -> AI proactively mentions available quests: "You have a daily quest to improve your bio. Want help?"

**Acceptance criteria:**
1. Users receive 3 daily quests and 1 weekly quest
2. Quest completion auto-detects when condition is met (e.g., bio is no longer empty)
3. Completing a quest awards XP and shows a celebration toast
4. Quests rotate daily (3 new quests at midnight UTC)
5. One-time quests are generated from portfolio completion gaps
6. `ActiveMissionsPanel` on dashboard shows real quest data
7. CRT AI is aware of active quests and can reference them in conversation
8. Expired quests are marked but do not penalize the user

**Dependencies:** Spec 4A (layout), Spec 4B (AI context to reference quests in chat). Quest condition checking depends on the same data layer used by the AI Context Engine.

---

### Spec 4F: Skill Icons and Visual Polish

**Objective:** Replace text/emoji skill representations with real technology icons. Fix visual bugs in hexagon overlapping. Polish timeline hexagon overlaps.

**Priority:** MEDIUM -- This is pure visual quality. It does not add functionality but significantly improves perceived quality. A portfolio with real React/TypeScript/Docker icons looks professional; one with text or generic emojis looks like a prototype.

**Effort estimate:** 3-5 days

**Skill icons approach:**

```
Option 1: Devicon (devicon.dev)
  - 500+ tech icons, SVG, free
  - Self-hosted or CDN
  - Cover: languages, frameworks, tools, databases
  - Missing: soft skills, non-tech skills

Option 2: Simple Icons (simpleicons.org)
  - 3000+ brand icons
  - npm package: `simple-icons`
  - Broader coverage but less "developer" focused

Option 3: Hybrid
  - Devicon for known tech skills (React, Python, Docker, etc.)
  - Lucide icons for generic categories (soft skills, tools, etc.)
  - Fallback: first 2 letters of skill name in monospace

Recommendation: Option 3 (Hybrid)
```

**Implementation:**

```typescript
// features/skills/constants/skillIcons.ts
// Map skill slugs to icon identifiers

const SKILL_ICON_MAP: Record<string, { source: 'devicon' | 'lucide' | 'text'; icon: string }> = {
  'react':      { source: 'devicon', icon: 'devicon-react-original' },
  'typescript': { source: 'devicon', icon: 'devicon-typescript-plain' },
  'python':     { source: 'devicon', icon: 'devicon-python-plain' },
  'docker':     { source: 'devicon', icon: 'devicon-docker-plain' },
  'nextjs':     { source: 'devicon', icon: 'devicon-nextjs-original' },
  // ... 50+ mappings

  // Fallback for unmapped skills
  'default':    { source: 'text', icon: '' },  // uses first 2 chars
}
```

**Visual bugs to fix:**

1. **Hexagon overlaps on zoom out (Skills page):** The `SkillTreeView` uses absolute positioning with fixed pixel coordinates. At lower zoom levels, hexagons overlap because the spacing does not scale with zoom. Fix: use CSS transform scale on the container, or recalculate positions based on zoom level.

2. **Timeline hexagon overlaps:** Similar issue -- hexagonal markers on the timeline overlap when too many entries are close in date. Fix: collision detection in the layout algorithm, push overlapping nodes apart.

3. **Skill tree edge case:** When a user has 20+ skills, the tree becomes too dense. Consider: group by category with expandable clusters, or switch to a grid view at high density.

**Key files to modify:**
- `features/skills/components/SkillTreeView.tsx` -- hexagon positioning, zoom scaling
- `features/skills/components/SkillHexagonNode.tsx` -- add icon rendering
- `features/skills/constants/skillIcons.ts` -- NEW: icon mapping
- `features/timeline/components/TimelineView.tsx` -- fix hexagon overlap
- `features/tech/components/hex-badge.tsx` -- support icon content

**Acceptance criteria:**
1. Top 50 tech skills show real Devicon SVG icons inside hexagons
2. Skills without mapped icons show the first 2 characters of the skill name
3. Hexagon overlap on zoom out is fixed (skills tree)
4. Timeline hexagon overlap is fixed
5. Icons load without layout shift (proper dimensions, fallback)
6. Icons work in both the skill tree and the portfolio public view
7. Dark mode compatibility (icons are visible on dark backgrounds)

**Dependencies:** None -- this is independent of AI specs and can be parallelized.

---

### Spec 4G: Portfolio View Options

**Objective:** Give users control over how their public portfolio is displayed. Currently the portfolio is section-based with navigation. Add options for one-page scroll, minimal card view, and layout customization.

**Priority:** LOW-MEDIUM -- Important for product differentiation but lower urgency than AI features. The current portfolio view works; this makes it better.

**Effort estimate:** 5-7 days

**View options:**

```typescript
type PortfolioViewMode =
  | "sections"      // Current: tabbed/navigated sections (default)
  | "one_page"      // Single scrollable page, all sections visible
  | "minimal"       // Card-style: name, bio, top skills, links only
  | "full_terminal" // Tech Mode only: entire portfolio in CRT/terminal aesthetic
```

**Implementation approach:**
- Add `viewMode` to `PortfolioSettings` in the User model
- Create a `PortfolioViewSelector` component in dashboard portfolio settings
- Each view mode is a separate template component in `features/portfolio/components/templates/`
- `PortfolioLayout.tsx` reads `viewMode` and renders the appropriate template

**Key files to create:**
- `features/portfolio/components/templates/OnePageTemplate.tsx`
- `features/portfolio/components/templates/MinimalTemplate.tsx`
- `features/portfolio/components/templates/TerminalTemplate.tsx` (Tech Mode only)

**Key files to modify:**
- `features/portfolio/components/PortfolioLayout.tsx` -- view mode routing
- `features/portfolio/types/portfolio.ts` -- add `viewMode` to settings type
- Dashboard portfolio settings page -- add view mode selector

**Acceptance criteria:**
1. User can choose between at least 3 view modes from dashboard settings
2. "One Page" mode shows all sections in a single scrollable page
3. "Minimal" mode shows a clean card with name, bio, top 5 skills, and social links
4. View mode selection persists and is reflected on the public portfolio
5. Tech Mode users have access to a "Terminal" view mode
6. Classic Mode users have access to "Sections" and "One Page" modes

**Dependencies:** None -- independent of AI features.

---

### Spec 4H: Theme System (Make Themes Actually Work)

**Objective:** The theme selector in Classic Mode already exists in the dashboard UI and saves to DB — but does nothing to the public portfolio. This spec makes themes functional for Classic Mode and evaluates Tech Mode variants.

**Priority:** MEDIUM — Affects visual differentiation and user satisfaction. Classic Mode users who select "Warm Cream" and see no change on their portfolio will be confused.

**Effort estimate:** 3-4 days

**Current state:**

Classic Mode has 4 presets defined in `features/portfolio-settings/constants/themes.ts`:

```typescript
// Already defined:
const THEMES = {
  default:      { bg: '#ffffff',  accent: '#2563eb', text: '#111827' },
  warm:         { bg: '#fdf8f0',  accent: '#d97706', text: '#1c1917' },
  'dark-elegant': { bg: '#030712', accent: '#ca8a04', text: '#f9fafb' },
  ocean:        { bg: '#f8fafc',  accent: '#0d9488', text: '#0f172a' },
}
```

The user selects a theme in `DashboardPortfolioView`. It saves to `PortfolioSettings.theme` in DB. The public portfolio components (`ClassicHero`, `ClassicAbout`, etc.) **never read this field** — they all use hardcoded Tailwind classes.

Tech Mode has no theme system. Palette is fixed: `#00D4FF` on `#0A0E1A`.

**Implementation plan:**

**Step 1: Apply themes to Classic portfolio (CSS variables approach)**

In the Classic portfolio layout root, inject CSS variables from the resolved theme:

```tsx
// features/portfolio/components/classic/ClassicLayout.tsx
export function ClassicLayout({ portfolioData }) {
  const theme = resolveTheme(portfolioData.settings?.theme ?? 'default')

  return (
    <div
      style={{
        '--theme-bg':     theme.bg,
        '--theme-accent': theme.accent,
        '--theme-text':   theme.text,
      } as React.CSSProperties}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
    >
      {children}
    </div>
  )
}
```

Classic components replace hardcoded colors (`text-blue-600`, `bg-white`) with CSS variable references or a `themeClasses(theme)` utility (similar to the existing `modeClasses()` pattern).

**Step 2: Tech Mode — evaluate and decide**

Tech Mode's fixed palette is a design identity choice, not a limitation. However, controlled variants are reasonable:

```typescript
type TechTheme = 'default' | 'plasma' | 'matrix'
// default: cyan   #00D4FF on #0A0E1A  (current)
// plasma:  magenta #D946EF on #0A0E1A (magenta-dominant)
// matrix:  green   #00FF41 on #0A0E1A (green terminal)
```

Decision: **Add Tech Mode themes but keep them as accent-color variants only** — background and structure stay the same. This preserves the Tech identity while giving personalisation. The `--theme-accent` variable replaces hardcoded `hsl(174,100%,50%)` references in Tech components.

**Step 3: Classic Mode — add more presets + optional custom color**

Add 2 more presets to reach 6 total: "Midnight" (dark navy) and "Forest" (green-tinted). Custom hex color picker is Phase 5.

**Key files to create:**
- `features/portfolio-settings/utils/resolveTheme.ts` — maps theme string to CSS variable values
- `features/portfolio/components/classic/ClassicLayout.tsx` — new wrapper that injects CSS vars

**Key files to modify:**
- `features/portfolio/components/classic/ClassicHero.tsx` — use CSS vars instead of hardcoded colors
- `features/portfolio/components/classic/ClassicAbout.tsx` — same
- (all 10 Classic components)
- `features/portfolio-settings/constants/themes.ts` — add 2 new Classic presets + 3 Tech variants
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` — add Tech theme picker (currently only Classic has one)
- `features/portfolio/data/getPortfolioData.data.ts` — confirm `theme` is included in the query (verify)

**Acceptance criteria:**
1. Selecting "Warm" in Classic Mode actually renders the public portfolio with `#fdf8f0` background and `#d97706` accents
2. All 4 existing Classic presets work end-to-end (select → save → public portfolio reflects)
3. Tech Mode has 3 accent variants selectable from dashboard
4. Tech accent variant applies to: CRT borders, hexagon fills, badge colors, button highlights
5. Theme change is visible without a page reload (revalidation triggers immediately)
6. Classic "dark-elegant" theme has proper contrast ratios for accessibility (WCAG AA)
7. Theme selector in dashboard shows a visual preview of each option

**Dependencies:** None — independent of AI specs. Can be parallelized with 4F and 4G.

---

## Backlog (Phase 5+)

These ideas have value but are not in Phase 4. They should be re-evaluated after Phase 4 ships and real user feedback is collected.

| Idea | Source doc | Reason for deferral |
|------|-----------|---------------------|
| **Mock Interviews** | AI_SKILL_ASSESSMENT_GAME.md | High complexity, requires voice/video, low-confidence demand signal |
| **Career Coaching dashboard** | AI_SKILL_ASSESSMENT_GAME.md | Depends on having enough user data to be useful |
| **Leaderboards** | ROADMAP_V2.md, AI_SKILL_ASSESSMENT_GAME.md | Requires active user base; empty leaderboard is worse than no leaderboard |
| **Portfolio Analytics** (views, clicks) | ROADMAP_V2.md | Requires subdomain analytics infrastructure (Vercel Analytics or custom) |
| **Classic Mode templates** (photographer, designer, writer) | TWO_MODE_STRATEGY.md | Good idea but requires user research to know which templates matter |
| **SEO Meta Generator** | AI_USE_CASES.md | Quick win but low retention impact |
| **Achievement Copy Generator** | AI_USE_CASES.md | Polish feature, low priority |
| **GitHub package.json detection** | ROADMAP_V2.md | Enhancement to GitHub validation, valuable but not urgent |
| **Behance/Dribbble/YouTube integration** | TWO_MODE_STRATEGY.md | Extends Gaming Mode to non-dev digital creators; requires API work per platform |
| **Auto-suggest skills from bio** (Classic Mode) | AI_USE_CASES.md | Nice onboarding UX, low complexity, good Phase 5 quick win |
| **Gridcn/Glitchcn adoption** | ROADMAP_V2.md | Evaluate after visual polish in 4F; may not be needed if existing components are sufficient |
| **Community-contributed assessment questions** | AI_SKILL_ASSESSMENT_GAME.md | Requires moderation infrastructure |
| **Freemium/Pro pricing** | CV_IMPROVEMENT_PROMPTS.md, AI_SKILL_ASSESSMENT_GAME.md | Premature without user base; implement when AI costs justify it |

---

## Implementation Order and Dependencies

```
                    +-----------+
                    |   4A      |
                    | Layout    |
                    | Unification|
                    +-----+-----+
                          |
                    +-----v-----+
                    |   4B      |
                    | AI Context|
                    | Engine    |
                    +-----+-----+
                          |
              +-----------+-----------+
              |                       |
        +-----v-----+          +-----v-----+
        |   4C      |          |   4D      |
        | CV        |          | Skill     |
        | Generator |          | Enhancement|
        +-----------+          +-----------+
              |                       |
              +-----------+-----------+
                          |
                    +-----v-----+
                    |   4E      |
                    | Quest     |
                    | System    |
                    +-----------+

    PARALLEL (no dependencies):

        +-----------+          +-----------+          +-----------+
        |   4F      |          |   4G      |          |   4H      |
        | Skill     |          | Portfolio |          | Theme     |
        | Icons     |          | View      |          | System    |
        +-----------+          +-----------+          +-----------+
```

**Recommended execution order:**

| Sprint | Spec | Duration | Parallelizable with |
|--------|------|----------|---------------------|
| Sprint 1 | 4A: Layout Unification | 3-4 days | 4F, 4G, 4H (all independent) |
| Sprint 1 | 4F: Skill Icons & Visual Polish | 3-5 days | 4A, 4G, 4H |
| Sprint 1 | 4H: Theme System | 3-4 days | 4A, 4F, 4G |
| Sprint 2 | 4B: AI Context Engine | 5-7 days | 4G: Portfolio View Options |
| Sprint 2 | 4G: Portfolio View Options | 5-7 days | 4B |
| Sprint 3 | 4C: CV Generator | 7-10 days | 4D: Skill Enhancement (after 4B) |
| Sprint 3 | 4D: Skill Enhancement | 5-7 days | 4C (after 4B) |
| Sprint 4 | 4E: Quest System | 7-10 days | -- |

**Total estimated time:** 7-9 weeks with up to 3 parallel work streams in Sprint 1.

**Who does what:**
- Opus: Writes detailed spec + tasks.md for each spec before Sonnet starts
- Sonnet: Implements tasks from spec
- Opus: Reviews completed work, adjusts course
- User: Reviews PRs, provides product direction

---

## Pre-Phase 4 Cleanup (from Health Check 2026-03-05)

Before starting Phase 4 implementation, complete these items from the health check. They are quick fixes that reduce confusion during Phase 4 work.

**Must complete (1-2 day sprint):**

| Item | Effort | File(s) |
|------|--------|---------|
| Delete `app/api/dev-cleanup/route.ts` + debug scripts | 5 min | `app/api/dev-cleanup/`, `scripts/cleanup-github-accounts.*` |
| Fix `revalidateTag` second argument `{}` in 14+ files | 30 min | grep for `revalidateTag.*{}` across codebase |
| Fix narrative cache keys `gaming`/`professional` -> `tech`/`classic` | 15 min | `features/ai-narrator/services/cache.service.ts` |
| Merge `(protected)` and `(dashboard)` route groups | 1-2 hours | Move main dashboard from `(protected)` to `(dashboard)`, add auth to `(dashboard)` layout |
| Fix `getAssessmentTokensData` daily reset bug | 30 min | `features/assessment/data/getAssessmentTokens.data.ts` |
| Remove `console.log` from `syncGitHub.service.ts` | 5 min | `features/github/services/syncGitHub.service.ts` |
| Clean root-level debug files | 10 min | `DASHBOARD_POLISH_PLAN.md`, `dev.log`, `recordatorio.md`, `test-auth-api.ts`, `seed-categories.js` |

**Should complete (but not blocking):**

| Item | Effort | File(s) |
|------|--------|---------|
| Extract shared `ImproveWithAIButton` from duplicates | 1 hour | `features/ai/components/Improve*.tsx` |
| Create `UserMeta` TypeScript interface | 2-3 hours | Used across `ai-quota`, `assessment`, `ai-narrator` |
| Extract shared `DailyTokenManager` utility | 1-2 hours | `features/ai-quota/services/`, `features/assessment/services/` |
| Internal "gaming" naming in `features/tech/index.tsx` | 30 min | Rename internal variants |

---

## Success Metrics for Phase 4

### Core engagement metrics

| Metric | Target | How to measure |
|--------|--------|----------------|
| **AI chat usage rate** | >50% of active users use chat weekly | Count unique users with >1 chat message per week |
| **CRT interaction rate** | >70% of page views include a CRT interaction | Track CRT expand/message events per page view |
| **CV generation** | >30% of users generate at least 1 CV | Count unique users with CV documents |
| **Skill enhancement clicks** | >40% of skill views result in enhancement panel open | Track panel opens per skill hexagon click |
| **Quest completion rate** | >60% of daily quests completed | Completed quests / assigned quests |
| **Return visits** | >3 sessions per week per active user | Session tracking |

### Quality metrics

| Metric | Target | How to measure |
|--------|--------|----------------|
| **AI response relevance** | >80% of AI suggestions are accepted or edited (not dismissed) | Track accept/edit/dismiss on AI-suggested actions |
| **CV download rate** | >60% of generated CVs are downloaded as PDF | Download events / generation events |
| **Portfolio completion** | >70% of users have 5+ skills, bio, and 2+ projects | Query DB for completion thresholds |

### Technical metrics

| Metric | Target | How to measure |
|--------|--------|----------------|
| **AI response latency** | <3s for non-streaming, <500ms to first token for streaming | Server-side timing |
| **CRT render performance** | <16ms frame time (60fps) on mid-range devices | Lighthouse, Chrome DevTools |
| **AI cost per active user/month** | <$0.50 | Total Gemini API cost / active users |

---

## Appendix: Key Architecture Decisions

### Why Gemini Flash and not Claude/GPT-4

The project uses Gemini 2.0 Flash via the Vercel AI SDK. At current scale (pre-launch), the cost difference is not significant. The real reasons:
1. Gemini 2.0 Flash is 10-20x cheaper than Claude Sonnet for the same quality on structured generation tasks (assessments, CV analysis)
2. The Vercel AI SDK abstracts the provider -- switching to a different model later requires changing 1 line
3. For the AI Context Engine (Spec 4B), the model needs to be fast (tool calls add latency). Flash is the fastest option.

If quality becomes insufficient for CV generation or assessment evaluation, consider Claude Haiku or Sonnet for those specific endpoints while keeping Flash for chat.

### Why not a separate AI microservice

All AI features run inside the Next.js app (`/api/chat`, server actions). At current scale, this is correct. A separate AI service adds deployment complexity, cold start latency, and operational overhead for zero benefit. Revisit when:
- AI costs exceed $500/month
- Response latency exceeds SLA
- Multiple frontend clients need AI access

### Why page-aware tools instead of always-available tools

The AI Context Engine could expose ALL tools on every page. But this causes two problems:
1. More tools = more system prompt tokens = higher cost and latency
2. The AI may call irrelevant tools (suggesting skill additions when user is editing timeline)

Page-aware tool filtering keeps the AI focused. The base tools (get_portfolio_health, get_profile) are always available. Page-specific tools (get_skill_tree on skills page, get_experiences on timeline page) are added based on `pageContext`.

---

**This roadmap supersedes ROADMAP_V2.md. Next action: create spec + tasks.md for Spec 4A (Dashboard Layout Unification) and begin the pre-Phase 4 cleanup sprint.**
