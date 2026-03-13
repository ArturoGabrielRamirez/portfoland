# Spec 4C: CV Generator

**Status:** Ready for implementation
**Branch:** `feat/phase4-ai-portfolio-os`
**Dependencies:** Spec 4B (completed)
**Estimated effort:** 7-10 days

---

## Problem

Portfoland users fill out their portfolio (skills, experiences, projects, bio, GitHub data) but have no way to convert that into a downloadable CV/resume. The platform captures career data but doesn't produce the artifact most immediately useful for job seekers: a tailored CV.

Additionally, `CV_IMPROVEMENT_PROMPTS.md` contains 6 curated, production-ready AI prompts for CV analysis (Reality Check, ATS Optimization, Impact Improvement, Keyword Gap, Weakness Detection, Competitive Differentiation) that have never been implemented.

---

## Solution

Build a CV Generator page at `/dashboard/cv` that:
1. Aggregates the user's portfolio data into a structured CV
2. Lets the user optionally paste a job description for ATS optimization
3. Generates a CV using AI (Gemini Flash)
4. Offers 6 AI-powered improvement analyses
5. Renders a PDF preview and allows download
6. Saves multiple CV versions per target job

---

## Architecture

### New Prisma model

```prisma
model CVDocument {
  id             String   @id @default(cuid()) @map("_id")
  userId         String
  title          String
  targetJob      String?
  jobDescription String?
  content        Json     // Structured CV sections (see CVContent type)
  analysisResults Json?   // Cached analysis results
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### New files

| File | Type | Purpose |
|------|------|---------|
| `features/cv/types/cv.ts` | Types | CVContent, CVSection, CVAnalysisType, CVAnalysisResult |
| `features/cv/data/getCVs.data.ts` | Data | Fetch user's saved CVs |
| `features/cv/data/createCV.data.ts` | Data | Create/update CV document |
| `features/cv/data/deleteCV.data.ts` | Data | Delete CV document |
| `features/cv/services/generateCV.service.ts` | Service | Orchestrate AI CV generation from portfolio data |
| `features/cv/services/analyzeCV.service.ts` | Service | Run the 6 improvement prompts |
| `features/cv/services/exportCV.service.ts` | Service | Render CV to PDF using @react-pdf/renderer |
| `features/cv/actions/generateCV.action.ts` | Action | Server action wrapper for CV generation |
| `features/cv/actions/analyzeCV.action.ts` | Action | Server action wrapper for CV analysis |
| `features/cv/actions/deleteCV.action.ts` | Action | Server action wrapper for CV deletion |
| `features/cv/components/CVGeneratorView.tsx` | Component | Main client component (page orchestrator) |
| `features/cv/components/CVPreview.tsx` | Component | Rendered CV preview (HTML) |
| `features/cv/components/CVPdfDocument.tsx` | Component | React-PDF document template |
| `features/cv/components/CVAnalysisPanel.tsx` | Component | Shows improvement suggestions |
| `features/cv/components/JobDescriptionInput.tsx` | Component | Paste target job description |
| `features/cv/components/CVListSidebar.tsx` | Component | List of saved CV versions |
| `features/cv/constants/prompts.ts` | Constants | The 6 CV improvement prompts (from CV_IMPROVEMENT_PROMPTS.md) |
| `features/cv/schemas/cv.schema.ts` | Schema | Yup schemas for action validation |
| `app/[locale]/(dashboard)/dashboard/cv/page.tsx` | Page | Dashboard CV Generator page |

### Modified files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add CVDocument model + relation on User |
| `features/ai/constants/pagePrompts.ts` | Add `cv` page prompt |
| `features/tech/types/page-context.ts` | Add `"cv"` to PageContext union |
| `features/tech/components/dashboard-nav.tsx` | Add CV Generator nav item |
| `messages/en.json` + `messages/es.json` | Add CV-related translations |

---

## Detailed Design

### 1. CVContent Type

```typescript
// features/cv/types/cv.ts

export interface CVContent {
  professionalSummary: string
  skills: CVSkillSection
  workExperience: CVExperienceEntry[]
  education: CVExperienceEntry[]
  projects: CVProjectEntry[]
  certifications: CVExperienceEntry[]
  languages?: string[]
  metadata: {
    generatedAt: string
    targetJob?: string
    locale: string
    portfolioMode: string
  }
}

export interface CVSkillSection {
  // Grouped by category, sorted by validation level
  categories: Array<{
    name: string
    skills: Array<{
      name: string
      level: number // 1-5
      validated: boolean // GitHub or assessment validated
    }>
  }>
}

export interface CVExperienceEntry {
  title: string
  company: string
  startDate: string
  endDate: string | null
  description: string // AI-improved bullets
  type: string
}

export interface CVProjectEntry {
  title: string
  description: string
  technologies: string[]
  links: Array<{ label: string; url: string }>
  status: string
}

export type CVAnalysisType =
  | "reality_check"
  | "ats_optimization"
  | "impact_improvement"
  | "keyword_gap"
  | "weakness_detection"
  | "differentiation"

export interface CVAnalysisResult {
  type: CVAnalysisType
  score?: number // 0-100 where applicable
  issues: Array<{
    severity: "critical" | "warning" | "info"
    issue: string
    impact: string
    fix: string
  }>
  improvedContent?: Partial<CVContent> // Suggested rewrites
  keywords?: Array<{
    keyword: string
    found: boolean
    priority: "high" | "medium" | "low"
  }>
}
```

### 2. CV Generation Service

**File:** `features/cv/services/generateCV.service.ts`

Orchestrates CV generation from portfolio data:

```typescript
export async function generateCVService(
  userId: string,
  targetJob?: string,
  jobDescription?: string,
  locale: string = "en"
): Promise<{ cv: CVContent; title: string }>
```

**Steps:**
1. Fetch all portfolio data in parallel:
   - `getUserSkillsData(userId)` — skills with validation status
   - `getExperiencesByUserId(userId)` — work + education + certs
   - `getProjectsByUserIdData(userId)` — projects
   - `prisma.user.findUnique(...)` — bio, name, GitHub stats
   - `getGitHubConnectionStatus(userId)` — GitHub context
2. Build a CV generation prompt that includes:
   - All portfolio data as structured context
   - Target job title (if provided)
   - Job description (if provided, for ATS alignment)
   - Instructions for bilingual output (es/en based on locale)
3. Call `generateObject` from AI SDK with a Zod schema matching `CVContent`
   - Model: `gemini-2.0-flash`
   - This ensures structured JSON output, not free text
4. Save to DB as CVDocument
5. Return the structured CV

**Key decisions:**
- Use `generateObject` (not `generateText`) to get structured JSON matching the CVContent type
- Skills sorted by validation: GitHub-validated > assessment-passed > manual, then by level desc
- Projects limited to top 5 (featured first, then by status: COMPLETED > IN_PROGRESS)
- Professional summary generated from bio + skills + experience years + GitHub data
- If no bio exists, AI generates one from the portfolio data

**Portfolio → CV mapping:**
| Portfolio Data | CV Section |
|---------------|------------|
| `user.bio` | Professional Summary (AI-enhanced) |
| `userSkills` (validated first) | Skills section, grouped by category |
| `experiences` (type: WORK) | Work Experience |
| `experiences` (type: EDUCATION) | Education |
| `experiences` (type: CERTIFICATION) | Certifications |
| `projects` (top 5) | Projects |
| GitHub stats | Mentioned in Professional Summary |

### 3. CV Analysis Service

**File:** `features/cv/services/analyzeCV.service.ts`

Runs the 6 improvement prompts from `CV_IMPROVEMENT_PROMPTS.md`:

```typescript
export async function analyzeCVService(
  userId: string,
  cvContent: CVContent,
  analysisType: CVAnalysisType,
  jobDescription?: string,
  locale: string = "en"
): Promise<CVAnalysisResult>
```

Each analysis type has a dedicated prompt (stored in `features/cv/constants/prompts.ts`). The service:
1. Checks lives via `consumeLifeService`
2. Serializes `cvContent` to text format for the prompt
3. Calls `generateObject` with a Zod schema matching `CVAnalysisResult`
4. Returns structured analysis

**Analysis types:**

| Type | Requires JD | Output |
|------|------------|--------|
| `reality_check` | No | Issues list with severity + fixes |
| `ats_optimization` | Yes | Rewritten CV sections with keywords |
| `impact_improvement` | No | Rewritten bullets with metrics |
| `keyword_gap` | Yes | Missing keywords + suggestions |
| `weakness_detection` | No | Red flags + fixes |
| `differentiation` | Optional | Unique value proposition |

### 4. PDF Export Service

**File:** `features/cv/services/exportCV.service.ts`

Uses `@react-pdf/renderer` for server-side PDF generation:

```typescript
export async function exportCVtoPDF(
  cvContent: CVContent,
  userName: string,
  userEmail: string,
  template: "professional" | "minimal" = "professional"
): Promise<Buffer>
```

The PDF template is a React component (`CVPdfDocument.tsx`) that renders:
- Header: Name, email, contact links
- Professional Summary
- Skills (grouped, with validation badges in text: "React (GitHub validated)")
- Work Experience (reverse chronological)
- Projects (top 3-5)
- Education
- Certifications

**Template considerations:**
- `professional`: Clean, ATS-friendly layout (single column, no tables, standard fonts)
- `minimal`: Compact, one-page focused
- Both templates are mode-agnostic (no Tech/Classic styling — CVs should be professional)

### 5. Dashboard Page

**File:** `app/[locale]/(dashboard)/dashboard/cv/page.tsx`

Server component that:
1. Fetches user data via `getDashboardPageData`
2. Fetches saved CVs via `getCVsByUserId`
3. Renders `DashboardPageLayout` with `pageContext="cv"`
4. Renders `CVGeneratorView` with user data and saved CVs

### 6. CVGeneratorView Component

**File:** `features/cv/components/CVGeneratorView.tsx`

Main client component with these states:
- **Empty state**: No CVs yet → "Generate your first CV" CTA
- **Generator state**: Form with target job input + job description textarea + generate button
- **Preview state**: Shows generated CV with analysis options
- **Analysis state**: Shows analysis results with accept/reject per suggestion

**Layout (Tech Mode):**
```
┌─────────────────────────────────────────┐
│ CV Generator                            │
├───────────┬─────────────────────────────┤
│ Saved CVs │ [Target Job Input]          │
│           │ [Job Description Textarea]  │
│ • CV v1   │ [Generate CV]               │
│ • CV v2   │                             │
│           │ ┌─────────────────────────┐ │
│           │ │ CV Preview              │ │
│           │ │ (scrollable)            │ │
│           │ └─────────────────────────┘ │
│           │                             │
│           │ [Download PDF] [Analyze]    │
│           │                             │
│           │ ┌─────────────────────────┐ │
│           │ │ Analysis Panel          │ │
│           │ │ (collapsible)           │ │
│           │ └─────────────────────────┘ │
└───────────┴─────────────────────────────┘
```

Uses `modeClasses(portfolioMode)` for Tech/Classic adaptive styling.

### 7. CRT AI Integration

Add a new tool to the AI tool registry so users can ask the CRT to generate/analyze CVs:

```typescript
// In features/ai/tools/writeTools.ts (or a new cvTools.ts)
generate_cv: tool({
  description: "Generate a CV/resume from the user's portfolio data, optionally targeting a specific job.",
  parameters: z.object({
    targetJob: z.string().optional().describe("Target job title to optimize the CV for"),
    jobDescription: z.string().optional().describe("Full job description text for ATS optimization"),
  }),
  execute: async ({ targetJob, jobDescription }) => {
    const result = await generateCVService(userId, targetJob, jobDescription, locale)
    return {
      success: true,
      cvId: result.cvId,
      message: `CV generated for ${targetJob || 'general use'}. View it at /dashboard/cv`,
    }
  },
})
```

### 8. Navigation

Add CV Generator to the dashboard nav:
- Icon: `FileText` from lucide-react
- Label: "CV Generator" (en) / "Generador de CV" (es)
- Route: `/dashboard/cv`
- Position: after Projects, before Portfolio

---

## Performance Considerations

1. **CV generation**: Single AI call with `generateObject` (~$0.01, ~3-5s)
2. **Each analysis**: Single AI call (~$0.016, ~2-4s)
3. **PDF export**: Server-side `@react-pdf/renderer` (~200ms)
4. **Portfolio data fetch**: Parallel queries, mostly cached via `getUserDashboardStats`
5. **Lives cost**: 1 life per generation, 1 life per analysis (same as current chat)

---

## Acceptance Criteria

1. User can generate a CV from portfolio data with one click
2. CV includes: Professional Summary, Skills, Work Experience, Projects, Education
3. User can paste a job description and get an ATS-optimized version
4. At least 3 improvement analyses are available (Reality Check, Impact, ATS)
5. User can download the CV as PDF
6. User can save multiple CV versions with different target jobs
7. CV uses real validated skills (GitHub + assessment results affect skill ordering)
8. Both Tech Mode and Classic Mode users can access the CV Generator page
9. CRT AI can initiate CV generation via the `generate_cv` tool
10. Generated CVs persist in the database across sessions

---

## Out of Scope

- DOCX export (PDF only for MVP)
- Custom CV templates beyond professional/minimal
- CV sharing via public URL
- Cover letter generation
- LinkedIn import/export
- Freemium gating (all users get full access for now — pricing model is a separate spec)
