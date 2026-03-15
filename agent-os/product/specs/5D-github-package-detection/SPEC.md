# Spec 5D — GitHub package.json Detection

## Summary

During GitHub sync, fetch `package.json` from the user's top repos and extract technology names from `dependencies` / `devDependencies`. Map known npm packages to Portfoland skill names, then auto-add them as INTERMEDIATE-level skills with `githubValidated: true`. This enriches the skill tree beyond what raw commit language stats provide (e.g. captures React, Prisma, Tailwind CSS, tRPC — things that don't show in language bytes).

## Goals

- Detect frontend/backend/devops skills from npm package manifests
- Auto-create skills the user is clearly using but hasn't added manually
- Mark auto-created skills as `githubValidated: true` immediately
- Rate-limit safe: probe max 5 repos per sync
- Non-blocking: failure must NOT break the main GitHub sync

## Non-goals

- Not fetching `pyproject.toml`, `Cargo.toml`, `build.gradle` etc. (JS/TS only for now)
- Not creating new SkillCategory records (use existing defaults)
- Not changing the sync result payload returned to the UI

## Architecture

### Files Created

| File | Role |
|------|------|
| `features/github/utils/packageJsonSkills.ts` | Pure utility — PACKAGE_TO_SKILL map + `extractSkillsFromPackageJson()` |
| `features/github/services/fetchPackageJsonSkills.service.ts` | Service — GitHub Contents API fetch + DB writes |

### Files Modified

| File | Change |
|------|--------|
| `features/github/services/syncGitHub.service.ts` | Added Step 6: non-blocking call to `fetchPackageJsonSkillsService` |

## Flow

```
syncGitHubService(userId)
  ├── Steps 1–5 (existing: language validation, stats persist)
  └── Step 6 (new, non-blocking):
        fetchPackageJsonSkillsService(userId, token, repos)
          ├── selectTopRepos(repos)         → top 5 by stars
          ├── for each repo:
          │     fetchPackageJson(token, repo.full_name)
          │       └── GET /repos/{owner}/{repo}/contents/package.json
          │           404 → null (skip), other error → null (skip)
          ├── extractSkillsFromPackageJson(pkg)
          │     └── merge deps+devDeps → PACKAGE_TO_SKILL lookup → deduplicate
          ├── DB: find user's existing skill names
          ├── for each new skill:
          │     getCategoryBySlugData(categorySlug)
          │     createSkillService({ selfAssessmentLevel: 'INTERMEDIATE' })
          │     prisma.userSkill.updateMany → githubValidated: true
          └── return { added, skipped }
```

## Package → Skill Mapping Highlights

~80+ packages covered across:
- Frontend: React, Next.js, Vue, Angular, Svelte, Tailwind CSS, etc.
- Backend: Express, Fastify, NestJS, Prisma, Drizzle ORM, GraphQL, tRPC, etc.
- Databases: MongoDB (mongoose), PostgreSQL (pg), MySQL (mysql2), Redis
- Testing: Jest, Vitest, Cypress, Playwright
- DevOps: Webpack, Vite, Turborepo, Docker
- State: Redux, Zustand, Jotai, React Query, SWR
- Auth: NextAuth.js, Better Auth, Passport.js
- Cloud: Firebase, Supabase, AWS SDKs

## Constraints

- Max 5 repos probed (GitHub rate-limit budget preservation)
- `selfAssessmentLevel: 'INTERMEDIATE'` for all auto-detected skills
- Skill creation errors (duplicate, race condition) → skipped, not thrown
- Category fallback: `core` if the mapped category slug is missing from DB
- If no default categories exist at all → skill is skipped (not thrown)
