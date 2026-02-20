# Two-Mode Strategy: Gaming vs Professional

**Fecha:** 2026-02-15
**Estado:** Propuesta alternativa - MÁS VIABLE que multi-career paths
**Prioridad:** Alta

---

## 🎯 La Propuesta

### Concepto:
En lugar de múltiples "Career Paths", tener **DOS modos complementarios:**

```
┌─────────────────────────────────────────────────┐
│  GAMING MODE 🎮                                 │
│  ────────────────                               │
│  • Developer-focused                            │
│  • GitHub integration                           │
│  • Tech skills (React, Python, etc.)           │
│  • XP from commits, repos, projects            │
│  • Cyberpunk aesthetic                         │
│  • Skill tree visualization                    │
│  • Gamification full                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  PROFESSIONAL MODE 💼                           │
│  ──────────────────                             │
│  • Generic/Flexible (cualquier profesión)      │
│  • No GitHub requirement                        │
│  • Custom skills (user-defined)                │
│  • Manual XP/validation                         │
│  • Clean, minimalist aesthetic                 │
│  • Traditional portfolio layout                │
│  • Optional gamification                       │
│  • CUSTOMIZABLE sections                       │
└─────────────────────────────────────────────────┘
```

---

## 🧠 Evolución del Concepto: Digital vs Presencial

**Fecha agregado:** 2026-02-17
**Idea:** Refinar el eje de separación entre los dos modos, de "developers vs todos" a **"profesiones digitales vs profesiones presenciales"**.

### El eje real de diferenciación

```
GAMING MODE 🎮 → Profesiones DIGITALES
─────────────────────────────────────────────────────
Trabajan en pantalla, crean assets digitales,
su portfolio SE PUEDE VER en internet.

  • Software Developers     → Validación: GitHub
  • UI/UX Designers         → Validación: Behance, Dribbble
  • Content Creators        → Validación: YouTube, Substack
  • Fotógrafos (digitales)  → Validación: Instagram, 500px
  • Motion Designers        → Validación: Behance, Vimeo
  • Data Scientists         → Validación: Kaggle, GitHub

PROFESSIONAL MODE 💼 → Profesiones PRESENCIALES / DE SERVICIO
─────────────────────────────────────────────────────
Trabajan con el cuerpo, el espacio o el cliente físico.
Su trabajo es difícil de "linkear" → necesitan showcase visual.

  • Peluqueros / Barberos   → Antes/después, Google Reviews
  • Manicuras               → Foto de trabajos, reseñas
  • Arquitectos             → Renders, fotos de obra
  • Chefs / Pasteleros      → Fotos de platos, eventos
  • Personal Trainers       → Transformaciones, testimonials
  • Psicólogos / Coaches    → Servicios, metodología, contacto
  • Maquilladores           → Portfolio fotográfico, editoriales
```

### Por qué este eje es más claro

| Criterio | "Developers vs todos" (original) | "Digital vs Presencial" (nuevo) |
|----------|-----------------------------------|---------------------------------|
| **Claridad al usuario** | 🟡 Un designer no sabe si es Gaming | 🟢 Muy claro dónde encaja |
| **Validación externa** | 🟡 Ambigua para no-devs | 🟢 APIs para digitales, manual para presenciales |
| **Gamification fit** | 🟡 Raro gamificar a un fotógrafo | 🟢 Natural para cualquier digital |
| **Marketing message** | 🟡 "Para devs" (limita) | 🟢 "Para los que trabajan en pantalla" |
| **Escalabilidad** | 🟡 Gaming = solo tech | 🟢 Gaming puede crecer a todo lo digital |

### Implicaciones en Gaming Mode

Si Gaming Mode = "Profesiones Digitales", entonces:

```typescript
// Gaming Mode se expande, pero mantiene la ESTÉTICA común
// Todos los digitales comparten: portafolio online, validación por plataforma, skill tree

GAMING_MODE_CAREERS = {
  developer:  { validation: 'github',   skills: 'tech stack' },
  designer:   { validation: 'behance',  skills: 'design tools' },
  creator:    { validation: 'youtube',  skills: 'content skills' },
  photo:      { validation: 'instagram', skills: 'photo genres' },
}
// Todos con cyberpunk aesthetic, XP system, skill tree
// Diferencia: qué plataforma se conecta y qué skills se sugieren
```

### Implicaciones en Professional Mode

Si Professional Mode = "Profesiones Presenciales", entonces:

```typescript
// Professional Mode se enfoca: no es "cualquier profesión" sino "trabajo físico/de servicio"
// La UX se diseña para showcase fotográfico, testimonials, servicios y reservas

PROFESSIONAL_MODE_FOCUS = {
  showcase:    'fotos de trabajos (antes/después, galería)',
  validation:  'Google Reviews, testimonials de clientes',
  cta:         'Reservar turno / Contactar / Ver precios',
  noNeed:      'GitHub, Behance, link a repos',
}
```

### ¿Qué pasa con los "borderline"? (fotógrafos, diseñadores freelance)

Un fotógrafo podría ir en cualquier modo:
- **Gaming** → Si es content creator digital (Instagram, YouTube)
- **Professional** → Si trabaja de forma presencial (bodas, eventos, estudios)

**Solución:** El onboarding hace 1 pregunta clave:
> "¿Tu trabajo vive principalmente online o trabajás de forma presencial con clientes?"
> → Online (Digital) → Gaming Mode
> → Presencial / Servicio → Professional Mode

---

## ✅ Por qué ESTO es mejor que Multi-Career Paths

### Ventajas

1. **Desarrollo más rápido** ⚡
   - No necesitás crear validadores para cada industry
   - No necesitás configs complejos por career path
   - Reutilizás mucho código existente

2. **Mantiene el diferenciador** 🎮
   - Gaming Mode = Tu nicho único (developers + cyberpunk)
   - Professional Mode = Accessibility amplia

3. **Menos complejo** 🧩
   - Solo 2 variantes vs 10+ career paths
   - Más fácil de mantener
   - Más fácil de testear

4. **Gradual enhancement** 📈
   - Empezás con Professional Mode básico
   - Agregás features específicas después si hace falta
   - Podés agregar "sub-modes" dentro de Professional después

5. **Marketing más claro** 📣
   - "Para developers: Gaming Mode con GitHub integration"
   - "Para otros profesionales: Professional Mode customizable"

---

## 🏗️ Cómo funcionaría cada modo

### 🎮 GAMING MODE (Developer-focused)

**Target:** Software developers, DevOps, Data scientists

**Features específicos:**
- ✅ GitHub OAuth required
- ✅ GitHub validation (commits, repos, languages)
- ✅ Tech skill tree predefinido (React, Python, Docker, etc.)
- ✅ XP automático desde GitHub activity
- ✅ Projects = repos con stack tech
- ✅ Cyberpunk theme (bg `#0A0E1A`, cyan, magenta)
- ✅ Hexagonal badges, CRT monitor, skill tree visual
- ✅ Gamification completo (levels, achievements, goals)

**Skills:**
```typescript
// Predefinidas, curadas para developers
const GAMING_SKILLS = [
  // Languages
  { name: 'JavaScript', category: 'Languages', icon: 'SiJavascript' },
  { name: 'Python', category: 'Languages', icon: 'SiPython' },
  { name: 'TypeScript', category: 'Languages', icon: 'SiTypescript' },

  // Frameworks
  { name: 'React', category: 'Frameworks', icon: 'SiReact' },
  { name: 'Next.js', category: 'Frameworks', icon: 'SiNextdotjs' },

  // Tools
  { name: 'Docker', category: 'Tools', icon: 'SiDocker' },
  { name: 'Git', category: 'Tools', icon: 'SiGit' },

  // + User puede agregar custom
]
```

**Portfolio sections:**
- Tech Stack (skill tree)
- Projects (code repos + live demos)
- GitHub Stats
- Timeline (experiences)
- Certifications

---

### 💼 PROFESSIONAL MODE (Generic/Customizable)

**Target:** Fotógrafos, diseñadores, estilistas, escritores, marketers, etc.

**Features específicos:**
- ✅ No GitHub required
- ✅ Custom skills (user define cualquier skill)
- ✅ Custom categories (user define categorías)
- ✅ Manual validation (upload certificados, links, testimonials)
- ✅ Flexible project types (gallery, case study, video, etc.)
- ✅ Clean white theme (bg white, text `gray-900`, accents `blue-600`)
- ✅ Traditional layout (no hexágonos, más cuadrado/grid)
- ✅ Gamification OPCIONAL (puede desactivarse)

**Skills:**
```typescript
// 100% custom, user define
const PROFESSIONAL_SKILLS = [
  // User puede crear:
  { name: 'Portrait Photography', category: 'Photography Genres' },
  { name: 'Adobe Lightroom', category: 'Tools' },
  { name: 'UI Design', category: 'Design' },
  { name: 'Copywriting', category: 'Content' },
  { name: 'SEO', category: 'Marketing' },
  // ... lo que sea
]
```

**Portfolio sections (CUSTOMIZABLE):**
- ☑️ About
- ☑️ Skills (optional layout: list, grid, tags)
- ☑️ Portfolio/Gallery (grid, masonry, carousel)
- ☑️ Services (para freelancers)
- ☑️ Timeline (experiences - optional)
- ☑️ Testimonials/Reviews
- ☑️ Contact
- ☑️ Social links
- ☑️ Resume download

**Customización:**
```typescript
// User puede toggle sections on/off
portfolioSettings: {
  showSkills: boolean
  showTimeline: boolean
  showServices: boolean
  showTestimonials: boolean
  showGallery: boolean
  galleryLayout: 'grid' | 'masonry' | 'carousel'
  colorScheme: 'default' | 'custom'
  customColors?: { primary, secondary, accent }
}
```

---

## 🗄️ Database Schema Changes

### Minimal changes necesarios:

```prisma
model User {
  // ... campos existentes
  portfolioMode  String  @default("professional")  // "gaming" | "professional"

  // Solo para Professional Mode
  portfolioSettings  Json?  // Configuración de secciones visibles
  customColors       Json?  // { primary, secondary, accent }

  // Opcional: Conectar otras redes sociales
  socialLinks  Json?  // { instagram, behance, linkedin, etc. }
}

model SkillCategory {
  // ... campos existentes
  isCustom   Boolean  @default(false)  // true si user lo creó (Professional Mode)
  isGlobal   Boolean  @default(false)  // true si es categoría predefinida (Gaming Mode)
}

model Skill {
  // ... campos existentes
  isCustom   Boolean  @default(false)  // true si user lo creó
  isGlobal   Boolean  @default(false)  // true si es skill predefinida (Gaming Mode)
}

model Project {
  // ... campos existentes
  projectType  String?  // "code" | "gallery" | "case-study" | "video" | "custom"
  gallery      Json?    // Para fotógrafos: [{ url, caption }]
  attachments  Json?    // PDFs, videos, etc.
}

// Nuevo modelo para testimonials (Professional Mode)
model Testimonial {
  id           String   @id @default(cuid()) @map("_id")
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  clientName   String
  clientTitle  String?
  clientImage  String?
  content      String
  rating       Int?     // 1-5 stars
  projectId    String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@map("testimonials")
}

// Nuevo modelo para services (Professional Mode)
model Service {
  id          String   @id @default(cuid()) @map("_id")
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String
  price       String?  // "From $500" | "Contact for quote"
  duration    String?  // "2-3 weeks"
  icon        String?
  order       Int?
  isActive    Boolean  @default(true)

  @@index([userId])
  @@map("services")
}
```

---

## 🎨 UI/UX Differences

### Dashboard

#### 🎮 Gaming Mode Dashboard
```
┌─────────────────────────────────────────┐
│  [WelcomeCard with XP bar]             │
│  [CRT Monitor - GitHub Activity]       │
├────────┬────────┬────────┬──────────────┤
│ 2,450  │   18   │   7    │   18/42      │
│ TOTAL  │ LEVEL  │ SKILLS │ ACHIEVEMENTS │
│   XP   │        │        │              │
├────────────────┬────────────────────────┤
│ Current Goals  │ Recent Activity        │
│ - Level 20     │ • Earned badge         │
│ - 5 Certs      │ • Added skill          │
│ - GitHub 100⭐ │ • Pushed to GitHub     │
└────────────────┴────────────────────────┘
```

**Colores:** Cyberpunk (dark bg, cyan, magenta, neon)
**Fonts:** Monospace (font-mono)
**Icons:** Hexagonal badges
**Animations:** Glitch effects, scanlines

#### 💼 Professional Mode Dashboard
```
┌─────────────────────────────────────────┐
│  Welcome back, [Name]! 👋              │
│  Your portfolio is 85% complete        │
├────────────────────────────────────────┤
│  Profile Views: 234 this month ↗       │
│  Portfolio Visits: 45 this week        │
├──────────────┬─────────────────────────┤
│ Quick Stats  │ Recent Updates          │
│ • 12 Skills  │ • Updated bio           │
│ • 5 Projects │ • Added project         │
│ • 3 Services │ • New testimonial       │
├──────────────┴─────────────────────────┤
│  [ Complete your profile ]             │
│  ☑ Add profile photo                   │
│  ☑ Write bio                           │
│  ☐ Add 3 projects                      │
└────────────────────────────────────────┘
```

**Colores:** Clean (white bg, gray-900 text, blue-600 accents)
**Fonts:** Sans-serif (font-sans)
**Icons:** Regular rounded icons
**Animations:** Subtle fades, smooth transitions

---

### Public Portfolio

#### 🎮 Gaming Mode Portfolio
```
/username (Gaming Mode)

┌─────────────────────────────────────────┐
│        [Cyberpunk Header]               │
│   ╔═══════════════════════════╗         │
│   ║  JOHN DOE                 ║         │
│   ║  Full Stack Developer     ║         │
│   ║  Level 18 • 2,450 XP      ║         │
│   ╚═══════════════════════════╝         │
├─────────────────────────────────────────┤
│  [ TECH STACK ] (Skill Tree Visual)    │
│     React ●─────● Node.js               │
│      │           │                      │
│   Next.js    Express                    │
├─────────────────────────────────────────┤
│  [ PROJECTS ] (Cards con repo links)   │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ Proj │ │ Proj │ │ Proj │            │
│  │  #1  │ │  #2  │ │  #3  │            │
│  └──────┘ └──────┘ └──────┘            │
├─────────────────────────────────────────┤
│  [ GITHUB STATS ]                      │
│  • 1,234 commits this year             │
│  • Top languages: TypeScript, Python   │
└─────────────────────────────────────────┘
```

**Layout:** Futurista, hexágonos, bordes angulares
**Interacciones:** Hover glows, neon effects

#### 💼 Professional Mode Portfolio
```
/username (Professional Mode)

┌─────────────────────────────────────────┐
│  [Clean Header - Photo + Name]         │
│  ┌────┐                                 │
│  │ 📷 │  Jane Smith                     │
│  └────┘  Product Designer               │
│          San Francisco, CA              │
├─────────────────────────────────────────┤
│  [ ABOUT ]                             │
│  I help startups build beautiful...    │
├─────────────────────────────────────────┤
│  [ PORTFOLIO ] (Grid/Masonry)          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │ 🎨 │ │ 🎨 │ │ 🎨 │ │ 🎨 │          │
│  └────┘ └────┘ └────┘ └────┘          │
├─────────────────────────────────────────┤
│  [ SERVICES ]                          │
│  • UI/UX Design - From $2,000          │
│  • Product Strategy - Contact for quote│
├─────────────────────────────────────────┤
│  [ TESTIMONIALS ]                      │
│  "Jane delivered amazing work!" ⭐⭐⭐⭐⭐ │
│  - Client Name, Company                │
└─────────────────────────────────────────┘
```

**Layout:** Tradicional, clean, grid-based
**Interacciones:** Smooth fades, subtle shadows

---

## 🔧 Implementation Strategy

### Phase 1: Refactor Existing (1 semana)

**Goal:** Hacer que el sistema actual sea "Gaming Mode"

1. **Marcar todo lo gaming-specific**
   ```typescript
   // Wrap gaming features
   {portfolioMode === 'gaming' && (
     <CRTMonitor />
     <HexBadge />
     <SkillTree />
   )}
   ```

2. **Extraer gaming theme a config**
   ```typescript
   // features/themes/configs/gaming.theme.ts
   export const gamingTheme = {
     colors: {
       bg: '#0A0E1A',
       primary: '#00D4FF',
       secondary: '#D946EF',
       accent: '#60FF00',
     },
     fonts: {
       body: 'mono',
       heading: 'mono',
     },
     components: {
       badge: 'hexagonal',
       card: 'angular',
     }
   }
   ```

3. **Skill categories para gaming**
   ```typescript
   // Seed predefined categories
   const GAMING_CATEGORIES = [
     { name: 'Languages', slug: 'languages', color: '#00D4FF', isGlobal: true },
     { name: 'Frameworks', slug: 'frameworks', color: '#D946EF', isGlobal: true },
     // ...
   ]
   ```

### Phase 2: Build Professional Mode (2 semanas)

1. **Professional theme**
   ```typescript
   // features/themes/configs/professional.theme.ts
   export const professionalTheme = {
     colors: {
       bg: '#FFFFFF',
       text: '#111827', // gray-900
       border: '#F3F4F6', // gray-100
       primary: '#2563EB', // blue-600
     },
     fonts: {
       body: 'sans',
       heading: 'sans',
     },
     components: {
       badge: 'rounded',
       card: 'clean',
     }
   }
   ```

2. **Customizable portfolio sections**
   ```typescript
   // features/portfolio/types/portfolio-settings.types.ts
   export interface PortfolioSettings {
     sections: {
       about: boolean
       skills: boolean
       skillsLayout: 'list' | 'grid' | 'tags'
       portfolio: boolean
       portfolioLayout: 'grid' | 'masonry' | 'carousel'
       services: boolean
       testimonials: boolean
       timeline: boolean
       contact: boolean
     }
     customColors?: {
       primary: string
       secondary: string
       accent: string
     }
   }
   ```

3. **Settings page**
   ```typescript
   // app/[locale]/(protected)/dashboard/settings/portfolio/page.tsx

   <PortfolioCustomization>
     <SectionToggle section="about" />
     <SectionToggle section="skills" />
     <LayoutSelector section="portfolio" />
     <ColorPicker />
   </PortfolioCustomization>
   ```

4. **New models (Services, Testimonials)**
   ```bash
   # Add to schema, migrate
   pnpm prisma db push
   ```

5. **Professional portfolio template**
   ```typescript
   // app/[locale]/(public)/[username]/templates/professional.tsx
   export function ProfessionalTemplate({ user, settings }: Props) {
     return (
       <div className="bg-white text-gray-900">
         {settings.sections.about && <AboutSection />}
         {settings.sections.portfolio && (
           <PortfolioSection layout={settings.sections.portfolioLayout} />
         )}
         {settings.sections.services && <ServicesSection />}
         {settings.sections.testimonials && <TestimonialsSection />}
       </div>
     )
   }
   ```

### Phase 3: Mode Switcher + Migration (3 días)

1. **Mode switcher in dashboard**
   ```typescript
   // features/dashboard/components/ModeSwitcher.tsx
   <Select value={portfolioMode} onChange={handleModeChange}>
     <option value="gaming">🎮 Gaming (Developer)</option>
     <option value="professional">💼 Professional</option>
   </Select>

   // Warning modal al cambiar
   "Switching to Professional mode will disable GitHub features. Continue?"
   ```

2. **Onboarding update**
   ```typescript
   // Step 2 en onboarding (después de auth)
   <ModeSelection>
     <ModeCard
       mode="gaming"
       title="Gaming Mode 🎮"
       description="For developers. GitHub integration, skill tree, XP system."
       features={['GitHub stats', 'Tech skills', 'Cyberpunk theme']}
     />
     <ModeCard
       mode="professional"
       title="Professional Mode 💼"
       description="For any profession. Customizable, clean design."
       features={['Custom skills', 'Services', 'Testimonials']}
     />
   </ModeSelection>
   ```

3. **Data migration (si user cambia de modo)**
   ```typescript
   // Cuando user cambia gaming → professional:
   // - Skills se mantienen (pero pierden validación GitHub)
   // - Projects se mantienen (pero sin repo links emphasis)
   // - Experiences se mantienen
   // - Theme cambia

   // Cuando professional → gaming:
   // - Si no tiene GitHub, prompt para conectar
   // - Skills manuales se mantienen, pero sin XP boost
   ```

---

## 📊 Comparison: Two-Mode vs Multi-Career

| Aspecto | Two-Mode (Gaming + Pro) | Multi-Career Paths |
|---------|------------------------|-------------------|
| **Complejidad dev** | 🟢 Media | 🔴 Alta |
| **Time to market** | 🟢 2-3 semanas | 🔴 2-3 meses |
| **Mantenimiento** | 🟢 Bajo | 🟡 Medio-Alto |
| **Flexibilidad** | 🟡 Media | 🟢 Alta |
| **Developer experience** | 🟢 Óptima | 🟢 Óptima |
| **Other professions** | 🟡 Buena | 🟢 Excelente |
| **Diferenciador** | 🟢 Gaming Mode único | 🟡 Menos claro |
| **Escalabilidad futura** | 🟡 Puede crecer a multi-career | 🟢 Ya es multi-career |

---

## 🎯 Decisión Recomendada

### ✅ **IR CON TWO-MODE STRATEGY**

**Por qué:**

1. **Quick win** - Tenés el Gaming Mode 80% hecho ya
2. **Less risk** - No rehacés todo, agregás Professional como addon
3. **Clear positioning:**
   - "Portfolio builder para developers (Gaming Mode)"
   - "También funciona para otros profesionales (Professional Mode)"
4. **Path to multi-career:** Si Professional Mode tiene éxito, podés expandir a career-specific templates dentro de Professional

**Roadmap:**
```
MVP (hoy)
  └─ Gaming Mode (developers)

v1.1 (+3 semanas)
  └─ Professional Mode (generic)

v1.2 (+2 meses) - Opcional
  └─ Professional Mode con "templates":
      ├─ Designer template
      ├─ Photographer template
      └─ Writer template
```

---

## 💡 Bonus: "Templates" dentro de Professional Mode

**Idea futura:** Professional Mode podría tener "templates" opcionales:

```typescript
// En lugar de career paths rígidos, templates sugeridos
const PROFESSIONAL_TEMPLATES = {
  blank: {
    name: 'Blank Canvas',
    sections: { about: true, contact: true }
  },
  designer: {
    name: 'Designer',
    sections: { about: true, portfolio: true, services: true },
    portfolioLayout: 'masonry',
    suggestedSkills: ['UI Design', 'Figma', 'Prototyping']
  },
  photographer: {
    name: 'Photographer',
    sections: { about: true, portfolio: true, testimonials: true },
    portfolioLayout: 'grid',
    suggestedSkills: ['Portrait', 'Lightroom', 'Canon 5D']
  },
  writer: {
    name: 'Writer',
    sections: { about: true, portfolio: true, testimonials: true },
    portfolioLayout: 'list',
    suggestedSkills: ['Copywriting', 'SEO', 'Storytelling']
  }
}
```

**User flow:**
```
Professional Mode onboarding
  → "Choose a starting template (you can customize later)"
  → [Designer] [Photographer] [Writer] [Blank]
  → Preconfigura sections + skills + layout
  → User puede modificar todo después
```

---

## 🚀 Action Items (si decidís ir por este camino)

### Ahora (con poca cuota):
- [ ] Validar que te guste este approach
- [ ] Definir scope exacto de Professional Mode v1

### Post Feb 17:
- [ ] Phase 1: Refactor gaming-specific code (1 semana)
- [ ] Phase 2: Build Professional Mode (2 semanas)
- [ ] Phase 3: Mode switcher + onboarding (3 días)
- [ ] Testing + polish (1 semana)

**Total:** ~4 semanas para Two-Mode completo

---

## 📝 Notas Finales

**Esta estrategia es el sweet spot entre:**
- ✅ Mantener tu visión única (Gaming Mode para developers)
- ✅ Abrir mercado (Professional Mode para todos)
- ✅ Desarrollo pragmático (no rehacés todo)
- ✅ Futuro escalable (podés agregar career-specific features después)

**vs Multi-Career Paths que requiere:**
- 🔴 Rehacer arquitectura completa
- 🔴 Múltiples validadores API
- 🔴 Mantenimiento de 10+ paths
- 🔴 3+ meses de desarrollo

**Winner: Two-Mode Strategy** 🏆
