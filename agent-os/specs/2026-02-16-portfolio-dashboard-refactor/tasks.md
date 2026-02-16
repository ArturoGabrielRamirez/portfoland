# Task Breakdown: Portfolio Dashboard Refactor

## Overview
Total Tasks: 15

## Task List

### Layer 1: Database & Types

#### Task Group 1: Schema Extension
**Dependencies:** None

- [ ] 1.0 Update `prisma/schema.prisma` to include new User fields.
  - [ ] 1.1 Add `sectionOrder` (String array) with default `['about', 'experience', 'skills', 'projects']`.
  - [ ] 1.2 Add `contactLinks` (Json) field.
  - [ ] 1.3 Add `sectionVisibility` (Json) field.
  - [ ] 1.4 Run `bunx prisma generate`.
- [ ] 2.0 Update Portfolio Types.
  - [ ] 2.1 Update `PortfolioUser` interface in `features/portfolio/types/portfolio.ts`.
  - [ ] 2.2 Update any relevant data fetching Zod schemas.

**Acceptance Criteria:**
- `PrismaClient` includes the new fields.
- Typescript definitions for `PortfolioUser` are correct.

---

### Layer 2: Actions & Logic

#### Task Group 2: Profile Update Action
**Dependencies:** Task Group 1

- [ ] 3.0 Enhance `updateProfile` action in `features/portfolio/actions/updateProfile.ts`.
  - [ ] 3.1 Write tests for validating complex `contactLinks` (Json) and `sectionOrder`.
  - [ ] 3.2 Update Zod schema for profile validation.
  - [ ] 3.3 Implement logic to persist the new fields.
  - [ ] 3.4 Ensure tests pass.

**Acceptance Criteria:**
- Profile action can save section order and social links without errors.
- Invalid data structure for JSON links is rejected.

---

### Layer 3: UI Implementation

#### Task Group 3: HUD Panel Refactor
**Dependencies:** Task Group 2

- [ ] 4.0 Create a reusable `HUDPanel` wrapper based on `ExperienceForm.tsx` patterns.
  - [ ] 4.1 Implement title bar with visibility toggle and up/down arrows.
  - [ ] 4.2 Ensure consistent cyberpunk styling (borders, glows).
- [ ] 5.0 Refactor `DashboardPortfolioView.tsx` to use HUD Panels for each section.
  - [ ] 5.1 Implement Bio Editor HUD (supporting Markdown).
  - [ ] 5.2 Implement Contact Info HUD (Fixed + Dynamic links).
  - [ ] 5.3 Implement Section Order logic within the view.

**Acceptance Criteria:**
- Dashboard UI matches the "Gaming" HUD aesthetic.
- Clicking arrows immediately updates the local order state.
- Visibility toggles are functional in the UI.

---

### Layer 4: Public Portfolio Sync

#### Task Group 4: Portfolio Rendering
**Dependencies:** Task Group 3

- [ ] 6.0 Update Portfolio Rendering logic.
  - [ ] 6.1 Ensure sections are sorted according to `user.sectionOrder`.
  - [ ] 6.2 Implement visibility checks before rendering each section.
  - [ ] 6.3 Render the Bio as Markdown on the public page.
  - [ ] 6.4 Display the new `contactLinks` in the public view.

**Acceptance Criteria:**
- Public portfolio honors the order and visibility set in the dashboard.
- Social links appear correctly on the public page.

---

## Execution Order
1. [Schema Extension] (foundational)
2. [Profile Update Action] (data integrity)
3. [HUD Panel Refactor] (core UI)
4. [Portfolio Rendering] (validation)
