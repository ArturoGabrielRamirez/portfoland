# Specification: Portfolio SEO & Meta Tags

## Goal
Implement comprehensive SEO and social sharing capabilities for public portfolio pages (`[username].portfoland.com`) to ensure high visibility and engaging presentation on search engines and social media.

## User Stories
- As a **Job Seeker**, I want my portfolio link to show a professional preview card on LinkedIn/WhatsApp so that recruiters are encouraged to click.
- As a **Developer**, I want my portfolio to have a "cyberpunk" style preview card that matches my gaming mode aesthetic.
- As a **Search Engine**, I want to understand the structure of the portfolio data (Person, Occupation) so I can display rich results.
- As a **Multilingual User**, I want my SEO metadata to appear in the correct language (English/Spanish) based on the viewer's locale.

## Specific Requirements

**Dynamic Metadata Generation**
- Implement `generateMetadata` in `app/[locale]/[username]/page.tsx`.
- Fetch user profile, mode, and bio via `getPortfolioByUsername`.
- Generate title: `[Name] - [Role] | Portfoland`.
- Generate description: Truncated bio or summary of key skills.
- Set canonical URL to the subdomain: `https://[username].portfoland.com`.
- Apply `noindex` if the user is not found.

**Dynamic Open Graph Images (OG)**
- Create API route `app/api/og/route.tsx` using `@vercel/og` (`ImageResponse`).
- Accept query params: `username`, `mode`, `locale`.
- Fetch user data server-side (cached) to populate the image.
- **Gaming Mode Template:**
  - Background: Dark hex patterns (`#0A0E1A`).
  - Font: Cyberpunk/Gaming font (load custom font).
  - Borders/Accents: Neon Cyan (`#00D4FF`) and Magenta (`#D946EF`).
  - Layout: "Player Card" style with Avatar, Level/Role, and top skills.
- **Professional Mode Template:**
  - Background: Clean White/Light Gray.
  - Font: Inter or Sans-serif.
  - Layout: Minimalist "Business Card" style with Photo, Name, and Title.
- Route metadata `openGraph.images` to this endpoint.

**Structural Data (JSON-LD)**
- Inject `<script type="application/ld+json">` in the page body or head.
- Implement `Person` schema:
  - `name`, `image`, `url`, `jobTitle`.
  - `knowsAbout` (map from Top Skills).
  - `sameAs` (links to GitHub, LinkedIn).
- Implement `Occupation` schema linked to `hasOccupation`.

**Localization**
- Use `next-intl` to localize static parts of the metadata (e.g., "Portfolio of...").
- Ensure `og:locale` matches the page locale.
- Support `en` and `es` initially.

**Performance & Caching**
- Use `edge` runtime for the OG image generation route if possible (or default to Node.js with aggressive caching).
- Cache user data fetching to avoid DATABASE hits on every social crawler visit.

## Visual Design
**OG Image - Gaming Mode**
- Background: `#0A0E1A` with subtle hexagon overlay.
- Typography: Press Start 2P or similar gaming font for headers.
- Elements: "Level [X] [Role]" badge, circular avatar with neon ring.

**OG Image - Professional Mode**
- Background: `#F8FAFC`.
- Typography: Inter / Geist Sans.
- Elements: Clean avatar, Name in bold, Role in slate gray.

## Existing Code to Leverage
**`features/portfolio/data.ts`**
- Use `getPortfolioByUsername` to fetch all necessary data (Profile, Skills, Mode) in one go.

**`app/api/auth/[...all]/route.ts`**
- Reference for API route structure (though OG route will use `next/server`).

**`messages/*.json`**
- Add new SEO-related keys (e.g., `Seo.titleTemplate`, `Seo.descriptionTemplate`).

## Out of Scope
- "Hide from search engines" toggle (deferred to Phase 5).
- `ItemList` schema for full timeline history.
- Editor preview of the OG image (dashboard feature, Phase 3 #19).
- Social share analytics.
