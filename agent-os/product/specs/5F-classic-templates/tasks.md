# Tasks: Spec 5F — Classic Mode Templates

## Task Group 1: Backend — extend allowed layout variants

- [x] **5F-1a** Update `VALID_LAYOUT_VARIANTS` in `portfolioSettings.schema.ts` to include `photographer`, `designer`, `writer`
- [x] **5F-1b** Update `VALID_LAYOUT_VARIANTS` constant in `portfolioSettings.service.ts` to match
- [x] **5F-1c** Add `updateLayoutVariantAction` server action to `portfolioSettingsActions.ts`

## Task Group 2: Templates

- [x] **5F-2a** Create `features/portfolio/components/templates/PhotographerTemplate.tsx`
  - Hero → Gallery → Services → Testimonials → About → Contact → AI
  - Applies theme CSS vars (same pattern as OnePageTemplate)
- [x] **5F-2b** Create `features/portfolio/components/templates/DesignerTemplate.tsx`
  - Hero → Gallery → Skills → Projects → About → Services → Testimonials → Contact → AI
  - Applies theme CSS vars
- [x] **5F-2c** Create `features/portfolio/components/templates/WriterTemplate.tsx`
  - Hero → About → Timeline → Projects → Skills → Testimonials → Contact → AI
  - Gallery omitted; applies theme CSS vars

## Task Group 3: Portfolio routing

- [x] **5F-3** Update `PortfolioLayout.tsx` to check `layoutVariant` for Classic Mode before delegating to view mode templates

## Task Group 4: Dashboard UI

- [x] **5F-4a** Create `features/portfolio-settings/components/LayoutVariantSelector.tsx`
  - 4 cards: Default, Photographer, Designer, Writer
  - `useTransition` + `updateLayoutVariantAction` + `toast` pattern
  - Matches visual style of `PortfolioViewSelector`
- [x] **5F-4b** Import and render `LayoutVariantSelector` in `DashboardPortfolioView.tsx` inside the Classic Mode guard (`user.portfolioMode === 'classic'`)
