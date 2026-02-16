# Sonnet: Cyberpunk UI Improvements V2

> Documento de tareas para unificar el estilo cyberpunk en todos los componentes.
> Seguir estrictamente las REGLAS GLOBALES y el design-system.md como referencia.
> IMPORTANTE: NO modificar archivos en `features/portfolio/components/professional/` — esos usan la paleta profesional (blanca) intencionalmente.

---

## REGLAS GLOBALES (leer primero, aplicar siempre)

```
1. TODO es font-mono. Sin excepciones en rutas de dashboard.
2. rounded-sm MAXIMO para contenedores, botones, inputs, cards, modales, dropdowns.
3. Solo rounded-full para: dots indicadores (w-1.5 h-1.5), spinners (animate-spin), progress bar tracks internos.
4. NUNCA rounded-xl, rounded-lg, rounded-md en ningún componente de dashboard/gaming.
5. Background: #0A0E1A (dark only). Cards: bg-[hsl(200,30%,8%)]
6. Borders: border-[hsl(174,100%,50%,0.15)] sutil, /0.3 activo
7. Text principal: text-foreground. Secundario: text-muted-foreground
8. Inputs: usar GamingInput o copiar su estilo: rounded-sm border-[#1E293B] bg-[#0D1421]
9. Colores semánticos:
   - Cyan  hsl(174,100%,50%) → acciones, links, primary
   - Magenta hsl(330,100%,65%) → logros, core skills
   - Green  hsl(150,100%,45%) → success, online, backend
   - Yellow hsl(60,100%,50%)  → XP, nivel, tools
   - Purple hsl(280,100%,70%) → frontend, special
10. NO usar: bg-white, text-gray-900, border-gray-200, bg-slate-800 (excepto en portfolio professional)
```

---

## TAREA 1: TimelineFilter — Quitar rounded-full de botones

**Archivo:** `features/timeline/components/TimelineFilter.tsx`

### Problema
Los filter pills usan `rounded-full` (líneas 55, 73, 86). Deben ser `rounded-sm` para estilo cyberpunk.

### Cambios exactos

**Línea 55:** Cambiar `rounded-full` → `rounded-sm`
```tsx
// ANTES
'relative px-4 py-2 rounded-full text-sm font-medium font-mono',
// DESPUES
'relative px-4 py-2 rounded-sm text-sm font-medium font-mono',
```

**Línea 73:** Cambiar `rounded-full` → `rounded-sm`
```tsx
// ANTES
'px-1.5 py-0.5 text-xs rounded-full font-mono',
// DESPUES
'px-1.5 py-0.5 text-xs rounded-sm font-mono',
```

**Línea 86:** Cambiar `rounded-full` → `rounded-sm`
```tsx
// ANTES
className="absolute inset-0 rounded-full"
// DESPUES
className="absolute inset-0 rounded-sm"
```

---

## TAREA 2: ExperienceForm — Unificar inputs y selectores

**Archivo:** `features/timeline/components/ExperienceForm.tsx`

### Cambios

**Línea 158:** `rounded-lg` → `rounded-sm`
```tsx
// ANTES
'flex items-center gap-2 p-3 rounded-lg border transition-all',
// DESPUES
'flex items-center gap-2 p-3 rounded-sm border transition-all',
```

**Línea 303:** `rounded-md` → `rounded-sm`
```tsx
// ANTES
className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white ...
// DESPUES
className="w-full px-3 py-2 bg-[#0D1421] border border-[#1E293B] rounded-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#0A0E1A]"
```

Buscar otros inputs con `bg-slate-900 border border-slate-700 rounded-md` y reemplazar por el patrón cyberpunk de arriba.

---

## TAREA 3: ExperienceCard — Pills a rounded-sm

**Archivo:** `features/timeline/components/ExperienceCard.tsx`

### Cambios

**Línea 86:** `rounded-full` → `rounded-sm`
```tsx
'flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium',
```

**Línea 156:** `rounded-full` → `rounded-sm`
```tsx
className="px-2 py-0.5 text-xs rounded-sm bg-[hsl(174,100%,50%,0.1)] text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%,0.2)]"
```

**Línea 162:** `rounded-full` → `rounded-sm`
```tsx
<span className="px-2 py-0.5 text-xs rounded-sm bg-[hsl(200,30%,8%)] text-muted-foreground">
```

---

## TAREA 4: MobileTimelineEvent — Iconos y badges

**Archivo:** `features/timeline/components/MobileTimelineEvent.tsx`

### Cambios

**Línea 79:** `rounded-full` → `clip-hexagon` (o `rounded-sm`)
```tsx
// Si quieres hexagonal (recomendado):
className="relative flex items-center justify-center w-10 h-10 clip-hexagon border-2"
// O si prefieres mantener como cuadrado:
className="relative flex items-center justify-center w-10 h-10 rounded-sm border-2"
```

**Línea 112:** `rounded-full` → `rounded-sm`
```tsx
className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium mb-2"
```

---

## TAREA 5: LocationPicker — Eliminar rounded-lg

**Archivo:** `features/timeline/components/LocationPicker.tsx`

### Cambios (buscar y reemplazar todas las instancias)

**Línea 134:** `rounded-lg` → `rounded-sm`
**Línea 142:** `rounded-lg` → `rounded-sm`
**Línea 180:** `rounded-lg` → `rounded-sm`
**Línea 217:** `rounded-lg` → `rounded-sm`

También cambiar `bg-slate-800` → `bg-[hsl(200,30%,8%)]` y `border-slate-700` → `border-[#1E293B]` donde aplique.

---

## TAREA 6: TimelineStats — Unificar

**Archivo:** `features/timeline/components/TimelineStats.tsx`

**Línea 35:** `rounded-lg` → `rounded-sm`
**Línea 51:** `rounded-full` → `clip-hexagon` (o `rounded-sm`)

---

## TAREA 7: DeleteConfirmModal — Icono

**Archivo:** `features/timeline/components/DeleteConfirmModal.tsx`

**Línea 76:** `rounded-full` → `rounded-sm`

---

## TAREA 8: Skills Components — Batch fix rounded

Los siguientes archivos tienen `rounded-lg`, `rounded-md`, o `rounded-xl`. Hacer buscar/reemplazar en cada uno:

### 8.1 ZoomControls.tsx
**Archivo:** `features/skills/components/ZoomControls.tsx`
- Línea 54: `rounded-xl` → `rounded-sm`
- Línea 69: `rounded-lg` → `rounded-sm`
- Línea 83: `rounded-lg` → `rounded-sm`
- Línea 96: `rounded-lg` → `rounded-sm`
- Línea 115: `rounded-lg` → `rounded-sm`

### 8.2 SkillDetailCard.tsx
**Archivo:** `features/skills/components/SkillDetailCard.tsx`
- Línea 196: `rounded-lg` → `rounded-sm`
- Línea 266: `rounded-lg` → `rounded-sm`
- Línea 278: `rounded-lg` → `rounded-sm`
- Línea 287: `rounded-lg` → `rounded-sm`
- Línea 319: `rounded-lg` → `rounded-sm`
- Línea 326: `rounded-lg` → `rounded-sm`

### 8.3 ManualSkillForm.tsx
**Archivo:** `features/skills/components/ManualSkillForm.tsx`
- Línea 139: `rounded-lg` → `rounded-sm`
- Línea 222: `rounded-lg` → `rounded-sm`

### 8.4 ManualSkillModal.tsx
**Archivo:** `features/skills/components/ManualSkillModal.tsx`
- Línea 183: `rounded-lg` → `rounded-sm`

### 8.5 CategorySelect.tsx
**Archivo:** `features/skills/components/CategorySelect.tsx`
- Línea 87: `rounded-lg` → `rounded-sm`
- Línea 126: `rounded-lg` → `rounded-sm`

### 8.6 CreateCategoryModal.tsx
**Archivo:** `features/skills/components/CreateCategoryModal.tsx`
- Línea 177: `rounded-lg` → `rounded-sm`
- Línea 188: `rounded-lg` → `rounded-sm`
- Línea 224: `rounded-lg` → `rounded-sm`
- Línea 267: `rounded-lg` → `rounded-sm`
- Línea 269: `rounded-lg` → `rounded-sm`

### 8.7 MobileSkillItem.tsx
**Archivo:** `features/skills/components/MobileSkillItem.tsx`
- Línea 66: `rounded-lg` → `rounded-sm`
- Línea 83: `rounded-lg` → `rounded-sm`
- Línea 199: `rounded-lg` → `rounded-sm`

### 8.8 MobileSkillList.tsx
**Archivo:** `features/skills/components/MobileSkillList.tsx`
- Línea 110: `rounded-lg` → `rounded-sm`
- Línea 119: `rounded-lg` → `rounded-sm`
- Línea 189: `rounded-lg` → `rounded-sm`
- Línea 295: `rounded-lg` → `rounded-sm`

### 8.9 XPSourceList.tsx
**Archivo:** `features/skills/components/XPSourceList.tsx`
- Línea 99: `rounded-lg` → `rounded-sm`
- Línea 107: `rounded-lg` → `rounded-sm`

### 8.10 SkillTagInput.tsx (Timeline)
**Archivo:** `features/timeline/components/SkillTagInput.tsx`
- Línea 91: `rounded-full` → `rounded-sm`

---

## TAREA 9: Projects Components — Batch fix rounded

### 9.1 ProjectForm.tsx
**Archivo:** `features/projects/components/ProjectForm.tsx`
- Línea 248: `rounded-md` → `rounded-sm`, cambiar `bg-slate-900 border-slate-700` → `bg-[#0D1421] border-[#1E293B]`
- Línea 342: `rounded-md` → `rounded-sm`, mismo cambio de colores

### 9.2 ImageUpload.tsx
**Archivo:** `features/projects/components/ImageUpload.tsx`
- Línea 102: `rounded-lg` → `rounded-sm`, cambiar `border-slate-700 bg-slate-900` → `border-[#1E293B] bg-[#0D1421]`
- Línea 116: `rounded-full` → `rounded-sm` (el botón de eliminar imagen)
- Línea 140: `rounded-lg` → `rounded-sm`

### 9.3 LinksFieldArray.tsx
**Archivo:** `features/projects/components/LinksFieldArray.tsx`
- Línea 65: `rounded-md` → `rounded-sm`, cambiar `border-slate-700 bg-slate-900` → `border-[#1E293B] bg-[#0D1421]`

---

## TAREA 10: ProjectDetailModal — Gaming mode verification

**Archivo:** `features/projects/components/ProjectDetailModal.tsx`

NOTA IMPORTANTE: Este archivo tiene DOS modales:
- `ProfessionalModal` (líneas ~61-172) — usa `text-gray-900`, `bg-white`, etc. **NO TOCAR** — es la versión profesional.
- `GamingModal` (líneas ~178+) — verificar que use estilos cyberpunk correctos.

Solo verificar el `GamingModal`:
- Línea 243: `rounded-lg` → `rounded-sm` (el botón de cerrar del gaming modal)

---

## TAREA 11: GalaxyCanvas — Unificar (baja prioridad)

**Archivo:** `features/skills/components/GalaxyCanvas.tsx`

Este componente puede estar en desuso (el canvas principal es CRTSkillCanvas). Si está activo:
- Líneas 384, 388: `rounded-lg` → `rounded-sm`
- Línea 399: `rounded-lg` → `rounded-sm`
- Línea 419: `rounded-xl` → `rounded-sm`
- Línea 434: `rounded-lg` → `rounded-sm`

---

## RESUMEN DE PATRON DE BUSQUEDA

Para hacer esto eficientemente, buscar y reemplazar en cada archivo:

```
rounded-xl  →  rounded-sm
rounded-lg  →  rounded-sm
rounded-md  →  rounded-sm
```

EXCEPCIONES (NO cambiar):
- `rounded-full` en dots indicadores tiny (w-1.5, w-2, h-1.5, h-2) — son decorativos
- `rounded-full` en spinners `animate-spin`
- `rounded-full` en progress bar inner tracks (h-1.5 con overflow-hidden)
- Cualquier cosa en `features/portfolio/components/professional/`
- El componente `GamingAvatar` y `GamingBadge` en `features/gaming/index.tsx` — usan `rounded-full` intencionalmente para variante circular
- `rounded-full` en la clase del Spinner component

Luego buscar y reemplazar colores slate:
```
bg-slate-900  →  bg-[#0D1421]
bg-slate-800  →  bg-[hsl(200,30%,8%)]
border-slate-700  →  border-[#1E293B]
```

NO tocar: `features/portfolio/components/professional/` ni `features/portfolio/__tests__/`

---

## CHECKLIST DE VERIFICACION

Después de implementar, verificar build con `npx next build`:
- [ ] No errores de TypeScript
- [ ] No imports sin usar

Verificar visualmente cada ruta:
- [ ] `/dashboard` — Cards y stats con sharp edges
- [ ] `/dashboard/timeline` — Filtros sin rounded-full, cards sharp, map OK
- [ ] `/dashboard/skills` — Canvas OK, modals con rounded-sm, zoom controls sharp
- [ ] `/dashboard/projects` — Form inputs con rounded-sm, cards sharp
- [ ] Modals (add skill, add experience, delete confirm) — todos con rounded-sm

---

## ARCHIVOS QUE NO SE TOCAN

```
features/portfolio/components/professional/*  (paleta blanca intencional)
features/portfolio/__tests__/*                 (tests existentes)
features/gaming/index.tsx                      (ya correcto)
features/gaming/components/welcome-card.tsx    (ya correcto)
features/gaming/components/dashboard-nav.tsx   (ya correcto)
features/dashboard/components/UserMenu.tsx     (ya correcto)
features/skills/components/CRTSkillCanvas.tsx  (ya correcto — hex grid fixed)
app/[locale]/(auth)/login/page.tsx             (ya correcto)
app/[locale]/(protected)/dashboard/page.tsx    (ya correcto)
```
