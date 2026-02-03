# Product Roadmap

> **Design Reference:** Ver `agent-os/product/design-ideas.md` para conceptos visuales detallados.

---

## Phase 1: Foundation (v0.1.0) ✅ COMPLETED

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

## Phase 2: Interactive Timeline (v0.2.0) 🎯 NEXT

> **Concepto aprobado:** Google Maps + Hexágonos Gaming
> Ver detalles en `agent-os/product/design-ideas.md`

8. [ ] Timeline Map Component — Google Maps como fondo con blur/fade + overlay gaming `L`
9. [ ] Hexagon Node System — Nodos hexagonales conectados representando experiencias `M`
10. [ ] Experience Cards — Cards gaming para mostrar detalles de cada experiencia `M`
11. [ ] Timeline Entry Creator — Forms para agregar experiencias con ubicación, fechas, descripción `M`
12. [ ] Career Field Configuration — Selección de campo con naming gamificado (Freelance → Freelancero) `S`
13. [ ] Zoom Interactions — Animaciones zoom in/out al seleccionar experiencias en el mapa `M`

---

## Phase 3: Skill Tree & Portfolio (v0.3.0)

14. [ ] Skill Tree Visualization — Árbol de habilidades estilo videojuego con progresión y dependencias `L`
15. [ ] Portfolio Template System — Templates con modos Professional y Gaming `L`
16. [ ] Subdomain Routing — username.portfoland.com con Next.js middleware `M`
17. [ ] Project Showcase — Cards de proyectos con imágenes, tech stack, links `M`
18. [ ] Portfolio SEO & Meta Tags — Open Graph, structured data dinámico `S`

---

## Phase 4: AI Assistant (v0.4.0)

19. [ ] Vercel AI SDK Integration — Streaming responses, conversation state `M`
20. [ ] Guided CV Interview — AI conversacional para recopilar info de CV `L`
21. [ ] AI Content Suggestions — Sugerencias para mejorar descripciones `M`
22. [ ] CV Document Generator — Export PDF con templates profesionales `M`

---

## Phase 5: Styles & Polish (v0.5.0+)

23. [ ] Pixelated Style Mode — Tercer modo visual con estética pixel art (evaluar complejidad) `L`
24. [ ] Geographic Map Expansion — Mapa de Argentina/mundo con regiones clickeables `L`
25. [ ] Character Customization — Avatares personalizables con pixel art `M`
26. [ ] Achievement System — Badges y logros desbloqueables `M`
27. [ ] Social Share Cards — Imágenes dinámicas para compartir `M`

---

## Phase 6: Scale & Launch (v1.0.0)

28. [ ] Performance Optimization — Bundle size, lazy loading, caching `M`
29. [ ] Mobile Refinement — Timeline y skill tree responsive `M`
30. [ ] Onboarding Flow — Guía para nuevos usuarios `S`
31. [ ] Accessibility Audit — WCAG compliance, keyboard navigation `M`
32. [ ] Analytics Dashboard — Métricas de portfolio views `S`

---

## Size Legend

- `S` = Small (1-2 días)
- `M` = Medium (3-5 días)
- `L` = Large (1-2 semanas)

## Notes

- Phase 1 ✅ completada establece la infraestructura base
- Phase 2 🎯 es el próximo objetivo - Timeline con Google Maps + Hexágonos
- Dos modos visuales: **Professional** (limpio, ATS-friendly) y **Gaming** (cyberpunk)
- Pixelated style postponed a v0.5.0+ para evaluar implementación
- AI features vienen después de tener contenido para mejorar
