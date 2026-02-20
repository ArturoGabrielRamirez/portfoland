# Sonnet: Cyberpunk UI Improvements & Fixes

> Documento de tareas para mejorar y unificar el diseño cyberpunk.
> Seguir estrictamente el design-system.md como referencia de tokens y reglas.
> Las imágenes de referencia están en `agent-os/product/visuals/`

---

## REGLAS GLOBALES (leer primero)

```
1. TODO es font-mono. Sin excepciones.
2. rounded-sm MAXIMO para contenedores. NUNCA rounded-xl, rounded-lg, rounded-md.
3. Solo rounded-full para pills/dots pequeños (badges, status dots).
4. Background: #0A0E1A (dark only). Cards: bg-[hsl(200,30%,8%)]
5. Borders: border-[hsl(174,100%,50%,0.15)] para sutil, /0.3 para activo
6. Text principal: text-foreground (claro). Secundario: text-muted-foreground
7. Colores con significado:
   - Cyan  #00D4FF  → acciones, links, primary
   - Magenta #D946EF → logros, achievements, core skills
   - Green  #22C55E → success, online, backend
   - Yellow #EAB308  → XP, nivel, tools
   - Purple #A855F7  → frontend, special
8. Hexágonos para: avatares, stats, skill nodes, badges
9. Clip paths: clip-hexagon (avatares), clip-hex-tab (nav tabs)
10. Labels: text-[9px] o text-[10px] font-mono uppercase tracking-wider text-muted-foreground
```

---

## TAREA 1: WelcomeCard — Agregar foto de usuario

**Archivo:** `features/gaming/components/welcome-card.tsx`
**Tipo:** `features/gaming/types/dashboard.ts`

### Problema
El WelcomeCard solo muestra iniciales en un hexágono SVG. Necesita aceptar y mostrar la imagen real del usuario.

### Cambios

1. En `features/gaming/types/dashboard.ts`, agregar `userImage?: string | null` a `WelcomeCardProps`:
```typescript
export interface WelcomeCardProps {
  userName: string
  userInitial: string
  userImage?: string | null  // AGREGAR
  level: number
  currentXP: number
  maxXP: number
  streakDays: number
  quickActions?: QuickAction[]
  className?: string
}
```

2. En `welcome-card.tsx`, reemplazar el SVG de avatar por una versión que soporte imagen:
```tsx
// Importar Image de next/image

// En el avatar section (donde está el SVG hexagonal):
<div className="relative">
  <div className="w-14 h-14 clip-hexagon bg-[hsl(174,100%,50%,0.2)] overflow-hidden flex items-center justify-center">
    {userImage ? (
      <Image
        src={userImage}
        alt={userName}
        width={56}
        height={56}
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-xl font-mono font-bold text-[hsl(174,100%,50%)]">
        {userInitial}
      </span>
    )}
  </div>
  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[hsl(330,100%,65%)] text-[hsl(200,25%,8%)] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm">
    Lv.{level}
  </div>
</div>
```

NOTA: El clip-hexagon ya maneja la forma. Si hay espacios blancos entre la imagen y el borde del hexágono, el `object-cover` + `w-full h-full` debería cubrirlos. Si la imagen es cuadrada y el clip-hexagon corta, eso es correcto.

3. En `app/[locale]/(protected)/dashboard/page.tsx`, pasar `userImage`:
```tsx
<WelcomeCard
  userName={displayName}
  userInitial={initials}
  userImage={userData.image}  // AGREGAR
  level={userStats.level}
  // ... rest
/>
```

---

## TAREA 2: Colores de título inconsistentes

### Problema
En /dashboard el título "My Skill Tree", "My Timeline", etc. son blancos (text-foreground). Pero en las sub-rutas a veces cambia a negro o gris oscuro.

### Verificar y corregir en estos archivos:

1. **`app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`**
   - El título h1 debe ser: `className="text-2xl font-mono font-bold text-foreground"`

2. **`app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`**
   - Verificar que el h1 use `text-foreground` (no text-black, text-gray-900, etc.)

3. **`app/[locale]/(dashboard)/dashboard/projects/DashboardProjectsView.tsx`**
   - Verificar que el h1 use `text-foreground`

4. Todos los subtítulos/descripciones: `text-xs font-mono text-muted-foreground`

---

## TAREA 3: Timeline — Unificar diseño cyberpunk

**Archivo:** `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`
**Referencia:** `agent-os/product/visuals/timeline-v2.png`

### Problemas
- Puede haber elementos con rounded-lg, rounded-md residuales
- El mapa de timeline (journey map SVG) debe tener estilo cyberpunk con hex nodes y dashed connections

### Búsqueda y reemplazo
Buscar en DashboardTimelineView.tsx:
- `rounded-lg` → `rounded-sm`
- `rounded-md` → `rounded-sm`
- `rounded-xl` → `rounded-sm`
- `bg-white` → NO DEBE EXISTIR
- `text-gray-` → reemplazar por `text-muted-foreground` o `text-foreground`
- `border-gray-` → reemplazar por `border-[hsl(174,100%,50%,0.15)]`

### Estructura esperada (según design-system.md):
```
┌──────────────────────────────────────────────────────────────┐
│ DashboardNav (ya incluido)                                   │
├──────────────────────────────────────────────────────────────┤
│ Header: "My Timeline" + [View Public] [+ Add Experience]     │
│ text-2xl font-mono font-bold text-foreground                 │
├──────────────────────────────────────────────────────────────┤
│ Stats row: HexBadge icons con Total XP, Milestones, etc.     │
│ border border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] │
├───────────────────────┬──────────────────────────────────────┤
│ Filter pills + List   │  Journey Map (SVG con hex grid)      │
│ Filtros: clip-hex-tab │  Nodos: SVG hexágonos coloreados     │
│ Timeline: vertical    │  Conexiones: dashed Bézier lines     │
│ line + HexBadge nodes │  Click list ↔ highlight map node     │
└───────────────────────┴──────────────────────────────────────┘
```

---

## TAREA 4: Skills Canvas — Mejoras visuales

**Archivo:** `features/skills/components/CRTSkillCanvas.tsx`
**Referencia:** `agent-os/product/visuals/skilltree-v2.png`

### Mejoras posibles

1. **Legend row** — Agregar una fila de leyenda debajo de las stats:
```tsx
{/* Debajo de stats, arriba del canvas */}
<div className="px-6 py-2 flex items-center gap-4 border-b border-[hsl(174,100%,50%,0.1)]">
  <button onClick={handleAddSkill} className="flex items-center gap-1 text-[10px] font-mono text-[hsl(174,100%,50%)] hover:underline">
    <Plus className="w-3 h-3" /> Add Skill
  </button>
  <div className="flex items-center gap-3 ml-auto">
    {/* Category color dots */}
    <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
      <span className="w-2 h-2 rounded-full bg-[hsl(330,100%,65%)]" /> Core
    </span>
    <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
      <span className="w-2 h-2 rounded-full bg-[hsl(150,100%,45%)]" /> Backend
    </span>
    <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
      <span className="w-2 h-2 rounded-full bg-[hsl(174,100%,50%)]" /> Frontend
    </span>
    {/* etc. for other categories */}
  </div>
  <span className="text-[9px] font-mono text-muted-foreground">
    {skills.length} skills &middot; {totalXP.toLocaleString()} XP
  </span>
</div>
```

2. **Nodos con letra del skill** — Los nodos actualmente muestran el nivel. La referencia visual muestra la inicial del skill (R, T, N, H, C, etc.). Considerar mostrar la inicial en el centro y el nivel como un mini-badge:
```tsx
{/* Dentro del nodo hexagonal */}
<span className="relative text-sm font-mono font-bold z-10">
  {node.skill.skill?.name?.charAt(0) || '?'}
</span>
{/* Mini level badge en esquina */}
<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(200,30%,8%)] border border-current flex items-center justify-center z-20">
  <span className="text-[7px] font-mono font-bold">{node.skill.level}</span>
</div>
```

3. **Efecto de partículas espaciales** — Agregar pequeñas partículas flotantes al fondo del canvas para dar sensación de espacio/constelación:
```tsx
{/* Dentro del canvas, antes de las conexiones */}
{/* Floating particles (decorative) */}
<svg className="absolute inset-0 pointer-events-none opacity-20">
  {Array.from({ length: 30 }).map((_, i) => (
    <circle
      key={i}
      cx={`${Math.random() * 100}%`}
      cy={`${Math.random() * 100}%`}
      r={Math.random() * 1.5 + 0.5}
      fill="hsl(174,100%,50%)"
    >
      <animate
        attributeName="opacity"
        values={`${0.1 + Math.random() * 0.3};${0.4 + Math.random() * 0.4};${0.1 + Math.random() * 0.3}`}
        dur={`${3 + Math.random() * 4}s`}
        repeatCount="indefinite"
      />
    </circle>
  ))}
</svg>
```

---

## TAREA 5: Dashboard — Links funcionales en Quick Actions

**Archivo:** `features/gaming/components/welcome-card.tsx`

### Problema
Los 4 hexágonos de Quick Actions no tienen funcionalidad. Conectarlos a rutas reales.

### Cambio en `app/[locale]/(protected)/dashboard/page.tsx`:
```tsx
import { useRouter } from 'next/navigation'  // Si se convierte a client component

// O mejor: Pasar quickActions con hrefs desde el server component
const quickActions = [
  { icon: Briefcase, label: "Timeline", color: "hsl(174,100%,50%)", href: `/${locale}/dashboard/timeline` },
  { icon: Clock, label: "Projects", color: "hsl(60,100%,50%)", href: `/${locale}/dashboard/projects` },
  { icon: GitBranch, label: "Skills", color: "hsl(330,100%,65%)", href: `/${locale}/dashboard/skills` },
  { icon: Target, label: "New Goal", color: "hsl(150,100%,45%)" },
]
```

### Cambio en WelcomeCardProps:
```typescript
export interface QuickAction {
  icon: LucideIcon
  label: string
  color: string
  onClick?: () => void
  href?: string  // AGREGAR - si tiene href, renderizar como Link
}
```

En welcome-card.tsx, si `action.href` existe, renderizar como `<Link>` en vez de `<button>`.

---

## TAREA 6: Register page — Rounded tabs

**Archivo:** `app/[locale]/(auth)/register/page.tsx`

Buscar tabs con `rounded-lg` y cambiar a `rounded-sm` o `clip-hex-tab` para consistencia con login.

---

## TAREA 7: Revisar backgrounds inconsistentes

### Verificar que TODAS las páginas de dashboard tengan:
```tsx
<div className="min-h-screen bg-[#0A0E1A] font-mono">
  <DashboardNav locale={locale} user={userData} />
  {/* content */}
</div>
```

### El layout protegido ya pone bg-[#0A0E1A]:
```tsx
// app/[locale]/(protected)/layout.tsx
<div className="dark min-h-screen bg-[#0A0E1A] text-white">
```

### El layout del dashboard group:
Verificar `app/[locale]/(dashboard)/layout.tsx` — Si existe, debe tener el mismo bg oscuro. Si no existe, cada page debe manejar su propio bg.

---

## TAREA 8: UserMenu hexagonal — Verificar resultado

**Archivo:** `features/dashboard/components/UserMenu.tsx`

El trigger del UserMenu fue cambiado a hexagonal:
```tsx
<Button
  variant="ghost"
  className="relative h-9 w-9 p-0 clip-hexagon bg-[hsl(174,100%,50%,0.15)] ..."
>
  <Avatar className="h-9 w-9 clip-hexagon rounded-none">
```

### Verificar:
- Que la imagen de usuario se vea bien dentro del hexágono
- Que no haya espacios blancos/transparentes entre la imagen y el clip
- Si hay gap, agregar `overflow-hidden` al contenedor padre
- El Avatar de shadcn puede tener `rounded-full` por defecto — asegurarse de que `rounded-none` lo override correctamente
- Si el clip-hexagon no funciona bien con el Avatar de shadcn, considerar usar un `<div>` con `<Image>` de next/image directamente

---

## TAREA 9: CRT Monitor interactivo (enhancement futuro)

**Concepto del design-system.md:** El CRT Monitor reacciona a lo que el usuario inspecciona. Al hacer hover sobre un stat card, el CRT muestra info detallada de ese stat.

### Implementación sugerida (futuro):
1. Agregar estado `hoveredStat` al dashboard
2. Pasar `lines` dinámicas al CRTMonitor basadas en `hoveredStat`
3. El CRT hace "reboot" visual cuando cambian las lines

Esto no es urgente pero queda documentado para una futura mejora.

---

## TAREA 10: Partículas reutilizables como componente

Crear un componente de partículas flotantes reutilizable que se pueda poner como fondo en cualquier sección:

**Crear:** `features/gaming/components/particle-field.tsx`

```tsx
"use client"

interface ParticleFieldProps {
  count?: number           // default 40
  color?: string          // default "hsl(174,100%,50%)"
  opacity?: number        // default 0.15
  className?: string
}

export function ParticleField({
  count = 40,
  color = "hsl(174,100%,50%)",
  opacity = 0.15,
  className
}: ParticleFieldProps) {
  // Generate stable random positions using index-based seed
  // Render SVG with animated circles
  // Optionally: connect nearby particles with faint lines

  return (
    <svg className={cn("absolute inset-0 pointer-events-none", className)} style={{ opacity }}>
      {/* particles with twinkling animation */}
    </svg>
  )
}
```

Exportar desde `features/gaming/index.tsx`.

Usar en: Skills canvas background, Dashboard background, Login background.

---

## CHECKLIST DE VERIFICACION

Después de implementar, verificar visualmente cada ruta:

- [ ] `/login` — hex grid bg, sharp edges, cyan accents, form funcional
- [ ] `/register` — tabs con clip-hex-tab, sin rounded-lg
- [ ] `/dashboard` — WelcomeCard con foto, CRT animado, hex stats, quick actions con links
- [ ] `/dashboard/timeline` — Sin rounded-lg/md, colores consistentes, hex badges
- [ ] `/dashboard/skills` — Canvas con partículas, legend row, nodos con iniciales
- [ ] `/dashboard/projects` — Hex thumbnails, cyan borders, sharp edges
- [ ] Navbar — Un solo avatar (UserMenu hexagonal), sin "VIEW:", Dashboard no siempre activo
- [ ] Colores — Títulos siempre text-foreground (blanco claro), backgrounds siempre #0A0E1A

---

## ARCHIVOS DE REFERENCIA

```
DESIGN SYSTEM:     agent-os/specs/cyberpunk-design-system/design-system.md
IMPLEMENTATION:    agent-os/specs/cyberpunk-design-system/implementation-prompt.md
VISUAL REFERENCE:  agent-os/product/visuals/dashboard-v2.png
                   agent-os/product/visuals/skilltree-v2.png
                   agent-os/product/visuals/timeline-v2.png
                   agent-os/product/visuals/login-v2.png
BACKUP COMPONENTS: backups/design-idea-v2/components/
```
