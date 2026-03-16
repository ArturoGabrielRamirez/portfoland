# Tasks — 6A: Portfolio Hub

## Setup
- [ ] 6A-0: Leer SPEC.md completo. Leer archivos: `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`, `DashboardPortfolioView.tsx`, `features/tech/components/dashboard-nav.tsx`, `features/services/components/DashboardServicesView.tsx`, `features/gallery/components/DashboardGalleryView.tsx`, `features/testimonials/components/DashboardTestimonialsView.tsx`, `features/dashboard/utils/modeClasses.ts`

## Fase 1 — Tab infrastructure
- [ ] 6A-1: Crear `PortfolioTabs.tsx` en `app/[locale]/(dashboard)/dashboard/portfolio/components/` — tabs bar que maneja state via URL `?tab=` con `useSearchParams` + `router.replace`. Props: `activeTab`, `availableTabs: Tab[]`, `portfolioMode`
- [ ] 6A-2: Crear `ProfileTab.tsx` — mover secciones About/Avatar/Bio/SocialLinks del view actual a este componente. Sin lógica nueva, solo reorganización.
- [ ] 6A-3: Crear `ThemeTab.tsx` — mover secciones Theme presets/custom builder/layout variant/view mode al componente. Solo Classic Mode users ven este tab.
- [ ] 6A-4: Crear `AnalyticsTab.tsx` — mover `AnalyticsPanel` existente. Read-only, sin save button.

## Fase 2 — Content Tab con CRUD inline
- [ ] 6A-5: Crear `ContentTab.tsx` — sección de visibility/order de sections (código actual). Para Classic Mode: añadir secciones Services, Gallery, Testimonials con CRUD inline.
- [ ] 6A-6: Extraer `ServicesSection.tsx` de `DashboardServicesView` — componente que muestra lista + add/edit/delete de services. Reusar server actions existentes.
- [ ] 6A-7: Extraer `GallerySection.tsx` de `DashboardGalleryView` — idem para gallery.
- [ ] 6A-8: Extraer `TestimonialsSection.tsx` de `DashboardTestimonialsView` — idem para testimonials.
- [ ] 6A-9: Integrar Services/Gallery/Testimonials sections en `ContentTab.tsx` — solo si `portfolioMode === 'classic'`

## Fase 3 — Refactor page y data fetching
- [ ] 6A-10: Actualizar `portfolio/page.tsx` — añadir fetch paralelo de services, gallery, testimonials data. Pasar a `DashboardPortfolioView` como nuevas props.
- [ ] 6A-11: Refactorizar `DashboardPortfolioView.tsx` — reemplazar scroll único con `<PortfolioTabs>` + tab components. Save FAB solo activo en tabs Profile/Content/Theme.

## Fase 4 — Redirects y nav
- [ ] 6A-12: Convertir `app/[locale]/(dashboard)/dashboard/services/page.tsx` en redirect a `/dashboard/portfolio?tab=content`
- [ ] 6A-13: Convertir `app/[locale]/(dashboard)/dashboard/gallery/page.tsx` en redirect a `/dashboard/portfolio?tab=content`
- [ ] 6A-14: Convertir `app/[locale]/(dashboard)/dashboard/testimonials/page.tsx` en redirect a `/dashboard/portfolio?tab=content`
- [ ] 6A-15: Eliminar items de Services/Gallery/Testimonials de `dashboard-nav.tsx` — nav queda igual para ambos modos

## Fase 5 — Verificación
- [ ] 6A-16: Verificar que Classic Mode users pueden crear/editar/eliminar services, gallery items, testimonials desde Content tab
- [ ] 6A-17: Verificar que Tech Mode users ven Content tab solo con visibility/order (sin CRUD inline de esas secciones)
- [ ] 6A-18: Verificar que las 3 rutas antiguas redirigen correctamente a `/dashboard/portfolio?tab=content`
- [ ] 6A-19: Verificar que el tab activo persiste en URL al navegar dentro de la página
- [ ] 6A-20: Verificar que Save FAB no aparece en Analytics tab
- [ ] 6A-21: `npx tsc --noEmit` — sin errores nuevos en archivos modificados
