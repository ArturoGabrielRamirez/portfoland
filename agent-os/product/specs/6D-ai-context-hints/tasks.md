# Tasks — 6D: AI Context Hints

## Setup
- [ ] 6D-0: Leer SPEC.md completo. Leer archivos: `features/tech/components/crt-with-ai.tsx` (cómo se maneja el input del chat), `features/tech/components/dashboard-page-layout.tsx` (donde se integra), `features/dashboard/utils/modeClasses.ts`

## Fase 1 — Hints map
- [ ] 6D-1: Crear `features/tech/constants/crtHints.ts` — exportar `CRT_HINTS: Record<string, string[]>` con 2-3 prompts por pageContext: dashboard, skills, timeline, projects, cv, portfolio, services, gallery, testimonials

## Fase 2 — CRTContextHint componente
- [ ] 6D-2: Crear `features/tech/components/crt-context-hint.tsx` con props: `pageContext: string`, `portfolioMode: PortfolioMode`, `onPromptClick: (text: string) => void`
- [ ] 6D-3: Implementar lógica de dismiss: leer/escribir `localStorage['crt-hint-dismissed-' + pageContext]`. Si dismissed → return null.
- [ ] 6D-4: Implementar render: muestra máximo 2 prompts del array `CRT_HINTS[pageContext]`. Si no hay hints → return null.
- [ ] 6D-5: Tech Mode styling: `font-mono text-[10px]`, prefijo `[NEURAL_LINK]:`, prompts como botones inline con hover underline
- [ ] 6D-6: Classic Mode styling: `text-xs text-gray-500`, prefijo "Tip: Try asking —", prompts como botones inline simples
- [ ] 6D-7: Dismiss button: `×` a la derecha, guarda en localStorage al hacer click

## Fase 3 — Integración con CRTWithAI
- [ ] 6D-8: En `crt-with-ai.tsx`, exponer método imperativo `insertPrompt(text: string)` via `useImperativeHandle` + `forwardRef` — el método debe: (1) setear el valor del input del chat, (2) enfocar el input
- [ ] 6D-9: En `dashboard-page-layout.tsx`, crear ref para `CRTWithAI` y handler `handlePromptInsert(text)` que llama `crtRef.current?.insertPrompt(text)`
- [ ] 6D-10: En `dashboard-page-layout.tsx`, añadir `<CRTContextHint>` debajo del `DashboardRow1` (CRT row), pasando `pageContext`, `portfolioMode`, y `onPromptClick={handlePromptInsert}`

## Fase 4 — Verificación
- [ ] 6D-11: Verificar que en `/dashboard/skills` aparece el hint con prompts de skills
- [ ] 6D-12: Verificar que en `/dashboard/cv` aparece el hint con prompts de CV
- [ ] 6D-13: Verificar que hacer click en un prompt inserta el texto en el input del CRT y lo enfoca
- [ ] 6D-14: Verificar que dismiss persiste al refrescar la página (localStorage)
- [ ] 6D-15: Verificar que en una página sin hints (ej: una con array vacío) no aparece ningún elemento vacío
- [ ] 6D-16: Verificar que Classic Mode muestra el hint sin monospace/corchetes
- [ ] 6D-17: `npx tsc --noEmit` — sin errores nuevos en archivos modificados
