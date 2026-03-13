# Tasks — Spec 5D: GitHub package.json Detection

## Task Group 1: Pure Utility

- [x] Create `features/github/utils/packageJsonSkills.ts`
  - [x] Define `PACKAGE_TO_SKILL` map (~80+ npm packages → skill name + category slug)
  - [x] Export `PackageSkillCandidate` interface `{ name: string; category: string }`
  - [x] Export `extractSkillsFromPackageJson(packageJson)` — merges deps+devDeps, deduplicates by skill name, returns sorted array

## Task Group 2: Service Layer

- [x] Create `features/github/services/fetchPackageJsonSkills.service.ts`
  - [x] Export `PackageJsonSkillsResult` interface `{ added: string[]; skipped: string[] }`
  - [x] Implement `fetchPackageJson(token, fullName)` — GitHub Contents API, base64 decode, returns parsed JSON or null on any error / 404
  - [x] Implement `selectTopRepos(repos)` — sort by stars desc, slice to MAX_REPOS (5)
  - [x] Implement `fetchPackageJsonSkillsService(userId, token, repos)`:
    - [x] Probe top repos sequentially, collect skill candidates via `extractSkillsFromPackageJson`
    - [x] Deduplicate candidates across repos (first-seen category wins)
    - [x] Query DB for user's existing skill names (case-insensitive comparison)
    - [x] For each new skill: resolve category via `getCategoryBySlugData`, fall back to 'core'
    - [x] Call `createSkillService` with `selfAssessmentLevel: 'INTERMEDIATE'`
    - [x] Update new `UserSkill.githubValidated = true` via `prisma.userSkill.updateMany`
    - [x] Catch individual skill creation errors → push to `skipped`, continue
    - [x] Return `{ added, skipped }` summary

## Task Group 3: Wire into Sync

- [x] Modify `features/github/services/syncGitHub.service.ts`
  - [x] Import `fetchPackageJsonSkillsService`
  - [x] After Step 5 (stats persist), add Step 6: fire-and-forget call to `fetchPackageJsonSkillsService(userId, token, syncData.repos)`
  - [x] Wrap in `.catch()` — log warning, must not propagate to caller
  - [x] Add Step 6 to the JSDoc header comment

## Task Group 4: Spec Documentation

- [x] Create `agent-os/product/specs/5D-github-package-detection/SPEC.md`
- [x] Create `agent-os/product/specs/5D-github-package-detection/tasks.md` (this file, all checked)
