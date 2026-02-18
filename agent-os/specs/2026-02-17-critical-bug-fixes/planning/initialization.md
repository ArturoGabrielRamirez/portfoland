# Spec Initialization: Phase 0 - Critical Bug Fixes

## Description
Fix 6 critical bugs and 3 nice-to-fix issues in the AI features layer of Portfoland. These bugs were identified during an Opus audit and documented in ROADMAP_V2.md Phase 0.

## Must-Fix Bugs
1. Race condition in `checkAndConsumLives` (lib/ai/lives.ts) - needs atomic MongoDB operation
2. Cache invalidation in narrate-portfolio - stale data after profile edits
3. `remainingLives` reporting bug in improve-bio/route.ts line 232
4. Rate limiting needed for AI endpoints (suggested: Upstash Redis)
5. Error message hardcoded in Spanish in lives.ts line 47
6. Typo: `checkAndConsumLives` -> `checkAndConsumeLives` - rename globally

## Nice-to-Fix
- Abort controller in GamingAI.tsx / ProfessionalAI.tsx useEffect fetch
- Extract shared component from GamingAI + ProfessionalAI (90% duplicated)
- Reduce console.log spam in chat/route.ts

## Source
ROADMAP_V2.md Phase 0: Critical Bug Fixes
