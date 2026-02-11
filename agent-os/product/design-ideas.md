# Design Ideas & Concepts

> Este archivo contiene ideas de diseño aprobadas para futuras implementaciones.
> Consultarlo al iniciar nuevos specs o features.

---

## Timeline Feature (v0.2.0) - Concepto Aprobado

**Fecha:** 2026-02-02
**Estado:** Aprobado para implementación

### Concepto: Google Maps + Hexágonos Gaming

La idea es combinar Google Maps real con la estética gaming cyberpunk existente.

#### Capas del diseño:

```
┌─────────────────────────────────────────────────┐
│  CAPA 3: HUD/Cards Gaming (foreground)          │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │   ⬡─────⬡─────⬡    ← Nodos hexagonales │    │
│  │   │     │     │      conectados         │    │
│  │   ⬡─────⬡─────⬡                        │    │
│  │                                         │    │
│  │   ┌─────────────┐                       │    │
│  │   │ Experiencia │  ← Cards con info     │    │
│  │   │ 2020-2022   │    estilo gaming      │    │
│  │   │ Buenos Aires│                       │    │
│  │   └─────────────┘                       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  CAPA 2: Overlay con efecto                     │
│  - Gradient oscuro desde bordes                 │
│  - Vignette effect                              │
│                                                 │
│  CAPA 1: Google Maps (background)               │
│  - Zoom dinámico (out → in al seleccionar)      │
│  - filter: blur(2-4px) + saturate(0.5)          │
│  - opacity: 0.3-0.5                             │
│  - Estilo oscuro/night mode del mapa            │
└─────────────────────────────────────────────────┘
```

#### Interacciones:

1. **Vista general:** Mapa con zoom out, hexágonos visibles como nodos
2. **Hover en hexágono:** Glow cyan/magenta según tipo de experiencia
3. **Click en hexágono:**
   - Zoom in animado hacia la ubicación
   - Card gaming aparece con detalles
   - Mapa se difumina más para dar foco a la card

#### Hexágonos - Usos:

- **Timeline:** Cada hexágono = una experiencia/trabajo
- **Navbar:** Posible uso como indicadores de sección
- **Conexiones:** Líneas entre hexágonos muestran progresión de carrera
- **Colores:**
  - Cyan: Trabajo/empleo
  - Magenta: Proyectos personales
  - Green: Logros/hitos
  - Yellow: Educación/certificaciones

#### Implementación técnica:

```typescript
// Dependencias necesarias
- @react-google-maps/api  // Google Maps para React
- framer-motion           // Animaciones de zoom/fade

// Componentes a crear
- features/timeline/components/TimelineMap.tsx
- features/timeline/components/HexagonNode.tsx
- features/timeline/components/ExperienceCard.tsx
- features/gaming/HexagonGrid.tsx  // Componente reutilizable
```

#### CSS Effects para el mapa:

```css
.map-background {
  filter: blur(3px) saturate(0.4) brightness(0.6);
  opacity: 0.4;
}

.map-background--focused {
  filter: blur(6px) saturate(0.2) brightness(0.4);
  opacity: 0.3;
  transition: all 0.5s ease-out;
}
```

#### Ventajas de este enfoque:

1. **Google Maps API** - Gratis hasta 28,000 cargas/mes
2. **CSS filters** - No requiere procesamiento de imágenes
3. **Hexágonos** - Estética gaming (Civilization, Stellaris, strategy games)
4. **Reutilizable** - El HexagonGrid puede usarse en otras partes
5. **Responsive** - Funciona en mobile con touch

---

## Estilo Pixelado (v0.5.0+) - Postponed

**Estado:** Idea para futuro, buscar implementación simple

- Posible uso de filtros CSS para efecto pixelado
- O librería de pixel art para avatares
- Evaluar complejidad vs beneficio cuando llegue el momento

---

## Sistema de Naming Gamificado

**Estado:** Definido, implementar en v0.2.0+

Cada profesión tiene dos versiones:

| Profesional | Gaming |
|-------------|--------|
| Freelance | Freelancero |
| Developer | Code Wizard |
| Designer | Pixel Artisan |
| Manager | Guild Leader |
| Consultant | Quest Advisor |

> Expandir esta lista al implementar el sistema de perfiles.

---

## Notas de Diseño

### Colores establecidos:
- Background: `#0A0E1A` (base), `#0D1421` (cards)
- Cyan: `#00D4FF` (primary)
- Magenta: `#D946EF` (secondary)
- Green: `#22C55E` (success)
- Yellow: `#EAB308` (XP/warning)
- Purple: `#A855F7` (achievements)

### Componentes gaming disponibles:
Ver `features/gaming/index.tsx`:
- GamingButton, GamingCard, GamingInput
- StatCard, XPBar, LevelBadge, HUDPanel
- GamingAvatar, GamingBadge, CharacterSelect
