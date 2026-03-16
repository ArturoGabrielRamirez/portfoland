# Phase 6 — UI Coherence + Navigation Consolidation

**Branch:** `feat/phase6-ui-coherence`
**Fecha inicio:** 2026-03-15
**Estado:** Planificado

---

## Objetivo

Convertir el dashboard de una colección de páginas independientes en un producto coherente donde:
- La navegación es predecible y minimal
- Cada página tiene un propósito claro y sin redundancias
- El AI assistant comunica lo que puede hacer en cada contexto
- Classic y Tech Mode tienen paridad de UX/UI
- La landing refleja el producto real

---

## Specs y Orden de Ejecución

### Sprint 1 — Fundación estructural

| Spec | Título | Prioridad | Tamaño | Dependencias |
|------|--------|-----------|--------|--------------|
| **6A** | Portfolio Hub (Settings Consolidation) | P0 | M | Ninguna |
| **6B** | Dashboard Home V2 | P1 | S | Ninguna |

**6A y 6B son independientes — pueden hacerse en paralelo o secuencialmente.**

### Sprint 2 — Polish y paridad

| Spec | Título | Prioridad | Tamaño | Dependencias |
|------|--------|-----------|--------|--------------|
| **6C** | Page Polish (Classic Mode Parity + UX Consistency) | P1 | M | 6A (para saber qué pages quedan) |
| **6D** | AI Context Hints | P2 | S | Ninguna |

### Sprint 3 — Comunicación hacia afuera

| Spec | Título | Prioridad | Tamaño | Dependencias |
|------|--------|-----------|--------|--------------|
| **6E** | Landing Page Refresh | P2 | M | 6A, 6C (para no mencionar rutas eliminadas) |

---

## Resumen de Cambios Estructurales

### Navegación: de 9 rutas a 6

**Antes:**
```
/dashboard
/dashboard/portfolio
/dashboard/timeline
/dashboard/skills
/dashboard/projects
/dashboard/cv
/dashboard/services      ← eliminar
/dashboard/gallery       ← eliminar
/dashboard/testimonials  ← eliminar
```

**Después:**
```
/dashboard
/dashboard/portfolio     ← Hub con tabs: Profile | Content | Theme | Analytics
/dashboard/timeline
/dashboard/skills
/dashboard/projects
/dashboard/cv
```

### Nav bar: de condicional a uniforme

**Antes:**
- Tech Mode: Dashboard | Timeline | Skills | Projects | CV
- Classic Mode: Dashboard | Timeline | Skills | Projects | CV | Services | Gallery | Testimonials

**Después (ambos modos):**
- Dashboard | Timeline | Skills | Projects | CV

### Portfolio page: de scroll infinito a tabs

**Antes:** 8+ secciones en una sola página scrolleable
**Después:** 4 tabs — Profile | Content | Theme | Analytics

---

## Problemas resueltos por spec

| Problema | Spec |
|---------|------|
| Services/Gallery/Testimonials son rutas separadas innecesarias | 6A |
| Portfolio page es un scroll infinito sin estructura | 6A |
| Nav Classic Mode tiene 3 ítems extra que confunden | 6A |
| HexStatGrid duplica info del CRT | 6B |
| QuickActionsBar tiene 4 botones placeholder | 6B |
| WelcomeCard "Level Up" y "New Goal" sin acción real | 6B |
| Skills/Timeline/Projects son Tech-only (sin Classic Mode) | 6C |
| Projects usa `window.confirm()` para delete | 6C |
| Skills no tiene empty state con CTA en desktop | 6C |
| Projects edit form bloquea la lista (inline) | 6C |
| Usuario no sabe qué pedirle al AI en cada página | 6D |
| Landing no refleja features actuales del producto | 6E |

---

## Lo que NO entra en Phase 6

- Nuevas features de AI (no es el foco)
- Mobile app o PWA
- Nuevas integraciones de APIs externas
- Sistema de pagos / Pro tier
- Performance optimization (Phase 7 territory)
