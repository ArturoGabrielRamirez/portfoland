# Spec 5B: Auto-suggest Skills from Bio

## Goal
When a user edits their bio in the portfolio dashboard, AI reads the text and suggests relevant skills to add that aren't already in their skill tree. A compact suggestion strip appears below the bio textarea with pill buttons per suggestion.

## Architecture

### API Route: `app/api/bio/suggest-skills/route.ts`
- POST, Node.js runtime, auth-guarded
- Body: `{ bio: string, locale?: string }`
- Fetches user's existing skill names from DB
- Calls `generateObject` with `gemini-2.0-flash` to extract tech skills from bio
- Returns `{ suggestions: [{ name, category, reason }] }` (max 8)

### Component: `features/portfolio/components/BioSkillSuggestions.tsx`
- Client component
- Props: `{ bio: string, onSkillAdded?: () => void }`
- Debounce 1.5s, fires only when bio.length > 30
- Shows pills per suggestion with tooltip reason on hover
- Clicking pill calls `createSkill` action at BEGINNER level
- Removes pill on success
- Loading state: "Analyzing bio..." with pulse
- No render if no suggestions or bio too short

### Types: `features/portfolio/types/bioSuggestions.ts`
- `BioSkillSuggestion` interface
- `BioSkillSuggestionsProps` interface

### Integration: `DashboardPortfolioView.tsx`
- Render `<BioSkillSuggestions bio={bio} />` below the bio textarea
