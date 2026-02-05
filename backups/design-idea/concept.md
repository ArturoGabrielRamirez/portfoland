Thought for 1sCreated MiCV Page
Completed all tasksHe creado todo el sistema de diseno de **Portfoland** con las siguientes paginas:

**Paginas creadas:**

- `/` - Landing Page con hero, features, pasos y CTA
- `/login` - Login/Registro con selector de avatar/clase gaming
- `/dashboard` - Dashboard principal con XP, logros, acciones rapidas
- `/dashboard/timeline` - Timeline interactivo tipo RPG con experiencias
- `/dashboard/skills` - Arbol de habilidades visual con nodos y conexiones
- `/dashboard/logros` - Galeria de achievements con filtros
- `/dashboard/mi-cv` - Generador de CV con asistente IA
- `/dashboard/settings` - Configuracion de perfil
- `/portfolio/[username]` - Portfolio publico gamificado


**Design System incluye:**

- Paleta gaming: Cyan (`#00d4ff`), Magenta (`#e930ff`), Verde, Amarillo, Purpura
- Componentes reutilizables: StatBox, XPBar, LevelBadge, GamingBadge, SkillNode, TimelineEvent, CategoryPill, NavItem, CharacterAvatar
- Efectos glow, HUD frames, achievement badges, progress bars estilo gaming
- Tipografia: Space Grotesk (headings) + Inter (body)


---

## Prompt para Claude + Pencil

Aqui tienes el prompt para continuar en Pencil:

---

**PORTFOLAND - Sistema de Portafolio Gamificado**

**Concepto:** Plataforma que transforma CVs tradicionales en experiencias gamificadas tipo RPG. Los usuarios tienen un "personaje" profesional con stats (XP, nivel), un arbol de habilidades visual, timeline de experiencias como "quest log", y logros desbloqueables.

**Modos de visualizacion:**

1. **Modo Profesional** - CV clasico asistido por IA, optimizado para ATS
2. **Modo Timeline Gaming** - Experiencia interactiva tipo juego para recruiters
3. **Modo Portfolio** - Puede ser profesional o gamer segun preferencia del usuario


**Design System:**

- **Colores primarios:** Cyan `#00d4ff` (principal), Magenta `#e930ff` (secundario)
- **Colores de soporte:** Verde `#3fb950` (success/backend), Amarillo `#f0b429` (XP/warning), Purpura `#a855f7` (accent)
- **Fondo:** Dark theme `#0a0e14` base, `#0d1117` cards
- **Bordes:** `#21262d` normal, `#30363d` hover
- **Tipografia:** Space Grotesk (headings display), Inter (body)


**Componentes UI clave:**

- StatBox: Cajas con valor grande + label, borde coloreado con glow
- LevelBadge: Hexagono/circulo con nivel del usuario
- XPBar: Barra de progreso amarilla brillante
- SkillNode: Nodos circulares conectados por lineas (arbol de habilidades)
- TimelineEvent: Cards verticales con indicador de tipo (trabajo/educacion/proyecto)
- AchievementBadge: Cards con icono, nombre, XP reward, estado locked/unlocked
- GamingCard: Fondo con gradiente sutil, borde, backdrop blur


**Paginas principales:**

1. Landing - Hero con CTA "Comenzar Aventura", stats sociales, features con iconos
2. Login - Split screen: izq features, der formulario con selector de avatar/clase
3. Dashboard - Sidebar nav, stats HUD arriba, acciones rapidas, logros recientes, actividad
4. Timeline - Vista vertical de experiencias con filtros por tipo, XP por item
5. Skill Tree - Visualizacion en arbol/grafo de habilidades con nodos conectados
6. Portfolio Publico - Perfil tipo gaming con stats, skills, proyectos, timeline destacado
7. Settings - Formulario de perfil, URL personalizada portfoland.com/username


**Interacciones importantes:**

- Nodos del skill tree brillan al hover, muestran tooltip con detalles
- Logros tienen animacion al desbloquearse
- Barras de XP se animan al cargar
- Cards tienen efecto glow sutil en hover
- Timeline items se expanden para mostrar detalles