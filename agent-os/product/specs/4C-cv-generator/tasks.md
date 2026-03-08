# Spec 4C: CV Generator — Tasks

**Spec:** `agent-os/product/specs/4C-cv-generator/SPEC.md`
**Branch:** `feat/phase4-ai-portfolio-os`

---

## Task Group 1: Schema + Types + Data Layer

Foundation: Prisma model, TypeScript types, and CRUD data functions.

- [ ] **TG1-A: Add CVDocument model to Prisma schema**
  - Add `CVDocument` model to `prisma/schema.prisma` with fields: `id` (cuid), `userId`, `title`, `targetJob?`, `jobDescription?`, `content` (Json), `analysisResults` (Json?), `createdAt`, `updatedAt`
  - Add `@@index([userId])`
  - Add relation: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
  - Add `cvDocuments CVDocument[]` to the User model
  - Run `npx prisma generate` (do NOT run `prisma db push` — user handles migrations)

- [ ] **TG1-B: Create CV types**
  - Create `features/cv/types/cv.ts`
  - Export interfaces: `CVContent`, `CVSkillSection`, `CVExperienceEntry`, `CVProjectEntry`
  - Export types: `CVAnalysisType` (union of 6 analysis types), `CVAnalysisResult`
  - Export type: `CVDocumentModel` (matching Prisma CVDocument shape for client use)
  - See SPEC.md Section 1 for exact type definitions

- [ ] **TG1-C: Create CV data layer**
  - Create `features/cv/data/getCVs.data.ts`: `getCVsByUserId(userId): Promise<CVDocumentModel[]>` — fetch all CVs ordered by updatedAt desc
  - Create `features/cv/data/createCV.data.ts`: `createCVDocument(data): Promise<CVDocumentModel>` and `updateCVDocument(id, userId, data): Promise<CVDocumentModel>` — with ownership check
  - Create `features/cv/data/deleteCV.data.ts`: `deleteCVDocument(id, userId): Promise<void>` — with ownership check
  - Follow existing data layer patterns (import prisma from `@/lib/prisma`)

**Acceptance:** `prisma generate` succeeds. Types compile. Data functions are importable.

---

## Task Group 2: CV Improvement Prompts

Extract and adapt the 6 prompts from `CV_IMPROVEMENT_PROMPTS.md` into code.

- [ ] **TG2: Create `features/cv/constants/prompts.ts`**
  - Define all 6 prompt templates as functions that accept `(cvText: string, locale: string, jobDescription?: string, targetJob?: string)` and return the prompt string
  - Prompts (adapted from `agent-os/product/ideas/CV_IMPROVEMENT_PROMPTS.md`):
    1. `realityCheckPrompt` — recruiter-perspective CV analysis
    2. `atsOptimizationPrompt` — ATS keyword integration (requires jobDescription)
    3. `impactImprovementPrompt` — convert responsibilities to measurable achievements
    4. `keywordGapPrompt` — compare CV vs job description (requires jobDescription)
    5. `weaknessDetectionPrompt` — employment gaps, red flags, inconsistencies
    6. `differentiationPrompt` — unique value proposition (optional targetJob)
  - Each prompt must be bilingual (check locale for es/en)
  - Each prompt instructs the AI to return structured JSON matching `CVAnalysisResult`
  - Export a `CV_ANALYSIS_LABELS` record with display names and descriptions for each type (bilingual)
  - Export a `getAnalysisPrompt(type, cvText, locale, jobDescription?, targetJob?)` helper

**Acceptance:** Each prompt function returns a well-formed string. Prompts requiring jobDescription throw if not provided.

---

## Task Group 3: CV Generation Service

The core service that creates CVs from portfolio data.

- [ ] **TG3: Create `features/cv/services/generateCV.service.ts`**
  - Import: `generateObject` from `ai`, `createGoogleGenerativeAI` from `@ai-sdk/google`, `z` from `zod`
  - Import data functions: `getUserSkillsData`, `getExperiencesByUserId`, `getProjectsByUserIdData`, `getGitHubConnectionStatus`
  - Import: `consumeLifeService` from `@/features/ai-quota`
  - Import: `prisma` from `@/lib/prisma`, `logger` from `@/lib/logger`
  - Export `generateCVService(userId, targetJob?, jobDescription?, locale?)`:
    1. Check and consume a life via `consumeLifeService`
    2. Fetch portfolio data in parallel (skills, experiences, projects, user profile, GitHub status)
    3. Build a CV generation system prompt:
       - Include all portfolio data as structured context
       - If targetJob provided, instruct AI to tailor content
       - If jobDescription provided, instruct AI to optimize for ATS keywords
       - Instruct AI to generate bilingual based on locale
    4. Call `generateObject` with a Zod schema matching `CVContent` structure
       - Model: `google('gemini-2.0-flash')`
       - This ensures structured JSON output
    5. Save to DB via `createCVDocument` with title based on targetJob or "General CV"
    6. Return `{ cvContent, cvId, title }`
  - **Skill sorting logic**: GitHub-validated > assessment-passed > manual, then by level desc, limited to top 20
  - **Project filtering**: Featured first, then COMPLETED > IN_PROGRESS, limited to top 5
  - **Experience sorting**: Reverse chronological, separate WORK / EDUCATION / CERTIFICATION

**Acceptance:** Given a user with portfolio data, generates a complete CVContent JSON with all sections populated. Saves to DB.

---

## Task Group 4: CV Analysis Service

Service that runs the 6 improvement prompts.

- [ ] **TG4: Create `features/cv/services/analyzeCV.service.ts`**
  - Import: `generateObject` from `ai`, Google AI provider, `z` from `zod`
  - Import: `consumeLifeService`, `logger`, `prisma`
  - Import prompts from `features/cv/constants/prompts`
  - Export `analyzeCVService(userId, cvContent, analysisType, jobDescription?, locale?)`:
    1. Check and consume a life
    2. Serialize `cvContent` to readable text format for the prompt
    3. Get the appropriate prompt via `getAnalysisPrompt`
    4. Call `generateObject` with Zod schema matching `CVAnalysisResult`
    5. Optionally cache result in the CVDocument's `analysisResults` field
    6. Return `CVAnalysisResult`
  - Export `serializeCVToText(cv: CVContent): string` helper — converts structured CV to readable text for prompts
  - Validate: `ats_optimization` and `keyword_gap` require `jobDescription`, throw if missing

**Acceptance:** Given a CV and analysis type, returns structured analysis with issues, severity, and fixes.

---

## Task Group 5: PDF Export Service

Server-side PDF generation using @react-pdf/renderer.

- [ ] **TG5-A: Install @react-pdf/renderer**
  - Run `npm install @react-pdf/renderer`
  - Verify it works with the existing Next.js setup (Node.js runtime)

- [ ] **TG5-B: Create CV PDF template**
  - Create `features/cv/components/CVPdfDocument.tsx`
  - Use `@react-pdf/renderer` components: `Document`, `Page`, `Text`, `View`, `StyleSheet`
  - Render all CV sections: header (name, email), professional summary, skills (grouped by category), work experience, projects, education, certifications
  - Clean, ATS-friendly layout: single column, standard fonts (Helvetica), no tables
  - Two templates: `"professional"` (full) and `"minimal"` (one-page compact)

- [ ] **TG5-C: Create export service**
  - Create `features/cv/services/exportCV.service.ts`
  - Export `exportCVtoPDF(cvContent, userName, userEmail, contactLinks?, template?)`: renders the React-PDF document and returns a Buffer
  - Use `renderToBuffer` from `@react-pdf/renderer`

**Acceptance:** Given CVContent, produces a valid PDF buffer that renders correctly.

---

## Task Group 6: Server Actions

Create the action layer connecting UI to services.

- [ ] **TG6-A: Create CV schemas**
  - Create `features/cv/schemas/cv.schema.ts`
  - Yup schemas for: `generateCVSchema` (targetJob?, jobDescription?), `analyzeCVSchema` (cvId, analysisType, jobDescription?), `deleteCVSchema` (cvId)

- [ ] **TG6-B: Create generate CV action**
  - Create `features/cv/actions/generateCV.action.ts`
  - Use `actionWrapper` pattern with Yup validation
  - Calls `generateCVService`, returns `{ success, cvId, cvContent }`
  - Calls `revalidateTag('user-cvs')` after success (if using cache tags)

- [ ] **TG6-C: Create analyze CV action**
  - Create `features/cv/actions/analyzeCV.action.ts`
  - Validates analysisType is one of the 6 types
  - Fetches CV from DB, calls `analyzeCVService`, returns analysis result

- [ ] **TG6-D: Create delete CV action**
  - Create `features/cv/actions/deleteCV.action.ts`
  - Calls `deleteCVDocument` with ownership check

- [ ] **TG6-E: Create PDF download API route**
  - Create `app/api/cv/[id]/pdf/route.ts`
  - GET handler: auth check, fetch CV by id + userId, call `exportCVtoPDF`, return Response with `application/pdf` content type and `Content-Disposition: attachment`

**Acceptance:** Actions compile. PDF route returns a downloadable PDF.

---

## Task Group 7: UI Components

Build the CV Generator page components.

- [ ] **TG7-A: Create CVGeneratorView (main orchestrator)**
  - Create `features/cv/components/CVGeneratorView.tsx` ("use client")
  - States: `idle` | `generating` | `previewing` | `analyzing`
  - Form: target job input + job description textarea + generate button
  - On generate: call `generateCVAction`, show loading, transition to preview
  - On analyze: call `analyzeCVAction`, show analysis panel
  - On download: trigger PDF download via `/api/cv/[id]/pdf`
  - On delete: confirm + call `deleteCVAction`
  - Use `modeClasses(portfolioMode)` for Tech/Classic styling
  - Use `useTransition` + server action + `toast` (sonner) pattern

- [ ] **TG7-B: Create CVPreview component**
  - Create `features/cv/components/CVPreview.tsx`
  - Renders CVContent as styled HTML (not PDF — for on-screen preview)
  - Sections: Professional Summary, Skills (grouped chips), Work Experience (timeline), Projects, Education
  - Clean, readable layout that approximates the PDF output
  - Scrollable container with max height

- [ ] **TG7-C: Create CVAnalysisPanel component**
  - Create `features/cv/components/CVAnalysisPanel.tsx`
  - Shows 6 analysis type cards (from `CV_ANALYSIS_LABELS`)
  - Cards that require jobDescription are disabled if no JD provided
  - On click: runs analysis, shows results in expandable sections
  - Results show: severity badges (critical/warning/info), issue text, impact, fix suggestion
  - Loading state per analysis type

- [ ] **TG7-D: Create CVListSidebar component**
  - Create `features/cv/components/CVListSidebar.tsx`
  - Lists saved CVs with title, targetJob, date
  - Click to load a saved CV into the preview
  - Delete button per CV

- [ ] **TG7-E: Create JobDescriptionInput component**
  - Create `features/cv/components/JobDescriptionInput.tsx`
  - Textarea with placeholder and character count
  - Collapsible (optional field)

**Acceptance:** All components render without errors. Generator flow works end-to-end.

---

## Task Group 8: Dashboard Page + Navigation

Wire up the page and add nav entry.

- [ ] **TG8-A: Create CV Generator page**
  - Create `app/[locale]/(dashboard)/dashboard/cv/page.tsx`
  - Server component: fetch user data via `getDashboardPageData`, fetch saved CVs
  - Wrap in `DashboardPageLayout` with `pageContext="cv"`
  - Pass translations, user data, saved CVs to `CVGeneratorView`

- [ ] **TG8-B: Add `"cv"` to PageContext type**
  - Update `features/tech/types/page-context.ts` to include `"cv"`

- [ ] **TG8-C: Add CV page prompt**
  - Update `features/ai/constants/pagePrompts.ts` with `cv` entry:
    - en: "User is on the CV Generator page. Help them generate, improve, and optimize their CV for specific job targets."
    - es: "El usuario esta en el Generador de CV. Ayuda a generar, mejorar y optimizar su CV para puestos especificos."

- [ ] **TG8-D: Add nav entry**
  - Update `features/tech/components/dashboard-nav.tsx` to add CV Generator link
  - Icon: `FileText` from lucide-react
  - Position: after Projects, before Portfolio
  - Label from translations

- [ ] **TG8-E: Add translations**
  - Add CV-related keys to `messages/en.json` and `messages/es.json`:
    - Page title, form labels, button texts, analysis type labels, empty states, error messages

**Acceptance:** `/dashboard/cv` loads, shows in nav, CRT context says "cv".

---

## Task Group 9: CRT AI Tool Integration

Add generate_cv tool to the AI chat.

- [ ] **TG9: Add `generate_cv` tool**
  - Add to `features/ai/tools/writeTools.ts` (or create `features/ai/tools/cvTools.ts`)
  - Tool: `generate_cv` with parameters `{ targetJob?: string, jobDescription?: string }`
  - Execute: calls `generateCVService`, returns success message with link to `/dashboard/cv`
  - Add to tool registry in `features/ai/tools/index.ts`

**Acceptance:** User can type "generate a CV for a Senior React role" in CRT and the AI creates a CV.

---

## Task Group 10: Integration Testing

- [ ] **TG10-A: Verify TypeScript compilation**
  - Run `npx tsc --noEmit` and confirm zero NEW errors from 4C changes

- [ ] **TG10-B: Verify CV generation flow** *(manual)*
  - Generate a CV from portfolio data
  - Verify all sections are populated
  - Verify PDF downloads correctly

- [ ] **TG10-C: Verify analysis flow** *(manual)*
  - Run Reality Check analysis on a generated CV
  - Verify structured results with issues/fixes

- [ ] **TG10-D: Verify CRT integration** *(manual)*
  - Ask CRT "generate a CV for me"
  - Verify tool executes and CV is created

---

## Implementation Order

1. **TG1** (Schema + Types + Data) — foundation, no dependencies
2. **TG2** (Prompts) — no dependencies
3. **TG3** (Generate Service) — depends on TG1, TG2
4. **TG4** (Analyze Service) — depends on TG1, TG2
5. **TG5** (PDF Export) — depends on TG1
6. **TG6** (Actions) — depends on TG3, TG4, TG5
7. **TG7** (UI Components) — depends on TG6
8. **TG8** (Page + Nav) — depends on TG7
9. **TG9** (CRT Tool) — depends on TG3
10. **TG10** (Testing) — depends on all above

TG1 and TG2 can be parallelized. TG3, TG4, TG5 can be parallelized after TG1+TG2.
