# Tasks — 6E: Landing Page Refresh

## Setup
- [ ] 6E-0: Leer SPEC.md completo. Leer archivos: `app/[locale]/page.tsx`, `features/landing/` (todos los componentes actuales), `messages/en.json` y `messages/es.json` (sección landing/home). Hacer un inventario de qué hay y qué está desactualizado.

## Fase 1 — Auditoría y limpieza
- [ ] 6E-1: Identificar todas las references a features "coming soon" que ya existen — listar en comentario o en este task file
- [ ] 6E-2: Identificar copy que no refleja el producto actual (gaming references, old mode names, etc.)

## Fase 2 — Hero section
- [ ] 6E-3: Actualizar headline y subheadline en `messages/en.json` y `messages/es.json`
- [ ] 6E-4: Actualizar CTA buttons — "Start free" → `/register`, "See example" → portfolio demo (si existe un usuario demo, usar ese; si no, link al GitHub del proyecto)
- [ ] 6E-5: Actualizar visual del hero si tiene screenshots/mockups — reflejar UI actual

## Fase 3 — Feature sections
- [ ] 6E-6: Crear o actualizar sección "AI that works with you" (3 sub-features: AI chat, CV tailored, skill assessment)
- [ ] 6E-7: Crear o actualizar sección "Auto-populate from what you have" (GitHub sync, CV Import)
- [ ] 6E-8: Crear o actualizar sección "Two modes, one portfolio" (Tech vs Classic) con toggle visual si es posible
- [ ] 6E-9: Crear o actualizar sección "Your portfolio gets found" (SEO, Analytics, subdomain)

## Fase 4 — Misc
- [ ] 6E-10: Eliminar cualquier sección "coming soon" para features que ya existen
- [ ] 6E-11: Verificar que todos los links de la landing son funcionales (CTAs, nav links)
- [ ] 6E-12: Verificar que la landing funciona en mobile (scroll, layouts, imágenes)
- [ ] 6E-13: Verificar i18n — EN y ES actualizados y sin keys faltantes
- [ ] 6E-14: `npx tsc --noEmit` — sin errores nuevos
- [ ] 6E-15: Performance check — ninguna imagen nueva sin `<Image>` de Next.js con `width`/`height`
