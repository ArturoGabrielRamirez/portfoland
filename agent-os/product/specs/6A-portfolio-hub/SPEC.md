# Spec 6A — Portfolio Hub (Settings Consolidation)

**Phase:** 6 — UI Coherence
**Branch:** `feat/phase6-ui-coherence`
**Priority:** P0 — Fundación del resto de Phase 6
**Estimated scope:** M (3–5 días)

---

## Problema

El dashboard tiene 3 rutas dedicadas para Classic Mode que son CRUD simples de listas cortas:
- `/dashboard/services` — gestión de servicios
- `/dashboard/gallery` — galería de imágenes
- `/dashboard/testimonials` — testimonios de clientes

Estas páginas son innecesariamente independientes. El Portfolio page ya tiene:
- Toggles de visibilidad para cada sección
- Textos que dicen "ir a /services para editar" (friction innecesaria)
- El tab Theme/Analytics ya sobrecarga una sola pantalla sin estructura

El resultado es una navegación con demasiados ítems, contenido duplicado (visibility control en Portfolio, CRUD en otra ruta), y un Portfolio page que no tiene estructura navegable.

---

## Solución

Convertir `/dashboard/portfolio` en un **Hub con tabs**, absorber el CRUD de Services, Gallery y Testimonials como secciones del tab "Content", y eliminar las 3 rutas independientes.

### Estructura nueva de Portfolio Hub

```
/dashboard/portfolio?tab=profile   (default)
/dashboard/portfolio?tab=content
/dashboard/portfolio?tab=theme
/dashboard/portfolio?tab=analytics
```

Implementar con `searchParams` o state local (no requiere routing separado — tabs dentro de la misma página).

---

## Tabs

### Tab 1: Profile
Contenido actual del Portfolio page:
- Display name (input)
- Bio (textarea con preview Markdown + AI "Improve Bio")
- Avatar upload con OAuth fallback
- Social links (GitHub URL, LinkedIn URL, custom links)

### Tab 2: Content
**Sección superior: Visibilidad y orden de secciones**
- Drag-to-reorder (igual que hoy)
- Toggle visible/hidden por sección

**Para usuarios Classic Mode — CRUD inline por sección:**

**Services:**
- Lista de servicios con Edit/Delete inline
- "Add Service" button + form inline o modal
- Reemplaza completamente `/dashboard/services`

**Gallery:**
- Grid de imágenes con delete
- Upload dropzone
- Reemplaza completamente `/dashboard/gallery`

**Testimonials:**
- Lista de testimonios con Edit/Delete
- "Add Testimonial" button + modal
- Reemplaza completamente `/dashboard/testimonials`

**Para usuarios Tech Mode:** Tab Content solo muestra visibilidad/orden de Experience, Skills, Projects (sin CRUD inline — esas secciones tienen sus propias páginas especializadas).

### Tab 3: Theme
Solo Classic Mode users. Contenido actual:
- Presets (4 themes: default, warm, dark-elegant, ocean)
- Custom Builder (color pickers)
- Layout Variant selector (Bento, Classic, Minimal)
- View Mode selector (Sections, One-Page, Terminal, Minimal)

### Tab 4: Analytics
Ambos modos:
- View counts (total y últimos 7 días)
- Referrer sources
- Top sections (cuál visitan más)
- Integrado desde `AnalyticsPanel` existente

---

## Cambios de Navegación

### Rutas a eliminar
- `/dashboard/services` → redirect a `/dashboard/portfolio?tab=content`
- `/dashboard/gallery` → redirect a `/dashboard/portfolio?tab=content`
- `/dashboard/testimonials` → redirect a `/dashboard/portfolio?tab=content`

### Nav items a eliminar
En `features/tech/components/dashboard-nav.tsx`:
- Eliminar entradas de "Services", "Gallery", "Testimonials"
- Nav queda: Dashboard | Timeline | Skills | Projects | CV

---

## Archivos Afectados

### Modificar
- `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` — pasar tabs params y datos de services/gallery/testimonials
- `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` — restructurar con tabs, añadir CRUD inline
- `features/tech/components/dashboard-nav.tsx` — eliminar 3 nav items Classic Mode

### Crear
- `app/[locale]/(dashboard)/dashboard/portfolio/components/ProfileTab.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/components/ContentTab.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/components/ThemeTab.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/components/AnalyticsTab.tsx`
- `app/[locale]/(dashboard)/dashboard/portfolio/components/PortfolioTabs.tsx`

### Crear redirects (o eliminar páginas y redirigir desde nav)
- `app/[locale]/(dashboard)/dashboard/services/page.tsx` → redirect
- `app/[locale]/(dashboard)/dashboard/gallery/page.tsx` → redirect
- `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx` → redirect

### Reusar (mover lógica, no reescribir)
- `features/services/components/DashboardServicesView.tsx` → extraer componente `ServicesSection`
- `features/gallery/components/DashboardGalleryView.tsx` → extraer componente `GallerySection`
- `features/testimonials/components/DashboardTestimonialsView.tsx` → extraer componente `TestimonialsSection`

---

## UX del Tab System

### Tech Mode
```
┌─────────────────────────────────────────────────────────┐
│ [PROFILE]  [CONTENT]  [THEME]  [ANALYTICS]              │
│ ─────────                                               │
│ (tab content below)                                     │
└─────────────────────────────────────────────────────────┘
```
Tabs: estilo monospace, borde cyan activo, fondo oscuro

### Classic Mode
```
┌─────────────────────────────────────────────────────────┐
│  Profile  |  Content  |  Theme  |  Analytics            │
│  ───────                                                │
│  (tab content below)                                    │
└─────────────────────────────────────────────────────────┘
```
Tabs: estilo clean, border-b azul activo, fondo blanco

### Comportamiento
- Tab activo persiste en URL como `?tab=profile` (para compartir/refresh)
- Save button global sigue en bottom-right FAB (guarda cualquier tab activo)
- Analytics tab es read-only (no save needed)

---

## Criterios de Aceptación

- [ ] `/dashboard/portfolio` tiene 4 tabs funcionales
- [ ] Classic Mode users pueden hacer CRUD completo de Services, Gallery, Testimonials desde Content tab
- [ ] Tech Mode users ven Content tab con solo visibility/order (sin CRUD inline de esas secciones)
- [ ] Las rutas `/dashboard/services`, `/dashboard/gallery`, `/dashboard/testimonials` redirigen a `/dashboard/portfolio?tab=content`
- [ ] Nav queda sin los 3 ítems eliminados (mismo nav para ambos modos)
- [ ] Save FAB guarda el tab activo correctamente
- [ ] Tab activo persiste en URL query param `?tab=`
- [ ] Analytics panel funcional en tab 4
- [ ] Theme tab solo visible para Classic Mode users
- [ ] No regression en funcionalidades existentes de Services/Gallery/Testimonials

---

## Notas de Implementación

- Los server actions de services/gallery/testimonials NO cambian — solo cambia dónde se montan los componentes
- `getDashboardPageData` puede necesitar extenderse para traer services/gallery/testimonials en el portfolio page data fetch
- El save FAB existente necesita conocer qué tab está activo para saber qué acción disparar
- Considerar `useSearchParams` + `router.replace` para manejar tab state en URL sin page reload
