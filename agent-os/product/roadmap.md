# Product Roadmap

> **Design Reference:** Ver `agent-os/product/design-ideas.md` para conceptos visuales detallados.

---

## Phase 1: Foundation (v0.1.0) COMPLETED

1. [x] Database Schema & Prisma Setup — MongoDB Atlas + Prisma 6.19, modelos User/Session/Account
2. [x] Authentication System — Better Auth con Google OAuth y email/password
3. [x] UI Component Library — shadcn/ui + Gaming components library (GamingCard, HUDPanel, XPBar, etc.)
4. [x] Internationalization — next-intl para EN/ES con LanguageSwitcher
5. [x] User Dashboard — Dashboard con stats, progress indicator, feature cards "Coming Soon"
6. [x] Landing Page — Hero section gaming, dos modos (Professional/Gaming), features preview
7. [x] Protected Routes — proxy.ts con redirecciones auth/unauth

**Tech Stack implementado:**
- Next.js 16.1.1 + App Router
- Better Auth (NO NextAuth.js)
- MongoDB + Prisma 6.19
- Tailwind CSS 4 + shadcn/ui
- next-intl (EN/ES)
- Vitest + Testing Library

---

## Phase 2: Interactive Timeline (v0.2.0) COMPLETED

> **Concepto aprobado:** Google Maps + Hexagons Gaming
> Ver detalles en `agent-os/product/design-ideas.md`

8. [x] Timeline Map Component — Google Maps como fondo con blur/fade + overlay gaming `L`
9. [x] Hexagon Node System — Nodos hexagonales conectados representando experiencias `M`
10. [x] Experience Cards — Cards gaming para mostrar detalles de cada experiencia `M`
11. [x] Timeline Entry Creator — Forms para agregar experiencias con ubicacion, fechas, descripcion `M`
12. [x] Career Field Configuration — Seleccion de campo con naming gamificado (Freelance -> Freelancero) `S`
13. [x] Zoom Interactions — Animaciones zoom in/out al seleccionar experiencias en el mapa `M`

---

## Phase 3: Skill Tree & Portfolio (v0.3.0) IN PROGRESS

14. [x] Skill Tree Visualization — Arbol de habilidades estilo videojuego con progresion y dependencias `L`
15. [x] Portfolio Template System — Templates con modos Professional y Gaming `L`
16. [x] Subdomain Routing — username.portfoland.com con proxy.ts rewrite `M`
17. [x] Project Showcase — Cards de proyectos con imagenes, tech stack, links `M`
18. [ ] Portfolio SEO & Meta Tags — Open Graph, structured data dinamico `S`
19. [ ] Portfolio Dashboard — Pagina unificada para gestionar portfolio: About/Bio, Contact info, modo visual, orden de secciones `M`

---

## Phase 4: AI Assistant (v0.4.0)

20. [ ] Vercel AI SDK Integration — Streaming responses, conversation state `M`
21. [ ] Guided CV Interview — AI conversacional para recopilar info de CV `L`
22. [ ] AI Content Suggestions — Sugerencias para mejorar descripciones `M`
23. [ ] CV Document Generator — Export PDF con templates profesionales `M`

---

## Phase 5: Styles & Polish (v0.5.0+)

24. [ ] Pixelated Style Mode — Tercer modo visual con estetica pixel art (evaluar complejidad) `L`
25. [ ] Geographic Map Expansion — Mapa de Argentina/mundo con regiones clickeables `L`
26. [ ] Character Customization — Avatares personalizables con pixel art `M`
27. [ ] Achievement System — Badges y logros desbloqueables `M`
28. [ ] Social Share Cards — Imagenes dinamicas para compartir `M`

---

## Phase 6: Scale & Launch (v1.0.0)

29. [ ] Performance Optimization — Bundle size, lazy loading, caching `M`
30. [ ] Mobile Refinement — Timeline y skill tree responsive `M`
31. [ ] Onboarding Flow — Guia para nuevos usuarios `S`
32. [ ] Accessibility Audit — WCAG compliance, keyboard navigation `M`
33. [ ] Analytics Dashboard — Metricas de portfolio views `S`

---

## Size Legend

- `S` = Small (1-2 dias)
- `M` = Medium (3-5 dias)
- `L` = Large (1-2 semanas)

## Notes

- Phase 1 completada establece la infraestructura base
- Phase 2 completada - Timeline con Google Maps + Hexagonos
- Phase 3 en progreso - Skill Tree y Portfolio Template System completados
- Dos modos visuales: **Professional** (limpio, ATS-friendly) y **Gaming** (cyberpunk)
- Pixelated style postponed a v0.5.0+ para evaluar implementacion
- AI features vienen despues de tener contenido para mejorar
