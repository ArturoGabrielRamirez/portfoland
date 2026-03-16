# Spec 6D — AI Context Hints

**Phase:** 6 — UI Coherence
**Branch:** `feat/phase6-ui-coherence`
**Priority:** P2
**Estimated scope:** S (1–2 días)

---

## Problema

El CRT con AI chat está presente en todas las páginas del dashboard, pero el usuario no sabe qué puede pedirle en cada contexto. La AI tiene herramientas reales:

- En Skills: puede agregar skills, sugerir learning paths, sugerir tecnologías relacionadas
- En CV: puede analizar el CV, identificar keyword gaps, sugerir mejoras
- En Timeline: puede agregar experiencias profesionales
- En Portfolio: puede mejorar el bio, sugerir secciones
- En Projects: puede agregar proyectos al portfolio
- En Dashboard: puede mostrar el skill tree, resumir el portfolio

Pero el usuario tiene que adivinar esto. El CRT aparece igual en todas las páginas — sin indicación de qué puede hacer ahí.

---

## Solución

Añadir un chip de "hint" contextual debajo del CRT en cada página. El chip muestra 2-3 ejemplos de prompts relevantes para la página actual. Es pequeño, discreto, y puede ser descartado.

---

## Diseño del Hint

### Tech Mode

```
┌──────────────────────────────────────────────────────────┐
│ [CRT terminal con AI chat aquí]                          │
│                                                          │
│ > [NEURAL_LINK]: ask me —                               │
│   "add React to my tree"  ·  "skills for senior backend"│
│                                              [dismiss ×] │
└──────────────────────────────────────────────────────────┘
```

- Fuente: `font-mono text-[10px]`
- Color: `text-muted-foreground`
- Prompts clickeables: al hacer click, insertan el texto en el input del CRT y lo enfocan
- Dismiss: persiste en `localStorage` con key `crt-hint-dismissed-{pageContext}`
- Una vez descartado, no reaparece

### Classic Mode

```
┌──────────────────────────────────────────────────────────┐
│ [CRT / chat section]                                     │
│                                                          │
│  Tip: Try asking — "What skills should I add?" ·        │
│  "Improve my bio"                          [Got it ×]   │
└──────────────────────────────────────────────────────────┘
```

- Sin monospace, sin corchetes
- Estilo card pequeña con `text-xs text-gray-500`

---

## Prompts por Página

```typescript
// features/tech/constants/crtHints.ts

export const CRT_HINTS: Record<string, string[]> = {
  dashboard: [
    '"Show my skill tree"',
    '"What should I work on next?"',
    '"Add a recent experience"',
  ],
  skills: [
    '"Add TypeScript to my tree"',
    '"Skills needed for senior backend?"',
    '"Suggest a learning path for DevOps"',
  ],
  timeline: [
    '"Add my current job at [Company]"',
    '"Add a freelance project from 2023"',
    '"Describe my last role"',
  ],
  projects: [
    '"Add my e-commerce project"',
    '"What tech should I highlight?"',
    '"Create a project with React and Node.js"',
  ],
  cv: [
    '"Analyze this CV for a backend role"',
    '"What keywords am I missing?"',
    '"How strong is my CV for this job?"',
  ],
  portfolio: [
    '"Improve my bio"',
    '"What sections should I highlight?"',
    '"Make my bio more concise"',
  ],
  services: [
    '"What services should I offer as a designer?"',
    '"Add a web development service"',
  ],
  gallery: [
    '"What should I include in my portfolio gallery?"',
  ],
  testimonials: [
    '"How can I get more testimonials?"',
  ],
}
```

---

## Componente

### `CRTContextHint`

**Archivo:** `features/tech/components/crt-context-hint.tsx`

```typescript
interface CRTContextHintProps {
  pageContext: string
  portfolioMode: PortfolioMode
  onPromptClick: (text: string) => void  // callback para insertar en el input del CRT
}
```

- Lee `CRT_HINTS[pageContext]` para obtener los prompts
- Muestra máximo 2 prompts (los primeros del array)
- Al hacer click en un prompt → llama `onPromptClick(prompt)` que debe:
  1. Insertar el texto en el input del CRT
  2. Enfocar el input
- Dismiss persiste en `localStorage['crt-hint-dismissed-' + pageContext]`
- Si `hints.length === 0` para ese pageContext → no renderiza nada
- Si ya fue descartado → no renderiza nada

### Integración

El componente se coloca dentro de `DashboardPageLayout` (o `CRTWithAI`), debajo del CRT row, antes del contenido de la página:

**Archivo:** `features/tech/components/dashboard-page-layout.tsx`

Añadir:
```tsx
{pageContext && (
  <CRTContextHint
    pageContext={pageContext}
    portfolioMode={portfolioMode}
    onPromptClick={handlePromptInsert}
  />
)}
```

El `handlePromptInsert` necesita comunicarse con `CRTWithAI` para insertar texto. Opciones:
- Opción A: Context/ref — `CRTWithAI` expone un ref con método `insertPrompt(text)`
- Opción B: State en `DashboardPageLayout` que se pasa a `CRTWithAI` como `initialPrompt`

Recomendar **Opción A** (ref con método imperativo) para no forzar re-renders.

---

## Archivos Afectados

### Crear
- `features/tech/components/crt-context-hint.tsx` — componente hint
- `features/tech/constants/crtHints.ts` — mapa de hints por pageContext

### Modificar
- `features/tech/components/dashboard-page-layout.tsx` — añadir `<CRTContextHint>`
- `features/tech/components/crt-with-ai.tsx` — exponer ref con `insertPrompt(text)` method

---

## Criterios de Aceptación

- [ ] Hint aparece debajo del CRT en cada página con prompts relevantes
- [ ] Máximo 2 prompts visibles por página
- [ ] Hacer click en un prompt inserta el texto en el input del CRT y lo enfoca
- [ ] Dismiss button elimina el hint de esa página permanentemente (localStorage)
- [ ] Una vez descartado, no reaparece al refrescar
- [ ] En Classic Mode, hint tiene estilo clean (sin monospace ni corchetes)
- [ ] En Tech Mode, hint tiene estilo monospace con `[NEURAL_LINK]` prefix
- [ ] Si no hay hints para una página, no renderiza nada (no hay elemento vacío)
- [ ] No interfiere con el scroll ni con el layout del contenido de la página
