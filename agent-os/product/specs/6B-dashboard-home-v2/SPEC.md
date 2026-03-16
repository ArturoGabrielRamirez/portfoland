# Spec 6B — Dashboard Home V2

**Phase:** 6 — UI Coherence
**Branch:** `feat/phase6-ui-coherence`
**Priority:** P1
**Estimated scope:** S (1–2 días)

---

## Problema

El dashboard home (`/dashboard`) tiene dos problemas de coherencia:

### 1. HexStatGrid duplica el CRT

El `HexStatGrid` muestra: XP, Level, Experiences, Achievements.
El CRT boot sequence ya muestra: XP, Level, Streak, Skills count, Achievements.

Son exactamente los mismos datos en dos lugares distintos de la misma pantalla — información que el usuario ya recibió hace 2 segundos en el boot.

**Archivo:** `features/tech/components/hex-stat-grid.tsx`
**Usado en:** `app/[locale]/(dashboard)/dashboard/DashboardView.tsx`

### 2. QuickActionsBar tiene 4 botones placeholder

La `QuickActionsBar` tiene 4 hexágonos de "quick access" que no tienen acciones reales implementadas. Placeholder silencioso.

**Archivo:** `features/tech/components/quick-actions-bar.tsx`
**Usado en:** `app/[locale]/(dashboard)/dashboard/DashboardView.tsx`

### 3. WelcomeCard quick actions — 2 sin destino real

- "Level Up" → no tiene href ni acción concreta
- "New Goal" → no tiene href ni acción concreta

**Archivo:** `features/tech/components/welcome-card.tsx`

---

## Solución

### HexStatGrid → reemplazar con métricas no-redundantes

Mostrar datos que el CRT NO muestra:

| Posición | Antes (redundante) | Después (nuevo) |
|----------|-------------------|-----------------|
| Top-left | Total XP | Portfolio Views (total vistas del portfolio) |
| Top-right | Level | Leaderboard Rank (#N de M usuarios) |
| Bottom-left | Experiences count | Active Quests (quests activas esta semana) |
| Bottom-right | Achievements | CV Generated (número de CVs creados) |

Si un dato no está disponible (ej: portfolio sin visitas), mostrar `—` o `0`.

**Datos a agregar a `getDashboardPageData`:**
- `portfolioViews`: total desde `PortfolioAnalytics`
- `leaderboardRank`: posición del usuario en el ranking de XP
- `activeQuestsCount`: quests activas
- `cvCount`: número de CVDocuments del usuario

### QuickActionsBar → 4 acciones reales

Reemplazar placeholders con links funcionales:

| Hexágono | Label | Acción | Color |
|---------|-------|--------|-------|
| 1 | Add Skill | `/dashboard/skills` (+ abrir modal) | cyan |
| 2 | Add XP | `/dashboard/timeline` | yellow |
| 3 | Generate CV | `/dashboard/cv` | magenta |
| 4 | View Portfolio | `https://[username].[domain]` (nueva pestaña) | green |

Si el usuario no tiene username, el botón "View Portfolio" muestra tooltip "Set your username first" y está deshabilitado.

### WelcomeCard quick actions — reemplazar 2

| Antes | Después |
|-------|---------|
| "Level Up" (sin acción) | "Skills" → `/dashboard/skills` |
| "New Goal" (sin acción) | "CV" → `/dashboard/cv` |

Mantener:
- "Timeline" → `/dashboard/timeline` ✅
- "Add Experience" → `/dashboard/timeline` ✅ (o modal directo si es posible)

---

## Archivos Afectados

### Modificar
- `features/tech/components/hex-stat-grid.tsx` — nuevas props para las 4 métricas
- `features/tech/components/quick-actions-bar.tsx` — 4 botones con hrefs reales
- `features/tech/components/welcome-card.tsx` — reemplazar "Level Up" y "New Goal"
- `app/[locale]/(dashboard)/dashboard/DashboardView.tsx` — pasar nuevas props
- `app/[locale]/(dashboard)/dashboard/page.tsx` — fetch nuevas métricas
- `features/dashboard/data/getDashboardPageData.data.ts` — añadir portfolioViews, leaderboardRank, cvCount, activeQuestsCount

---

## Criterios de Aceptación

- [ ] HexStatGrid muestra 4 métricas que el CRT boot NO muestra (portfolio views, rank, quests, cv count)
- [ ] QuickActionsBar tiene 4 botones con navegación real (no placeholders)
- [ ] "View Portfolio" deshabilitado si no hay username, con tooltip explicativo
- [ ] WelcomeCard: "Level Up" → "Skills" link, "New Goal" → "CV" link
- [ ] Ningún dato nuevo carga lento (usa `getDashboardPageData` con la misma query cacheada)
- [ ] Tech Mode y Classic Mode funcionan correctamente

---

## Notas de Implementación

- `portfolioViews`: usar `prisma.portfolioAnalytics.count({ where: { userId } })` o el campo `totalViews` si existe
- `leaderboardRank`: se puede calcular con `prisma.user.count({ where: { totalXP: { gt: user.totalXP } } }) + 1`
- `cvCount`: `prisma.cVDocument.count({ where: { userId } })`
- `activeQuestsCount`: ya existe `ActiveMissionsPanel` que lo tiene — extraer el count
- Todas estas queries son simples `count()` — fast y no bloquean el render
