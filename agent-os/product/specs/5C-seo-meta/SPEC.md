# Spec 5C — SEO Meta Generator

## Goal

Generate rich, template-based SEO meta tags (title, description, Open Graph, Twitter Card) for the public portfolio page using the user's real portfolio data.

## Approach

Template-based generation — no AI call. Fast, deterministic, no quota cost.

## Files Changed

- `features/portfolio/utils/generatePortfolioMeta.ts` — pure utility, returns `PortfolioMetaValues`
- `app/[locale]/[username]/page.tsx` — adds `generateMetadata` export

## Logic

### `generatePortfolioMeta(data, locale)`

Returns `{ title, description, ogTitle, ogDescription, keywords }`.

- **title** (`< 60 chars`): `"{name} — {topSkill} Developer | Portfoland"` or `"{name} | Portfolio | Portfoland"` if no skills.
- **description** (`< 160 chars`): first 120 chars of bio + `" | Skills: {top 5 skills}"`. Falls back to generic string when bio is empty.
- **ogTitle** (`< 70 chars`): same pattern as title.
- **ogDescription** (`< 200 chars`): first sentence of bio + skill count + experience count stats.
- **keywords**: skill names + name + `"portfolio"`, `"developer"`, `"portfoland"`.

All fields degrade gracefully for empty bio, no skills, etc.

### `generateMetadata` (page)

- Calls `getPortfolioByUsername` (Next.js deduplicates the fetch with the page component).
- Returns full Next.js `Metadata` object: title, description, keywords, alternates, openGraph, twitter, robots.
- OG image: user avatar if present, else `/api/og?username=...&mode=...&locale=...`.
- On 404 (user not found): returns minimal fallback metadata.
