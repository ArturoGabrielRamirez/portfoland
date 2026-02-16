# Task Breakdown: Portfolio SEO & Meta Tags

## Overview
Total Tasks: 3 Groups

## Task List

### Foundation Layer

#### Task Group 1: Localization & Data Prep
**Dependencies:** None

- [ ] 1.0 Prepare localization keys and verify data fetching
  - [ ] 1.1 Create test to verify `getPortfolioByUsername` returns needed fields (mode, bio, skills)
  - [ ] 1.2 Add SEO translation keys to `messages/en.json` and `messages/es.json` (title, description templates)
  - [ ] 1.3 Verify `next-intl` setup allows accessing these keys in `generateMetadata`

**Acceptance Criteria:**
- `getPortfolioByUsername` confirmed to return `portfolioMode`.
- `messages/*.json` contain `Seo` namespace with title/description templates.
- Test confirms data accessibility.

### API Layer

#### Task Group 2: Dynamic OG Image Generation (Satori)
**Dependencies:** Group 1 (Data Prep)

- [ ] 2.0 Implement `/api/og` route with Dual Mode templates
  - [ ] 2.1 Create basic test for `/api/og` endpoint (status 200)
  - [ ] 2.2 Implement `app/api/og/route.tsx` skeleton with `ImageResponse`
  - [ ] 2.3 Implement **Gaming Mode** template (Cyberpunk, Neon, Stats)
  - [ ] 2.4 Implement **Professional Mode** template (Clean, Minimal)
  - [ ] 2.5 Add font loading (Gaming font + Standard font)
  - [ ] 2.6 Integrate real data fetching in the route
  - [ ] 2.7 Verify generated images via browser manual test

**Acceptance Criteria:**
- GET `/api/og?username=demo&mode=gaming` returns a binary image.
- Gaming mode shows dark theme + hex patterns.
- Professional mode shows light theme + clean typography.
- Performance is acceptable (under 2s generation).

### UI Layer

#### Task Group 3: Metadata & JSON-LD Integration
**Dependencies:** Group 2 (for OG URL)

- [ ] 3.0 Integrate SEO into Portfolio Page
  - [ ] 3.1 Write test for `generateMetadata` output
  - [ ] 3.2 Implement `generateMetadata` in `app/[locale]/[username]/page.tsx` using localized strings
  - [ ] 3.3 Construct Canonical URL and OG Image URL (pointing to `/api/og`)
  - [ ] 3.4 Create `JsonLd` component for Person/Occupation schema
  - [ ] 3.5 Inject `JsonLd` into page body
  - [ ] 3.6 Manual verification: Check `<head>` tags in browser

**Acceptance Criteria:**
- Page `<head>` contains correct `title`, `description`, `canonical`.
- `og:image` tags point to correct API route with params.
- JSON-LD is valid (test with Google Rich Results Test tool or validator).
- Switching locale (`/en` vs `/es`) updates metadata language.

## Execution Order
1. **Task Group 1** (Foundation) - Unlocks localization.
2. **Task Group 2** (API) - Independent, complex piece.
3. **Task Group 3** (UI) - Ties everything together.
