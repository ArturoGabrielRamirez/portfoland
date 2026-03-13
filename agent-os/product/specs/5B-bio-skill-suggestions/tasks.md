# Tasks: Spec 5B — Auto-suggest Skills from Bio

## Task Group A: Types

- [x] Create `features/portfolio/types/bioSuggestions.ts` with `BioSkillSuggestion` and `BioSkillSuggestionsProps` interfaces

## Task Group B: API Route

- [x] Create `app/api/bio/suggest-skills/route.ts` (POST, nodejs runtime, auth-guarded, generateObject with gemini-2.0-flash)

## Task Group C: Component

- [x] Create `features/portfolio/components/BioSkillSuggestions.tsx` (debounce, pill buttons, tooltip, createSkill action, loading state)

## Task Group D: Integration

- [x] Update `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` to render `<BioSkillSuggestions bio={bio} />` below the bio textarea
