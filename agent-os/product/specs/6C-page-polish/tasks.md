# Tasks — 6C: Page Polish (Classic Mode Parity + UX Consistency)

## Setup
- [ ] 6C-0: Leer SPEC.md completo. Leer archivos: `features/dashboard/utils/modeClasses.ts`, `features/cv/components/CVGeneratorView.tsx` (referencia de cómo usar modeClasses), `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx`, `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`, `app/[locale]/(dashboard)/dashboard/projects/DashboardProjectsView.tsx`, `features/skills/components/SkillTreeView.tsx`, `features/timeline/components/TimelineMap.tsx` (o donde esté el map)

## Fase 1 — Shared DeleteConfirmModal
- [ ] 6C-1: Verificar si ya existe un `DeleteConfirmModal` compartido en `features/ui/` o `features/shared/`
- [ ] 6C-2: Si no existe, crear `features/ui/components/DeleteConfirmModal.tsx` con props: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `isLoading`, `portfolioMode`. Adapta estilo a Tech/Classic.
- [ ] 6C-3: Si ya existe en features/timeline/, moverlo a `features/ui/` y actualizar el import en timeline

## Fase 2 — Classic Mode en Projects page
- [ ] 6C-4: En `DashboardProjectsView.tsx`, importar `modeClasses` y aplicar `mc.*` classes en: header, add button, project cards (background, border, text colors), empty state
- [ ] 6C-5: Cambiar color del Add Project button de yellow a cyan (en ambos modos usa `mc.primaryButton`)
- [ ] 6C-6: Reemplazar `window.confirm()` (delete) con `DeleteConfirmModal` — añadir state `deleteTarget: Project | null`, conectar al modal
- [ ] 6C-7: Mover el formulario de create/edit de inline a modal: crear `ProjectModal.tsx` (o `ProjectFormModal.tsx`) en `features/projects/components/`, montar `ProjectForm` dentro. Activar con `isFormOpen` state en lugar de `showForm`.
- [ ] 6C-8: Añadir spinner `<Loader2>` al delete button durante `isPending`

## Fase 3 — Classic Mode en Timeline page
- [ ] 6C-9: En `DashboardTimelineView.tsx`, importar `modeClasses` y aplicar `mc.*` classes en: header, stats row (si se mantiene), filter pills, cards de experiencia, add button
- [ ] 6C-10: En Classic Mode, ocultar o simplificar el stats row (4 HexBadge cards) — reemplazar con texto plano o section count simple
- [ ] 6C-11: Añadir empty state al desktop map: cuando `experiences.length === 0` y `!isMobile`, mostrar overlay centrado con MapPin icon + "Add your first experience" CTA button

## Fase 4 — Classic Mode en Skills page
- [ ] 6C-12: En `DashboardSkillsView.tsx`, importar `modeClasses` y aplicar `mc.*` classes en: header, add button, legend row
- [ ] 6C-13: En `SkillTreeView.tsx`, cuando `portfolioMode === 'classic'`, renderizar siempre `MobileSkillList` (list view) en vez del canvas hexagonal — independiente de si es mobile o desktop. El canvas hexagonal es una feature de Tech Mode.
- [ ] 6C-14: En `SkillTreeView.tsx` o `CRTSkillCanvas.tsx`, añadir empty state cuando `skills.length === 0` en Tech Mode: overlay con GitBranch icon + "Add your first skill" button
- [ ] 6C-15: En Skills, añadir `DeleteConfirmModal` al delete de skills — actualmente elimina directo sin confirmación
- [ ] 6C-16: Pasar `portfolioMode` a `AssessmentWidget` y `GitHubSyncPanel` para que también adapten sus estilos si ya tienen soporte

## Fase 5 — Verificación
- [ ] 6C-17: Verificar Classic Mode en `/dashboard/projects` — fondo blanco, texto gris, borders grises, botones azules
- [ ] 6C-18: Verificar Classic Mode en `/dashboard/timeline` — idem
- [ ] 6C-19: Verificar Classic Mode en `/dashboard/skills` — list view en lugar de canvas hexagonal
- [ ] 6C-20: Verificar que delete en Projects usa modal custom (no browser confirm)
- [ ] 6C-21: Verificar que delete en Skills pide confirmación antes de eliminar
- [ ] 6C-22: Verificar que Projects edit usa modal (no inline form que bloquea lista)
- [ ] 6C-23: Verificar empty state en Skills desktop (Tech Mode) cuando no hay skills
- [ ] 6C-24: Verificar empty state en Timeline desktop (Tech Mode) cuando no hay experiencias
- [ ] 6C-25: Verificar que Tech Mode sigue funcionando en las 3 páginas sin regresiones
- [ ] 6C-26: `npx tsc --noEmit` — sin errores nuevos en archivos modificados
