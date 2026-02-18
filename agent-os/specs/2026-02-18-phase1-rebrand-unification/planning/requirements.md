# Requirements: Phase 1 — Rebrand & Unification

## R1: Mode Value Renaming (DB + Code)
- Replace `"gaming"` → `"tech"` and `"professional"` → `"classic"` everywhere
- Update Prisma schema default value
- Update TypeScript types, constants, validation schemas
- Update all conditional logic comparing mode values
- Create MongoDB migration script for existing users
- Update narrative cache keys in MongoDB meta field

## R2: Component & File Renaming
- Rename `features/gaming/` folder → `features/tech/`
- Rename 14 portfolio section components (7 Gaming* → Tech*, 7 Professional* → Classic*)
- Update all barrel exports in `features/portfolio/index.ts` and `features/tech/index.tsx`
- Update all ~20 import sites referencing `@/features/gaming`

## R3: i18n Key Renaming
- Rename all `"gaming"` keys → `"tech"` and `"professional"` keys → `"classic"` in `messages/en.json` and `messages/es.json`
- Update display labels: "Gaming Mode" → "Tech Mode", "Professional Mode" → "Classic Mode"
- Update all component call sites using old i18n key paths

## R4: AI Prompt Updates
- Rename prompt functions in `improve-bio/route.ts` (getGamingPrompt → getTechPrompt, etc.)
- Update mode fallback defaults in `narrate-portfolio/route.ts` and `og/route.tsx`
- Update condition checks from `mode === 'gaming'` to `mode === 'tech'`

## R5: Subdomain Routing Unification
- Remove or redirect `/[locale]/[username]` route files
- Update revalidatePath calls that reference `/[username]` paths
- Ensure subdomain-based routing covers all public portfolio access

## R6: Test Updates
- Update all 16+ test files with old mode string literals
- Verify all tests pass after renaming

## R7: Documentation Updates
- Update strategy docs to reflect Tech Mode / Classic Mode naming
