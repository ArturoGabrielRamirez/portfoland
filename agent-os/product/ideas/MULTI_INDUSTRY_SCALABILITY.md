# Multi-Industry Scalability - Career Path System

**Fecha:** 2026-02-15
**Estado:** Propuesta - Diseño conceptual
**Impacto:** CRÍTICO - Define el alcance del producto

---

## 🎯 La Pregunta Central

**¿Puede Portfoland servir para fotógrafos, diseñadores, estilistas, etc., o es solo para developers?**

**Respuesta corta:** Actualmente NO, pero SÍ es escalable con el diseño correcto.

---

## 📊 Análisis del Sistema Actual

### ❌ Por qué NO funciona para otros profesionales (estado actual)

| Aspecto | Developers | Fotógrafos | Diseñadores | Estilistas |
|---------|-----------|------------|-------------|------------|
| **Skills** | TypeScript, React, etc. | Retoque, Iluminación, etc. | UI/UX, Figma, etc. | Moda, Vestuario, etc. |
| **Validación** | GitHub (commits, repos) | ❌ No aplica | Behance/Dribbble | Instagram/Portfolio sites |
| **Portfolio showcase** | Code repos, tech stack | ❌ Galería de fotos | ❌ Diseños/mockups | ❌ Lookbooks, antes/después |
| **XP/Métricas** | Commits, PRs | ❌ No definido | ❌ No definido | ❌ No definido |
| **Experiences** | ✅ Job timeline | ✅ Funciona | ✅ Funciona | ✅ Funciona |
| **Projects** | ✅ Repo links | ❌ Necesita galería | ❌ Necesita showcase | ❌ Necesita galería |

**Conclusión:** El 60% del sistema NO sirve para no-developers.

---

## 🚀 Solución: Sistema de Career Paths (Templates)

### Concepto: Onboarding con Career Selection

```
┌─────────────────────────────────────────────┐
│  Welcome to Portfoland! 🎯                  │
│  What type of professional are you?         │
│                                             │
│  ┌───────┐  ┌────────┐  ┌──────────┐       │
│  │ 💻    │  │ 📸     │  │ 🎨       │       │
│  │ Dev   │  │ Photo  │  │ Designer │  ...  │
│  └───────┘  └────────┘  └──────────┘       │
│                                             │
│  Don't worry, you can change this later     │
└─────────────────────────────────────────────┘
```

**Al seleccionar career path:**
1. Se adaptan las skills disponibles
2. Se configuran las fuentes de validación
3. Se personaliza el dashboard
4. Se ajusta el sistema de puntos

---

## 🎨 Career Paths - Diseño Detallado

### 1. Developer (Actual)

**Skills:**
- Categorías: Languages, Frameworks, Tools, Soft Skills
- Ejemplos: JavaScript, React, Docker, Git

**Validación:**
- ✅ GitHub API (commits, repos, languages)
- ✅ Certificaciones (Udemy, Coursera, etc.)
- ✅ Projects con stack tech

**XP System:**
```typescript
{
  experience: {
    formula: "(months * 10) + (skills.length * 20)",
    max: 500
  },
  skills: {
    manual: 50,
    githubVerified: 200,
    withCertificate: 250,
    withProjects: "+100 per project"
  },
  projects: {
    basic: 100,
    withLiveDemo: 150,
    withGithubStars: "+10 per 10 stars (max 200)"
  }
}
```

**Portfolio Sections:**
- Timeline (experiences)
- Tech Stack (skill tree)
- Projects (repos + live demos)
- Certifications

---

### 2. Photographer 📸

**Skills:**
- Categorías: Genres, Equipment, Editing, Business
- Ejemplos: Portrait, Landscape, Adobe Lightroom, Camera Canon 5D

**Validación:**
- ✅ Instagram API (followers, engagement, posts)
- ✅ 500px / Unsplash (stats, downloads)
- ✅ Google Reviews (clientes)
- ✅ Upload certificados/premios

**XP System:**
```typescript
{
  experience: {
    formula: "(months * 10) + (clients * 5)",
    max: 500
  },
  skills: {
    manual: 50,
    instagramVerified: 150,  // >1k followers
    withClientReviews: 200,
    award: 300
  },
  projects: {
    photoShoot: 100,
    withClientTestimonial: 150,
    published: 200,  // en revista, blog, etc.
    award: 300
  },
  socialProof: {
    instagramFollowers: {
      "1k-5k": 100,
      "5k-10k": 200,
      "10k-50k": 300,
      "50k+": 500
    },
    avgEngagement: {
      ">5%": 100,
      ">10%": 200
    }
  }
}
```

**Portfolio Sections:**
- Gallery (grid de fotos con lightbox)
- Services (retratos, bodas, producto, etc.)
- Client Reviews
- Behind the scenes (opcional)
- Equipment list (opcional)

**Integraciones API:**
```typescript
// Instagram Basic Display API
GET /me/media
  → Recent posts, likes, comments

// 500px API
GET /users/{username}/photos
  → Photos, views, favorites

// Unsplash API (si es contributor)
GET /users/{username}/statistics
  → Downloads, views
```

---

### 3. UI/UX Designer 🎨

**Skills:**
- Categorías: Design, Tools, Research, Soft Skills
- Ejemplos: UI Design, Figma, User Research, Prototyping

**Validación:**
- ✅ Behance API (projects, appreciations, views)
- ✅ Dribbble API (shots, likes)
- ✅ Figma Community (followers, duplicates)
- ✅ Certificaciones (Interaction Design Foundation, etc.)

**XP System:**
```typescript
{
  experience: {
    formula: "(months * 10) + (projects * 30)",
    max: 500
  },
  skills: {
    manual: 50,
    behanceVerified: 200,  // projects publicados
    withCertificate: 250,
    withCaseStudy: 300
  },
  projects: {
    caseStudy: 200,  // Con proceso documentado
    behanceAppreciations: "+5 per 10 appreciations (max 200)",
    dribbbleLikes: "+5 per 10 likes (max 200)",
    liveProduct: 300
  }
}
```

**Portfolio Sections:**
- Case Studies (diseños con proceso, wireframes, final)
- Design System showcase
- Tools & Process
- Client work vs Personal projects
- Behance/Dribbble embed

**Integraciones API:**
```typescript
// Behance API
GET /users/{username}/projects
  → Projects, views, appreciations, comments

// Dribbble API
GET /users/{username}/shots
  → Shots, likes, views, comments

// Figma (no API pública, manual upload)
```

---

### 4. Fashion Stylist 💄

**Skills:**
- Categorías: Styling, Fashion, Business, Trends
- Ejemplos: Editorial Styling, Personal Shopping, Wardrobe Consulting

**Validación:**
- ✅ Instagram API (followers, engagement)
- ✅ Client testimonials (manual upload)
- ✅ Published work (revistas, editoriales)
- ✅ Certifications (fashion schools)

**XP System:**
```typescript
{
  experience: {
    formula: "(months * 10) + (clients * 15)",
    max: 500
  },
  skills: {
    manual: 50,
    withClientReview: 150,
    publishedWork: 250,
    fashionWeekParticipation: 400
  },
  projects: {
    editorial: 200,
    personalStyling: 100,
    celebrityWork: 400,
    published: 300
  },
  socialProof: {
    instagramFollowers: {
      "1k-5k": 100,
      "5k-10k": 200,
      "10k+": 300
    }
  }
}
```

**Portfolio Sections:**
- Lookbook (antes/después, outfits)
- Editorial work
- Client transformations
- Press & Features
- Services offered
- Style philosophy/about

---

## 🏗️ Arquitectura de Implementación

### 1. Database Schema Changes

```prisma
// Nuevo modelo: CareerPath
model CareerPath {
  id          String   @id @default(cuid()) @map("_id")
  slug        String   @unique  // "developer", "photographer", "designer", etc.
  name        String   // "Software Developer"
  icon        String   // "💻"
  description String
  isActive    Boolean  @default(true)

  // Configuración del career path
  config      Json     // Skills categories, validation sources, XP formulas

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]

  @@map("career_paths")
}

// Actualizar User model
model User {
  // ... campos existentes
  careerPathId String?
  careerPath   CareerPath? @relation(fields: [careerPathId], references: [id])

  // Nuevos campos de validación social
  socialLinks  Json?    // { instagram: "url", behance: "url", dribbble: "url", ... }
  socialStats  Json?    // Stats cacheadas de APIs externas
  lastSyncAt   DateTime?
}

// Actualizar Project model para soportar galleries
model Project {
  // ... campos existentes
  gallery      Json?    // Array de { url, caption, order } para fotógrafos/diseñadores
  metrics      Json?    // Behance appreciations, Dribbble likes, Instagram engagement, etc.
}

// Skill categories son dinámicas por career path
model SkillCategory {
  // ... campos existentes
  careerPathId String?
  careerPath   CareerPath? @relation(fields: [careerPathId], references: [id])
}
```

### 2. Career Path Config Structure

```typescript
// features/career-paths/types/career-path.types.ts
export interface CareerPathConfig {
  slug: string
  name: string
  icon: string

  // Skills disponibles
  skillCategories: SkillCategoryTemplate[]

  // Fuentes de validación
  validationSources: {
    github?: GitHubValidationConfig
    instagram?: InstagramValidationConfig
    behance?: BehanceValidationConfig
    dribbble?: DribbbleValidationConfig
    custom?: CustomValidationConfig[]
  }

  // Sistema de XP
  xpFormulas: {
    experience: string  // Formula string evaluable
    skills: Record<string, number>
    projects: Record<string, number>
    socialProof?: Record<string, any>
  }

  // Secciones de portfolio habilitadas
  portfolioSections: {
    timeline: boolean
    skills: boolean
    projects: boolean
    gallery?: boolean      // Para fotógrafos
    caseStudies?: boolean  // Para diseñadores
    reviews?: boolean      // Para servicios
  }

  // Dashboard widgets personalizados
  dashboardWidgets: string[]  // ['stats', 'goals', 'activity', 'social-proof', ...]
}
```

### 3. Validation Service Architecture

```typescript
// features/validation/services/validation.service.ts
export class ValidationService {

  async validateSkill(
    userId: string,
    skillId: string,
    validationSource: string
  ): Promise<ValidationResult> {
    const user = await getUserWithCareerPath(userId)
    const config = user.careerPath.config

    // Router a la validación correcta según career path
    switch (validationSource) {
      case 'github':
        return this.githubValidator.validate(user, skillId)
      case 'instagram':
        return this.instagramValidator.validate(user, skillId)
      case 'behance':
        return this.behanceValidator.validate(user, skillId)
      // ...
    }
  }

  async syncSocialStats(userId: string): Promise<void> {
    const user = await getUserWithCareerPath(userId)
    const sources = user.careerPath.config.validationSources

    // Sync todas las fuentes conectadas
    const stats = {}

    if (sources.instagram && user.socialLinks?.instagram) {
      stats.instagram = await this.instagramAPI.getStats(user.socialLinks.instagram)
    }

    if (sources.behance && user.socialLinks?.behance) {
      stats.behance = await this.behanceAPI.getStats(user.socialLinks.behance)
    }

    // Update user.socialStats
    await prisma.user.update({
      where: { id: userId },
      data: {
        socialStats: stats,
        lastSyncAt: new Date()
      }
    })
  }
}
```

### 4. XP Calculation Service

```typescript
// features/gamification/services/xp-calculator.service.ts
export class XPCalculator {

  calculateExperienceXP(
    experience: Experience,
    careerPath: CareerPath
  ): number {
    const formula = careerPath.config.xpFormulas.experience
    const months = this.getMonthsDuration(experience.startDate, experience.endDate)

    // Eval formula (safely)
    // Formula example: "(months * 10) + (skills.length * 20)"
    const context = {
      months,
      skills: experience.skills,
      clients: (experience.metadata as any)?.clients || 0,
    }

    return this.evalFormula(formula, context)
  }

  calculateSkillXP(
    skill: UserSkill,
    validationSource: string | null,
    careerPath: CareerPath
  ): number {
    const baseXP = careerPath.config.xpFormulas.skills.manual || 50

    if (!validationSource) return baseXP

    // Buscar multiplier según validación
    const validated = careerPath.config.xpFormulas.skills[validationSource]
    return validated || baseXP
  }

  calculateProjectXP(
    project: Project,
    careerPath: CareerPath
  ): number {
    const formulas = careerPath.config.xpFormulas.projects
    let totalXP = formulas.basic || 100

    // Aplicar bonuses según métricas
    if (project.metrics) {
      const metrics = project.metrics as Record<string, any>

      // Behance appreciations
      if (metrics.behanceAppreciations) {
        totalXP += Math.min(
          Math.floor(metrics.behanceAppreciations / 10) * 5,
          200
        )
      }

      // Instagram engagement
      if (metrics.instagramLikes) {
        totalXP += Math.min(
          Math.floor(metrics.instagramLikes / 100) * 10,
          200
        )
      }
    }

    return totalXP
  }

  private evalFormula(formula: string, context: Record<string, any>): number {
    // Usar librería como `expr-eval` o `mathjs` para eval seguro
    // NO usar eval() directamente por seguridad
    const parser = new Parser()
    return Math.floor(parser.evaluate(formula, context))
  }
}
```

---

## 🎨 UI/UX Adaptations

### 1. Onboarding Flow

```typescript
// app/[locale]/(auth)/onboarding/page.tsx

Step 1: Career Selection
  → Grid de career paths con preview
  → "Not sure? Take our quiz" (AI-powered)

Step 2: Profile Basics
  → Name, bio, location (igual para todos)

Step 3: Connect Social (variable por career)
  Developer → GitHub
  Photographer → Instagram + 500px
  Designer → Behance + Dribbble
  Stylist → Instagram

Step 4: Import Initial Data (si conectó social)
  → "We found 12 React projects on GitHub"
  → "We found 45 photos on Instagram"
  → Checkbox para importar

Step 5: Portfolio Mode
  → Gaming vs Professional theme
```

### 2. Dashboard Adaptations

```typescript
// Dashboard widgets según career path

Developer:
  - GitHub Activity (commits this week)
  - Top Languages (from repos)
  - Skills verified by GitHub
  - Recent code contributions

Photographer:
  - Instagram Engagement (likes, comments)
  - Recent shoots (projects)
  - Client reviews
  - Popular photos (most liked)

Designer:
  - Behance Appreciations this month
  - Dribbble Popular Shots
  - Design tools mastery
  - Case studies published

Stylist:
  - Instagram Growth
  - Client transformations
  - Upcoming appointments (si integra calendar)
  - Style trends you're using
```

### 3. Portfolio Public View

```typescript
// Sections variables según career path

Developer Portfolio:
  /username
    → Hero (name, title, github stats)
    → Tech Stack (skill tree)
    → Projects (cards con repo + demo)
    → Timeline
    → Contact

Photographer Portfolio:
  /username
    → Hero (name, tagline, featured photo)
    → Gallery (masonry grid con lightbox)
    → Services
    → Client Reviews
    → Behind the Scenes
    → Contact + Booking

Designer Portfolio:
  /username
    → Hero (name, tagline, design preview)
    → Case Studies (proceso completo)
    → Work Gallery
    → Tools & Process
    → Dribbble/Behance embed
    → Contact

Stylist Portfolio:
  /username
    → Hero (name, style philosophy)
    → Lookbook (antes/después)
    → Services
    → Client Transformations
    → Press & Features
    → Instagram feed
    → Book Consultation
```

---

## 🤖 AI-Powered Career Matching (Bonus)

### Quiz + Skills Analysis

```typescript
// features/onboarding/services/career-matcher.service.ts
export async function suggestCareerPath(
  userInput: {
    skills?: string[]
    interests?: string[]
    socialLinks?: string[]
    freeformDescription?: string
  }
): Promise<CareerPathSuggestion[]> {

  // Llamar a Claude API con prompt
  const prompt = `
    Based on this information, suggest the top 3 career paths for this user:

    Skills: ${userInput.skills?.join(', ')}
    Interests: ${userInput.interests?.join(', ')}
    Social links: ${userInput.socialLinks?.join(', ')}
    Description: ${userInput.freeformDescription}

    Available career paths: ${CAREER_PATHS.map(cp => cp.name).join(', ')}

    Return JSON with top 3 suggestions, confidence score, and reasoning.
  `

  const suggestions = await callClaudeAPI(prompt)

  return suggestions
}
```

---

## 📊 Escalabilidad: ¿Qué tan fácil es agregar nuevos Career Paths?

### Proceso para agregar nuevo Career Path

1. **Definir config JSON**
   ```typescript
   const architectCareerPath: CareerPathConfig = {
     slug: 'architect',
     name: 'Architect',
     icon: '🏛️',
     skillCategories: [
       { name: 'Software', slug: 'software', color: '#00D4FF' },
       { name: 'Styles', slug: 'styles', color: '#D946EF' },
       // ...
     ],
     validationSources: {
       instagram: { /* config */ },
       custom: [
         { name: 'ArchDaily', url: 'https://archdaily.com/...' }
       ]
     },
     xpFormulas: {
       experience: "(months * 10) + (projects * 50)",
       skills: { manual: 50, withPublication: 300 },
       projects: { basic: 200, award: 500 }
     },
     portfolioSections: {
       timeline: true,
       skills: true,
       projects: true,
       gallery: true  // Para renders/fotos
     },
     dashboardWidgets: ['stats', 'goals', 'recent-projects', 'publications']
   }
   ```

2. **Seed database**
   ```typescript
   await prisma.careerPath.create({
     data: {
       slug: 'architect',
       name: 'Architect',
       icon: '🏛️',
       description: 'Build amazing spaces',
       config: architectCareerPath,
       isActive: true
     }
   })
   ```

3. **Crear validator si necesita API custom**
   ```typescript
   // features/validation/validators/archdaily.validator.ts
   export class ArchDailyValidator implements IValidator {
     async validate(user: User, skillId: string): Promise<ValidationResult> {
       // Custom logic
     }
   }
   ```

4. **Agregar portfolio template** (opcional)
   ```tsx
   // app/[locale]/(public)/[username]/templates/architect.tsx
   export function ArchitectPortfolio({ user, projects }: Props) {
     return (
       <div>
         {/* Custom layout para architects */}
       </div>
     )
   }
   ```

**Tiempo estimado para nuevo career path:** 2-3 días (con arquitectura bien hecha)

---

## 🎯 Decisión de Producto: ¿Qué tan amplio ir?

### Opción A: Vertical Focus (Solo Developers) ✅ SEGURO
- **Pros:** Más fácil, mejor producto inicial, nicho claro
- **Cons:** Mercado limitado, difícil escalar después
- **Estrategia:** Dominar developers primero, expandir después

### Opción B: Multi-Vertical desde Día 1 ⚠️ RIESGOSO
- **Pros:** Mercado enorme, diferenciador fuerte vs competencia
- **Cons:** Complejo, recursos necesarios mayores, cada vertical necesita pulido
- **Estrategia:** Lanzar con 3-4 career paths, iterar rápido

### Opción C: Plataforma Configurable 🚀 IDEAL A LARGO PLAZO
- **Pros:** Escalabilidad infinita, users pueden crear sus propios templates
- **Cons:** Muy complejo para MVP, puede no ser necesario
- **Estrategia:** Arquitectura preparada para esto, pero comenzar con paths pre-definidos

---

## 💡 Recomendación Final

### Fase 1: MVP - Developer Focused (3 meses)
- Solo "Software Developer" career path
- Sistema de validación GitHub
- Portfolio template profesional + gaming
- Probar product-market fit

### Fase 2: Multi-Career Beta (3 meses)
- Agregar 2-3 career paths populares:
  - UI/UX Designer (Behance/Dribbble validation)
  - Photographer (Instagram validation)
  - Content Creator / Writer (Medium/Substack validation)
- Validar arquitectura escalable
- Recoger feedback

### Fase 3: Expansión (6+ meses)
- Agregar 5-10 career paths más
- Marketplace de templates (users crean sus propios)
- AI career matching
- Cross-career portfolios (ej: Developer + Designer)

### Arquitectura desde Día 1
**IMPORTANTE:** Aunque el MVP sea solo developers, la arquitectura debe soportar multi-career desde el principio.

```typescript
// ✅ HACER (preparado para multi-career)
const xp = calculateXP(user.careerPath, experience)

// ❌ NO HACER (hardcoded para developers)
const xp = experience.months * 10 + githubCommits * 5
```

---

## 📚 Referencias & Competitors

### Portfolio Builders Existentes
- **Behance** (Adobe) - Solo diseñadores, muy visual
- **Dribbble** - Solo diseñadores UI/UX
- **GitHub** - Solo developers (no es portfolio per se)
- **LinkedIn** - Multi-industry pero genérico, no personalizado
- **Notion** - DIY pero requiere setup manual
- **Carrd/Webflow** - Genérico, no industry-specific

### Oportunidad de Portfoland
**Ser el "Canva de portfolios profesionales":**
- Templates específicos por industria
- Validación automática (GitHub, Behance, Instagram, etc.)
- Gamification que motiva a mejorar
- Multi-theme (Professional vs Gaming aesthetic)
- One-click deploy

**Diferenciador clave:** Validación externa + Gamification
