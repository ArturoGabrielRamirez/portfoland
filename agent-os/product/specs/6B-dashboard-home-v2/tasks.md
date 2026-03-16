# Tasks — 6B: Dashboard Home V2

## Setup
- [ ] 6B-0: Leer SPEC.md completo. Leer archivos: `features/tech/components/hex-stat-grid.tsx`, `features/tech/components/quick-actions-bar.tsx`, `features/tech/components/welcome-card.tsx`, `app/[locale]/(dashboard)/dashboard/DashboardView.tsx`, `app/[locale]/(dashboard)/dashboard/page.tsx`, `features/dashboard/data/getDashboardPageData.data.ts`

## Fase 1 — Nuevas métricas para HexStatGrid
- [ ] 6B-1: Actualizar `getDashboardPageData.data.ts` — añadir 4 nuevas queries en el `Promise.all`:
  - `portfolioViews`: count de registros en `PortfolioAnalytics` del usuario
  - `leaderboardRank`: count de users con totalXP mayor al usuario + 1
  - `cvCount`: count de CVDocuments del usuario
  - `activeQuestsCount`: count de quests activas (si tiene el modelo — si no, omitir y mostrar `—`)
- [ ] 6B-2: Actualizar props de `HexStatGrid` — cambiar las 4 métricas actuales (XP, Level, Experiences, Achievements) por (portfolioViews, rank, cvCount, activeQuestsCount). Actualizar tipos y labels.
- [ ] 6B-3: Actualizar `DashboardView.tsx` — pasar las nuevas props a `HexStatGrid`
- [ ] 6B-4: Actualizar `page.tsx` — pasar los nuevos datos desde `getDashboardPageData` a `DashboardView`

## Fase 2 — QuickActionsBar funcional
- [ ] 6B-5: Leer `quick-actions-bar.tsx` completo para entender la estructura actual
- [ ] 6B-6: Reemplazar los 4 placeholder actions con:
  - "Add Skill" → href `/dashboard/skills` + símbolo cyan
  - "Add XP" (o "Timeline") → href `/dashboard/timeline` + símbolo yellow
  - "Generate CV" → href `/dashboard/cv` + símbolo magenta
  - "View Portfolio" → `href="https://{username}.portfoland.com" target="_blank"` + símbolo green; deshabilitado si no hay username con tooltip "Set username first"
- [ ] 6B-7: `DashboardView.tsx` — pasar `username` como prop a `QuickActionsBar` para el condicional del "View Portfolio" button

## Fase 3 — WelcomeCard quick actions
- [ ] 6B-8: En `welcome-card.tsx`, identificar dónde están definidos los `defaultQuickActions`
- [ ] 6B-9: Reemplazar:
  - "Level Up" → `{ label: "Skills", icon: GitBranch, href: "/dashboard/skills", color: "hsl(330,100%,65%)" }`
  - "New Goal" → `{ label: "CV", icon: FileText, href: "/dashboard/cv", color: "hsl(150,100%,45%)" }`
  - Mantener "Timeline" y "Add Experience" sin cambios

## Fase 4 — Verificación
- [ ] 6B-10: Verificar que HexStatGrid muestra las 4 nuevas métricas correctamente (incluyendo `—` si alguna es 0 o no disponible)
- [ ] 6B-11: Verificar que los 4 botones de QuickActionsBar navegan a las rutas correctas
- [ ] 6B-12: Verificar que "View Portfolio" está deshabilitado si el usuario no tiene username
- [ ] 6B-13: Verificar que WelcomeCard muestra Skills y CV en lugar de Level Up y New Goal
- [ ] 6B-14: `npx tsc --noEmit` — sin errores nuevos en archivos modificados
