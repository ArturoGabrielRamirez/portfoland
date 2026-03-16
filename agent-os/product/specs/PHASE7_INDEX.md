# Phase 7 — Portfolio Distribution + AI Depth

**Branch:** `feat/phase7-distribution-ai-depth`
**Estado:** Propuesto

---

## Objetivo

Convertir Portfoland de una herramienta de construcción de portfolios en una plataforma de distribución profesional activa. Phase 6 consolidó la navegación interna y la coherencia del dashboard. Phase 7 trabaja en la dirección opuesta: hacia afuera.

- El portfolio público se vuelve más poderoso como herramienta de networking real
- La IA pasa de responder preguntas a iniciar acciones complejas
- El sistema de CVs evoluciona de generador de documentos a motor de aplicaciones laborales
- La experiencia mobile alcanza paridad funcional con desktop
- Los usuarios tienen razones concretas para volver cada día

---

## Specs y Orden de Ejecución

### Sprint 1 — Mobile + AI Narrative (independientes, pueden ir en paralelo)

| Spec | Título | Prioridad | Tamaño | Dependencias |
|------|--------|-----------|--------|--------------|
| **7E** | Mobile Dashboard — Paridad funcional en móvil | P0 | M | Phase 6 completo |
| **7D** | AI Narrative + Timeline Narrator público | P1 | S | Phase 6 completo |

### Sprint 2 — Distribución del portfolio

| Spec | Título | Prioridad | Tamaño | Dependencias |
|------|--------|-----------|--------|--------------|
| **7A** | Public Portfolio V2 — Portfolio Adaptativo al Visitante | P0 | L | Phase 6 completo |
| **7B** | Share Kit — Social Cards + Portfolio Link Tools | P1 | S | 7A |

### Sprint 3 — AI de segunda generación + Engagement

| Spec | Título | Prioridad | Tamaño | Dependencias |
|------|--------|-----------|--------|--------------|
| **7C** | Interview Simulator — Práctica de entrevistas con AI | P1 | M | Phase 6 completo |
| **7F** | Notifications + Engagement Loop | P2 | M | 7A, 7B |

---

## Descripción de Specs

### 7A — Public Portfolio V2: Portfolio Adaptativo al Visitante
**P0 | L**

El portfolio público es estático — muestra el mismo contenido a todos. Un recruiter técnico ve lo mismo que un cliente de diseño. Añade un selector de rol al inicio del portfolio público (`Recruiter / Tech Lead / Founder / Client`). La IA reordena secciones, resalta proyectos relevantes, y genera un mini pitch personalizado en el hero. También añade un "Recruiter Mode" toggle con vista ATS-friendly (bio, top 6 skills, experiencias recientes, enlace directo al CV PDF).

**Archivos clave:** `features/portfolio/components/PortfolioLayout.tsx`, `app/[locale]/[username]/page.tsx`, `features/portfolio/components/classic/ClassicHero.tsx`

---

### 7B — Share Kit: Social Cards + Portfolio Link Tools
**P1 | S**

No hay herramientas para compartir activamente el portfolio. Añade panel "Share Kit" en Portfolio Hub con: URL con botón copiar + QR code, vista previa de Open Graph card, botones de share a LinkedIn/Twitter/WhatsApp con mensaje pre-llenado, "CV Share Link" (link directo al PDF más reciente sin login), y badge embeddable para GitHub README.

**Archivos clave:** `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`, `features/analytics/`

---

### 7C — Interview Simulator: Práctica de entrevistas con AI
**P1 | M**

El CV Generator genera documentos optimizados por job description pero el siguiente paso del funnel (la entrevista) no tiene soporte. Añade sección "Interview Prep" en `/dashboard/cv`, accesible desde cualquier CV guardado. La IA genera preguntas behavioral (método STAR) basadas en el timeline real + preguntas técnicas del skill tree + feedback instantáneo por respuesta + score final.

**Archivos clave:** `features/cv/components/CVGeneratorView.tsx`, `app/api/chat/route.ts`

---

### 7D — AI Narrative + Timeline Narrator Público
**P1 | S**

`features/ai-narrator/` existe con `narrative.service.ts` implementado pero no está expuesto en ninguna UI. `ClassicAI.tsx` y `TechAI.tsx` en el portfolio público están vacíos. Activa el narrator: en el portfolio público muestra la narrativa generada (Classic: sección "My Story"; Tech: log de terminal). En el dashboard añade "Generate Career Story" en el tab Profile con outputs para LinkedIn About, elevator pitch y bio para web.

**Archivos clave:** `features/ai-narrator/services/narrative.service.ts`, `features/portfolio/components/classic/ClassicAI.tsx`, `features/portfolio/components/tech/TechAI.tsx`

---

### 7E — Mobile Dashboard: Paridad funcional en móvil
**P0 | M**

El dashboard es desktop-first. Skills hexagonal, timeline map, y CRT terminal son fundamentalmente difíciles en mobile. Fixes específicos por página: Skills usa `MobileSkillList` en mobile (ambos modos); Timeline reemplaza Google Maps con lista cronológica; CRT se minimiza a botón flotante que abre un sheet/drawer; Dashboard home colapsa a una columna. Reusar componentes existentes (`MobileSkillList` ya existe, Shadcn Sheet ya instalado).

**Archivos clave:** `features/tech/components/dashboard-page-layout.tsx`, `features/skills/components/SkillTreeView.tsx`, `app/[locale]/(dashboard)/dashboard/timeline/DashboardTimelineView.tsx`

---

### 7F — Notifications + Engagement Loop
**P2 | M**

Quests y streak existen pero no hay mecanismo que traiga al usuario de vuelta. Dos componentes: (A) In-app notification center con bell icon en el dashboard header — notificaciones para quest completado, nueva vista del portfolio, streak en riesgo, CV listo; (B) Email digest semanal opt-in con resumen de vistas, quests, XP, y sugerencia de la IA. Usar Resend (ya en el stack).

**Archivos clave:** `features/quests/`, `features/analytics/`, nueva tabla `Notification` en schema Prisma

---

## Secuencia de Implementación

```
Phase 6 completo
       │
       ├─── 7E (Mobile) — P0, independiente, paridad funcional en mobile
       ├─── 7D (AI Narrative) — S, activa feature ya implementada
       │
       ├─── 7A (Portfolio Adaptativo) — P0, habilita 7B
       │         └─── 7B (Share Kit) — depende de 7A
       │
       └─── 7C (Interview Simulator) — usa infraestructura CV existente
                 └─── 7F (Notifications) — depende de 7A y 7B
```

**Empezar con 7D (más pequeño, activa feature existente) + 7E en paralelo.**

---

## Lo que NO entra en Phase 7

- Sistema de pagos / Pro tier
- Integraciones externas nuevas (LinkedIn API, Behance)
- Tercer modo visual
- Multi-tenancy / portfolios para equipos
- Performance optimization avanzado
