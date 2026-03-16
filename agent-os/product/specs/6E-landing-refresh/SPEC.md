# Spec 6E — Landing Page Refresh

**Phase:** 6 — UI Coherence
**Branch:** `feat/phase6-ui-coherence`
**Priority:** P2
**Estimated scope:** M (2–3 días)

---

## Problema

La landing page (`app/[locale]/page.tsx`) fue diseñada en una versión temprana del producto. No refleja las features reales que existen hoy:

**Features actuales no mostradas:**
- CV Generator con AI (genera PDFs tailored por job)
- CV Import (sube PDF/DOCX y extrae datos)
- AI Skill Assessment (quiz de validación de skills)
- Portfolio Analytics (tracking de visitas con privacidad)
- GitHub Integration (validación automática de skills desde repos)
- AI Chat (asistente en el dashboard con herramientas reales)
- SEO Meta automático para portfolios públicos
- Classic Mode templates para profesionales de servicio

**Secciones probablemente desactualizadas:**
- "Coming Soon" features que ya existen
- Screenshots/mockups de UI old
- Copy genérico que no refleja el valor real del producto

---

## Solución

Refreshear la landing con copy y secciones actualizadas. NO es un rediseño completo — es actualizar el contenido para que refleje lo que el producto realmente hace hoy.

---

## Estructura propuesta de la Landing

### Hero
**Headline:** "Your portfolio, built by AI"
**Subheadline:** "Import your CV, connect GitHub, and get a professional portfolio in minutes — with AI that knows your career."
**CTA primario:** "Start free" → `/register`
**CTA secundario:** "See example portfolio" → link a un portfolio demo

Visual: Split entre Tech Mode y Classic Mode mostrando el mismo portfolio.

### Feature Section 1: "AI that works with you"

3 features del AI chat:
1. **Ask, don't fill forms** — "Add my job at Accenture as backend dev" — AI adds it directly
2. **Tailored CVs in seconds** — Upload job description, get a PDF CV optimized for it
3. **Skill assessment** — Validate your skills with AI questions, earn XP

### Feature Section 2: "Auto-populate from what you already have"

2 features de import:
1. **GitHub sync** — Connect your repos, skills auto-detected from package.json dependencies
2. **CV Import** — Upload your existing PDF/DOCX CV, extract all data instantly

### Feature Section 3: "Two modes, one portfolio"

Tech Mode vs Classic Mode:
- Tech: Para developers, con skill tree hexagonal, GitHub validation, CRT terminal AI
- Classic: Para diseñadores, fotógrafos, consultores — limpio, con gallery, servicios, testimonios

Visual: Toggle entre los dos modos mostrando el mismo portfolio.

### Feature Section 4: "Your portfolio gets found"

- SEO automático con Open Graph y structured data
- Analytics privados (quién visita, desde dónde, qué secciones)
- Subdomain propio: `username.portfoland.com`

### Pricing / CTA Final

- Free plan (features actuales)
- Pro plan (futuro — placeholder)
- CTA: "Start building your portfolio"

---

## Archivos Afectados

### Modificar
- `app/[locale]/page.tsx` — estructura principal de la landing
- `features/landing/` — componentes de landing existentes (actualizar copy y secciones)
- `messages/en.json` y `messages/es.json` — keys de i18n para la landing

### Posiblemente Crear
- `features/landing/components/FeatureSection.tsx` — nuevo layout de feature sections
- `features/landing/components/ModeTogglePreview.tsx` — toggle visual Tech/Classic
- `features/landing/components/FeatureCard.tsx` — cards de features individuales

---

## Criterios de Aceptación

- [ ] Hero copy refleja el valor real del producto (AI + portfolio)
- [ ] Al menos 4 features actuales están descritas en la landing
- [ ] La sección de modos (Tech/Classic) es visible y explicada
- [ ] GitHub sync y CV Import están mencionados como features de onboarding
- [ ] No hay referencias a "coming soon" para features que ya existen
- [ ] CTAs funcionales: "Start free" → `/register`, ejemplo portfolio funcional
- [ ] Versión ES y EN actualizadas (i18n keys)
- [ ] Landing funciona correctamente en mobile
- [ ] Tiempo de carga < 3s (no añadir imágenes pesadas sin optimizar con Next Image)

---

## Notas de Implementación

- Si hay screenshots de UI, usar Next.js `<Image>` con `priority` en above-the-fold
- El toggle Tech/Classic en la landing puede ser client component puro (no necesita server data)
- Coordinar con 6A/6C para que la landing refleje la estructura final del dashboard (no mencionar /services como ruta separada si ya fue eliminada)
- El copy en español puede ser ligeramente diferente al inglés (no traducción literal)
