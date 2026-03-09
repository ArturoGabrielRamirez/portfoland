# Specification: 4F — Skill Icons + Visual Fix

## Goal

Replace first-letter placeholders in all skill displays with real Devicon technology icons, and fix two layout bugs: hexagon node overlapping in `CRTSkillCanvas` when skill counts are high, and skill badge overflow in timeline `ExperienceCard`.

## User Stories

- As a visitor viewing a Tech Mode portfolio, I want to see recognizable technology icons on skill hexagons so I can instantly identify the tech stack at a glance.
- As a developer, I want my skill detail card and mobile skill list to show the technology's icon so the UI feels polished and professional.

## Specific Requirements

**Devicon utility — `features/skills/utils/devicons.ts`**
- Pure TypeScript module (no `'use client'`), zero npm dependencies — uses Devicon CDN
- Export `getDeviconSlug(skillName: string): string | null` that normalizes input (lowercase, trim, strip punctuation) then returns the matching Devicon slug or `null`
- Map at minimum 40 common skills: `javascript`, `typescript`, `react`, `nextjs`, `nodejs`, `python`, `go`, `rust`, `java`, `php`, `ruby`, `swift`, `kotlin`, `html5`, `css3`, `tailwindcss`, `sass`, `vue`, `angular`, `svelte`, `graphql`, `postgresql`, `mysql`, `mongodb`, `redis`, `sqlite`, `docker`, `kubernetes`, `git`, `github`, `gitlab`, `linux`, `nginx`, `aws`, `googlecloud`, `azure`, `figma`, `vscode`, `jest`, `webpack`, `vite`, `prisma`
- Normalize aliases: `"node.js"` → `nodejs`, `"next.js"` → `nextjs`, `"postgres"` → `postgresql`, `"tailwind"` → `tailwindcss`, `"vue.js"` → `vue`, `"react native"` → `react`
- Export `getDeviconUrl(slug: string): string` that returns the CDN URL: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{slug}/{slug}-original.svg` (fallback to `-plain.svg` variant is handled at runtime via `onError`)

**`SkillIcon` component — `features/skills/components/SkillIcon.tsx`**
- Client component that accepts `skillName: string`, `size: 'xs' | 'sm' | 'md' | 'lg'` (px: 16/20/28/40), and optional `className`
- Internally calls `getDeviconSlug(skillName)` to resolve the CDN URL
- Renders an `<img>` tag with `alt={skillName}`, fixed `width`/`height`, and `onError` fallback to `-plain.svg` variant; if both fail, renders the colored-circle fallback
- Fallback (no Devicon match or all `onError` fired): a small circle with `backgroundColor` derived from the first char's char code mod applied to a palette of 6 category-like colors, containing the first 2 characters of `skillName` in white, `text-[10px] font-mono font-bold`
- Props type defined in `features/skills/types/skill.ts`
- No external npm packages — CDN `<img>` only

**`CRTSkillCanvas` hexagon layout fix — `features/skills/components/CRTSkillCanvas.tsx`**
- Current bug: nodes at high skill counts have overlapping `absolute` positioned divs because `generateNodePositions` places nodes on a circle with a fixed `skillRadius` of 60-100px regardless of skill count
- Fix: increase `skillRadius` proportionally when `skillCount > 6` — use `Math.max(60, skillCount * 18)` for the orbit radius, capped at 180px, so dense categories spread further apart
- Also increase the `groupRadius` base when total skill count is high: multiply `radiusBase` by `1 + (totalSkillCount / 60)` (cap factor at 1.5) so the whole galaxy expands with more skills
- Do not change any visual styling, colors, or connection logic — only the position calculation

**`CRTSkillCanvas` node content — show icon in hexagon**
- Inside the `<button>` skill node, replace the single-letter `<span>` with `<SkillIcon skillName={node.skill.skill?.name ?? ''} size="sm" />`
- The level badge (`-top-1 -right-1`) and glow overlay remain unchanged
- The `SkillIcon` must be `relative z-10` so it sits above the SVG hexagon background

**`SkillDetailCard` header icon — `features/skills/components/SkillDetailCard.tsx`**
- In the header's hexagon avatar (`w-16 h-16 clip-hexagon`), replace `{userSkill.skill?.name?.charAt(0).toUpperCase() ?? '?'}` with `<SkillIcon skillName={userSkill.skill?.name ?? ''} size="lg" />`
- The `Crown` overlay for legendary level stays in place above the icon
- Import `SkillIcon` from `../components/SkillIcon`

**`MobileSkillItem` icon — `features/skills/components/MobileSkillItem.tsx`**
- In the "Skill Letter Badge" `div` (currently `w-10 h-10`), replace the first-char `<span>` with `<SkillIcon skillName={userSkill.skill?.name ?? ''} size="md" />`
- Keep the existing `backgroundColor` and `boxShadow` on the container div for the category color ring — only the inner content changes

**Timeline `ExperienceCard` skill badges — `features/timeline/components/ExperienceCard.tsx`**
- Current bug: skill badges in the "Skills" section overflow awkwardly with many skills because the container is `flex flex-wrap gap-1.5` with no `max-h` constraint
- Fix: add `max-h-20 overflow-hidden` to the skills container and show a `+N more` badge when `skills.length > 5` (already capped at `slice(0, 5)` — verify this cap is correct and add a `+N more` indicator if missing)
- Add `<SkillIcon skillName={skill} size="xs" />` before each skill name text inside the badge `<span>`, with `inline-flex items-center gap-1` on the badge

**`SkillIcon` props in types**
- Add `SkillIconProps` interface to `features/skills/types/skill.ts`:
  - `skillName: string`
  - `size?: 'xs' | 'sm' | 'md' | 'lg'`
  - `className?: string`

## Visual Design

No mockups provided. Follow the established Tech Mode palette:

- Devicon `<img>` renders in full color with natural transparency on the dark `#0A0E1A` / `hsl(200,30%,8%)` background — no tinting needed
- Fallback circle colors should match the 6 `CATEGORY_COLORS` palette: `#D946EF`, `#A855F7`, `#22C55E`, `#F97316`, `#EC4899`, `#EAB308` — pick by `skillName.charCodeAt(0) % 6`
- At `size="sm"` (20px) inside the 64px hexagon node, the icon should be visually centered; ensure the icon does not overflow the hexagon boundary
- In the `SkillDetailCard` header hexagon, at `size="lg"` (40px) inside the `w-16 h-16` container, the icon fills most of the hexagon with appropriate breathing room

## Existing Code to Leverage

**`SkillHexagonNode` letter display pattern (`features/skills/components/SkillHexagonNode.tsx` line 265–278)**
- Currently renders `skillLetter` as a `<span>` inside the hexagon SVG button — this is exactly the location to swap for `<SkillIcon>`; replicate the `relative z-10` positioning and the `textShadow` glow is not needed for the icon

**`MobileSkillItem` letter badge (`features/skills/components/MobileSkillItem.tsx` line 82–90)**
- The `div` with `backgroundColor: userSkill.skill?.category?.color` is the container to replace the inner text with `<SkillIcon>` while keeping the container styling intact

**`ExperienceCard` skills slice pattern (`features/timeline/components/ExperienceCard.tsx` line 152–166)**
- Already slices to 5 and shows `+N more` count badge — confirm the `+N more` indicator is already present and only needs the icon added to each displayed badge

**`getDeviconSlug` fallback-first pattern from constants**
- The `getCategoryColor` utility in `features/skills/constants/categories.ts` uses a record lookup with a default fallback — mirror this exact pattern for `getDeviconSlug` with a `Record<string, string>` of normalized slug mappings

**CDN `<img>` pattern (no npm)**
- No new npm packages should be installed; the Devicon CDN `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/` is publicly available and served with long cache headers — use a plain `<img>` tag with `onError` for the `-plain.svg` fallback, then the letter fallback

## Out of Scope

- Installing the `simple-icons` npm package or any other icon library package
- Modifying the Prisma `Skill.iconName` field or writing any DB migrations
- Populating `iconName` in the database for existing skills
- Adding icon selection UI in the skill creation/edit form (`ManualSkillForm`)
- Applying icons to the Classic Mode portfolio skill section (`features/portfolio/components/classic/`)
- Modifying `SkillHexagonNode` (used in the deprecated galaxy view path — the active canvas is `CRTSkillCanvas`)
- Fixing any bugs in the Galaxy canvas (`GalaxyCanvas.tsx`) or `StarfieldBackground.tsx`
- Adding animations or hover effects specific to the icon beyond what the existing hexagon hover already provides
- Changing any colors, category logic, or XP/level display
- i18n / translation strings for icon-related content
