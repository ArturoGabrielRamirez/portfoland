# Pending Cyberpunk Improvements

> Para Sonnet: usar `sonnet-improvements-v2.md` (unificar rounded-sm + colores)
> Para Opus: implementar Sidebar Timeline (ver plan abajo)

## Skills Canvas - Advanced Improvements

### 1. Sidebar Timeline for Navigation

**Requirement:** Add a sidebar next to the skill map for timeline navigation and organization

**Implementation notes:**
- Create a vertical timeline sidebar showing skill acquisition chronologically
- Should be collapsible/expandable
- Clicking timeline items should highlight/focus corresponding nodes in the map
- Show skill progression over time with dates
- Could include filters by category or time period

**Files to modify:**
- `features/skills/components/SkillTreeView.tsx` - Add sidebar wrapper
- `features/skills/components/CRTSkillCanvas.tsx` - Adjust to work with sidebar
- Create new `features/skills/components/SkillTimeline.tsx` component

**Considerations:**
- Responsive design - sidebar should hide/collapse on mobile
- State management for selected skill in timeline
- Synchronization between map and timeline
- Animation when transitioning between timeline items

### 2. Fix Overlapping Hexagons Based on Zoom

**Requirement:** Dynamically adjust hexagon spacing based on map zoom level

**Current issue:**
- Hexagons overlap when zoomed out
- Fixed positioning doesn't adapt to zoom level

**Implementation approach:**
1. Calculate collision detection between hexagon nodes
2. Adjust `generateNodePositions()` to accept zoom parameter
3. Increase spacing between nodes based on zoom level:
   ```typescript
   const skillRadius = (60 + (skillCount > 3 ? 40 : 0)) / zoom;
   ```
4. Consider using force-directed layout algorithm for auto-spacing
5. Add smooth transitions when zoom changes spacing

**Libraries to consider:**
- d3-force for force-directed layout
- Custom collision detection algorithm

**Files to modify:**
- `features/skills/components/CRTSkillCanvas.tsx`
  - Update `generateNodePositions()` function
  - Add collision detection
  - Recalculate positions on zoom change

**Alternative approach:**
- Use CSS transform scale on individual nodes instead of repositioning
- Implement clustering when zoomed out (group nearby skills)

## Implementation Priority & Decision (Opus session 2026-02-12)

1. **Sonnet → sonnet-improvements-v2.md** — Unificar rounded-sm y colores slate en ~40 archivos (AHORA)
2. **Opus → Sidebar Timeline** — Arquitectura + lógica de sincronización map↔sidebar (SIGUIENTE)
3. **Overlapping Hexagons** — Postergar hasta tener datos reales con 15+ skills por categoría (FUTURO)

### Sidebar Timeline — Opus Implementation Plan

**Approach:** Opus designs architecture + sync logic, creates component skeleton with state management.

**Architecture:**
- New `features/skills/components/SkillTimeline.tsx` — Collapsible vertical timeline
- Modify `features/skills/components/SkillTreeView.tsx` — Flex wrapper: sidebar + canvas
- State: `selectedSkillId` shared between timeline and canvas via callback props
- Click timeline item → canvas pans/zooms to that node + highlight glow
- Click canvas node → timeline scrolls to that entry + highlight
- Responsive: sidebar hidden on mobile, toggle button to show as overlay

**Visual design:**
- Vertical line with hex nodes (same category colors as canvas)
- Each node: skill name, level badge, date added
- Collapsible by category groups
- Cyberpunk styling: border-[hsl(174,100%,50%,0.15)], bg-[hsl(200,30%,8%)], font-mono

### Overlapping Hexagons — Notes for Future

- Only relevant with 15+ skills per category
- Best approach: d3-force with collision radius based on zoom
- Alternative: simple min-distance check in generateNodePositions()
- Performance: debounce recalculation on zoom change
