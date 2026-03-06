# Portfoland Roadmap V2 — Post-Audit

**Fecha:** 2026-02-17
**Estado:** Activo — Reemplaza roadmap anterior
**Origen:** Auditoría Opus integral (product + code + strategy)

---

## Cambios Fundamentales vs Roadmap V1

| Aspecto | V1 (anterior) | V2 (este doc) |
|---------|---------------|----------------|
| **Naming** | Gaming Mode + Professional Mode | **Tech Mode** + **Classic Mode** |
| **Identidad visual** | "Cyberpunk arcade" | **Tech-futurista profesional** (hexágonos, CRT, consoles — sin parecer juego) |
| **Eje de separación** | "Developers vs todos" | **Digital creators vs servicios presenciales** |
| **Routing** | `/[locale]/[username]` + subdominios | **Solo subdominios** (`user.portfoland.com`) — unificar |
| **Prioridad RPG** | Post-MVP pero "pronto" | **Después de tener usuarios reales** |
| **Bugs** | No documentados | **Phase 0 obligatoria** (race conditions, cache, rate limiting) |

---

## Mapping: Tasks Pendientes V1 → V2

| Task pendiente (roadmap viejo) | Ubicación en V2 |
|---|---|
| GitHub validation | Phase 3A |
| Dynamic goals | Phase 3C |
| Real XP calculation | Phase 3C |
| Auto-suggest skills desde GitHub | Phase 3A (subset) |
| Portfolio health check | Phase 5 (candidato) |
| SEO meta generator | Phase 5 (candidato) |
| Professional Mode enhancements | Phase 2 (Classic Mode) |
| AI Skill Assessment Game | Phase 4 |
| The Gridcn/Glitchcn integration | Phase 3B (evaluación) |
| Toast effects expansion | Continuo — se aplica conforme se tocan formularios (`FormWithIndicator`) |
| Skill tree visual polish | Phase 3B |

---

## Fases

### Phase 0: Critical Bug Fixes ✅ COMPLETED
**Tiempo estimado:** 2-3 días
**Delegable a Sonnet:** Sí (con spec detallada)

**Must-fix:**
1. **Race condition en `checkAndConsumLives`** — Usar `$inc` atómico de MongoDB o `findOneAndUpdate` con condición `remainingLives > 0`. No leer-modificar-escribir.
2. **Cache invalidation en narrate-portfolio** — Invalidar keys `aiNarrative_*` en `User.meta` cuando el usuario edita: bio, skills, projects, experiences. Hook en los services/actions correspondientes.
3. **`remainingLives` reporting bug** en `improve-bio/route.ts` línea 232 — Ya viene decrementado de `checkAndConsumLives`, no restar otra vez.
4. **Rate limiting** — Implementar con Upstash Redis. 10 req/hora/user para endpoints AI. Middleware o per-route.
5. **Error message hardcoded en español** en `lives.ts` línea 47 — Hacerlo locale-aware.
6. **Typo: `checkAndConsumLives` → `checkAndConsumeLives`** — Rename con find-and-replace global.

**Nice-to-fix (en esta fase si hay tiempo):**
- Abort controller en `GamingAI.tsx` / `ProfessionalAI.tsx` useEffect fetch
- Extraer componente compartido `AISection` de GamingAI + ProfessionalAI (90% duplicado)
- Reducir console.log spam en `chat/route.ts` → usar logger con niveles

---

### Phase 1: Rebrand & Unificación ✅ COMPLETED
**Tiempo estimado:** 3-5 días
**Completado:** 2026-02-19
**Spec:** `agent-os/specs/2026-02-18-phase1-rebrand-unification/`

**Tasks:**
1. **Renaming en código:** ✅
   - `portfolioMode: "gaming"` → `"tech"` en DB y schema
   - `portfolioMode: "professional"` → `"classic"` en DB y schema
   - Todos los condicionales, prompts, cache keys, tipos
   - Migration script para usuarios existentes (`scripts/migrate-portfolio-modes.ts`)

2. **Unificar routing a subdominios:** ✅
   - Rutas `/[locale]/[username]` y `/[locale]/timeline/[username]` convertidas a redirects
   - Layouts y sub-rutas eliminados via git rm

3. **Actualizar docs de estrategia:** ✅ (parcial)
   - MEMORY.md → actualizado con naming y estrategia

4. **Ajustar system prompts de IA:** ✅
   - `chat/route.ts`: `RPG_MASTER_PROMPT` → `TECH_SYSTEM_PROMPT_EN/ES`
   - Tono: "Mission Briefing" tech-futurista, sin terminología arcade
   - `improve-bio/route.ts`: `getTechPrompt`/`getClassicPrompt`

---

### Phase 2: Classic Mode MVP
**Tiempo estimado:** 2-3 semanas
**Delegable a Sonnet:** Sí (spec por spec)

**Objetivo:** Que un fotógrafo, peluquero, o diseñador pueda crear un portfolio profesional sin ver un solo hexágono.

**Tasks por spec:**

**Spec 2A: Schema & Data Layer** ✅ COMPLETED
**Completado:** 2026-02-20
**Spec:** `agent-os/specs/2026-02-19-classic-mode-schema-data-layer/`
- [x] Modelo `Service` (título, descripción, precio, duración, orden)
- [x] Modelo `Testimonial` (cliente, contenido, rating, foto)
- [x] Modelo `GalleryItem` (imagen, caption, categoría, orden)
- [x] `PortfolioSettings` (theme, layoutVariant, heroStyle, showBranding)
- [x] Section system: TECH_DEFAULT_SECTIONS + CLASSIC_DEFAULT_SECTIONS
- [x] Portfolio data aggregation extendida con servicios, testimonials, galería y settings
- [x] 73 tests — todos pasan

**Spec 2B: Classic Mode Template (Portfolio Público)** ✅ COMPLETED
- 10 componentes en `features/portfolio/components/classic/`
- Secciones: About, Skills, Gallery, Services, Testimonials, Contact, Timeline
- `PortfolioLayout` detecta modo y renderiza Classic o Tech template

**Spec 2C: Dashboard Adaptations** ✅ COMPLETED
- CRUD de Services (`dashboard/services/`)
- CRUD de Gallery (`dashboard/gallery/`)
- CRUD de Testimonials (`dashboard/testimonials/`)
- Theme presets (default, warm, dark-elegant, ocean) en `DashboardPortfolioView`
- `modeClasses()` utility — dashboard adapta visuals a Tech/Classic

**Spec 2D: Onboarding & Mode Switcher** ✅ COMPLETED
- Onboarding con selección de modo (Tech/Classic) + username con availability check
- `PortfolioModeToggle` en DashboardHeader y DashboardPortfolioView
- Warning modal al cambiar modo

---

### Phase 3: Solidificar Tech Mode
**Tiempo estimado:** 2 semanas
**Delegable a Sonnet:** Sí

**Objetivo:** Que Tech Mode sea un portfolio que un dev senior no se avergüence de mostrar a un recruiter de FAANG.

**Tasks:**

**Spec 3A: GitHub Validation** COMPLETED 2026-03-04
**Spec:** `agent-os/specs/2026-03-03-phase-3a-github-validation/`
- Conectar cuenta GitHub (OAuth ya existe via Better Auth)
- Obtener repos, languages, commit activity
- Auto-validar skills basado en repos (`TypeScript` si tiene repos con >60% TS)
- XP boost para skills validadas (1.3x credibility)

**Spec 3B: Visual Polish** ✅ COMPLETED
- CRT boot lines con stats reales (XP, level, streak, achievements)
- AIAssistantFloat widget en todas las páginas del dashboard excepto donde ya hay CRTWithAI
- `modeClasses()` utility para dashboard con Tech/Classic aesthetics
- `AIEye` exported, `searching` state para GitHub sync animation

**Spec 3C: Real XP & Stats** ✅ COMPLETED
- XP desde: experiencias (10/mes), proyectos (50-300 por status), skills (XP acumulado con 1.3x GitHub multiplier)
- `getUserDashboardStats` con `unstable_cache` + tag invalidation
- Niveles dinámicos: `level² × 100` XP curve
- 3 achievements computados en runtime (sin writes a DB)

---

### Phase 4: AI Skill Assessment MVP
**Tiempo estimado:** 2-3 semanas
**Delegable a Sonnet:** Parcialmente (lógica de engine sí, prompts necesitan review Opus)

**Prerequisitos:**
- Phase 0 completa (rate limiting, lives fixes)
- Al menos 20-30 usuarios activos que validen demanda
- Solo para tech skills inicialmente

**Tasks:**
- Assessment engine (5 preguntas, 3 vidas, pass/fail)
- Solo multiple choice (MVP)
- Gemini genera preguntas + evalúa
- Badges + XP rewards
- Cooldown 24h en fail
- 5 skills iniciales: React, JavaScript, TypeScript, Python, Node.js

**Decisión pendiente:** Sistema de energía separado para assessments vs asistencia IA. Resolver antes de implementar.

---

### Phase 5: Growth & Polish
**Tiempo estimado:** Ongoing
**Requiere usuarios reales para priorizar**

Candidatos (no ordenados — depende de feedback):
- CV Dinámico (generado para cada job description)
- Career Coaching (skill gap analysis)
- Portfolio analytics (views, clicks)
- Leaderboards (Tech Mode)
- Templates dentro de Classic Mode (photographer, designer, writer)
- The Gridcn/Glitchcn adoption para Tech Mode v2
- Mock interviews
- **GitHub package.json Framework Detection** — Leer `package.json` de repos vía GitHub API para detectar dependencias (`react`, `next`, `vue`, `express`, etc.) y validar framework skills directamente. Más preciso que inferir por lenguaje. Requiere spec propia + tasks.

---

## Must-Have vs Nice-to-Have

### Must-Have (sin esto no se lanza)
- [x] Phase 0 completa (bugs críticos)
- [x] Phase 1 completa (rebrand + subdomain unification)
- [x] Phase 2A completa (Classic Mode data layer — Spec 2026-02-19)
- [x] Phase 2B completa (Classic Mode template — 10 componentes)
- [x] Phase 2C completa (Dashboard CRUD Services/Gallery/Testimonials)
- [x] Phase 2D completa (Onboarding username + modo, mode switcher)
- [x] Phase 3A completa (GitHub Validation — Spec 2026-03-03)
- [x] Phase 3B completa (Visual Polish — CRT real stats, AIAssistantFloat)
- [x] Phase 3C completa (Real XP & Stats — experiences + projects + skills)

### Pre-launch Blockers (health check 2026-03-05)
- [x] **P0:** Eliminado `app/api/dev-cleanup/route.ts` + scripts de debug
- [x] **P0:** `revalidateTag` — segundo argumento `{}` eliminado en 14 archivos
- [x] **P1:** Narrative cache keys actualizadas a "tech"/"classic"
- [x] **P1:** Route group `(protected)` eliminado — solo queda `(dashboard)`
- [x] **P1:** Stale files en root eliminados

### Nice-to-Have (mejora el producto pero no bloquea)
- [ ] Classic Mode: color picker custom
- [ ] Classic Mode: gallery masonry layout
- [ ] GitHub Validation
- [ ] AI Skill Assessment
- [ ] Leaderboards, achievements
- [ ] Toast effects cyberpunk (ya implementado, mantener)

---

## Workflow de Ejecución

```
1. Opus crea ROADMAP_V2.md (este doc) ✅
2. Para cada Phase, Opus crea spec + tasks.md
3. Sonnet ejecuta tasks individuales
4. User revisa PRs/cambios
5. Si algo falla o necesita decisión → Opus interviene
```

**Regla clave:** Cada spec que se le dé a Sonnet debe ser:
- Autocontenida (no requiere leer 5 docs para entender)
- Con archivos específicos a crear/modificar
- Con criterios de aceptación claros
- Sin decisiones de producto abiertas

---

## Principios de Diseño Actualizados

### Tech Mode (Digital Creators)
- **Estética:** Tech-futurista profesional. Hexágonos, bordes angulares, monospace, fondos oscuros. NO arcade, NO neón excesivo, NO glitch effects gratuitos.
- **Referencia visual:** Terminal moderna (VS Code, Warp), no Tron/Cyberpunk 2077
- **Paleta:** Cyan `#00D4FF` + Magenta/Violeta `#D946EF` sobre fondo `#0A0E1A`. Estos colores son identidad, se mantienen.
- **Elementos visuales a conservar y refinar:**
  - Hexágonos como elemento recurrente (badges, skills, indicators, corners)
  - Skill tree con nodos hexagonales conectados por líneas "data flow"
  - CRT monitor en dashboard
  - Bordes angulares en cards
  - Monospace (JetBrains Mono / Fira Code) para datos y stats
  - Toast border effects: borde pulsante global + hexágono status indicator sincronizado con eventos
  - `FormWithIndicator` + `useCyberpunkToast()` para formularios — expandir a todos los forms conforme se toquen
- **Gamificación:** Presente pero sutil. XP y levels son datos, no animaciones con luces de neón
- **Target:** Devs, designers, data scientists, content creators digitales
- **Integrations:** GitHub, Behance, Dribbble, YouTube (futuro)
- **UI Effects docs:** `features/ui/README.md` (implementación) + `features/ui/IDEAS.md` (futuras mejoras)

### Classic Mode (Servicios Presenciales)
- **Estética:** Limpio, blanco, tipografía clara. Borders suaves, sombras sutiles.
- **Referencia visual:** Squarespace, Read.cv, portfolios de Awwwards
- **Gamificación:** Invisible o desactivada. Progress bar de perfil, nada más.
- **Target:** Fotógrafos, peluqueros, arquitectos, coaches, chefs
- **Focus:** Galería visual, servicios con precios, testimonials, contacto/reservas

### Ambos Modos
- Responsive mobile-first
- SEO optimizado
- i18n (ES/EN)
- AI asistente disponible (con vidas)
- Subdominios (`user.portfoland.com`)

---

## Métricas de Éxito Revisadas

### Pre-launch (ahora)
- **Bugs críticos:** 0 (Phase 0 complete)
- **Tiempo de primer portfolio publicado:** < 15 min
- **Portfolio funcional en ambos modos:** Sí

### Launch (cuando haya usuarios)
- **Signups primer mes:** 50+
- **Profile completion > 70%:** Target 60% (más realista)
- **Classic Mode adoption:** > 30% de nuevos users
- **Drop-off en onboarding:** < 40%

### Post-launch
- **AI features usage:** > 50% de users prueban al menos 1 feature AI
- **GitHub connection (Tech Mode):** > 60%
- **Assessment completion (cuando exista):** > 40% de Tech Mode users

---

**Este roadmap se actualiza cuando:**
1. Se completa una Phase
2. Feedback de usuarios reales cambia prioridades
3. Se descubre deuda técnica nueva

**Próximo paso:** Crear spec detallada para Phase 2B (Classic Mode Template).
