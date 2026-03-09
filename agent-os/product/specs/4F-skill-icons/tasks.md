# Task Breakdown: 4F — Skill Icons + Visual Fix

## Overview

Total Task Groups: 8
Total Tasks: ~28

Replace all single-letter skill placeholders with real Devicon technology icons across the skill canvas, detail card, mobile list, and timeline. Fix two independent layout bugs: hexagon node overlapping in `CRTSkillCanvas` when skill counts are high, and a missing `+N more` indicator on `ExperienceCard` skill badges.

No npm packages are added. All icon loading uses the Devicon CDN via plain `<img>` tags.

---

## Task List

### TG1: Devicon Utility

**File:** `features/skills/utils/devicons.ts` (new file — create the `utils/` directory first)
**Dependencies:** None

- [x] TG1-A: Create `features/skills/utils/devicons.ts` as a pure TypeScript module (no `'use client'`, no npm imports).
  - Export `DEVICON_SLUGS: Record<string, string>` — a flat normalized lookup map. Keys are already-lowercased, trimmed, punctuation-stripped names. Values are the exact Devicon slug string.
  - Include all 42 slugs required by the spec: `javascript`, `typescript`, `react`, `nextjs`, `nodejs`, `python`, `go`, `rust`, `java`, `php`, `ruby`, `swift`, `kotlin`, `html5`, `css3`, `tailwindcss`, `sass`, `vue`, `angular`, `svelte`, `graphql`, `postgresql`, `mysql`, `mongodb`, `redis`, `sqlite`, `docker`, `kubernetes`, `git`, `github`, `gitlab`, `linux`, `nginx`, `aws`, `googlecloud`, `azure`, `figma`, `vscode`, `jest`, `webpack`, `vite`, `prisma`.
  - Mirror the `getCategoryColor` pattern from `features/skills/constants/categories.ts` (Record lookup with default fallback).

- [x] TG1-B: Export `getDeviconSlug(skillName: string): string | null` from the same file.
  - Normalize input: `skillName.toLowerCase().trim().replace(/[^a-z0-9]/g, '')`.
  - After stripping, apply alias substitutions before the lookup: `"nodejs"` → `nodejs`, `"nextjs"` → `nextjs`, `"postgres"` → `postgresql`, `"tailwind"` → `tailwindcss`, `"vuejs"` → `vue`, `"reactnative"` → `react`. Alias map keys should be the already-stripped form.
  - Perform the lookup in `DEVICON_SLUGS`; return the slug or `null` if not found.

- [x] TG1-C: Export `getDeviconUrl(slug: string): string` from the same file.
  - Returns `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`.
  - Export a companion `getDeviconPlainUrl(slug: string): string` that returns the `-plain.svg` variant — this is used by `SkillIcon`'s `onError` handler.

---

### TG2: SkillIcon Component

**File:** `features/skills/components/SkillIcon.tsx` (new file)
**Dependencies:** TG1

- [x] TG2-A: Add `SkillIconProps` interface to `features/skills/types/skill.ts`.
  - Fields: `skillName: string`, `size?: 'xs' | 'sm' | 'md' | 'lg'`, `className?: string`.
  - Place the interface in the "Component Props Types" section of that file, following the existing JSDoc comment pattern.

- [x] TG2-B: Create `features/skills/components/SkillIcon.tsx` as a `'use client'` component.
  - Import `SkillIconProps` from `../types/skill`.
  - Import `getDeviconSlug`, `getDeviconUrl`, `getDeviconPlainUrl` from `../utils/devicons`.
  - Size-to-pixel map: `xs` → 16, `sm` → 20, `md` → 28, `lg` → 40. Default size is `sm`.
  - Resolve slug via `getDeviconSlug(skillName)`. If `null`, render the fallback circle immediately (no `<img>` rendered).
  - When slug is found, render `<img src={getDeviconUrl(slug)} width={px} height={px} alt={skillName} />`.
  - `onError` first attempt: swap `src` to `getDeviconPlainUrl(slug)`. Use a `useState` boolean `plainFailed` to track whether the plain variant has already errored. On second `onError`, set `plainFailed` to true and render the fallback circle.
  - Fallback circle: `<div>` with `width`/`height` set to the px value, `borderRadius: '50%'`, `backgroundColor` from `FALLBACK_COLORS[skillName.charCodeAt(0) % 6]`, containing a `<span>` of `skillName.slice(0, 2).toUpperCase()` styled `text-[10px] font-mono font-bold text-white`.
  - `FALLBACK_COLORS` constant (inline in the same file): `['#D946EF', '#A855F7', '#22C55E', '#F97316', '#EC4899', '#EAB308']` — matches `CATEGORY_COLORS` order from `features/skills/constants/categories.ts`.
  - Apply `cn(className)` to the outermost element using `cn` from `@/lib/utils`.
  - Export as named export `SkillIcon`.

- [x] TG2-C: Add `SkillIcon` to the barrel export in `features/skills/components/index.ts`.
  - Add line: `export { SkillIcon } from './SkillIcon';` under the "Core components" block.

---

### TG3: Fix Hexagon Layout Bug in CRTSkillCanvas

**File:** `features/skills/components/CRTSkillCanvas.tsx` (lines 107–116 in `generateNodePositions`)
**Dependencies:** None (independent visual fix)

- [x] TG3-A: Replace the fixed `skillRadius` calculation on line 113 of `CRTSkillCanvas.tsx`.
  - Current code: `const skillRadius = 60 + (skillCount > 3 ? 40 : 0);`
  - New code: `const skillRadius = Math.min(Math.max(60, skillCount * 18), 180);`
  - This is the only line that changes. Do not touch any other part of the function.

- [x] TG3-B: Add dynamic `radiusBase` scaling based on total skill count in `generateNodePositions`.
  - `generateNodePositions` currently computes `const radiusBase = Math.min(width, height) * 0.3;` on line 54.
  - After that line, compute `totalSkillCount` as the sum of all `group.skills.length` across all groups.
  - Apply: `const scaledRadiusBase = radiusBase * Math.min(1 + (totalSkillCount / 60), 1.5);`
  - Replace all subsequent uses of `radiusBase` in the function body with `scaledRadiusBase`. The only usage is on line 96: `const groupRadius = radiusBase + (groupIndex % 2) * 80;` — change it to `const groupRadius = scaledRadiusBase + (groupIndex % 2) * 80;`.

---

### TG4: Integrate SkillIcon into SkillDetailCard Header

**File:** `features/skills/components/SkillDetailCard.tsx` (line 233)
**Dependencies:** TG2

- [x] TG4-A: Add `SkillIcon` import to `SkillDetailCard.tsx`.
  - Add: `import { SkillIcon } from './SkillIcon';`

- [x] TG4-B: Replace the letter avatar with `SkillIcon` in `SkillDetailCard.tsx`.
  - Target: line 233 — `{userSkill.skill?.name?.charAt(0).toUpperCase() ?? '?'}`.
  - Replace with: `<SkillIcon skillName={userSkill.skill?.name ?? ''} size="lg" className="relative z-10" />`.
  - The surrounding `div` (line 226–237, the `w-16 h-16 clip-hexagon` container) keeps all existing styles: `backgroundColor: categoryColor`, `boxShadow`, `clip-hexagon`, flex centering.
  - The `Crown` overlay (`absolute -top-2 -right-2`) on line 234–236 remains in place and unchanged.

---

### TG5: Integrate SkillIcon into CRTSkillCanvas Hexagon Nodes

**File:** `features/skills/components/CRTSkillCanvas.tsx` (line 464)
**Dependencies:** TG2, TG3

- [x] TG5-A: Add `SkillIcon` import to `CRTSkillCanvas.tsx`.
  - Add: `import { SkillIcon } from './SkillIcon';`

- [x] TG5-B: Replace the single-letter `<span>` inside each hexagon `<button>` node with `SkillIcon`.
  - Target: lines 463–465 — the `<span>` containing `{node.skill.skill?.name?.charAt(0) || '?'}`.
  - Replace with:
    ```tsx
    <SkillIcon
      skillName={node.skill.skill?.name ?? ''}
      size="sm"
      className="relative z-10"
    />
    ```
  - The mini level badge (`absolute -top-1 -right-1`) and the glow hover overlay beneath remain completely unchanged.

---

### TG6: Integrate SkillIcon into MobileSkillItem

**File:** `features/skills/components/MobileSkillItem.tsx` (lines 82–90)
**Dependencies:** TG2

- [x] TG6-A: Add `SkillIcon` import to `MobileSkillItem.tsx`.
  - Add: `import { SkillIcon } from './SkillIcon';`

- [x] TG6-B: Replace the first-character `<span>` inside the "Skill Letter Badge" `div` with `SkillIcon`.
  - Target: line 89 — `{userSkill.skill?.name?.charAt(0).toUpperCase() ?? '?'}`.
  - Replace with: `<SkillIcon skillName={userSkill.skill?.name ?? ''} size="md" />`.
  - The outer `div` (lines 82–88) with `w-10 h-10 rounded-sm flex items-center justify-center`, `backgroundColor`, and `boxShadow` styles remains entirely unchanged — only the inner content changes.

---

### TG7: Fix ExperienceCard Timeline Skill Badges

**File:** `features/timeline/components/ExperienceCard.tsx` (lines 151–166)
**Dependencies:** TG2

- [x] TG7-A: Add `SkillIcon` import to `ExperienceCard.tsx`.
  - Add: `import { SkillIcon } from '@/features/skills/components/SkillIcon';`

- [x] TG7-B: Verify the `+N more` badge is already present and correct.
  - Inspect lines 161–165: the existing code already does `slice(0, 5)` and renders a `+{experience.skills.length - 5}` badge when `experience.skills.length > 5`.
  - Confirm that the `+N more` span uses class `text-muted-foreground` and does NOT need a `SkillIcon` (it is a count badge, not a skill badge).
  - No code change needed for the `+N more` badge itself — it is already correct.

- [x] TG7-C: Add `SkillIcon` to each displayed skill badge span and convert to `inline-flex`.
  - Target: the `<span>` on lines 153–159 that renders each individual skill.
  - Current markup:
    ```tsx
    <span
      key={skill}
      className="px-2 py-0.5 text-xs rounded-sm bg-[hsl(174,100%,50%,0.1)] text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%,0.2)]"
    >
      {skill}
    </span>
    ```
  - New markup:
    ```tsx
    <span
      key={skill}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm bg-[hsl(174,100%,50%,0.1)] text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%,0.2)]"
    >
      <SkillIcon skillName={skill} size="xs" />
      {skill}
    </span>
    ```
  - Changes: add `inline-flex items-center gap-1` to the `className`, and prepend `<SkillIcon skillName={skill} size="xs" />` inside the span. All other classes stay identical.

---

### TG8: QA Checklist

**Dependencies:** TG1–TG7 all complete

- [x] TG8-A: Devicon utility smoke check.
  - Open `features/skills/utils/devicons.ts` and verify `getDeviconSlug('Next.js')` → `'nextjs'`, `getDeviconSlug('Postgres')` → `'postgresql'`, `getDeviconSlug('tailwind')` → `'tailwindcss'`, `getDeviconSlug('vue.js')` → `'vue'`, `getDeviconSlug('NotARealSkill')` → `null`.
  - Verify `getDeviconUrl('react')` returns `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg`.

- [x] TG8-B: SkillIcon CDN rendering check.
  - Navigate to the Skills dashboard page (Tech Mode). Confirm hexagon nodes now show Devicon SVG images instead of capital letters for skills like React, TypeScript, Docker.
  - Zoom in on the canvas and confirm icons are visually centered inside the 64px hexagon, do not overflow the hexagon boundary, and the level badge remains visible in the top-right corner.

- [x] TG8-C: SkillIcon fallback check.
  - Add or locate a skill with an uncommon name (e.g., "Leadership" or any custom skill name not in the devicons map). Confirm the fallback colored circle renders with 2-character initials, correct background color from the palette, and does not cause a console error or broken image icon.

- [x] TG8-D: SkillDetailCard header check.
  - Click any skill hexagon node to open the `SkillDetailCard` slide-in panel. Confirm the `w-16 h-16 clip-hexagon` avatar in the header now shows the Devicon icon at `size="lg"` (40px), centered with breathing room. Confirm the `Crown` icon still renders for any Level 5 (Legendary) skill if one exists.

- [x] TG8-E: MobileSkillList check (mobile viewport or dev tools narrow screen).
  - Resize the browser to a mobile width. Confirm each skill row's letter badge `div` now shows `SkillIcon` at `size="md"` (28px). Confirm the container `backgroundColor` category color ring still appears around the icon.

- [x] TG8-F: Hexagon layout overlap check.
  - On the Skills canvas, navigate to a category with 8 or more skills (or use a dev account with many skills). Confirm nodes no longer visually overlap each other. Confirm the overall galaxy has expanded proportionally and all categories remain visible within the canvas without needing to pan.

- [x] TG8-G: ExperienceCard skill badges check.
  - Navigate to the Timeline page. Click an experience node that has skills attached. In the `ExperienceCard` popup, confirm: (a) each displayed skill badge now shows an `xs` Devicon icon to the left of the skill name text, (b) the `+N more` badge still appears correctly when more than 5 skills are present, (c) the badge layout does not overflow the card width.

- [x] TG8-H: TypeScript compilation check.
  - Run `npx tsc --noEmit` from the project root. Confirm zero new TypeScript errors introduced by this spec.
  - Confirm that the `SkillIconProps` interface is properly imported (not redefined) in `SkillIcon.tsx`.

---

## Execution Order

```
TG1 (devicons.ts utility)
  └─> TG2 (SkillIcon component + props type + barrel export)
        ├─> TG4 (SkillDetailCard header)
        ├─> TG5 (CRTSkillCanvas nodes)  ← also depends on TG3
        ├─> TG6 (MobileSkillItem)
        └─> TG7 (ExperienceCard badges)

TG3 (hexagon layout fix) — independent, can be done in parallel with TG1/TG2

TG8 (QA) — after all above complete
```

TG3 has no dependency on TG1 or TG2 and can be implemented at any point before TG8. TG5 should be done after both TG2 and TG3 are complete so the icon and the layout fix are both in place before verifying the canvas.
