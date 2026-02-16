# Plan de Delegación: Portfolio Edit Page

## Estado Actual
- **SEO Metadata**: YA IMPLEMENTADO en `app/[locale]/[username]/page.tsx` (generateMetadata lines 39-53)
- **Pendiente**: Página de edición de portfolio en el dashboard

## Tarea: Dashboard Portfolio Edit Page

### Qué es
Una página en `/dashboard/portfolio` donde el usuario autenticado puede editar su perfil público (nombre, bio, imagen, modo portfolio). Es la pieza que falta para que el dashboard sea funcional.

### Archivos a CREAR

#### 1. `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx`
Server component. Seguir patrón exacto de `dashboard/skills/page.tsx`:
- Auth check con `auth.api.getSession({ headers: await headers() })`
- Redirect a `/login` si no hay session
- Fetch user data con prisma (name, username, email, image, bio, portfolioMode, locale)
- Pasar data a `<DashboardPortfolioView />`
- Export `metadata` estático

#### 2. `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`
Client component ('use client'). UI para editar perfil:
- Formulario con campos: name, bio, image (URL por ahora), portfolioMode toggle
- Usar patrón `useTransition` + server action + `toast` (sonner)
- Importar `DashboardNav` de `@/features/gaming`
- Importar `PortfolioModeToggle` de `@/features/portfolio`
- Link para ver portfolio público: `/{locale}/{username}`
- Estilo cyberpunk consistente con otras páginas dashboard

#### 3. `features/portfolio/actions/updateProfile.ts`
Server action siguiendo patrón existente:
```ts
'use server';
import { actionWrapper } from '@/lib/actionWrapper';
// Schema validation con Yup
// Update user en prisma
// revalidatePath
```

#### 4. `features/portfolio/schemas/portfolio.schema.ts` (EDITAR, no crear)
Agregar schema `updateProfileSchema`:
```ts
export const updateProfileSchema = yup.object({
  name: yup.string().required().min(2).max(50),
  bio: yup.string().nullable().max(500),
  image: yup.string().nullable().url(),
});
```

#### 5. `features/portfolio/data/updateProfile.data.ts`
Data layer para update:
```ts
export async function updateUserProfile(userId: string, data: { name: string; bio?: string | null; image?: string | null }) {
  return prisma.user.update({ where: { id: userId }, data });
}
```

#### 6. `features/portfolio/services/portfolio.service.ts` (EDITAR)
Agregar función de servicio `updateProfile` que llame a data layer.

### Archivos de REFERENCIA (leer estos para copiar patrones)
- `app/[locale]/(dashboard)/dashboard/skills/page.tsx` - Patrón de page server component
- `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` - Patrón de view client component
- `features/portfolio/actions/togglePortfolioMode.ts` - Patrón de server action
- `features/portfolio/schemas/portfolio.schema.ts` - Schemas existentes
- `features/portfolio/services/portfolio.service.ts` - Service layer existente
- `features/portfolio/types/portfolio.ts` - Types existentes

### Patrones CRÍTICOS a seguir
1. **Action wrapper**: `actionWrapper` con Yup schema validation
2. **Client state**: `useTransition` + `startTransition(() => action())` + `toast.success/error`
3. **Imports**: `cn()` from `@/lib/utils`, `auth` from `@/lib/auth`
4. **Types**: Definir props interfaces en el mismo archivo de component (para views) o en `types/`
5. **Three-layer**: action → service → data
6. **i18n**: `useTranslations` en client, `getTranslations` en server (opcional si no hay keys aún)

### NO hacer
- No agregar tests (pendiente para después)
- No agregar i18n keys nuevas (usar strings hardcoded por ahora)
- No over-engineer (sin image upload, solo URL field por ahora)
- No tocar archivos fuera del scope

---

## Prompt para Sonnet

```
Lee el archivo `agent-os/DELEGATION-PLAN.md` para el plan completo de implementación.

TAREA: Implementar la página de edición de portfolio en el dashboard.

ANTES DE ESCRIBIR CÓDIGO, lee estos archivos de referencia para copiar los patrones exactos:
1. `app/[locale]/(dashboard)/dashboard/skills/page.tsx`
2. `app/[locale]/(dashboard)/dashboard/skills/DashboardSkillsView.tsx` (primeras 100 líneas)
3. `features/portfolio/actions/togglePortfolioMode.ts`
4. `features/portfolio/schemas/portfolio.schema.ts`
5. `features/portfolio/services/portfolio.service.ts`
6. `features/portfolio/types/portfolio.ts`
7. `features/portfolio/data/updatePortfolioMode.data.ts`

ARCHIVOS A CREAR/EDITAR (en este orden):
1. CREAR `features/portfolio/data/updateProfile.data.ts` - prisma update user
2. EDITAR `features/portfolio/schemas/portfolio.schema.ts` - agregar updateProfileSchema
3. EDITAR `features/portfolio/services/portfolio.service.ts` - agregar updateProfile service
4. CREAR `features/portfolio/actions/updateProfile.ts` - server action con actionWrapper
5. CREAR `app/[locale]/(dashboard)/dashboard/portfolio/page.tsx` - server page
6. CREAR `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx` - client view

Sigue la arquitectura three-layer (action → service → data) y los patrones exactos del codebase.
El formulario debe tener: name, bio (textarea), image URL, y el PortfolioModeToggle existente.
Usa el estilo cyberpunk consistente con las otras páginas del dashboard.
```
