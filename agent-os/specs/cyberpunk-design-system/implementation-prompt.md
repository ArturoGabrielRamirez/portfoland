# Implementation Prompt — Cyberpunk Design System

> Este prompt está diseñado para ser pasado a Claude Sonnet, un modelo open-source,
> u otro agente de código. Contiene toda la información necesaria para implementar
> el UI cyberpunk de Portfoland sin ambigüedad.

---

## Context

You are implementing the cyberpunk UI for **Portfoland**, a gamified portfolio platform built with:

- **Next.js** (App Router) with `app/[locale]/` i18n routing (next-intl)
- **Tailwind CSS v4** (CSS-first config, `@theme inline` in globals.css)
- **Feature-based architecture**: `features/{name}/components/`, `features/{name}/types/`
- Existing gaming components in `features/gaming/index.tsx` (barrel file with GamingButton, GamingInput, GamingCard, etc.)
- **Shadcn** components in `features/shadcn/ui/`
- **Prisma** for DB, **Better Auth** for authentication
- **Server actions** use `actionWrapper` pattern with Yup validation
- **Client components** use `useTransition` + server action + `toast` (sonner) pattern

## Critical Rules

1. **All text is monospace** — `font-mono` everywhere, no exceptions
2. **Sharp edges** — Use `rounded-sm` max for containers, never `rounded-xl`. Hexagons use clip-path/SVG
3. **Dark mode only** — Background `#0A0E1A`, no light theme
4. **Color = meaning** — Cyan=#00D4FF (actions/work), Magenta=#D946EF (achievements/certs), Green=#22C55E (education/success), Yellow=#EAB308 (XP/level/projects), Red=#EF4444 (errors), Purple=#A855F7 (special)
5. **Glow with restraint** — Only on interactive elements and active states
6. **Types in types/ folder** — Never define component prop types inline in component files
7. **`cn()` from `@/lib/utils`** for conditional classes
8. **CVA** for variant systems
9. **Hexagons as identity** — Use SVG hex for: avatars, stats, skill nodes, nav items, achievements. NOT for action buttons.
10. **Parametrize everything** — V2 backup components have hardcoded data. Extract ALL data to props.

## Design Tokens

Add these CSS custom properties to `app/globals.css` inside the `.dark` block (this app is dark-only, so also set them in `:root`):

```css
/* Add to :root AND .dark */
--cyber-bg: #0A0E1A;
--cyber-bg-elevated: #0D1421;
--cyber-bg-surface: #131B2E;
--cyber-bg-overlay: #1E293B;
--cyber-cyan: #00D4FF;
--cyber-magenta: #D946EF;
--cyber-green: #22C55E;
--cyber-yellow: #EAB308;
--cyber-red: #EF4444;
--cyber-purple: #A855F7;
--cyber-text: #E2E8F0;
--cyber-text-muted: #64748B;
--cyber-text-dim: #475569;
```

Add these animations/utilities after the existing keyframes in globals.css:

```css
@keyframes crt-scan {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
.crt-scanner {
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent);
  animation: crt-scan 4s linear infinite;
  pointer-events: none; z-index: 10;
}

@keyframes hex-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
  50%      { filter: drop-shadow(0 0 12px currentColor); }
}
.animate-hex-pulse { animation: hex-pulse 2s ease-in-out infinite; }

@keyframes data-stream {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -30; }
}
.animate-data-stream { animation: data-stream 1.5s linear infinite; }

.clip-hexagon {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

.clip-hex-tab {
  clip-path: polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%);
}

.crt-lines {
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.03) 2px, rgba(0,212,255,0.03) 4px);
  pointer-events: none;
}
```

## Task: Phase 1 — Foundation Components

### Task 1.1: Rescue HexBadge

Copy `backups/design-idea-v2/components/hex-badge.tsx` to `features/gaming/components/hex-badge.tsx`.

Changes needed:
- Move `HexBadgeProps` interface to `features/gaming/types/hex-badge.ts`
- Import `cn` from `@/lib/utils` (already does this)
- Keep `HexBadge` and `HexStatBadge` exports
- Export from `features/gaming/index.tsx` barrel file
- NO other changes — this component is ready as-is

### Task 1.2: Rescue CRTMonitor

Copy `backups/design-idea-v2/components/crt-monitor.tsx` to `features/gaming/components/crt-monitor.tsx`.

Changes needed:
- Move interfaces to `features/gaming/types/crt-monitor.ts`
- Make it accept props:
  ```typescript
  interface CRTMonitorProps {
    className?: string
    lines?: CRTLine[]          // dynamic content (default: bootSequence)
    title?: string             // header title (default: "SYS_MONITOR v3.2")
    statusText?: string        // right side status (default: "ONLINE")
    children?: React.ReactNode // for custom content instead of lines
  }
  ```
- If `lines` prop is provided, use those instead of the hardcoded `bootSequence`
- If `children` prop is provided, render children instead of line-by-line boot
- Keep the scanner line, header bar, and cursor animation
- Export from barrel file

### Task 1.3: Update existing gaming components

In `features/gaming/index.tsx`, make these changes:
- `GamingCard`: Change all `rounded-xl` to `rounded-sm`
- `GamingButton`: Change `rounded-lg` to `rounded-sm`, `rounded-md` to `rounded-sm`
- `GamingInput`: Change `rounded-lg` to `rounded-sm`
- `HUDPanel`: Change `rounded-xl` to `rounded-sm`
- `XPBar`: Change `rounded-full` to `rounded-sm` on the outer div, inner bar use `style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}` instead of `rounded-full`
- `GamingAvatar`: Add a new `shape` prop: `"circle" | "hexagon"`, default `"circle"`. When `"hexagon"`, add `clip-hexagon` class and remove `rounded-full`
- `LevelBadge`: Change `rounded-lg` to `clip-hexagon`

### Task 1.4: Build CyberpunkNav

Create `features/gaming/components/cyberpunk-nav.tsx` based on `backups/design-idea-v2/components/nav-bar.tsx`.

Adapt to Next.js:
```typescript
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
// ... lucide icons

const navItems = [
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
]

export function CyberpunkNav() {
  const pathname = usePathname()
  // Remove locale prefix for matching: /en/dashboard → /dashboard

  return (
    <nav className="flex items-center justify-center gap-1 py-3 px-4">
      <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#64748B] mr-4">
        VIEW:
      </span>
      {navItems.map((item) => {
        const isActive = // check if pathname matches
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider transition-all duration-300",
              isActive
                ? "bg-[#00D4FF] text-[#0A0E1A] font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] clip-hex-tab"
                : "text-[#64748B] hover:text-[#E2E8F0]"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

## Task: Phase 2 — Page Implementations

For each page, use the layout specs from the design system document.
Each page should:
1. Import components from `features/gaming/` barrel exports
2. Accept data as props (from server components)
3. Use `font-mono` exclusively
4. Follow the cyberpunk color system
5. Include hex grid SVG backgrounds where specified

### Reference Files (READ these first for patterns):
- `backups/design-idea-v2/components/dashboard-page.tsx` — Dashboard structure
- `backups/design-idea-v2/components/timeline-page.tsx` — Timeline structure
- `backups/design-idea-v2/components/skill-tree-page.tsx` — Skill tree canvas
- `backups/design-idea-v2/components/login-page.tsx` — Login layout (if exists)

### Important Reference Images:
- `agent-os/product/visuals/dashboard-v2.png` — Target dashboard look
- `agent-os/product/visuals/timeline-v2.png` — Target timeline look
- `agent-os/product/visuals/skilltree-v2.png` — Target skill tree look
- `agent-os/product/visuals/login-v1.png` — Target login look (V1 layout is better)

---

## Summary of All Files to Create/Modify

### Create:
- `features/gaming/components/hex-badge.tsx`
- `features/gaming/components/crt-monitor.tsx`
- `features/gaming/components/cyberpunk-nav.tsx`
- `features/gaming/types/hex-badge.ts`
- `features/gaming/types/crt-monitor.ts`

### Modify:
- `app/globals.css` — Add cyberpunk tokens + animations
- `features/gaming/index.tsx` — Update rounded corners, add exports, add hex variants

### Later Phases (not in this prompt):
- Dashboard page implementation
- Timeline page implementation
- Skill Tree page implementation
- Login page implementation
- HoneycombGrid component
- Portfolio público page
- CyberpunkFlipCard component
