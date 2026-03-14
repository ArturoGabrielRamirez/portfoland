# Spec 5F: Classic Mode Templates

## Overview

Add 3 new layout variants for Classic Mode public portfolios: `photographer`, `designer`, and `writer`. Each variant reorders/emphasizes different sections to match the professional's needs. The user selects a variant in the dashboard; it is stored in `PortfolioSettings.layoutVariant`.

## Goals

- Allow Classic Mode users to select a profession-specific portfolio layout
- Reuse ALL existing Classic section components — no new components created
- Store selection in `PortfolioSettings.layoutVariant` (field already exists in DB)
- Surface the selector in the dashboard portfolio settings page, only for Classic Mode users

## Non-Goals

- Tech Mode templates (Tech Mode has its own rendering path)
- New DB models or migrations
- New section components

## Architecture

### Templates (new files)

| File | Layout Order |
|------|-------------|
| `PhotographerTemplate.tsx` | Hero → Gallery → Services → Testimonials → About → Contact → AI |
| `DesignerTemplate.tsx` | Hero → Gallery → Skills → Projects → About → Services → Testimonials → Contact → AI |
| `WriterTemplate.tsx` | Hero → About → Timeline → Projects → Skills → Testimonials → Contact → AI |

### Routing

`PortfolioLayout.tsx` checks `layoutVariant` before falling through to view mode routing:

```
if (mode === 'classic') {
  if (layoutVariant === 'photographer') → PhotographerTemplate
  if (layoutVariant === 'designer')     → DesignerTemplate
  if (layoutVariant === 'writer')       → WriterTemplate
}
// fall through to viewMode routing (one_page / minimal / terminal / sections)
```

### Dashboard Component

`LayoutVariantSelector.tsx` — 4-card selector panel (Default, Photographer, Designer, Writer). Only shown when `portfolioMode === 'classic'`.

### Backend Changes

- `portfolioSettings.schema.ts` — adds `photographer`, `designer`, `writer` to `VALID_LAYOUT_VARIANTS`
- `portfolioSettings.service.ts` — syncs `VALID_LAYOUT_VARIANTS` constant
- `portfolioSettingsActions.ts` — adds `updateLayoutVariantAction` server action

## Data Flow

User clicks a template card → `updateLayoutVariantAction(layoutVariant)` → service validates → `updatePortfolioSettingsData` upserts → `revalidatePath('/dashboard/portfolio')` → public portfolio re-renders with new template.

## Files Modified

- `features/portfolio-settings/schemas/portfolioSettings.schema.ts`
- `features/portfolio-settings/services/portfolioSettings.service.ts`
- `features/portfolio-settings/actions/portfolioSettingsActions.ts`
- `features/portfolio/components/PortfolioLayout.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`

## Files Created

- `features/portfolio/components/templates/PhotographerTemplate.tsx`
- `features/portfolio/components/templates/DesignerTemplate.tsx`
- `features/portfolio/components/templates/WriterTemplate.tsx`
- `features/portfolio-settings/components/LayoutVariantSelector.tsx`
