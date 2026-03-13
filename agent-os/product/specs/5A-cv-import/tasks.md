# Task Breakdown: 5A CV Import

## Overview

Total Task Groups: 8
Total Tasks: ~30

Allow users to upload a PDF or DOCX resume, have AI extract structured data (skills, experiences, projects), preview and selectively confirm items, then write confirmed items into the DB via existing create services.

---

## Task List

### TG1: Install Packages

**Dependencies:** None

- [x] TG1-A: Add `pdf-parse` and `mammoth` to `dependencies` in `package.json`
  - Run: `bun add pdf-parse mammoth`
  - These are runtime deps — the route handler runs on the Node.js runtime, not Edge
- [x] TG1-B: Add type declarations to `devDependencies` in `package.json`
  - Run: `bun add -d @types/pdf-parse @types/mammoth`
  - Verify types resolve: `pdf-parse` exports `(buffer: Buffer) => Promise<{ text: string }>` and `mammoth.extractRawText({ buffer }) => Promise<{ value: string }>`
- [x] TG1-C: Verify `bun.lock` updated and no peer dependency warnings appear

**Acceptance Criteria:**
- `import pdfParse from 'pdf-parse'` and `import mammoth from 'mammoth'` resolve without TS errors
- `bun install` completes cleanly

---

### TG2: Zod Schema + Types

**Dependencies:** TG1

- [x] TG2-A: Create `features/cv/schemas/cvImport.schema.ts` — Zod schema for AI extraction
  - Export `CVImportSchema` as a `z.object` with:
    - `skills`: `z.array(z.object({ name: z.string(), level: z.number().int().min(1).max(5), category: z.string() })).max(30)`
    - `experiences`: `z.array(z.object({ type: z.enum(['WORK', 'EDUCATION', 'CERTIFICATION']), title: z.string(), company: z.string(), startDate: z.string().describe('ISO date string YYYY-MM-DD'), endDate: z.string().optional().nullable(), description: z.string().max(500) })).max(20)`
    - `projects`: `z.array(z.object({ title: z.string(), description: z.string().max(300), technologies: z.array(z.string()).max(10) })).max(10)`
    - `summary`: `z.string().optional()` — extracted CV objective/bio section
  - Export inferred TypeScript type: `export type CVImportSchemaOutput = z.infer<typeof CVImportSchema>`
- [x] TG2-B: Add `confirmCVImportSchema` Yup schema to the same file `features/cv/schemas/cvImport.schema.ts`
  - This schema validates the server action body (confirmed subset sent by the client)
  - Shape mirrors the Zod schema but uses Yup: `yup.object({ skills: yup.array(...), experiences: yup.array(...), projects: yup.array(...) })`
  - All three arrays are optional (user may uncheck all items in a group)
  - Export inferred type: `export type ConfirmCVImportInput = yup.InferType<typeof confirmCVImportSchema>`
- [x] TG2-C: Create `features/cv/types/cvImport.ts` — TypeScript interfaces for component props
  - `CVImportSkillItem`: `{ name: string; level: number; category: string }`
  - `CVImportExperienceItem`: `{ type: 'WORK' | 'EDUCATION' | 'CERTIFICATION'; title: string; company: string; startDate: string; endDate?: string | null; description: string }`
  - `CVImportProjectItem`: `{ title: string; description: string; technologies: string[] }`
  - `CVImportPreview`: `{ skills: CVImportSkillItem[]; experiences: CVImportExperienceItem[]; projects: CVImportProjectItem[]; summary?: string }`
  - `CVImportPanelProps`: `{ portfolioMode: PortfolioMode }` — import `PortfolioMode` from `@/features/portfolio/types/portfolio`
  - `CVImportButtonProps`: `{ portfolioMode: PortfolioMode }`
  - `BulkCreateResult`: `{ skillsAdded: number; experiencesAdded: number; projectsAdded: number; skipped: number }`

**Acceptance Criteria:**
- No TypeScript errors when importing from either file
- `CVImportSchema` is a valid Zod schema usable with `generateObject`
- `confirmCVImportSchema` is a valid Yup schema usable with `actionWrapper`

---

### TG3: `/api/cv/import` Route Handler

**Dependencies:** TG2

- [x] TG3-A: Create directory `app/api/cv/import/` and file `app/api/cv/import/route.ts`
  - Add `export const runtime = 'nodejs'` at the top — required for `pdf-parse` and `mammoth` (they use Node.js Buffer/fs APIs not available on Edge)
  - No `export const dynamic` needed; Next.js infers dynamic from `request` usage
- [x] TG3-B: Implement auth guard at the top of the `POST` handler
  - Pattern identical to `features/cv/actions/generateCV.action.ts` lines 34–40:
    ```ts
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    ```
  - Import `auth` from `@/lib/auth`, `headers` from `next/headers`, `NextResponse` from `next/server`
- [x] TG3-C: Parse multipart form data and validate the uploaded file
  - `const formData = await request.formData()`
  - `const file = formData.get('file') as File | null`
  - Return 400 if `file` is null or not a `File` instance
  - Validate MIME type: accept only `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; return `{ error: 'Unsupported file type. Upload a PDF or DOCX.' }` with status 400 for any other type
  - Validate size: `if (file.size > 5 * 1024 * 1024)` return `{ error: 'File too large. Maximum size is 5MB.' }` with status 400
- [x] TG3-D: Extract plain text from the file based on MIME type
  - Convert `File` to `Buffer`: `const buffer = Buffer.from(await file.arrayBuffer())`
  - PDF branch: uses `pdf-parse` v2 class API: `new PDFParse({ data: buffer }).getText()`
  - DOCX branch: `const mammoth = await import('mammoth')` then `const { value: text } = await mammoth.extractRawText({ buffer })`
  - Both branches produce a `text: string`; truncate to 15,000 characters max before sending to AI to keep token cost predictable: `const truncatedText = text.slice(0, 15000)`
- [x] TG3-E: Call `generateObject` with `CVImportSchema` against extracted text
  - Set up the Google provider exactly as in `features/cv/services/generateCV.service.ts` lines 25–27
  - Build a system prompt instructing the AI to extract structured career data from the raw CV text
  - Call: `const { object: preview } = await generateObject({ model: google('gemini-2.0-flash'), schema: CVImportSchema, prompt: ... })`
- [x] TG3-F: Return the structured preview as JSON — no DB writes in this handler
  - `return NextResponse.json(preview)` — shape matches `CVImportPreview` from TG2-C
  - Wrap the entire extraction + AI call in try/catch; return `{ error: 'Failed to parse CV' }` with status 500 on failure
  - Log errors with `logger.error(...)` from `@/lib/logger`

**Acceptance Criteria:**
- POST to `/api/cv/import` with a valid PDF returns `{ skills, experiences, projects, summary? }` JSON with status 200
- POST with wrong MIME type returns 400 with descriptive error message
- POST with file over 5MB returns 400
- POST without a valid session returns 401

---

### TG4: `bulkCreateFromCVService`

**Dependencies:** TG2

- [x] TG4-A: Create `features/cv/services/bulkCreateFromCV.service.ts`
  - File header JSDoc: "Orchestrates bulk creation of skills, experiences, and projects from an imported CV"
  - Import `createSkillService`, `CreateSkillServiceInput` from `@/features/skills/services/skill.service`
  - Import `createExperienceService`, `CreateExperienceServiceInput` from `@/features/timeline/services/experience.service`
  - Import `createProjectService`, `CreateProjectServiceInput` from `@/features/projects/services/project.service`
  - Import `getUserSkillsData` from `@/features/skills/data/getUserSkills.data`
  - Import `getSkillCategoriesData` from `@/features/skills/data/getSkillCategories.data`
  - Import `revalidateTag` from `next/cache` and `revalidatePath` from `next/cache`
  - Import `logger` from `@/lib/logger`
  - Import `BulkCreateResult`, `CVImportSkillItem`, `CVImportExperienceItem`, `CVImportProjectItem` from `../types/cvImport`
- [x] TG4-B: Implement the level-to-SelfAssessmentLevel mapping helper (private, top of file)
  ```ts
  function mapLevelToSelfAssessment(level: number): SelfAssessmentLevel {
    if (level <= 2) return 'BEGINNER';
    if (level === 3) return 'INTERMEDIATE';
    return 'ADVANCED';
  }
  ```
  Import `SelfAssessmentLevel` from `@/features/skills/constants/xp`
- [x] TG4-C: Implement skill creation loop in `bulkCreateFromCVService`
  - Fetch existing user skills: `const existingSkills = await getUserSkillsData(userId)`
  - Build a Set of lowercase skill names: `const existingNames = new Set(existingSkills.map(us => us.skill.name.toLowerCase()))`
  - Fetch skill categories for the user: `const categories = await getSkillCategoriesData(userId)`
  - For each `skill` in `confirmedSkills`:
    - If `skill.name.toLowerCase()` is in `existingNames`: increment `skipped`, continue
    - Try to match `skill.category` (case-insensitive) to a category in `categories`; if found use its `id` as `categoryId`, otherwise omit `categoryId` (service falls back to first available)
    - Call `await createSkillService({ userId, name: skill.name, categoryId, selfAssessmentLevel: mapLevelToSelfAssessment(skill.level) })`
    - Catch individual errors with `logger.warn(...)` and continue; do not abort the entire batch
    - Increment `skillsAdded` on success
- [x] TG4-D: Implement experience creation loop in `bulkCreateFromCVService`
  - `createExperienceService` requires `latitude`, `longitude`, `address` — use `0, 0, ''` as defaults since CV import does not collect location data
  - For each `exp` in `confirmedExperiences`:
    - Parse `exp.startDate` string to `Date`: `new Date(exp.startDate)` — if invalid (isNaN), skip with `logger.warn`
    - Parse `exp.endDate` the same way; if null/undefined use `null`
    - Call `await createExperienceService({ userId, type: exp.type, title: exp.title, company: exp.company, latitude: 0, longitude: 0, address: '', startDate, endDate, description: exp.description })`
    - Catch individual errors with `logger.warn(...)` and continue
    - Increment `experiencesAdded` on success
- [x] TG4-E: Implement project creation loop in `bulkCreateFromCVService`
  - For each `proj` in `confirmedProjects`:
    - Call `await createProjectService({ userId, title: proj.title, description: proj.description, technologies: proj.technologies, status: 'COMPLETED', startDate: new Date() })`
    - Note: `startDate` is required by `CreateProjectServiceInput`; use `new Date()` as a placeholder since the CV does not always include project dates
    - Catch individual errors with `logger.warn(...)` and continue
    - Increment `projectsAdded` on success
- [x] TG4-F: Revalidate caches after all writes and return aggregate counts
  - After all three loops complete (regardless of individual errors):
    ```ts
    revalidateTag(`user-stats-${userId}`);
    revalidatePath('/dashboard/skills');
    revalidatePath('/dashboard/timeline');
    revalidatePath('/dashboard/projects');
    ```
  - Return: `{ skillsAdded, experiencesAdded, projectsAdded, skipped }`
- [x] TG4-G: Export the function signature:
  ```ts
  export async function bulkCreateFromCVService(
    userId: string,
    confirmedSkills: CVImportSkillItem[],
    confirmedExperiences: CVImportExperienceItem[],
    confirmedProjects: CVImportProjectItem[]
  ): Promise<BulkCreateResult>
  ```

**Acceptance Criteria:**
- Skills with duplicate names (case-insensitive) are skipped and counted in `skipped`
- A single failing skill/experience/project does not abort the entire batch
- All four cache tags/paths are revalidated after writes
- Returns correct counts

---

### TG5: `importCV.action.ts` Server Action

**Dependencies:** TG4

- [x] TG5-A: Create `features/cv/actions/importCV.action.ts`
  - Add `'use server'` directive at the top
  - Import `headers` from `next/headers`, `auth` from `@/lib/auth`, `actionWrapper` from `@/features/core`, `confirmCVImportSchema` from `../schemas/cvImport.schema`, `bulkCreateFromCVService` from `../services/bulkCreateFromCV.service`
  - Import `BulkCreateResult` from `../types/cvImport`
- [x] TG5-B: Implement `importCVAction` following the exact `actionWrapper` pattern from `features/cv/actions/generateCV.action.ts`:
  ```ts
  export async function importCVAction(input: Record<string, unknown>) {
    return actionWrapper<BulkCreateResult>(async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.id) throw new Error('You must be logged in to import a CV');

      const data = await confirmCVImportSchema.validate(input);

      const result = await bulkCreateFromCVService(
        session.user.id,
        data.skills ?? [],
        data.experiences ?? [],
        data.projects ?? []
      );

      return {
        payload: result,
        message: `Imported: ${result.skillsAdded} skills, ${result.experiencesAdded} experiences, ${result.projectsAdded} projects`,
      };
    });
  }
  ```
  - The session userId is the authoritative source — never trust a userId from the client body

**Acceptance Criteria:**
- Action returns `ActionResponse<BulkCreateResult>` with `hasError: false` on success
- Returns `hasError: true` with Yup validation message if input fails schema
- Returns `hasError: true` with auth message if no session

---

### TG6: `/api/cv/confirm` Route Handler

**Dependencies:** TG4

Note: The SPEC defines this route as an alternative to the server action for direct API consumers. The `CVImportPanel` component (TG7) will use `importCVAction` (TG5) directly via `useTransition`. This route exists for completeness and future API access.

- [x] TG6-A: Create directory `app/api/cv/confirm/` and file `app/api/cv/confirm/route.ts`
  - Add `export const runtime = 'nodejs'`
- [x] TG6-B: Implement auth guard — same pattern as TG3-B
- [x] TG6-C: Parse JSON body and call `bulkCreateFromCVService`:
  ```ts
  const body = await request.json();
  const { skills = [], experiences = [], projects = [] } = body;
  const result = await bulkCreateFromCVService(session.user.id, skills, experiences, projects);
  return NextResponse.json(result);
  ```
  - Do NOT read `userId` from body — use `session.user.id` exclusively
  - Wrap in try/catch; return `{ error: 'Import failed' }` with status 500 on failure

**Acceptance Criteria:**
- POST to `/api/cv/confirm` with valid JSON body and valid session returns `{ skillsAdded, experiencesAdded, projectsAdded, skipped }`
- POST without session returns 401
- POST with malformed body returns 500 with error message

---

### TG7: `CVImportPanel.tsx` Component

**Dependencies:** TG5, TG2-C

- [x] TG7-A: Create `features/cv/components/CVImportPanel.tsx`
  - `'use client'` directive at top
  - Imports: `useState`, `useTransition`, `useRef` from `react`; `toast` from `sonner`; `Loader2`, `Upload` from `lucide-react`; `cn` from `@/lib/utils`; `modeClasses` from `@/features/dashboard/utils/modeClasses`
  - Import `importCVAction` from `../actions/importCV.action`
  - Import types from `../types/cvImport`: `CVImportPanelProps`, `CVImportPreview`, `CVImportSkillItem`, `CVImportExperienceItem`, `CVImportProjectItem`
  - Import `updateProfile` from `@/features/portfolio/actions/updateProfile` for the optional "Apply as bio" button
- [x] TG7-B: Define component state
  - `viewState: 'idle' | 'parsing' | 'preview'` — starts as `'idle'`
  - `preview: CVImportPreview | null` — AI-extracted data
  - `selectedSkills: Set<number>` — indices of checked skills (all checked by default when preview loads)
  - `selectedExperiences: Set<number>` — same for experiences
  - `selectedProjects: Set<number>` — same for projects
  - `fileRef: React.RefObject<HTMLInputElement>` — reference to the hidden file input
  - `[isConfirming, startConfirmTransition] = useTransition()`
  - `[isApplyingBio, startBioTransition] = useTransition()`
- [x] TG7-C: Implement file upload handler `handleUpload`
  - Get file from `fileRef.current?.files?.[0]`; return early if no file
  - Set `viewState` to `'parsing'`
  - Build a `FormData`, append `file`
  - `const res = await fetch('/api/cv/import', { method: 'POST', body: formData })`
  - On non-ok response: parse error JSON, call `toast.error(data.error || 'Failed to parse CV')`, reset `viewState` to `'idle'`
  - On success: parse JSON as `CVImportPreview`, set `preview`, initialize all three Sets with all indices (all checked), set `viewState` to `'preview'`
  - Wrap in try/catch; on catch: `toast.error('Upload failed')`, reset state
- [x] TG7-D: Implement confirm handler `handleConfirm` using `useTransition`
  - Build confirmed arrays by filtering by selected indices from the Sets
  - Call `importCVAction` inside `startConfirmTransition`:
    ```ts
    const result = await importCVAction({ skills: confirmedSkills, experiences: confirmedExperiences, projects: confirmedProjects });
    if (result.hasError) { toast.error(result.message); return; }
    const { skillsAdded, experiencesAdded, projectsAdded } = result.payload;
    toast.success(`Imported: ${skillsAdded} skills, ${experiencesAdded} experiences, ${projectsAdded} projects`);
    setViewState('idle');
    setPreview(null);
    ```
- [x] TG7-E: Implement optional "Apply as bio" handler
  - Only rendered if `preview?.summary` is present
  - Calls `updateProfile({ bio: preview.summary })` inside `startBioTransition`
  - On success: `toast.success('Bio updated')`; on error: `toast.error('Failed to update bio')`
- [x] TG7-F: Render idle state — file dropzone
  - Hidden `<input type="file" accept=".pdf,.docx" ref={fileRef} onChange={handleUpload} className="sr-only" />`
  - Visible upload area styled with `mc.card` classes: dashed border, centered `Upload` icon, text "Drop your CV here or click to browse", subtext "PDF or DOCX, max 5MB"
  - Clicking the visible area triggers `fileRef.current?.click()`
  - The `onChange` on the file input immediately calls `handleUpload` — no separate "Upload" button needed
- [x] TG7-G: Render parsing state — loading spinner
  - Full-width centered block with `<Loader2 className="animate-spin" />` and text "Parsing your CV with AI..."
  - Use `mc.label` class for text, consistent with `CVGeneratorView.tsx` spinner pattern
- [x] TG7-H: Render preview state — three collapsible groups
  - Summary section (if `preview.summary`): show extracted text in a styled box + "Apply as bio" button (disabled while `isApplyingBio`)
  - Skills group: heading "Skills ({count})", list each item with checkbox toggle; show name + category + level as badge (e.g. "L4")
  - Experiences group: heading "Experiences ({count})", list each item with checkbox; show type badge (WORK/EDUCATION/CERTIFICATION), title, company, date range
  - Projects group: heading "Projects ({count})", list each item with checkbox; show title, truncated description, technology pills
  - Checkbox toggle: clicking anywhere on the row toggles the index in/out of the relevant Set
  - Use `modeClasses(portfolioMode)` for all styling — `mc.card`, `mc.label`, `mc.subHeading`, `mc.primaryButton`, `mc.saveButton`, `mc.cancelButton`
- [x] TG7-I: Render confirm button at bottom of preview state
  - Disabled when no items are selected across all groups
  - Shows `<Loader2 className="animate-spin" />` when `isConfirming`
  - Label: Tech mode `'IMPORT_SELECTED'`, Classic mode `'Import Selected'`
  - Secondary "Start over" link/button resets to idle state without confirmation dialog

**Acceptance Criteria:**
- Component cycles through idle → parsing → preview → idle correctly
- All items are checked by default when preview loads
- Unchecking an item removes it from the confirmed payload
- "Apply as bio" only appears when `preview.summary` exists
- Confirm button is disabled when zero items are checked

---

### TG8: `CVImportButton.tsx` Component

**Dependencies:** TG7

- [x] TG8-A: Create `features/cv/components/CVImportButton.tsx`
  - `'use client'` directive
  - Imports: `useState` from `react`; `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@/features/shadcn/ui/dialog`; `Upload` from `lucide-react`; `cn` from `@/lib/utils`; `modeClasses` from `@/features/dashboard/utils/modeClasses`
  - Import `CVImportPanel` from `./CVImportPanel`
  - Import `CVImportButtonProps` from `../types/cvImport`
- [x] TG8-B: Implement component
  - Single piece of state: `open: boolean`
  - Render a trigger button styled with `mc.cancelButton` (secondary style, not primary — this is an auxiliary action):
    - Icon: `<Upload className="h-3.5 w-3.5" />`
    - Label: Tech mode `'IMPORT_CV'`, Classic mode `'Import CV'`
    - `onClick={() => setOpen(true)}`
  - Render `<Dialog open={open} onOpenChange={setOpen}>` containing `<DialogContent>` with max-width `sm:max-w-2xl` to give the panel room
  - `<DialogHeader>` with `<DialogTitle>`: Tech mode `'> IMPORT_CV'`, Classic mode `'Import CV'`
  - Inside dialog body: `<CVImportPanel portfolioMode={portfolioMode} />`
  - When dialog closes (`onOpenChange(false)`), the panel's internal state resets automatically because `CVImportPanel` mounts/unmounts with the dialog

**Acceptance Criteria:**
- Button opens the Dialog; Dialog contains `CVImportPanel`
- Dialog can be closed via the `X` button or by pressing Escape
- Button styling adapts to Tech vs Classic mode via `modeClasses()`

---

### TG9: Wire into `DashboardPortfolioView`

**Dependencies:** TG8

- [x] TG9-A: Add import to `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` (around line 20, after existing feature imports):
  ```ts
  import { CVImportButton } from '@/features/cv/components/CVImportButton';
  ```
- [x] TG9-B: Add `CVImportButton` to the page header `flex` container at lines 210–222 (the `<div className="flex items-center gap-3">` that holds the "View Public" link and `PortfolioModeToggle`)
  - Place it between the "View Public" link and the `PortfolioModeToggle`, or after the link — either works; keep the gap consistent
  - Pass `portfolioMode={user.portfolioMode}`:
    ```tsx
    <CVImportButton portfolioMode={user.portfolioMode} />
    ```
- [x] TG9-C: No other changes to `DashboardPortfolioView` — form logic, state, and existing handlers are untouched

**Acceptance Criteria:**
- "Import CV" button appears in the portfolio page header next to the "View Public" link
- Clicking it opens the `CVImportButton` Dialog
- No TypeScript errors or regressions in `DashboardPortfolioView`

---

### TG10: QA Checklist (Manual)

**Dependencies:** TG1–TG9

- [x] TG10-A: Happy path — PDF upload
  - Upload a real-world PDF resume under 5MB
  - Verify the preview panel appears with Skills, Experiences, and Projects groups populated
  - Uncheck two skills; click "Import Selected"
  - Verify toast shows correct counts (unchecked skills not counted)
  - Navigate to `/dashboard/skills` — confirm new skills appear
  - Navigate to `/dashboard/timeline` — confirm new experiences appear
  - Navigate to `/dashboard/projects` — confirm new projects appear
- [x] TG10-B: Happy path — DOCX upload
  - Upload a `.docx` resume; verify same flow works end-to-end
- [x] TG10-C: Summary / "Apply as bio" flow
  - Use a CV that has an objective/summary section
  - Verify summary is shown in the preview panel
  - Click "Apply as bio"; verify toast confirms update
  - Navigate to `/dashboard/portfolio` — verify bio field shows the new value
- [x] TG10-D: Error paths
  - Upload a `.txt` or `.jpg` file — verify 400 error toast "Unsupported file type"
  - Upload a PDF over 5MB — verify 400 error toast "File too large"
  - Upload a nearly empty file with no recognizable content — verify the preview shows empty groups gracefully (no crash)
- [x] TG10-E: Duplicate detection
  - Import a CV that includes a skill already in the user's profile
  - Verify that skill is not duplicated in the DB; the `skipped` count in the toast is accurate
- [x] TG10-F: Tech Mode / Classic Mode styling
  - Switch portfolio to Classic Mode, open the import dialog — verify button and panel use Classic styles (white bg, blue accents)
  - Switch to Tech Mode — verify panel uses Tech styles (dark bg, cyan/monospace)
- [x] TG10-G: Zero-selection guard
  - Open preview, uncheck all items in all groups
  - Verify "Import Selected" button is disabled
- [x] TG10-H: TypeScript build check
  - Run `bun run build` (or `tsc --noEmit`) and verify zero new type errors

**Acceptance Criteria:**
- All manual QA steps pass without errors or regressions
- `bun run build` completes with no new TypeScript errors

---

## Execution Order

```
TG1 (packages)
  └─ TG2 (schemas + types)
       ├─ TG3 (import route — reads Zod schema)
       ├─ TG4 (bulk create service — reads types)
       │    ├─ TG5 (server action — calls service)
       │    └─ TG6 (confirm route — calls service)
       │         └─ TG7 (CVImportPanel — calls action + fetch route)
       │              └─ TG8 (CVImportButton — wraps panel)
       │                   └─ TG9 (wire into DashboardPortfolioView)
       │                        └─ TG10 (QA)
       └─ (TG3 and TG4 can be implemented in parallel)
```

TG3, TG4, TG5, and TG6 are all backend and can be implemented before touching any UI. TG7 and TG8 depend on the action (TG5) being in place. TG9 is a small wiring task done last before QA.
