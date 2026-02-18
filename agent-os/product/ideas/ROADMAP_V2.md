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

### Phase 0: Critical Bug Fixes
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

### Phase 1: Rebrand & Unificación
**Tiempo estimado:** 3-5 días
**Delegable a Sonnet:** Sí

**Tasks:**
1. **Renaming en código:**
   - `portfolioMode: "gaming"` → `"tech"` en DB y schema
   - `portfolioMode: "professional"` → `"classic"` en DB y schema
   - Todos los condicionales, prompts, cache keys, tipos
   - Migration script para usuarios existentes

2. **Unificar routing a subdominios:**
   - Eliminar ruta `/[locale]/[username]` (o redirect a subdominio)
   - Verificar que proxy/middleware de subdominios funcione para todos los casos
   - Redirect `portfoland.com/user` → `user.portfoland.com`

3. **Actualizar docs de estrategia:**
   - README.md → reflejar Tech Mode / Classic Mode
   - TWO_MODE_STRATEGY.md → marcar como superseded, link a este doc
   - MEMORY.md → actualizar naming y estrategia

4. **Ajustar system prompts de IA:**
   - `chat/route.ts`: RPG_MASTER_PROMPT → reescribir sin terminología "gaming"
   - Tono: "Mission Briefing" tech-futurista, no "arcade RPG"
   - `narrate-portfolio`: diferenciar prompts Tech vs Classic (hoy son idénticos)

---

### Phase 2: Classic Mode MVP
**Tiempo estimado:** 2-3 semanas
**Delegable a Sonnet:** Sí (spec por spec)

**Objetivo:** Que un fotógrafo, peluquero, o diseñador pueda crear un portfolio profesional sin ver un solo hexágono.

**Tasks por spec:**

**Spec 2A: Schema & Data Layer**
- Modelo `Service` (título, descripción, precio, duración, orden)
- Modelo `Testimonial` (cliente, contenido, rating, foto)
- `PortfolioSettings` en `User` (secciones visibles, layouts, colores custom)
- Migration script

**Spec 2B: Classic Mode Template (Portfolio Público)**
- Template limpio: white bg, gray-900 text, blue-600 accents
- Secciones: About, Skills (tags), Gallery (grid/masonry), Services, Testimonials, Contact
- Cada sección toggleable via `sectionVisibility`
- Responsive

**Spec 2C: Dashboard Adaptations**
- Settings page para configurar secciones visibles
- CRUD de Services
- CRUD de Testimonials
- Color picker para colores custom (opcional, v1 puede ser presets)

**Spec 2D: Onboarding & Mode Switcher**
- Onboarding: "¿Tu trabajo es principalmente online/digital o presencial/de servicio?"
- Switcher en settings para cambiar modo
- Warning al cambiar (no se pierden datos, cambia visual + secciones default)

---

### Phase 3: Solidificar Tech Mode
**Tiempo estimado:** 2 semanas
**Delegable a Sonnet:** Sí

**Objetivo:** Que Tech Mode sea un portfolio que un dev senior no se avergüence de mostrar a un recruiter de FAANG.

**Tasks:**

**Spec 3A: GitHub Validation**
- Conectar cuenta GitHub (OAuth ya existe via Better Auth)
- Obtener repos, languages, commit activity
- Auto-validar skills basado en repos (`TypeScript` si tiene repos con >60% TS)
- XP boost para skills validadas (1.3x credibility)

**Spec 3B: Visual Polish**
- Evaluar The Gridcn / Glitchcn para componentes que mejoren la UI sin ser "arcade"
- Refinar hexágonos, CRT monitor, skill tree — hacerlos más "terminal profesional" que "Tron 1982"
- Asegurar que el portfolio se vea serio pero distintivo

**Spec 3C: Real XP & Stats**
- Reemplazar mock data con cálculos reales
- XP desde: experiencias + skills + proyectos + GitHub activity
- Dynamic goals (no hardcoded)

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

---

## Must-Have vs Nice-to-Have

### Must-Have (sin esto no se lanza)
- [ ] Phase 0 completa (bugs críticos)
- [ ] Phase 1 completa (rebrand + subdomain unification)
- [ ] Phase 2A + 2B (Classic Mode template funcional)
- [ ] Onboarding básico con selección de modo

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

**Próximo paso:** Crear spec detallada para Phase 0 (Critical Bug Fixes).
