# Spec Requirements: Portfolio SEO & Meta Tags

## Initial Description
Portfolio SEO & Meta Tags — Open Graph, structured data dinamico. Roadmap item #18, size S.

## Requirements Discussion

### First Round Questions & Answers

**Q1: Dynamic Open Graph Images**
- **Requirements:** Implement using `@vercel/og` (Satori).
- **Design:** Must support Two-Mode Strategy (Gaming vs Professional).
- **Gaming Mode:** Cyberpunk aesthetic, neon colors, HUD-style borders, "Player Card" look.
- **Professional Mode:** Clean, minimalist, corporate aesthetic for non-devs or formal contexts.
- **Content:** Name, avatar, career role/title, key skills (if space permits).

**Q2: Structured Data (JSON-LD)**
- **Schema:** Use `Person` and `Occupation` schemas.
- **Goal:** Enhance rich results for personal branding.
- **Constraint:** Skip `ItemList` for now to reduce complexity.

**Q3: Canonical URLs & Subdomains**
- **Strategy:** Set `username.portfoland.com` as the canonical URL.
- **Goal:** Prioritize the user's personal brand subdomain over `portfoland.com/[username]`.

**Q4: Metadata Localization**
- **Strategy:** Use `next-intl`.
- **Requirement:** Metadata (title, description) must match the user's selected language (EN/ES).

**Q5: Robots/Indexing**
- **Default:** `index, follow`.
- **Constraint:** "Hide from search engines" toggle is deferred to Phase 5 (Polish).

**Q6: Keywords**
- **Strategy:** Auto-generate keywords based on the user's top skills and roles from their Skill Tree.

### Existing Code to Reference
- **Landing Page SEO:** Check `app/[locale]/layout.tsx` for existing patterns (though minimal).
- **Current Portfolio Page:** `app/[locale]/[username]/page.tsx` has basic static metadata to be replaced.

### Follow-up Questions
No follow-ups needed. The distinction between Gaming/Professional modes for OG images was clarified by the user.

## Visual Assets
### Files Provided:
No visual files provided.

### Visual Insights:
- **Gaming Mode OG:** Needs to replicate the dashboard's "Cyberpunk" aesthetic. Hexagons, neon borders, dark background.
- **Professional Mode OG:** White/light gray background, serif or clean sans-serif typography, standard "business card" layout.

## Requirements Summary

### Functional Requirements
1. **Dynamic Metadata:**
   - Title: `[Name] - [Role] | Portfoland` (Localized)
   - Description: Summary of professional bio (Localized)
   - Canonical URL serving the subdomain.
   - Keywords generated from skills.
2. **Open Graph Image Generation (API Route):**
   - Endpoint: `/api/og?username=[user]&mode=[mode]`
   - Uses `ImageResponse` from `@vercel/og`.
   - Renders HTML/CSS template based on `user.portfolioMode`.
3. **Structured Data:**
   - Inject `script type="application/ld+json"` in head.
   - `Person` schema linked to `Occupation`.

### Scope Boundaries
**In Scope:**
- Metadata generation for `[username]/page.tsx`.
- `/api/og` route for dynamic image generation.
- Two visual templates for OG images (Gaming/Professional).
- JSON-LD injection.

**Out of Scope:**
- "Hide from search engines" user setting (Phase 5).
- `ItemList` schema for timeline/skills.
- Dashboard SEO settings page (Phase 3 #19).

### Technical Considerations
- **Libraries:** next-intl, @vercel/og.
- **Performance:** Ensure OG generation is cached or efficient (Vercel Edge caching).
- **Fonts:** Load custom fonts for Satori (Cyberpunk font vs Standard font).
- **Integration:** Must read `user.portfolioMode` from database to determine OG style.
