# Portfoland Cyberpunk Design System

> Documento de referencia para implementar el UI cyberpunk unificado.
> Combina lo mejor de V1 (component library) + V2 (cyberpunk pages) + ideas nuevas (honeycomb nav, CRT reactivo).

---

## 1. Design Tokens

### 1.1 Color Palette

```css
/* Agregar a globals.css dentro de :root o .dark */

/* === CYBERPUNK CORE PALETTE === */
--cyber-bg:          #0A0E1A;       /* Fondo principal oscuro */
--cyber-bg-elevated: #0D1421;       /* Cards, paneles */
--cyber-bg-surface:  #131B2E;       /* Hover states, superficies elevadas */
--cyber-bg-overlay:  #1E293B;       /* Bordes, divisores */

/* === NEON ACCENT COLORS === */
--cyber-cyan:        #00D4FF;       /* Primary - acciones, links, CTAs */
--cyber-magenta:     #D946EF;       /* Secondary - achievements, rare items */
--cyber-green:       #22C55E;       /* Success - completado, online, education */
--cyber-yellow:      #EAB308;       /* Warning - XP, nivel, certifications */
--cyber-red:         #EF4444;       /* Destructive - errores, danger */
--cyber-purple:      #A855F7;       /* Accent - special, legendary */

/* === TEXT HIERARCHY === */
--cyber-text:        #E2E8F0;       /* Texto principal (no blanco puro) */
--cyber-text-muted:  #64748B;       /* Texto secundario */
--cyber-text-dim:    #475569;       /* Texto terciario, labels */

/* === GLOW INTENSITIES (para box-shadow) === */
/* Uso: shadow-[0_0_Xpx_var(--glow-cyan)] */
--glow-cyan:    rgba(0, 212, 255, 0.3);
--glow-magenta: rgba(217, 70, 239, 0.3);
--glow-green:   rgba(34, 197, 94, 0.3);
--glow-yellow:  rgba(234, 179, 8, 0.3);
--glow-purple:  rgba(168, 85, 247, 0.3);

/* === BORDER OPACITY LEVELS === */
/* Bordes: usar color + opacity. Ej: border-[#00D4FF]/15 */
/* Nivel 1 (sutil):    /10 - /15  */
/* Nivel 2 (visible):  /20 - /30  */
/* Nivel 3 (activo):   /40 - /50  */
/* Nivel 4 (highlight): /60 - /80 */
```

### 1.2 Typography

```
Font Stack:
- Monospace: font-mono (Geist Mono) — TODO el UI cyberpunk usa mono
- Display:   font-mono font-bold uppercase tracking-wider — titulos, labels
- Body:      font-mono text-sm — contenido general

Tamaños:
- Micro label:  text-[8px] - text-[9px]   uppercase tracking-[0.15em]
- Small label:  text-[10px]                uppercase tracking-wider
- Body:         text-xs - text-sm          normal
- Heading:      text-lg - text-2xl         font-bold
- Display:      text-3xl+                  font-bold uppercase

Regla: TODO ES MONOSPACE. Sin excepciones.
```

### 1.3 Spacing & Layout

```
Border radius: NO rounded-xl/rounded-lg para cyberpunk puro.
- Contenedores principales: rounded-none o rounded-sm (sharp edges)
- Badges pequeños: rounded-full (solo para dots/pills)
- Hexágonos: clip-path, NO border-radius

Padding estándar:
- Cards:     p-3 a p-4
- Secciones: p-6
- Gaps:      gap-3 a gap-4

Max width: max-w-7xl mx-auto para contenido principal
```

### 1.4 Animations (agregar a globals.css)

```css
/* === CRT SCANNER LINE === */
@keyframes crt-scan {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
.crt-scanner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent);
  animation: crt-scan 4s linear infinite;
  pointer-events: none;
  z-index: 10;
}

/* === HEX PULSE (para nodos activos) === */
@keyframes hex-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
  50%      { filter: drop-shadow(0 0 12px currentColor); }
}
.animate-hex-pulse {
  animation: hex-pulse 2s ease-in-out infinite;
}

/* === DATA STREAM (para conexiones skill tree) === */
@keyframes data-stream {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -30; }
}
.animate-data-stream {
  animation: data-stream 1.5s linear infinite;
}

/* === BOOT SEQUENCE (texto apareciendo) === */
@keyframes boot-line {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-boot-line {
  animation: boot-line 0.3s ease-out forwards;
}

/* === HEXAGON CLIP PATH (utilidad global) === */
.clip-hexagon {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

/* === NAV HEXAGON CLIP PATH (más sutil, para tabs) === */
.clip-hex-tab {
  clip-path: polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%);
}

/* === CRT SCANLINES TEXTURE (overlay para monitores) === */
.crt-lines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 212, 255, 0.03) 2px,
    rgba(0, 212, 255, 0.03) 4px
  );
  pointer-events: none;
}

/* === BORDER GRADIENT TOP (para HUD panels) === */
.border-glow-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan, #00D4FF), transparent);
}
```

---

## 2. Component Inventory

### 2.1 TIER 1 — Atomic Components (build/rescue these first)

| Component | Source | Status | Notes |
|-----------|--------|--------|-------|
| **HexBadge** | V2 `hex-badge.tsx` | RESCUE AS-IS | Multi-size (sm/md/lg/xl), multi-color, fillPercent, glow. SVG hexagon. El átomo fundamental. |
| **HexStatBadge** | V2 `hex-badge.tsx` | RESCUE AS-IS | HexBadge + value/label layout. Para stat cards. |
| **CRTMonitor** | V2 `crt-monitor.tsx` | RESCUE + ENHANCE | Hacerlo genérico: accept `lines: CRTLine[]` como prop, accept `children` para contenido custom. Scanner line + blink cursor. |
| **GamingButton** | Current `features/gaming` | KEEP | Ya usa CVA con variantes correctas. Cambiar rounded-lg → rounded-sm. |
| **GamingInput** | Current `features/gaming` | KEEP | Cambiar rounded-lg → rounded-sm. |
| **GamingCard** | Current `features/gaming` | EVOLVE | Cambiar rounded-xl → rounded-sm. Agregar variant "hex" con clip-path borders. |
| **GamingBadge** | Current `features/gaming` | KEEP | Rounded-full pills están OK para tags. |
| **XPBar** | Current `features/gaming` | EVOLVE | Cambiar rounded-full → clip-path angular: `clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%)`. Agregar glow. |
| **HUDPanel** | Current `features/gaming` | EVOLVE | Cambiar rounded-xl → rounded-sm. Mantener gradient top/bottom accents. |
| **LevelBadge** | Current `features/gaming` | EVOLVE | Cambiar de cuadrado a hexagonal (usar HexBadge internamente). |
| **GamingAvatar** | Current `features/gaming` | EVOLVE | Variante hexagonal: `clip-hexagon` class. Mantener frame glow options. |
| **Spinner** | Current `features/gaming` | KEEP | Funcional, sin cambios. |

### 2.2 TIER 2 — Composite Components (rescue from V2 backups)

| Component | Source | Adaptation Needed |
|-----------|--------|-------------------|
| **CyberpunkNav** | V2 `nav-bar.tsx` | Adaptar a Next.js links, i18n labels, hex clip-path en active tab. |
| **DashboardLayout** | V2 `dashboard-page.tsx` | Estructura: WelcomeCard+CRT / HexStats row / Goals+Activity grid. Conectar a data real. |
| **TimelineView** | V2 `timeline-page.tsx` | Split: Lista izq + Journey Map SVG der. Hex nodes en mapa. Conectar a timeline data. |
| **SkillTreeCanvas** | V2 `skill-tree-page.tsx` | Pan/zoom canvas, hex nodes con fill level, animated connections. Conectar a skill data. |
| **AchievementBadge** | V1 `gaming/index.tsx` | Restyle: cambiar circulo → hexágono, rarity system (common/rare/epic/legendary) con glows apropiados. |

### 2.3 TIER 3 — New Components (to design & build)

| Component | Description | Priority |
|-----------|-------------|----------|
| **HoneycombGrid** | Grid layout donde items se posicionan como panal de abejas. Cada celda es un HexBadge clicable. Al hover/click, el CRT monitor cercano muestra info del item. | HIGH |
| **CyberpunkFlipCard** | Card con efecto flip 3D. Frente: hex icon + titulo. Reverso: detalles expandidos, stats, links. Para proyectos. | MEDIUM |
| **HexProgressRing** | SVG hexagonal con stroke-dasharray para mostrar progreso circular pero en forma hex. Para skills/achievements. | MEDIUM |
| **GlitchText** | Texto con efecto glitch CSS (text-shadow con offsets RGB). Para títulos hero o loading states. | LOW |
| **ParticleBackground** | Canvas/SVG background con partículas flotantes conectadas por líneas (constellation). Para login/landing. | LOW |

---

## 3. Layout Specs por Sección

### 3.1 Login Page

```
Layout: Split 50/50
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│  LOGO (hex P badge)          │   ┌──────────────────────┐   │
│                              │   │ [SIGN IN] [SIGN UP]  │   │
│  "START YOUR"                │   │                      │   │
│  "ADVENTURE"  (cyan bold)    │   │  EMAIL input         │   │
│                              │   │  PASSWORD input      │   │
│  • Interactive Timeline      │   │                      │   │
│  • Achievement System        │   │  [START GAME →]      │   │
│  • AI-Powered CV             │   │                      │   │
│                              │   │  OR CONTINUE WITH    │   │
│                              │   │  [Google] [GitHub]   │   │
│                              │   └──────────────────────┘   │
│  Particle/grid background    │                              │
└──────────────────────────────┴──────────────────────────────┘

Fuente: V1 login — mejor espaciado y breathing room
Background: hex grid pattern SVG (muy sutil, 0.04 opacity)
CTA: GamingButton primary, full width, clip-hex-tab shape
Form container: border cyber-cyan/15, bg cyber-bg-elevated
```

### 3.2 Dashboard

```
Layout:
┌─────────────────────────────────────────────────────────────┐
│ [CyberpunkNav: Logo | Dashboard* | Timeline | Skill Tree]  │
├─────────────────────────────────────────────────────────────┤
│ SubNav: [Portfoland logo] [Dashboard|Timeline|Skills] [Avatar]│
├────────────────────────────────────┬────────────────────────┤
│ Welcome Card                       │ CRT Monitor            │
│ - Avatar hex, nombre, level badge  │ - Boot sequence        │
│ - XP bar                          │ - Stats display        │
│ - "12 day streak"                  │ - Reacciona a hover    │
├────────┬────────┬────────┬─────────┴────────────────────────┤
│ HexStat│ HexStat│ HexStat│ HexStat                          │
│ XP     │ Level  │ Exp    │ Achievements                     │
├────────┴────────┴────────┴──────────────────────────────────┤
│ Current Goals (hex % badges)  │  Recent Activity (hex icons) │
│ - Progress bars angular       │  - Feed list con HexBadge sm │
│ - 3 goal cards                │  - "+200 XP" colored labels  │
├───────────────────────────────┴─────────────────────────────┤
│ Quick Actions (4 buttons con hex icon)                       │
└─────────────────────────────────────────────────────────────┘

Fuente estructura: V2 dashboard
Stat cards: V2 (con HexBadge dentro)
CRT: V2 (hacerlo reactivo — al hover sobre un stat, muestra info en CRT)
Goals: V2 (hex percentage badge + angular progress bar)
```

### 3.3 Timeline

```
Layout: Split [420px list] + [flex-1 journey map]
┌──────────────────────────────────────────────────────────────┐
│ Header: "My Timeline" + [View Public] [+ Add Experience]     │
├──────────────────────────────────────────────────────────────┤
│ Stats row: Total XP | Milestones | Experiences | Achievements│
├───────────────────────┬──────────────────────────────────────┤
│ Filter pills:         │  Journey Map (SVG):                  │
│ [ALL] [Work] [Edu]    │  ┌────────────────────────────────┐  │
│ [Project] [Cert]      │  │  hex grid pattern background   │  │
│                       │  │                                │  │
│ Timeline list:        │  │    ⬡ ── ── ⬡                  │  │
│ ┃ ⬡ Senior Dev    +XP│  │   /          \                 │  │
│ ┃ ⬡ AWS Cert      +XP│  │  ⬡     info   ⬡               │  │
│ ┃ ⬡ CS Degree     +XP│  │   \    card  /                 │  │
│ ┃ ⬡ Frontend Dev  +XP│  │    ⬡ ── ── ⬡                  │  │
│ ┃ ⬡ OSS Project   +XP│  │         |                      │  │
│ ┃                     │  │         ⬡                      │  │
│                       │  │  [location legend bar]         │  │
│                       │  └────────────────────────────────┘  │
└───────────────────────┴──────────────────────────────────────┘

Fuente: V2 timeline
Lista izq: Vertical line gradient + HexBadge sm como nodo en la línea
Mapa der: SVG con hex grid pattern, nodos hex coloreados por categoría,
          dashed curved connections (Bézier), info card flotante
Click en lista → resalta nodo en mapa y viceversa
```

### 3.4 Skill Tree

```
Layout: Full-width canvas
┌──────────────────────────────────────────────────────────────┐
│ Header: [⬡ icon] "My Skill Tree" + [View Public]            │
├──────────────────────────────────────────────────────────────┤
│ Stats: Total Skills | Total XP | Mastered | Categories       │
├──────────────────────────────────────────────────────────────┤
│ Legend: [+ Add Skill] ● Core ● Backend ● Frontend ○ Locked   │
│                                       12 skills  6,100 XP    │
├──────────────────────────────────────────────────────────────┤
│ Canvas (pan + zoom):                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  hex grid background pattern                          │  │
│  │                                                        │  │
│  │        CORE / FUNDAMENTALS          BACKEND            │  │
│  │                                                        │  │
│  │     ⬡R ──── ⬡T ──── ⬡N                               │  │
│  │    / |        |    \    \                              │  │
│  │  ⬡T  ⬡C ──── ⬡H    ⬡S  ⬡M                           │  │
│  │       |        |                                       │  │
│  │      ⬡R  ⬡J ── ⬡N    FRONTEND                        │  │
│  │               \                                        │  │
│  │                ⬡G                                      │  │
│  │                                          [zoom +/-/fit]│  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Fuente: V2 skill-tree
Nodos: Hexágonos SVG con fill-level (clipPath), border coloreado por categoría
Conexiones: Bézier curves con animated dash (data-stream)
Hover: Outer glow hex + tooltip con nombre, nivel, XP, categoría
Pan: mousedown+drag. Zoom: wheel. Reset: fit button.
Zoom < 0.5: nodos se agrupan en clusters por categoría
```

### 3.5 Portfolio Público (nueva idea — honeycomb)

```
Layout: Honeycomb central
┌──────────────────────────────────────────────────────────────┐
│ [Logo] [Username] [Download CV]                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│           ⬡ About    ⬡ Skills                               │
│        ⬡ Projects  ⬡ Timeline  ⬡ Contact                    │
│           ⬡ Certs    ⬡ Social                               │
│                                                              │
│  (Cada hexágono es clicable)                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ CRT Monitor (reacciona al hex seleccionado):                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ $ inspect --section=projects                             │ │
│ │ > Loading 7 projects... OK                               │ │
│ │ > Featured: Portfoland (Next.js, TypeScript)             │ │
│ │ > Tech stack: React, Node.js, PostgreSQL                 │ │
│ │ > Last updated: 2 days ago                               │ │
│ │ [ver lista de proyectos renderizada debajo]              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Contenido expandido de la sección seleccionada]             │
└──────────────────────────────────────────────────────────────┘

Concepto: El portfolio NO es un scroll lineal.
Es un "panel de control" donde el usuario explora secciones
vía hexágonos. Al seleccionar uno, el CRT hace un "boot" de esa
sección y el contenido se renderiza debajo.
```

### 3.6 Project Form / Project Showcase

```
Layout: Standard form dentro de HUDPanel
┌──────────────────────────────────────────────────────────────┐
│ HUDPanel title="NEW PROJECT" (border-glow-top)               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  Project Name     [GamingInput]                          │ │
│ │  Description      [GamingInput textarea]                 │ │
│ │  Tech Stack       [Tag input con GamingBadge pills]      │ │
│ │  Links            [URL inputs]                           │ │
│ │  Image            [Upload area con hex border]           │ │
│ │                                                          │ │
│ │  [Cancel (outline)]              [Save Project (primary)]│ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Los forms mantienen el estilo cyberpunk pero priorizan usabilidad.
Labels: text-[10px] uppercase tracking-wider text-cyber-text-muted
Inputs: border-cyber-overlay bg-cyber-bg-elevated, focus:border-cyber-cyan
```

---

## 4. Component Specs Detallados

### 4.1 HexBadge (RESCUE — source: `backups/design-idea-v2/components/hex-badge.tsx`)

```typescript
// Props:
interface HexBadgeProps {
  children: React.ReactNode
  color?: "cyan" | "magenta" | "yellow" | "green"  // maps to neon palette
  size?: "sm" | "md" | "lg" | "xl"                 // 40, 56, 72, 96 px
  filled?: boolean                                   // background fill
  fillPercent?: number                               // 0-100, partial fill
  glowing?: boolean                                  // animate-hex-pulse
  className?: string
  onClick?: () => void
}

// Size map: sm=40, md=56, lg=72, xl=96
// Hex path: "M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
// Background: filled ? color@0.2 : cyber-bg-surface@0.8
// Border: color stroke, width 2, opacity 0.8
// Content: centered, fontSize = size * 0.32

// Companion: HexStatBadge — HexBadge(lg, filled) + value/label text
```

### 4.2 CRTMonitor (RESCUE + ENHANCE)

```typescript
// Props actuales (V2):
interface CRTMonitorProps {
  className?: string
  lines?: CRTLine[]        // NUEVO: contenido dinámico
  children?: React.ReactNode // NUEVO: render custom content
  title?: string            // NUEVO: header title (default "SYS_MONITOR v3.2")
  onBootComplete?: () => void // NUEVO: callback
}

interface CRTLine {
  text: string
  color: "cyan" | "green" | "yellow" | "magenta" | "white"
  prefix?: string  // "$ ", "> ", etc.
}

// Estructura:
// 1. Container: border-cyber-cyan/20, bg-cyber-bg, rounded-sm, overflow-hidden
// 2. Scanner line: .crt-scanner (CSS animation)
// 3. Header bar: status LED + title + "ONLINE" badge
// 4. Content: font-mono text-xs, boot sequence animation (staggered 600ms)
// 5. Blinking cursor at bottom
//
// ENHANCEMENT: Cuando recibe nuevas `lines`, hace animación de "reboot":
// - Flash breve
// - Limpia pantalla
// - Muestra nuevas líneas con boot sequence
```

### 4.3 CyberpunkNav (RESCUE + ADAPT)

```typescript
// Adaptar V2 nav-bar.tsx a Next.js routing:
interface CyberpunkNavProps {
  // Usa usePathname() para determinar active
}

// Items: Login, Dashboard, Timeline, Skill Tree
// Active state: bg-cyber-cyan, text-cyber-bg, clip-hex-tab, font-bold, glow shadow
// Inactive: text-muted, hover:text-foreground
// PREFIX: "VIEW:" label en monospace small
// Icons: lucide-react (LogIn, LayoutDashboard, Clock, GitBranch)
```

### 4.4 HoneycombGrid (NEW — diseñar)

```typescript
// El componente más innovador del proyecto.
interface HoneycombGridProps {
  items: HoneycombItem[]
  onSelect: (id: string) => void
  selectedId?: string
  size?: "sm" | "md" | "lg"
}

interface HoneycombItem {
  id: string
  label: string
  icon: React.ReactNode
  color: "cyan" | "magenta" | "yellow" | "green"
  disabled?: boolean
}

// Implementación:
// - CSS Grid con offset rows (honeycomb pattern)
// - Cada celda es un HexBadge con onClick
// - Selected: glowing + scale(1.1) + border highlight
// - Layout CSS:
//   .honeycomb { display: grid; grid-template-columns: repeat(auto-fill, 80px); gap: 4px; }
//   .honeycomb > :nth-child(even of .hex-row) { margin-left: 40px; }
//   O mejor: usar posicionamiento absoluto calculado:
//     col offset = col * (size * 0.75)
//     row offset = row * (size * 0.866) + (col % 2 ? size * 0.433 : 0)
//
// Alternativa más simple: SVG con hexágonos posicionados manualmente
// (como el skill tree pero sin conexiones y con layout de panal regular)
```

### 4.5 AchievementBadge (RESCUE + RESTYLE from V1)

```typescript
interface AchievementBadgeProps {
  title: string
  description: string
  xp: number
  unlocked?: boolean
  icon?: React.ReactNode
  rarity?: "common" | "rare" | "epic" | "legendary"
}

// CAMBIOS vs V1:
// - Reemplazar circulo por HexBadge (icon dentro)
// - rarity glow colors:
//   common:    sin glow, border-muted
//   rare:      glow-cyan, border-cyan
//   epic:      glow-magenta, border-magenta
//   legendary: glow-yellow, border-yellow, animate-hex-pulse
// - Locked state: overlay con opacity + lock icon dentro de hex
// - XP badge: GamingBadge color="yellow"
```

---

## 5. Color Usage Map

```
cyan    (#00D4FF)  → Primary actions, links, nav active, borders, Work category
magenta (#D946EF)  → Secondary actions, achievements, Certification category, epic rarity
green   (#22C55E)  → Success states, online status, Education category, progress complete
yellow  (#EAB308)  → XP values, level numbers, warnings, Project category, legendary rarity
red     (#EF4444)  → Errors, destructive actions, danger states
purple  (#A855F7)  → Special items, accent, rare content
```

---

## 6. SVG Patterns

### Hex Grid Background (para canvas areas)

```html
<defs>
  <pattern id="hexGrid" width="30" height="30" patternUnits="userSpaceOnUse">
    <path d="M15 0 L30 7.5 L30 22.5 L15 30 L0 22.5 L0 7.5 Z"
          fill="none" stroke="#00D4FF" strokeWidth="0.3" strokeOpacity="0.04" />
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#hexGrid)" />
```

### Hexagon Path (reutilizar en todos los componentes SVG)

```
Standard (viewBox 0 0 100 100): M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z
CSS clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
Nav tab: polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)
```

---

## 7. Files to Rescue (copy paths)

Copiar estos archivos de backups al proyecto real y adaptar:

```
FROM: backups/design-idea-v2/components/hex-badge.tsx
  TO: features/gaming/components/hex-badge.tsx

FROM: backups/design-idea-v2/components/crt-monitor.tsx
  TO: features/gaming/components/crt-monitor.tsx

FROM: backups/design-idea-v2/components/skill-tree-page.tsx
  TO: features/skill-tree/components/skill-tree-canvas.tsx (extraer lógica canvas)

FROM: backups/design-idea-v2/components/timeline-page.tsx
  TO: features/timeline/components/journey-map.tsx (extraer SVG map)

FROM: backups/design-idea-v2/components/nav-bar.tsx
  TO: features/gaming/components/cyberpunk-nav.tsx (adaptar a Next.js)
```

---

## 8. Implementation Order

```
Phase 1: Foundation (tokens + atomic components)
  1. Update globals.css with cyberpunk tokens + animations
  2. Rescue HexBadge + HexStatBadge → features/gaming/
  3. Rescue CRTMonitor (enhanced) → features/gaming/
  4. Update existing gaming components (rounded → sharp, add hex variants)

Phase 2: Navigation + Layout
  5. Build CyberpunkNav (from V2 nav-bar, adapt to Next.js routing)
  6. Build HoneycombGrid component (new)

Phase 3: Pages
  7. Dashboard page (V2 structure + real data)
  8. Timeline page (V2 structure + real data)
  9. Skill Tree page (V2 canvas + real data)
  10. Login page (V1 layout + cyberpunk styling)

Phase 4: Portfolio público
  11. Honeycomb navigation for portfolio sections
  12. CRT reactive display
  13. Section content renderers

Phase 5: Polish
  14. CyberpunkFlipCard for projects
  15. AchievementBadge restyle
  16. Responsive adaptations
  17. Particle/constellation background
```

---

## 9. Reglas de Diseño (para quien implemente)

1. **TODO es monospace.** No mezclar font families.
2. **Borders sharp.** `rounded-sm` máximo para containers. No `rounded-xl`.
3. **Glow con mesura.** Solo en elementos interactivos y estados activos. No en todo.
4. **Hexágonos como identidad.** Usar HexBadge para: avatares, stats, skill nodes, nav items, achievements. NO para botones de acción (esos son rectangulares).
5. **CRT como centro de información.** En el dashboard y portfolio, el CRT monitor reacciona a lo que el usuario inspecciona.
6. **Color = significado.** Cyan=acción, Magenta=logro, Green=educación/success, Yellow=XP/nivel. SIEMPRE.
7. **Datos desde props/server.** Los componentes de V2 tienen datos hardcodeados. Al rescatar, parametrizar TODO.
8. **Animaciones opt-in.** Usar `prefers-reduced-motion` media query. Las animaciones no deben ser bloqueantes.
9. **Font-size micro.** Los labels usan 8-10px. El contenido usa 12-14px (xs-sm). Headings 18-24px. No más grande.
10. **Dark only.** Este design system es dark mode exclusivamente. No hay versión light.
