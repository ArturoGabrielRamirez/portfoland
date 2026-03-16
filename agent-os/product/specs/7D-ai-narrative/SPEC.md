# Spec 7D — AI Narrative Dashboard Integration

**Phase:** 7 — Portfolio Distribution + AI Depth
**Priority:** P1 | **Size:** S

---

## Situación actual

`features/ai-narrator/` está completamente implementado:
- `narrative.service.ts` genera narrativa via Gemini con cache de 24h en user.meta
- API route `/api/ai/narrate-portfolio` funciona
- `ClassicAI.tsx` y `TechAI.tsx` muestran la narrativa en el portfolio público
- `usePortfolioNarrative` hook gestiona loading/error/success

Lo que NO existe: ninguna forma de que el usuario vea, edite o use su narrativa desde el dashboard.

## Qué hace esta spec

Añade una sección "Career Story" en el tab **Profile** del Portfolio Hub (`/dashboard/portfolio`).

El usuario puede:
1. Generar su narrativa con un click (llama al API existente)
2. Ver el resultado con markdown rendering
3. Copiarlo al portapapeles
4. Usarlo como bio (guarda en `user.bio` via `updateProfile`)

## Archivos afectados

- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` — añadir sección Career Story en el Profile tab
- `features/portfolio/components/GenerateCareerStory.tsx` — nuevo componente cliente

## Criterios de aceptación

- [ ] Botón "Generate Career Story" visible en Profile tab
- [ ] Llama a `/api/ai/narrate-portfolio` con el username del usuario actual
- [ ] Muestra loading state durante generación
- [ ] Muestra la narrativa con markdown rendering
- [ ] Botón "Copy" copia el texto al portapapeles
- [ ] Botón "Use as Bio" guarda la narrativa en el campo bio del usuario
- [ ] Si no tiene username, muestra mensaje de que primero debe elegir uno
- [ ] Funciona en Tech Mode y Classic Mode con estilos apropiados
