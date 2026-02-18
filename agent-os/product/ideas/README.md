# Portfoland - Product Strategy & Ideas

**Última actualización:** 2026-02-17
**Estado:** Documentación de diseño y estrategia de producto + AI Features Sprint 1-3 COMPLETADOS ✅

> **IMPORTANTE:** El roadmap activo es [ROADMAP_V2.md](./ROADMAP_V2.md) (post-auditoría Opus).
> Cambios clave: **Tech Mode + Classic Mode** (reemplaza Gaming/Professional), bugs críticos como Phase 0, subdominios unificados.
> TWO_MODE_STRATEGY.md queda como referencia histórica.

---

## 📚 Índice de Documentos

Este directorio contiene toda la estrategia de producto, ideas de features, y referencias de diseño para Portfoland.

---

## ✅ **AI FEATURES IMPLEMENTADOS** (Sprint 1-3)

### **Sprint 1: AI Assistant Core** ✅ COMPLETADO
**Implementado:** 2026-02-16
**Ubicación:** Dashboard → Chat Panel

**Features:**
- ✅ Chat conversacional con streaming (Vercel AI SDK + Gemini 2.0 Flash)
- ✅ System prompts bilingües (ES/EN) adaptados al locale
- ✅ Tool calling para sugerencias dinámicas
- ✅ Persistencia de conversaciones en MongoDB
- ✅ Lives system (3 vidas/día, reset a medianoche)
- ✅ Refetch automático de vidas después de cada mensaje

**Costo:** ~$0.001 per conversation turn
**Archivos clave:**
- [`app/api/chat/route.ts`](../../app/api/chat/route.ts)
- [`features/dashboard/components/ai/AIChatContainer.tsx`](../../features/dashboard/components/ai/AIChatContainer.tsx)
- [`lib/ai/lives.ts`](../../lib/ai/lives.ts)
- [`lib/ai/prompts.ts`](../../lib/ai/prompts.ts)

---

### **Sprint 2: Content Improvement** ✅ COMPLETADO
**Implementado:** 2026-02-16
**Ubicación:** Dashboard → Bio, Projects, Experiences

**Features:**
- ✅ "Improve with AI" button en bio personal
- ✅ "Improve with AI" button en project descriptions
- ✅ "Improve with AI" button en experience descriptions
- ✅ Personalización basada en skills del usuario (top 8)
- ✅ Cálculo de años de experiencia desde DB (WORK → ANY → oldest skill)
- ✅ Input opcional para contexto adicional del usuario
- ✅ Markdown support con preview en vivo
- ✅ Límite de bio aumentado a 1000 caracteres
- ✅ Consume 1 vida por mejora

**Costo:** ~$0.0005 per improvement
**Archivos clave:**
- [`app/api/ai/improve-bio/route.ts`](../../app/api/ai/improve-bio/route.ts)
- [`app/api/ai/improve-description/route.ts`](../../app/api/ai/improve-description/route.ts)
- [`features/ai/components/ImproveBioButton.tsx`](../../features/ai/components/ImproveBioButton.tsx)
- [`features/ai/components/ImproveDescriptionButton.tsx`](../../features/ai/components/ImproveDescriptionButton.tsx)

---

### **Sprint 3: Public AI Narrator (Executive Summary)** ✅ COMPLETADO
**Implementado:** 2026-02-17
**Ubicación:** Public Portfolio → "AI Core" / "AI Summary" section

**Features:**
- ✅ Resumen ejecutivo AI-generated (120-150 palabras)
- ✅ Analiza trayectoria completa (skills, experiences, projects)
- ✅ NO repite bio verbatim - cuenta historia cohesiva
- ✅ Identifica hilo conductor de carrera
- ✅ **Quick Stats**: Años exp (< 1 si es 0), proyectos (total + completados), skills
- ✅ **Featured Projects**: Top 3 con tech stack + links (GitHub/Demo)
- ✅ **Quick Access**: GitHub, LinkedIn, Email, Website
- ✅ Cache 24h en `User.meta` para reducir costos
- ✅ Prompt unificado para Gaming y Professional modes
- ✅ Bilingüe (ES/EN)

**Costo:** ~$0.0003 per narrative (cacheable 24h)
**Archivos clave:**
- [`app/api/ai/narrate-portfolio/route.ts`](../../app/api/ai/narrate-portfolio/route.ts)
- [`features/portfolio/components/gaming/GamingAI.tsx`](../../features/portfolio/components/gaming/GamingAI.tsx)
- [`features/portfolio/components/professional/ProfessionalAI.tsx`](../../features/portfolio/components/professional/ProfessionalAI.tsx)

---

## 🎨 **UI FEATURES IMPLEMENTADOS**

### **Toast Border Effects (Cyberpunk Notifications)** ✅ COMPLETADO
**Implementado:** 2026-02-16
**Ubicación:** Global (todas las páginas)

**Features:**
- ✅ Borde pulsante global con color según tipo de notificación
- ✅ Hexágonos en esquinas con animación
- ✅ Efecto de scanline flash
- ✅ Auto-trigger con `useCyberpunkToast()` hook
- ✅ Color-coded: Error (rojo), Success (verde), Warning (amarillo), Info (cyan)
- ✅ Integrado globalmente en `app/[locale]/layout.tsx`

**Documentación:** [`features/ui/README.md`](../../features/ui/README.md)
**Ideas futuras:** [`features/ui/IDEAS.md`](../../features/ui/IDEAS.md) - Screen shake, glitch effects, particle systems

---

### 🎯 Estrategia Core

#### 1. [TWO_MODE_STRATEGY.md](./TWO_MODE_STRATEGY.md) ⭐ **RECOMENDADO**
**Decisión principal de producto**

- Gaming Mode 🎮 (Developer-focused)
  - GitHub integration, cyberpunk theme, gamification completa
- Professional Mode 💼 (Generic/Customizable)
  - Cualquier profesión, customizable, clean theme
- Por qué esto es mejor que Multi-Career Paths
- Roadmap de implementación (~4 semanas)

**Conclusión:** Enfoque pragmático que mantiene diferenciador (Gaming) + abre mercado (Professional)

---

#### 2. [DASHBOARD_GAMIFICATION.md](./DASHBOARD_GAMIFICATION.md)
**Sistema de XP, validación, y gamification**

- Análisis del dashboard actual (mock data → real stats)
- Sistema de puntos contextualizado
- GitHub API validation (commits, repos, languages)
- Sistema de credibilidad (1.0x manual → 2.0x certificado)
- Dynamic goals (vs hardcoded)
- Feature unlocks por nivel
- Badges públicos
- Quick wins prioritizados

**Métricas clave:**
- GitHub validation = diferenciador vs otros portfolio builders
- Credibility score promedio target: >1.3
- Profile completion target: >80%

---

#### 3. [MULTI_INDUSTRY_SCALABILITY.md](./MULTI_INDUSTRY_SCALABILITY.md)
**Análisis de escalabilidad multi-industry**

- Por qué el sistema actual NO funciona para no-developers
- Sistema de Career Paths detallado:
  - Developer (actual)
  - Photographer (Instagram/500px validation)
  - UI/UX Designer (Behance/Dribbble validation)
  - Fashion Stylist (Instagram/testimonials)
- Arquitectura de implementación
- Database schema para career paths
- Validation service architecture
- XP calculator por career path

**Conclusión:** Viable pero complejo (2-3 meses). Two-Mode Strategy es más pragmático.

---

#### 4. [AI_USE_CASES.md](./AI_USE_CASES.md)
**Ideas de IA (Claude API) para Portfoland**

**Top Use Cases (ordenados por prioridad):**

1. ⭐⭐⭐ **Auto-Suggest Skills**
   - Gaming: desde GitHub repos
   - Professional: desde texto bio
   - Effort: 2-3 días | Impact: Alto

2. ⭐⭐⭐ **Auto-Generate Bio**
   - Input: role, specialization, experience, location
   - Output: 2-3 sentences professional
   - Effort: 1-2 días | Impact: Alto

3. ⭐⭐ **Project Description Generator**
   - Gaming: desde GitHub repo
   - Professional: desde datos básicos
   - Effort: 2-3 días | Impact: Medio

4. ⭐⭐⭐ **Portfolio Review / Health Check**
   - Analiza portfolio completo
   - Sugiere 3-5 mejoras accionables
   - Effort: 3-4 días | Impact: Alto

5. ⭐⭐ **Career Path Matcher** (onboarding)
   - Ayuda a elegir Gaming vs Professional
   - Effort: 2 días | Impact: Medio

6. ⭐⭐ **Smart Skill Level Assessment**
   - Gaming Mode: desde GitHub activity
   - Effort: 3 días | Impact: Medio

**Cost estimation (original):** ~$0.14/user/month (~$140/mes para 1000 users)

**Cost tracking (implementado - Gemini 2.0 Flash):**
- Chat conversation turn: ~$0.001
- Bio improvement: ~$0.0005
- Description improvement: ~$0.0005
- Public narrator (cacheable 24h): ~$0.0003

**Ejemplo de uso promedio/user/month:**
- 10 chat messages: $0.01
- 2 bio improvements: $0.001
- 5 description improvements: $0.0025
- 1 narrator generation (cache): $0.0003
- **Total:** ~$0.014/user/month (10x más barato que estimación original)

**Para 1000 usuarios activos:** ~$14/mes (vs $140 estimado)

**Principio:** IA asiste, el usuario decide. No reemplaza autenticidad.

---

#### 5. [AI_SKILL_ASSESSMENT_GAME.md](./AI_SKILL_ASSESSMENT_GAME.md) 🎮 **FEATURE DESTACADA**
**Gamified skill validation con IA**

- **Concepto:** Juego de rol donde IA hace preguntas/ejercicios para validar skills
- **Mecánica:** 5 preguntas adaptativas, 3 vidas (🟢🟢🟢), múltiples tipos (multiple choice, code challenges, short answers)
- **Rewards:** Badge verificado, +150 XP, credibility boost (1.5x-2.0x)
- **Cost:** ~$0.035/assessment (~$350/mes para 10k users)
- **Freemium model:** 3 assessments/mes gratis, unlimited con Pro ($9/mes)
- **Diferenciador:** Ningún competidor tiene esto (LinkedIn = endorsements sin validación, HackerRank = no integra con portfolio)

**Timing:** Post-MVP (v1.2+) pero high priority

**Gamification:**
- Leaderboards por skill
- Achievements (Perfectionist, Polyglot, Comeback Kid)
- Weekly challenges
- Anti-cheating measures

**EXTENDED FEATURES (Documentadas en AI_SKILL_ASSESSMENT_GAME.md):**

**A. Mock Interviews 🎭**
- **Technical Interviews:** Preguntas conceptuales + coding challenges + system design
- **Behavioral Interviews:** STAR method evaluation con feedback estructurado
- **System Design Interviews:** Para roles senior/lead con evaluación de arquitectura
- **Cost:** ~$0.15-$0.25 per interview (30 min, ~15 exchanges)
- **Freemium:** 1 interview/mes gratis, 5 con Pro ($9/mes), unlimited con Premium ($29/mes)

**B. Career Coaching & Tips 💡**
- **Skill Gap Analysis:** Identifica gaps entre nivel actual y target (e.g., Mid-level → Senior)
- **Action Plan:** Roadmap personalizado con timeline (3-6 meses)
- **Resource Recommendations:** Cursos, proyectos sugeridos, frecuencia de práctica
- **Salary Projection:** Estimación de salary range con improvements
- **Cost:** ~$0.01 per coaching session (relativamente económico)

**C. Learning Resources Recommendations 📚**
- **Videos:** YouTube, Udemy, cursos online con ratings y relevance score
- **Articles:** GitHub repos, blog posts, documentation
- **Books:** Industry standards recomendados por relevancia
- **Practice Platforms:** LeetCode, HackerRank, coding challenges
- **Personalization:** Basado en skill gaps + learning style (visual/reading/hands-on)
- **Progress Tracking:** Marca recursos como completados, % completion
- **Cost:** Gratis (web scraping/APIs) + ~$0.01 para AI recommendations

**D. Interview Preparation Checklist ✅**
- **Technical Prep:** Review patterns, practice algorithms, mock interviews
- **Behavioral Prep:** STAR stories, company research, questions for interviewer
- **Portfolio Prep:** Update projects, add metrics, practice walkthrough
- **Day Before:** Tech check (camera/mic), background setup, print resume
- **Personalized:** Adaptado a company/role si se especifica

**Timing:** Phase 2 (v1.3) para Career Coaching, Phase 3 (v1.4) para Mock Interviews

---

### 🌟 AI FEATURES - PHASE 4+ (Ideas Futuras)

Documentadas en [../ai-features-ideas.md](../ai-features-ideas.md) - Ideas exploratorias post-MVP

#### **Ideas de Alto Valor:**

**1. Portfolio Adaptativo al Visitante** 🎯
- **Concepto:** Portfolio se reordena según quien lo mira (Recruiter / Tech Lead / Founder / Cliente)
- **Capacidades:** Reordena skills, resalta proyectos relevantes, ajusta timeline, genera mini pitch
- **Ejemplo:** "Para un Tech Lead, este perfil destaca arquitectura, escalabilidad y liderazgo técnico"
- **Complejidad:** L (Large) | **Impact:** Muy Alto (wow factor)

**2. Explorador Inteligente de Skills (Árbol Vivo)** 🌳
- **Concepto:** Skill tree conversacional con IA
- **Preguntas:** "¿Qué skills me faltan para ser Senior Frontend?" / "Comparame con Backend Dev"
- **Visual:** IA resalta nodos relevantes, sugiere caminos: "Si reforzás X → Y → Z, en 3-6 meses estás listo para SSR"
- **Complejidad:** M (Medium) | **Impact:** Alto (integra con Phase 3)

**3. Timeline Narrador (IA Cuenta Tu Historia)** 📖
- **Concepto:** IA como narrador de carrera profesional
- **Capacidades:** "Contame la historia", "¿Qué decisiones fueron clave?", "¿Dónde hubo cambios de rumbo?"
- **Ejemplo output:** "En 2023 hay un punto de inflexión: pasa de ejecutar tareas a liderar decisiones técnicas"
- **Valor:** Oro para recruiters que quieren entender el journey
- **Complejidad:** S (Small) | **Impact:** Medio (diferenciador único)

**4. CV Dinámico Generado en Tiempo Real** 📄
- **Concepto:** CV optimizado para cada job description
- **Flujo:** User pega job description → IA genera CV optimizado, ajusta bullets, reordena skills, marca gaps
- **Extra:** "Este CV tiene 82% de match con la posición"
- **Complejidad:** M (Medium) | **Impact:** Alto (uso práctico inmediato)

**5. Storytelling Automático** ✍️
- **Concepto:** Botón "Contá esta carrera como historia"
- **Outputs:** LinkedIn About section, Pitch de 30 segundos, Bio para web
- **Complejidad:** S (Small) | **Impact:** Medio (quick win)

**6. Modo Comparación** 🔄
- **Concepto:** Comparar dos timelines, dos skill trees
- **Capacidades:** IA explica diferencias, gaps, fortalezas
- **Complejidad:** M (Medium) | **Impact:** Bajo (nicho)

#### **Priorización Sugerida Phase 4:**

| Prioridad | Feature | Complejidad | Impact | Timing |
|-----------|---------|-------------|--------|--------|
| 1 | CV Dinámico (#4) | M | Alto | v1.5 |
| 2 | Explorador de Skills (#2) | M | Alto | v1.6 |
| 3 | Timeline Narrador (#3) | S | Medio | v1.6 |
| 4 | Career Coach (extended) | S | Medio | v1.7 |
| 5 | Portfolio Adaptativo (#1) | L | Muy Alto | v2.0 |
| 6 | Mock Interviews (extended) | L | Alto | v2.0 |
| 7 | Storytelling (#5) | S | Medio | v1.7 |
| 8 | Modo Comparación (#6) | M | Bajo | v2.1+ |

**Nota:** Requiere Vercel AI SDK (ya implementado en v1.2), streaming responses para UX fluida, data model de skills preparado

---

### 🎨 Referencias de Diseño

#### 6. [UI_LIBRARIES_REFERENCE.md](./UI_LIBRARIES_REFERENCE.md)
**Bibliotecas de componentes cyberpunk/gaming para futuras mejoras**

**The Gridcn** ([thegridcn.com](https://thegridcn.com/))
- 50+ componentes Tron-inspired con Three.js
- HUD elements, terminal aesthetics, cyberpunk cards
- 6 temas de color configurables
- Componentes 3D: Scanner, Hologram, Particle effects
- Animaciones avanzadas: Glitch, Scan, Data flow
- **Uso propuesto:** Gaming Mode v2.0 (reemplazo/complemento de componentes actuales)
- **Ventaja:** Ahorra semanas de desarrollo de efectos visuales

**Glitchcn** ([glitchcn-ui.vercel.app](https://glitchcn-ui.vercel.app/))
- 12 componentes terminal-styled lightweight
- Aesthetic minimalista cyberpunk sin dependencias pesadas
- Command line interface, ASCII art, retro terminal
- **Uso propuesto:** Complemento para console/terminal elements en Gaming Mode
- **Ventaja:** Ligero, no requiere Three.js, fácil integración

**Estrategia de adopción:**
- **Fase 1 (actual):** Shadcn UI base + componentes gaming custom
- **Fase 2 (v2.0):** Migración gradual a The Gridcn + Glitchcn para Gaming Mode
- **Fase 3:** Tercer tema "Tron/Cyberpunk" como opción premium

**Decisión:** Explorar post-MVP para reducir tiempo de desarrollo de efectos visuales

---

### 📁 Documentos Adicionales (Creados por Opus)

#### 7. [../ai-features-ideas.md](../ai-features-ideas.md) (Opus - Phase 4+)
**Ideas adicionales de IA**

**Ideas fuertes:**
1. Portfolio Adaptativo al visitante (reordena según quien mira)
2. Explorador de Skills conversacional (árbol vivo)
3. Timeline Narrador (IA cuenta la historia de carrera)
4. CV Dinámico (optimizado para cada job description)
5. **Simulador de Entrevistas** (práctica con feedback IA)
6. AI Career Coach
7. Storytelling automático

**Nota:** Estas ideas son complementarias a AI_USE_CASES.md y AI_SKILL_ASSESSMENT_GAME.md

#### 8. [../design-ideas.md](../design-ideas.md) (Opus)
**Conceptos de diseño aprobados**

- Timeline con Google Maps + hexágonos
- Sistema gaming naming (Developer → Code Wizard)
- Colores establecidos, componentes gaming disponibles

#### 9. [CV_IMPROVEMENT_PROMPTS.md](./CV_IMPROVEMENT_PROMPTS.md) 📄 **PROMPTS CURRADOS**
**6 prompts específicos para CV optimization con IA**

**Prompts incluidos:**
1. **Reality Check del Reclutador** - Por qué el CV no genera entrevistas
2. **Optimización para ATS** - Pasar sistemas de tracking (crítico, 75% empresas usan ATS)
3. **Mejora de Impacto y Resultados** - Logros medibles vs responsabilidades
4. **Detector de Brechas de Keywords** - Gap analysis vs job description
5. **Detector de Debilidades** - Red flags, inconsistencias, vacíos
6. **Diferenciación Competitiva** - Ventaja única vs otros candidatos

**Por qué son valiosos:**
- **Ultra-específicos** (no genéricos)
- **Accionables** (output estructurado)
- **Costo-efectivos** (~$0.016 por análisis)
- **Críticos para Professional Mode** (ATS optimization = must-have)

**Feature relacionado:** CV Dinámico (Phase 4, Prioridad #1)
**Timing:** v1.5-1.6 (2-3 semanas implementación)
**Freemium:** 1 análisis/mes gratis, 5 con Pro ($9/mes)

**Ventaja competitiva:** Portfoland = Portfolio + CV + Validation + AI Optimization (todo integrado, nadie más tiene esto)

---

### 📊 Comparación Rápida de Estrategias

| Aspecto | Two-Mode | Multi-Career | Solo Gaming |
|---------|----------|--------------|-------------|
| **Time to market** | 🟢 4 semanas | 🔴 2-3 meses | 🟢 2 semanas |
| **Alcance mercado** | 🟢 Developers + Otros | 🟢 Máximo | 🔴 Solo devs |
| **Complejidad** | 🟡 Media | 🔴 Alta | 🟢 Baja |
| **Diferenciador** | 🟢 Gaming Mode único | 🟡 Diluido | 🟢 Máximo |
| **Mantenimiento** | 🟢 Bajo | 🔴 Alto | 🟢 Mínimo |
| **Escalabilidad** | 🟡 Media-Alta | 🟢 Máxima | 🔴 Limitada |

**Decisión recomendada:** Two-Mode Strategy 🏆

---

## 🚀 Roadmap Consolidado

### MVP - Gaming Mode (Current)
```
✅ Dashboard con stats (mock → real)
✅ Skill tree
✅ GitHub OAuth (Better Auth)
✅ Cyberpunk theme
⏳ GitHub validation
⏳ Dynamic goals
⏳ Real XP calculation
```

### v1.1 - Professional Mode (+4 semanas)
```
Week 1: Refactor gaming-specific code
  - Extract theme config
  - Mark gaming features
  - Gaming skill categories

Week 2-3: Build Professional Mode
  - Professional theme (clean, white)
  - Schema (Services, Testimonials, Settings)
  - Customizable sections
  - Gallery layouts (grid/masonry/carousel)
  - Custom colors

Week 4: Integration
  - Mode switcher
  - Onboarding flow
  - Settings page
  - Public portfolio templates
```

### v1.2 - AI Features ✅ COMPLETADO (3 Sprints - 5 días)
```
✅ Sprint 1 (Feb 16): AI Assistant Core
  - Chat conversacional con Gemini 2.0 Flash
  - Lives system (3/día, reset medianoche)
  - Persistencia de conversaciones
  - System prompts bilingües

✅ Sprint 2 (Feb 16): Content Improvement
  - Improve bio with AI
  - Improve project descriptions
  - Improve experience descriptions
  - Markdown support + preview

✅ Sprint 3 (Feb 17): Public AI Narrator
  - Executive Summary en portfolios públicos
  - Quick Stats + Featured Projects + Quick Access
  - Cache 24h, prompt personalizado
  - NO repite bio

⏳ Sprint 4 (Futuro): Advanced Features
  - Auto-suggest skills desde GitHub
  - Portfolio health check
  - SEO meta generator
```

### v2.0 - Enhancements (Post-launch)
```
Basado en feedback:
  - Professional Mode templates (Designer, Photographer, etc.)
  - More customization (preset themes, typography)
  - Advanced AI features
  - Portfolio analytics
  - Leaderboards (Gaming Mode)
```

---

## 🎯 Principios de Diseño

### Gaming Mode 🎮
- **Fixed design** - No customization (brand consistency)
- **Full gamification** - XP, levels, achievements, badges
- **GitHub-centric** - Validation, stats, repos
- **Cyberpunk aesthetic** - Dark bg, neon, hexágonos, monospace
- **Target:** Software developers que quieren destacar

### Professional Mode 💼
- **Customizable** - Secciones, colores, layouts
- **Clean aesthetic** - White bg, sans-serif, minimalist
- **No gamification visible** - O opcional/light
- **Flexible content** - Gallery, services, testimonials
- **Target:** Fotógrafos, diseñadores, freelancers, cualquier profesional

### Ambos Modos
- **Mobile-first** - Responsive design
- **Fast performance** - Optimized images, lazy loading
- **SEO optimized** - Meta tags, semantic HTML
- **Accessible** - WCAG 2.1 AA compliant

---

## 📊 Success Metrics

### Product Metrics
- **Signups:** Target +100/mes
- **Profile completion rate:** Target >70%
- **Portfolio publish rate:** Target >50%
- **Weekly active users:** Target >60%

### Engagement (Gaming Mode)
- **GitHub connection rate:** Target >80%
- **Skills validated via GitHub:** Target >40%
- **Average XP growth:** Target +200/week

### Engagement (Professional Mode)
- **Custom sections enabled:** Target >3 per user
- **Gallery uploads:** Target >10 images
- **Services listed:** Target >2

### Quality
- **Time to first published portfolio:** Target <30 min
- **User satisfaction:** Target >4/5 stars
- **Portfolio views (avg):** Target >50/month

---

## 💡 Decisiones Clave

### ✅ Decidido - Product Strategy
1. **Two-Mode Strategy** (Gaming + Professional) vs Multi-Career
2. **GitHub validation** como diferenciador (Gaming Mode)
3. **Moderada customización** en Professional Mode (no súper dinámica en v1)
4. **AI como asistente**, no generador automático
5. **Mobile-first**, responsive design
6. **Feature-based architecture** (features/{name}/)

### ✅ Decidido - Technical Architecture
1. **Three-layer pattern** (action → service → data)
   - Actions: Server actions con `actionWrapper` + Yup validation
   - Services: Business logic reutilizable
   - Data: Pure Prisma queries
2. **Vercel AI SDK + Gemini 2.0 Flash**
   - Costo: ~10x más barato que GPT-4
   - Streaming support para chat
   - Tool calling para features dinámicas
3. **Lives system en `User.meta` JSON**
   - 3 vidas/día por usuario
   - Reset a medianoche (timezone del usuario)
   - Almacenado en MongoDB como JSON flexible
4. **Caching strategy para AI narratives**
   - 24h cache en `User.meta`
   - Keys: `aiNarrative_${mode}_${locale}`
   - Invalidación manual con script
5. **No global state library** (Redux/Zustand)
   - Server state via Server Actions
   - URL state via searchParams
   - Local state via useState
6. **i18n con next-intl**
   - Route-based locale (`/[locale]/`)
   - System prompts bilingües en endpoints
7. **Prisma + MongoDB**
   - Flexible schema (JSON fields: meta, contactLinks, sectionVisibility)
   - Sin migraciones complejas
8. **Barrel exports** para features
   - `features/gaming/index.tsx` - Gaming UI components
   - `features/shadcn/ui/` - Shadcn components
   - Clean imports: `import { HUDPanel } from '@/features/gaming'`

### ⏳ Por Decidir
1. Pricing model (freemium? premium features?)
2. Portfolio analytics (mostrar views/clicks?)
3. Social features (follow users? like portfolios?)
4. Integración con job boards?
5. White-label option para empresas?
6. The Gridcn/Glitchcn adoption timeline

---

## 🔗 Links Útiles

### Referencias Externas
- The Gridcn: https://thegridcn.com/
- Glitchcn UI: https://glitchcn-ui.vercel.app/
- Shadcn/ui: https://ui.shadcn.com/
- Next.js: https://nextjs.org/
- Prisma: https://prisma.io/
- Better Auth: https://better-auth.com/

### APIs a Integrar
- GitHub API: https://docs.github.com/en/rest
- Instagram Basic Display API: https://developers.facebook.com/docs/instagram-basic-display-api
- Behance API: https://www.behance.net/dev
- Dribbble API: https://developer.dribbble.com/
- Claude API: https://docs.anthropic.com/

### Internal Docs & Key Files
- **Memoria del proyecto:** [`C:\Users\user\.claude\projects\C--Users-user-code-nextjs-portfoland\memory\MEMORY.md`](C:\Users\user\.claude\projects\C--Users-user-code-nextjs-portfoland\memory\MEMORY.md)
  - Patrones del proyecto, convenciones, decisiones arquitectónicas
  - Key Patterns, Toast Border Effects, Completed Specs
- **Specs de implementación:** `agent-os/specs/`
  - [`2026-02-16-ai-assistant/`](../specs/2026-02-16-ai-assistant/) - AI Assistant (Sprint 1-3)
  - [`2026-02-04-portfolio-template-system/`](../specs/2026-02-04-portfolio-template-system/) - Portfolio System
- **Design backups/references:**
  - `backups/design-idea-v1/` - Full app structure con shadcn UI
  - `backups/design-idea-v2/` - CRT monitor, hex-badge, login-page
- **Feature implementations:**
  - [`features/ai/`](../../features/ai/) - AI components (ImproveBioButton, ImproveDescriptionButton)
  - [`features/dashboard/components/ai/`](../../features/dashboard/components/ai/) - AI Chat Container
  - [`features/portfolio/components/gaming/GamingAI.tsx`](../../features/portfolio/components/gaming/GamingAI.tsx) - Public narrator
  - [`features/ui/`](../../features/ui/) - Toast effects, form indicators
  - [`lib/ai/`](../../lib/ai/) - Lives system, prompts
- **API endpoints:**
  - [`app/api/chat/route.ts`](../../app/api/chat/route.ts) - Chat streaming
  - [`app/api/ai/improve-bio/route.ts`](../../app/api/ai/improve-bio/route.ts) - Bio improvement
  - [`app/api/ai/improve-description/route.ts`](../../app/api/ai/improve-description/route.ts) - Description improvement
  - [`app/api/ai/narrate-portfolio/route.ts`](../../app/api/ai/narrate-portfolio/route.ts) - Public narrator

---

## 📝 Notas para Implementación

### Para Opus / Implementer:
1. **Leer TWO_MODE_STRATEGY.md primero** - Decisión core
2. **Seguir roadmap consolidado** - Phases claras
3. **Referirse a MEMORY.md** para patterns del proyecto
4. **AI features son post-MVP** - No bloquean lanzamiento
5. **Professional Mode customización moderada v1** - No over-engineer

### Context Clave:
- Ya existe: Gaming components, cyberpunk theme, GitHub OAuth, Prisma schema
- Schema ya tiene: User.portfolioMode, Skills, Experiences, Projects
- Falta agregar: Services, Testimonials, Portfolio Settings
- Theme system: Gaming (dark, neon) vs Professional (white, clean)

---

## 🎨 Visual References

```
GAMING MODE AESTHETIC:
  Colors: #0A0E1A (bg), #00D4FF (cyan), #D946EF (magenta)
  Fonts: Monospace (JetBrains Mono, Fira Code)
  Components: Hexagonal badges, CRT monitor, angular cards
  Animations: Glitch effects, scanlines, neon glow

PROFESSIONAL MODE AESTHETIC:
  Colors: #FFFFFF (bg), #111827 (text), #2563EB (primary)
  Fonts: Sans-serif (Inter, system-ui)
  Components: Clean cards, rounded corners, grid layouts
  Animations: Subtle fades, smooth transitions
```

---

## ✅ Checklist para Inicio de Implementación

- [ ] Leer todos los docs en este directorio
- [ ] Entender Two-Mode Strategy
- [ ] Revisar schema actual (prisma/schema.prisma)
- [ ] Identificar gaming-specific code a refactorear
- [ ] Planear schema changes para Professional Mode
- [ ] Decidir tech stack para customization (JSON config, etc.)
- [ ] Setup theme system (gaming.theme.ts, professional.theme.ts)

---

---

## ⚙️ **Consideraciones Técnicas AI Features**

### Rate Limiting & Abuse Prevention
**Implementación recomendada (no implementado aún):**
```typescript
// Upstash Redis + Ratelimit
- 10 requests/hour per user para AI features
- Sliding window algorithm
- Graceful degradation (mostrar mensaje claro vs error)
```

### Caching Strategy (✅ Implementado)
```typescript
// Cache AI responses para reducir costos
- Bio improvements: No cache (user puede editar input)
- Narrator: 24h cache en User.meta (minimal changes)
- Chat conversations: Persist en DB para history
- Key pattern: `aiNarrative_${mode}_${locale}`
```

### Cost Monitoring
**Tracking necesario:**
- Logs de API calls por usuario
- Costos diarios/mensuales agregados
- Alertas si costo/user > threshold ($0.10/mes)
- Dashboard interno para monitoring

### Quality Assurance
**Best practices:**
1. **Transparencia:** Siempre mostrar que el contenido es AI-generated
2. **Editabilidad:** Permitir edición fácil post-generación
3. **Regenerate:** Botón para probar otra versión
4. **Optional:** No forzar uso de AI features
5. **Fallbacks:** Si AI falla, degradar gracefully (no romper UX)

### Anti-Cheating (Skill Assessment)
**Cuando se implemente:**
- Time limits por pregunta
- Question randomization (orden opciones + orden preguntas)
- Cooldown periods (24h retry si falla)
- Browser tab detection (3 strikes)
- AI detection de copy-paste answers

---

## 📊 **Estado Actual del Proyecto** (2026-02-17)

### ✅ **Completado**
- Core portfolio system (Gaming/Professional modes)
- Dashboard con profile management
- Timeline con Google Maps + hexágonos
- Skills con XP system
- Projects showcase
- **AI Features (Sprint 1-3):**
  - ✅ AI Chat Assistant (Gemini 2.0 Flash)
  - ✅ Lives system (3/día)
  - ✅ Content improvement (bio, descriptions)
  - ✅ Public AI Narrator (Executive Summary)
  - ✅ Toast border effects (cyberpunk)
- Better Auth (email/password)
- i18n (ES/EN) con next-intl
- Markdown support + preview
- Responsive design

### 🚧 **En Progreso / Próximo**
- GitHub validation (diferenciador clave)
- Real XP calculation
- Dynamic goals
- Skill credibility scores
- Feature unlocks

### 📋 **Roadmap Futuro**
- **v1.1:** Professional Mode enhancements (4 semanas)
- **v1.2+:** AI Skill Assessment Game (GAME-CHANGER)
- **v2.0:** The Gridcn/Glitchcn integration
- **v2.0+:** Multi-industry expansion

### 💰 **Cost Analysis (Actualizado)**
- **Desarrollo AI:** ~$0.014/user/mes (10x más barato que estimado)
- **Gemini 2.0 Flash:** Costo-efectivo vs GPT-4
- **Cache strategy:** Reduce costos significativamente (narrativas 24h)

---

**Última palabra:** Este conjunto de documentos representa ~6 horas de análisis de producto, diseño de arquitectura, y estrategia. Todo está pensado para ser **pragmático** (quick to market) mientras mantiene **escalabilidad futura**.

**Los AI Features (Sprint 1-3) se completaron en 5 días**, demostrando la viabilidad de la estrategia de IA asistida. El siguiente paso crítico es **GitHub validation** para consolidar el diferenciador en Gaming Mode.

**Next step:**
1. Implementar GitHub API validation (diferenciador clave)
2. Preparar Two-Mode Strategy (Professional Mode enhancements)
3. Comenzar diseño de AI Skill Assessment Game
