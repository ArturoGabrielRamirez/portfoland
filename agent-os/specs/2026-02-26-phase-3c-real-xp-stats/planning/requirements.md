# Requirements: Phase 3C — Real XP & Stats

**Spec folder:** `agent-os/specs/2026-02-26-phase-3c-real-xp-stats/`
**Date:** 2026-02-26

---

## Objective

Replace all hardcoded/mock data in the Tech Mode dashboard with real computed values.
Currently: `XP = 1900`, `level = 18`, `streak = 12`, `achievements = { current: 18, total: 42 }` are all static constants in the page server component. After this spec, they are computed from the user's real DB data.

---

## Existing Infrastructure (found in codebase)

- `Experience` model has `xp` field (manually entered — NOT used for global total)
- `UserSkill` has `totalXP` (calculated from `SkillSource` records)
- `features/skills/constants/xp.ts` has `calculateDurationXP`, `calculateLevelFromXP`, skill-level thresholds
- `getExperiencesByUserId` already calculates `stats.totalXP`
- `Project` model has `status: IN_PROGRESS | COMPLETED | ARCHIVED`
- `UserSkill` has an `aiValidated` boolean (or equivalent) — to be confirmed during implementation

---

## XP Formula

### Global TotalXP

```
TotalXP = Σ(XP_Projects) + Σ(XP_Experiences_duration) + Σ(XP_Skills_AI_validated)
```

**DO NOT** use the stored `experience.xp` manual field — it is gameable and excluded from the global total.

### XP per Experience
Calculated dynamically from duration:
- `10 XP per month` of employment/experience duration
- Duration = difference between `startDate` and `endDate` (or today if current)
- Minimum: 1 month (never 0 XP for a valid experience)

### XP per Project (by status)
- `COMPLETED`: 300 XP
- `IN_PROGRESS`: 100 XP
- `ARCHIVED`: 50 XP

### XP per Skill
- Only AI-validated skills contribute to global XP
- Use `userSkill.totalXP` value for AI-validated skills
- Non-validated skills: 0 XP toward global total
- Rationale: incentivizes use of AI assessment feature (Phase 4)

---

## Player Level

Formula-based curve (no manual table):

```
Level = floor(sqrt(TotalXP / 100))
```

Examples:
- 0 XP → Level 0
- 100 XP → Level 1
- 400 XP → Level 2
- 2500 XP → Level 5
- 10000 XP → Level 10
- 250000 XP → Level 50 (very active pro user, ~1 year)
- 1000000 XP → Level 100 (aspirational "Legendary")

No manual level table needed. Formula scales indefinitely.

---

## Streak Tracking

### Behavior
- Streak increments when user **adds or edits content** (experience, skill, or project)
- NOT login/visit based (would be a meaningless metric)
- Triggering actions: create/update experience, create/update skill, create/update project

### Schema Change Required
Add to `User` model in `prisma/schema.prisma`:
```prisma
lastStreakDate   DateTime?
currentStreak    Int       @default(0)
```

### Logic
- On each content-creation/edit action: check if `lastStreakDate` is yesterday → increment streak; if today → no change; if older → reset to 1
- Store updated `lastStreakDate = today` and `currentStreak`

### Future (out of scope for 3C)
- Streak multiplier (1.2x XP) — Phase 4
- Faster AI life recharge from streak — Phase 4

---

## Achievements (Minimal Real)

Computed dynamically — no new DB model. Count how many of these milestones are true:

| # | Achievement | Condition |
|---|---|---|
| 1 | Profile Complete | `user.bio != null && user.image != null && user.username != null` |
| 2 | First AI-Validated Skill | At least 1 `UserSkill` with `aiValidated = true` |
| 3 | AI Survivor | At least 1 completed AI assessment (to be determined based on existing data) |

- `achievements.current` = count of milestones met (0–3)
- `achievements.total` = 3 (fixed for now)
- No achievement unlock events, no badge records, no notifications in this spec

---

## Caching Strategy

Use Next.js `unstable_cache` with `revalidateTag`:
- Cache tag: `user-stats-${userId}`
- Invalidate when user creates/updates: experience, skill, project, profile
- Fresh on first load; cached on subsequent loads until invalidated

---

## Dashboard Components to Update

| Component | Current mock | Real data source |
|---|---|---|
| `WelcomeCard` XP bar | `currentXP: 1900, maxXP: 2450` | Computed `TotalXP`, next level threshold |
| `WelcomeCard` level | `level: 18` | `floor(sqrt(TotalXP / 100))` |
| `WelcomeCard` streak | `streakDays: 12` | `user.currentStreak` from DB |
| `HexStatGrid` XP | same | same |
| `HexStatGrid` level | same | same |
| `HexStatGrid` experiences | mock | count of user's experiences |
| `HexStatGrid` achievements | `{ current: 18, total: 42 }` | computed milestones `{ current: 0-3, total: 3 }` |

---

## Active Missions Panel

**Out of scope for 3C.** Keep the existing hardcoded missions list. Do not touch `ActiveMissionsPanel`.

Dynamic AI-powered goals deferred to Phase 5.

---

## Architecture

### New function: `getUserDashboardStats`

Location: `features/dashboard/data/getUserDashboardStats.data.ts`

Returns:
```ts
interface DashboardStats {
  totalXP: number
  level: number
  xpToNextLevel: number      // XP needed to reach next level
  currentLevelXP: number     // XP at start of current level (for progress bar)
  nextLevelXP: number        // XP at start of next level
  experiencesCount: number
  achievements: { current: number; total: number }
  currentStreak: number
}
```

Single Prisma query aggregation — fetch experiences, projects, skills (AI-validated only) in one call.

### Streak update: server action hook

Add streak update logic to the existing `actionWrapper` or to each content-creation action directly. When a user saves content → call `updateStreak(userId)` utility.

### Revalidation

Add `revalidateTag(\`user-stats-${userId}\`)` to:
- `createExperience` / `updateExperience` actions
- `createSkill` / `updateSkill` actions
- `createProject` / `updateProject` actions

---

## Out of Scope for 3C

- XP multiplier from streak (Phase 4)
- AI life recharge from streak (Phase 4)
- Full achievement system with unlock events (Phase 5)
- Dynamic AI-powered missions (Phase 5)
- GitHub activity as XP source (Phase 3A)
- Classic Mode validation via image/vision AI (future)
- XP for testimonials/reviews (future)

---

## No Visual Assets

User reference: "inspire from the current dashboard." Existing `WelcomeCard` and `HexStatGrid` components are the visual reference — no layout changes, only data wiring.
