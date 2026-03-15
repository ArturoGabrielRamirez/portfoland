# Tasks — Spec 5C: SEO Meta Generator

## Implementation Tasks

- [x] Create `features/portfolio/utils/generatePortfolioMeta.ts`
  - Pure utility function `generatePortfolioMeta(data: PortfolioData, locale: string): PortfolioMetaValues`
  - Title under 60 chars with topSkill or fallback
  - Description under 160 chars combining bio + top skills
  - ogTitle and ogDescription with richer detail
  - Keywords array from skill names + name + generic terms
  - Graceful handling of missing data (no bio, no skills)

- [x] Update `app/[locale]/[username]/page.tsx`
  - Add `generateMetadata` export function
  - Fetch portfolio data via `getPortfolioByUsername` (Next.js deduplicates with page fetch)
  - Call `generatePortfolioMeta` for meta values
  - Return full `Metadata` object: title, description, keywords, alternates, openGraph, twitter, robots
  - OG image: user avatar if available, else `/api/og` endpoint
  - 404 fallback metadata when user not found

- [x] Create `agent-os/product/specs/5C-seo-meta/SPEC.md`
- [x] Create `agent-os/product/specs/5C-seo-meta/tasks.md`
