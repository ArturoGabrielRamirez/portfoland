# Spec 6C — Page Polish (Classic Mode Parity + UX Consistency)

**Phase:** 6 — UI Coherence
**Branch:** `feat/phase6-ui-coherence`
**Priority:** P1
**Estimated scope:** M (3–4 días)

---

## Problema

El audit UX reveló dos categorías de problemas en Skills, Timeline, Projects y CV:

### A) Classic Mode Parity (crítico)

3 de 4 páginas son **Tech Mode only** — reciben el prop `portfolioMode` pero no lo usan:

| Página | portfolioMode prop | modeClasses() usado | Resultado |
|--------|-------------------|---------------------|-----------|
| Skills | ✅ recibe | ❌ no usa | Usuario Classic ve UI tech oscura |
| Timeline | ✅ recibe | ❌ no usa | Usuario Classic ve UI tech oscura |
| Projects | ✅ recibe | ❌ no usa | Usuario Classic ve UI tech oscura |
| CV | ✅ recibe | ✅ usa | ✅ Correcto — modelo a seguir |

La referencia de cómo hacerlo está en `features/cv/components/CVGeneratorView.tsx`:
- Importa `modeClasses(portfolioMode)` → objeto `mc` con clases Tailwind
- Usa `cn(mc.card)`, `cn(mc.heading)`, `cn(mc.subHeading)`, etc.
- Adapta colores, borders, tipografía a Classic (blanco/azul) vs Tech (oscuro/cyan)

**Archivo de referencia:** `features/dashboard/utils/modeClasses.ts`

### B) UX Inconsistencies

#### 1. Confirmación de delete — 3 patrones distintos
- Timeline → `DeleteConfirmModal` custom ✅ (buen patrón)
- Projects → `window.confirm()` browser nativo ❌ (feísimo, no puede estilizarse)
- Skills → delete directo con toast ⚠️ (sin confirmación para acción destructiva)

#### 2. Loading states en Projects
- Delete button solo pone `opacity-50` cuando `isPending`
- No hay spinner visible
- Usuario no sabe si la acción está procesando

#### 3. Empty states inconsistentes
- Skills (desktop canvas): pantalla vacía sin CTA
- Timeline (desktop map): vacío sin CTA
- Projects: buen empty state ✅
- CV: buen empty state ✅

#### 4. Projects inline form bloquea la lista
- Al editar un proyecto, el form inline aparece arriba y empuja la lista hacia abajo
- El usuario no puede ver el proyecto que está editando
- Timeline y Skills usan modal → mejor patrón

#### 5. Projects: header button color inconsistente
- Add Project button es amarillo (yellow) mientras todos los demás headers usan cyan
- Portfolio usa cyan, Skills usa cyan, Timeline usa cyan

---

## Solución

### A) Classic Mode — aplicar `modeClasses()` a Skills, Timeline, Projects

Seguir exactamente el patrón de CV page:

```typescript
import { modeClasses } from '@/features/dashboard/utils/modeClasses'

// En el componente:
const mc = modeClasses(portfolioMode)

// En JSX:
<div className={cn(mc.card)}>
<h2 className={cn(mc.heading)}>
<p className={cn(mc.subHeading)}>
<button className={cn(mc.primaryButton)}>
```

**Páginas a actualizar:**
- `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`
- `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`
- `app/[locale]/(dashboard)/dashboard/projects/DashboardProjectsView.tsx`

Nota: El skill tree canvas (`CRTSkillCanvas`) es inherentemente Tech Mode — en Classic Mode mostrar `MobileSkillList` en desktop también, o una versión de lista más limpia. No es necesario hacer el canvas hexagonal en Classic Mode.

### B) UX Fixes

#### Fix 1: Estandarizar delete confirmation

Crear (o reusar) `DeleteConfirmModal` como componente compartido en `features/ui/components/DeleteConfirmModal.tsx`:

```typescript
interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string       // "Delete Project"
  description: string // "Are you sure you want to delete 'My App'? This cannot be undone."
  isLoading?: boolean
  portfolioMode: PortfolioMode
}
```

- **Projects**: Reemplazar `window.confirm()` con `DeleteConfirmModal`
- **Skills**: Añadir `DeleteConfirmModal` antes de eliminar (actualmente elimina directo)
- **Timeline**: Ya usa su propio modal — migrar a shared o dejar como está

#### Fix 2: Loading state en Projects delete

```tsx
<button
  onClick={() => setDeleteTarget(project)}
  disabled={isPending}
>
  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
</button>
```

#### Fix 3: Empty states

**Skills — desktop canvas vacío:**
Añadir overlay sobre `CRTSkillCanvas` cuando `skills.length === 0`:
```tsx
{skills.length === 0 && (
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <GitBranch className="w-12 h-12 text-muted-foreground/30 mb-4" />
    <p className="font-mono text-muted-foreground text-sm">No skills yet</p>
    <button onClick={onAddSkill} className="mt-3 ...">Add your first skill</button>
  </div>
)}
```

**Timeline — desktop map vacío:**
Similar overlay en `TimelineMap` cuando `experiences.length === 0`.

#### Fix 4: Projects edit — reemplazar inline form con modal

- Mover `ProjectForm` de "inline card above list" a `ProjectModal` (dialog)
- `showForm` state → `isModalOpen` state
- Mantiene lista visible mientras el usuario edita
- Consistente con Skills y Timeline que usan modales

#### Fix 5: Projects — color del Add button

Cambiar de `hsl(60,100%,50%)` (yellow) a `hsl(174,100%,50%)` (cyan) para consistencia con el resto de páginas.

---

## Archivos Afectados

### Skills
- `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`
- `features/skills/components/SkillTreeView.tsx` (empty state overlay)
- `features/skills/components/CRTSkillCanvas.tsx` (empty state)

### Timeline
- `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`
- `features/timeline/components/TimelineMap.tsx` (empty state)

### Projects
- `app/[locale]/(dashboard)/dashboard/projects/DashboardProjectsView.tsx`
- `features/projects/components/ProjectModal.tsx` (CREAR — modal para edit/create)
- `features/projects/components/ProjectForm.tsx` (adaptar para funcionar en modal)

### Shared
- `features/ui/components/DeleteConfirmModal.tsx` (CREAR — modal compartido)

---

## Classic Mode Visual Reference

Cuando `portfolioMode === 'classic'`:
- Background: `bg-white` o `bg-gray-50`
- Text: `text-gray-900`
- Borders: `border-gray-200`
- Accent: `text-blue-600`, `bg-blue-600`
- Cards: `bg-white shadow-sm border border-gray-200 rounded-lg`
- Buttons: `bg-blue-600 text-white hover:bg-blue-700 rounded-md`
- Font: sans-serif (no monospace)

Cuando `portfolioMode === 'tech'`:
- Background: `bg-[#0A0E1A]`
- Text: `text-foreground` (claro)
- Borders: `border-[hsl(174,100%,50%,0.15)]`
- Accent: `text-[hsl(174,100%,50%)]` (cyan)
- Cards: `bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)]`
- Buttons: `bg-[hsl(174,100%,50%)] text-[#0A0E1A]`
- Font: `font-mono`

---

## Skills — Nota sobre Classic Mode Canvas

El hexagonal canvas (`CRTSkillCanvas`) es inherentemente Tech aesthetics. Para Classic Mode:
- Opción A: Mostrar `MobileSkillList` (accordion por categoría) también en desktop — más limpio para Classic
- Opción B: Hacer un `ClassicSkillGrid` — cards en grid 3x4 con skill name, level bar, category badge

Recomendar **Opción A** (reusar MobileSkillList para Classic desktop) por simplicidad. El canvas hexagonal es un feature de Tech Mode.

---

## Criterios de Aceptación

- [ ] Classic Mode users ven Skills page con fondo blanco, texto gris, borders grises, botones azules
- [ ] Classic Mode users ven Timeline page adaptada a classic styles
- [ ] Classic Mode users ven Projects page adaptada a classic styles
- [ ] Skills page (Classic Mode desktop) usa list view en vez del hexagonal canvas
- [ ] Delete en Projects usa modal branded (no browser confirm())
- [ ] Delete en Skills usa modal de confirmación antes de eliminar
- [ ] Projects: form de edit/create está en modal (no inline)
- [ ] Skills: empty state con CTA "Add your first skill" visible en desktop
- [ ] Timeline: empty state con CTA visible en desktop map
- [ ] Projects: Add Project button es cyan (no yellow)
- [ ] Loading spinner visible en Projects delete button durante isPending
- [ ] No regression en Tech Mode para ninguna de las 3 páginas
