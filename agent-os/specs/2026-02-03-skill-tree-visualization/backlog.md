# Skill Tree - Backlog de Mejoras

Issues y mejoras identificadas durante la implementación que se postponen para fases futuras.

---

## UX/UI Improvements

### 1. Conexiones Inteligentes entre Skills (AI Phase)
**Prioridad:** Media
**Fase:** AI Features / UX Improvements

**Problema actual:**
- En modo web, los nodos de skills no tienen conexiones visuales entre ellos
- El componente `SkillConnections` existe pero `connections` está vacío (placeholder)
- Ubicación: `features/skills/components/GalaxyCanvas.tsx` líneas 253-258

**Solución propuesta:**
- Implementar conexiones inteligentes usando AI para sugerir relaciones:
  - Progresiones comunes (JavaScript → TypeScript → React → Next.js)
  - Skills que aparecen juntos en experiencias del usuario
  - Skills complementarios basados en patrones de la industria
- Tipos de conexión:
  - `direct`: Skills que el usuario ya domina en secuencia
  - `suggested`: Skills recomendados como siguiente paso

**Archivos a modificar:**
- `features/skills/components/GalaxyCanvas.tsx` - Generar connections array
- `features/skills/components/SkillConnections.tsx` - Ya implementado, solo necesita data
- `features/skills/constants/suggestions.ts` - Ya tiene `SKILL_PROGRESSIONS` base

---

### 2. Navegación Timeline en Modo Web
**Prioridad:** Media
**Fase:** UX Improvements

**Problema actual:**
- En modo web de Timeline, se pierde el patrón de línea temporal
- El mapa está "suelto" sin contexto de secuencia
- En móvil se mantiene bien el timeline vertical

**Solución propuesta (opciones):**
1. **Mini-timeline lateral:** Panel colapsable que muestra la línea de tiempo real
2. **Navegación prev/next en tarjetas:** Botones para ir a experiencia anterior/siguiente
3. **Breadcrumb temporal:** Mostrar posición en el tiempo (2020 → 2021 → 2022 → ...)
4. **Vista híbrida:** Combinar mapa con timeline superpuesto

**Archivos a modificar:**
- `features/timeline/components/` - Componentes de timeline web
- Posiblemente crear nuevo componente `TimelineNavigator.tsx`

---

## Technical Debt

### 3. Tests de Integración E2E
**Prioridad:** Baja
**Fase:** Testing Phase

**Pendiente:**
- Tests E2E con Playwright para flujo completo:
  - Crear skill manual → ver en galaxy
  - Crear experiencia con skills → ver sync en skill tree
  - Editar/eliminar skills
- El archivo `skill-integration.test.ts` tiene tests unitarios, faltan E2E

---

## Performance

### 4. Virtualización para Muchos Skills
**Prioridad:** Baja
**Fase:** Performance Optimization

**Problema potencial:**
- Con 50+ skills, el rendering puede volverse lento
- El canvas re-renderiza todo en cada zoom/pan

**Solución propuesta:**
- Implementar virtualización (solo renderizar nodos visibles)
- Usar `react-window` o similar para listas largas en mobile
- Optimizar re-renders con mejor memoización

---

## Fecha de documentación
- **Creado:** 2026-02-04
- **Última actualización:** 2026-02-04
- **Relacionado con:** Spec `2026-02-03-skill-tree-visualization`
