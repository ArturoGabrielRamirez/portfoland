# Specification: 5A CV Import

## Goal

Allow users to upload an existing PDF or DOCX resume, have AI extract and structure the data into skills, experiences, and projects, preview and selectively confirm which items to import, then write the confirmed items into the DB via existing create services.

## User Stories

- As a user, I want to upload my existing resume so that my portfolio is populated with my real career history without manual data entry.
- As a user, I want to preview what was extracted and uncheck items I do not want before committing, so that I have full control over what enters my profile.
- As a user, I want to see a summary toast after import showing how many skills, experiences, and projects were added, so that I know the import succeeded.

## Specific Requirements

**File Upload Route (`app/api/cv/import/route.ts`)**
- POST handler with `export const runtime = 'nodejs'` — required for `pdf-parse` and `mammoth`
- Parse file from `request.formData()` — no multer, use native Next.js multipart handling
- Validate: only `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document` MIME types accepted; reject others with 400
- Enforce 5MB max: check `file.size` before extracting, return 400 if exceeded
- Extract text: call `pdf-parse` for PDF files, `mammoth.extractRawText()` for DOCX files — both return plain text string
- Call `generateObject` with the CV Zod schema against the extracted text; use `google('gemini-2.0-flash')` via `createGoogleGenerativeAI` — same pattern as `generateCV.service.ts`
- Return the structured preview as JSON: `{ skills, experiences, projects, summary }` — no DB writes in this route
- Auth guard: validate session via `auth.api.getSession({ headers: await headers() })` before any processing

**AI Extraction Schema (Zod)**
- Define `CVImportSchema` in `features/cv/schemas/cvImport.schema.ts` — separate file from existing `cv.schema.ts`
- Skills array (max 30): `{ name, level (1-5), category }` — `level` is AI's confidence guess based on context/years
- Experiences array (max 20): `{ type: enum WORK|EDUCATION|CERTIFICATION, title, company, startDate, endDate?, description (max 500) }`
- Projects array (max 10): `{ title, description (max 300), technologies (max 10) }`
- Optional `summary` string: extracted from CV objective/summary section as bio suggestion
- Level-to-SelfAssessmentLevel mapping: 1-2 → `BEGINNER`, 3 → `INTERMEDIATE`, 4-5 → `ADVANCED`

**Confirm Route (`app/api/cv/confirm/route.ts`)**
- POST handler, accepts JSON body: `{ skills[], experiences[], projects[], userId }` (confirmed/checked subset only)
- Auth guard — re-validate session server-side, do not trust userId from body
- Call `bulkCreateFromCVService` which orchestrates all creation; return `{ skillsAdded, experiencesAdded, projectsAdded, skipped }` counts
- No `actionWrapper` here since this is a route handler not a server action; handle errors with standard try/catch and JSON error responses

**Bulk Create Service (`features/cv/services/bulkCreateFromCV.service.ts`)**
- Orchestrates three creation flows in sequence (not parallel) to avoid race conditions on category lookups
- Skills: for each confirmed skill, case-insensitive check if skill name already exists for user using `getUserSkillsData`; skip duplicates silently; call `createSkillService` with mapped `selfAssessmentLevel`; if `category` name from AI matches an existing `SkillCategory` name (case-insensitive) use its ID, otherwise fall back to default category
- Experiences: for each confirmed experience, parse `startDate` string to `Date` object; call `createExperienceService` directly — no duplicate detection needed since timeline entries are not unique-constrained
- Projects: for each confirmed project, call `createProjectService` with `status: 'COMPLETED'` as default; `technologies` array maps directly; no `imageUrl` or `links` required
- Return aggregate counts: `{ skillsAdded, experiencesAdded, projectsAdded, skipped }`
- Revalidate cache tags after all writes: `revalidateTag('user-stats-' + userId)`, `revalidatePath('/dashboard/skills')`, `revalidatePath('/dashboard/timeline')`, `revalidatePath('/dashboard/projects')`

**Import Action (`features/cv/actions/importCV.action.ts`)**
- `'use server'` action using `actionWrapper` pattern
- Validates confirmed items with a Yup schema (`confirmCVImportSchema` in `features/cv/schemas/cvImport.schema.ts`)
- Calls `bulkCreateFromCVService`, returns `ActionResponse<{ skillsAdded, experiencesAdded, projectsAdded, skipped }>`
- Used by `CVImportPanel` confirm button via `useTransition`

**Preview UI (`features/cv/components/CVImportPanel.tsx`)**
- Client component (`'use client'`) — manages upload state, extracted preview, and checkbox selections
- Three states: `idle` (show file dropzone), `parsing` (loading spinner while route processes), `preview` (show extracted items)
- File input: accept `.pdf,.docx` only; show file name and size once selected; Upload button triggers fetch to `/api/cv/import`
- Preview renders three collapsible groups: Skills, Experiences, Projects — each item has a checkbox (checked by default); uncheck to exclude from import
- Summary section at top if AI extracted a `summary` string: show it with an optional "Apply as bio" button that calls `updateProfile` action separately
- Confirm button calls `importCVAction` with only the checked items; shows `Loader2` while pending
- On success: `toast.success('Imported: X skills, Y experiences, Z projects')` then reset to `idle`
- On error: `toast.error(result.message)`
- Types for props defined in `features/cv/types/cvImport.ts` — separate from existing `cv.ts`

**Import Button & Trigger (`features/cv/components/CVImportButton.tsx`)**
- Client component: renders a button that opens a `Dialog` (shadcn/ui) containing `CVImportPanel`
- Dialog is self-contained — no state leaks to parent; on close resets panel to idle
- Accepts `portfolioMode` prop to adapt button styling using `modeClasses()`

**Dashboard Integration (`app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`)**
- Add `CVImportButton` import and render it in the page header area, next to the "View Public" link
- Pass `portfolioMode={user.portfolioMode}` to `CVImportButton`
- No other changes to the form or existing logic

**Dependency Installation**
- Add `pdf-parse` and `mammoth` to `package.json` dependencies
- Add `@types/pdf-parse` and `@types/mammoth` to devDependencies if type declarations are not bundled

## Visual Design

No mockups provided. Follow existing CV Generator UI patterns from `features/cv/components/CVGeneratorView.tsx` for consistent look and feel: `modeClasses()` for Tech/Classic adaptive styling, `HUDPanel` wrapper for groupings, `Loader2` spinner during async ops, `toast` (sonner) for feedback.

## Existing Code to Leverage

**`features/cv/services/generateCV.service.ts`**
- Exact pattern for `createGoogleGenerativeAI` + `generateObject` with a Zod schema and a prompt — replicate this in the `/api/cv/import` route handler for the AI parsing step
- Shows how to import and call `google('gemini-2.0-flash')` with `apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY`

**`features/skills/services/skill.service.ts` → `createSkillService`**
- Accepts `{ userId, name, categoryId?, selfAssessmentLevel, learningSources?, dateStarted? }` — call this directly from `bulkCreateFromCVService` for each imported skill
- Already handles default category fallback internally when `categoryId` is omitted

**`features/timeline/actions/createExperience.ts` → `createExperienceService`**
- Accepts plain object with `{ userId, type, title, company, startDate, endDate, description, skills }` — call the service layer directly from `bulkCreateFromCVService`, bypassing the action wrapper

**`features/projects/actions/createProject.ts` → `createProjectService`**
- Accepts `{ userId, title, description, technologies, status, ... }` — call the service layer directly for project creation; `status` defaults to `'COMPLETED'`

**`features/cv/components/CVGeneratorView.tsx`**
- Pattern for three-state UI (`idle` / async / `previewing`) with `useTransition` + `useState` — replicate for `CVImportPanel`'s `idle` / `parsing` / `preview` states
- `modeClasses(portfolioMode)` usage for adaptive Tech/Classic styling classes
- `toast.error` / `toast.success` with sonner pattern

## Out of Scope

- LinkedIn import or any URL-based CV ingestion
- Real-time streaming progress during file processing
- Parsing images, tables, or multi-column layouts in PDFs (plain text extraction only)
- Editing extracted items inline before import (checkbox exclude only)
- Automatic bio update — the "Apply as bio" button in the summary section is optional and user-initiated
- Duplicate detection for experiences or projects (only skills are deduplicated)
- CV import quota / life consumption (unlike CV generation, import does not consume AI lives)
- Storing the raw extracted text or the import event in the DB
- Undo / rollback of an import after confirmation
