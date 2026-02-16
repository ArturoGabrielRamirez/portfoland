# Dashboard & Gamification System - Improvement Ideas

**Fecha:** 2026-02-15
**Estado:** Propuesta - Pendiente implementación
**Prioridad:** Alta

---

## 📋 Análisis del Estado Actual

### ✅ Lo que funciona bien
- Gamification visual (hexágonos, badges, progress bars)
- Estructura clara (Stats, Goals, Activity feed)
- Sistema XP/Level base en schema (UserSkill, SkillSource)

### ⚠️ Problemas detectados

#### 1. Todo es Mock Data
```typescript
// app/[locale]/(protected)/dashboard/page.tsx línea 48-67
const stats = [
  { value: "2,450", label: "TOTAL XP", ... },
  // Stats, goals, activities son hardcoded
]
```
**Impacto:** Los usuarios no ven progreso real → pierden motivación

#### 2. Sistema de Puntos Arbitrario
- `Experience.xp: Int` sin lógica de cálculo definida
- `SkillSource.xpAmount` existe pero no se usa
- **Problema:** ¿Por qué una experiencia vale 200 XP y otra 50?

#### 3. Self-Assessment sin Validación
```typescript
selfAssessmentLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
```
- Es 100% subjetivo
- No hay incentivo para ser honesto
- Puede inflar artificialmente el nivel

---

## 🎯 Recomendaciones de Mejora

### 1. Sistema de Puntos Contextualizado ⭐

**En lugar de XP arbitrarios, usar métricas reales:**

```typescript
// Para Experiences (trabajo/educación):
XP = (duración en meses × 10) + (skills.length × 20) + bonus

// Para Skills:
- Auto-declarado sin pruebas: 50 XP base
- Con certificado: 200 XP
- Con GitHub activity: hasta 500 XP
- Con proyectos usando la skill: +100 XP por proyecto
```

**Ventaja:** Los puntos significan algo tangible

---

### 2. Validación por GitHub API 🔥

**GitHub APIs útiles para validación:**

```typescript
// Endpoints relevantes:
GET /users/{username}/repos
  → Analizar lenguajes usados (stars, commits, size)

GET /repos/{owner}/{repo}/languages
  → % de código en cada lenguaje

GET /users/{username}/events/public
  → Actividad reciente (commits, PRs, issues)

GET /search/commits?q=author:{username}+language:{lang}
  → Commits por lenguaje específico
```

**Implementación sugerida:**

```typescript
// features/skills/services/github-validator.service.ts
export async function validateSkillLevel(username: string, skillName: string) {
  // 1. Mapear skill a GitHub language
  const langMap = {
    'JavaScript': 'javascript',
    'React': 'javascript',
    'Python': 'python',
    // ...
  }

  // 2. Contar commits/repos/contributions
  const metrics = await getGitHubMetrics(username, langMap[skillName])

  // 3. Calcular nivel sugerido
  if (metrics.commits > 500 && metrics.repos > 10) return 'ADVANCED'
  if (metrics.commits > 100 && metrics.repos > 3) return 'INTERMEDIATE'
  return 'BEGINNER'
}
```

**Bonuses:**
- Badge "GitHub Verified" si los datos coinciden con self-assessment
- Multiplier de XP: x1.5 si está validado por GitHub
- Auto-sugerir skills desde repos públicos del usuario
- Actualización periódica automática (ej: cada semana)

---

### 3. Sistema de Credibilidad 🎖️

**En lugar de puntos "gratuitos", hacerlos ganables:**

| Acción | XP Base | Validación | XP Final | Credibilidad |
|--------|---------|------------|----------|--------------|
| Add skill manual | 50 | - | 50 | 1.0x |
| Add skill + GitHub match | 50 | +150 | 200 | 1.5x |
| Add skill + certificado | 50 | +200 | 250 | 2.0x |
| Add project usando skill | 100 | - | 100 | 1.2x |
| Add experience (1 año) | 120 | - | 120 | 1.0x |

**Cambios en schema:**

```prisma
model UserSkill {
  // ... campos existentes
  credibilityScore  Float     @default(1.0)  // 1.0 = no validado, 1.5 = GitHub, 2.0 = certificado
  lastValidatedAt   DateTime?
  validationSource  String?   // "github", "certificate", "project", "manual"
  validationData    Json?     // Metadata de la validación
}
```

**Visualización en Dashboard:**
- Badge "Verified" en skills con credibilityScore > 1.3
- Tooltip mostrando fuente de validación
- Progress bar de "Portfolio Credibility" (promedio de todas las skills)

---

### 4. Goals System Dinámico 🎯

**Actual:** Goals hardcoded
**Mejor:** Goals generados dinámicamente basados en progreso del usuario

```typescript
// features/dashboard/services/goals.service.ts
export async function generateDynamicGoals(userId: string) {
  const user = await getUserWithStats(userId)

  const goals = []

  // Goal 1: Profile Completion
  const profileCompletion = calculateProfileCompletion(user)
  if (profileCompletion < 100) {
    goals.push({
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Fill all profile sections',
      progress: profileCompletion,
      target: 100,
      reward: { xp: 100, badge: 'Professional' },
      color: 'cyan',
      checklist: [
        { done: !!user.image, label: 'Profile image' },
        { done: !!user.bio, label: 'Bio description' },
        { done: user.skills.length >= 3, label: '3+ skills' },
        { done: user.experiences.length >= 1, label: '1+ experience' },
        { done: user.projects.length >= 1, label: '1+ project' },
      ]
    })
  }

  // Goal 2: GitHub Connection
  if (!user.githubUsername) {
    goals.push({
      id: 'connect-github',
      title: 'Connect GitHub Account',
      description: 'Unlock skill validation and earn 3x XP',
      progress: 0,
      target: 100,
      reward: { xp: 200, feature: 'Skill Validation' },
      color: 'magenta',
    })
  }

  // Goal 3: Skill Validation
  const validatedSkills = user.skills.filter(s => s.credibilityScore > 1.0)
  if (validatedSkills.length < 5) {
    goals.push({
      id: 'validate-skills',
      title: 'Validate 5 Skills',
      description: 'Add proof to your expertise',
      progress: (validatedSkills.length / 5) * 100,
      target: 5,
      reward: { xp: 500, badge: 'Verified Developer' },
      color: 'green',
    })
  }

  // Goal 4: Level Up
  const nextLevel = user.level + 1
  goals.push({
    id: 'reach-next-level',
    title: `Reach Level ${nextLevel}`,
    description: 'Keep building your portfolio',
    progress: (user.totalXP % 1000) / 10, // Assuming 1000 XP per level
    target: 1000,
    reward: { badge: `Level ${nextLevel}` },
    color: 'yellow',
  })

  return goals.slice(0, 3) // Top 3 active goals
}

function calculateProfileCompletion(user: UserWithStats): number {
  const checks = [
    user.image ? 20 : 0,
    user.bio ? 20 : 0,
    user.skills.length >= 3 ? 20 : 0,
    user.experiences.length >= 1 ? 20 : 0,
    user.projects.length >= 1 ? 20 : 0,
  ]
  return checks.reduce((sum, val) => sum + val, 0)
}
```

---

### 5. Hacer los Puntos Útiles 💎

**Problema actual:** Los puntos no sirven para nada
**Solución:** Darles utilidad real

#### Feature Unlocks por Nivel

```typescript
const LEVEL_REWARDS = {
  5: { feature: 'Custom color theme', description: 'Personalize your portfolio colors' },
  10: { feature: 'Custom portfolio URL', description: 'portfoland.com/your-name' },
  15: { feature: 'Portfolio analytics', description: 'See who visits your portfolio' },
  20: { feature: 'Remove Portfoland badge', description: 'White-label your portfolio' },
  25: { feature: 'Priority support', description: 'Get help faster' },
  30: { feature: 'Export to PDF', description: 'Download portfolio as PDF resume' },
}
```

#### Badges Públicos

```typescript
const BADGES = {
  'first-skill': { name: 'First Steps', icon: '🌱', xpRequired: 0 },
  'github-verified': { name: 'GitHub Verified', icon: '✓', requireGithub: true },
  'complete-profile': { name: 'Professional', icon: '💼', profileCompletion: 100 },
  'skill-master': { name: 'Skill Master', icon: '⚡', skillsWithMax: 5 },
  'certified': { name: 'Certified Pro', icon: '🎓', certifications: 3 },
  'portfolio-live': { name: 'Published', icon: '🚀', portfolioPublished: true },
}
```

#### Portfolio Visibility Score

```typescript
// Mejor XP → mejor ranking en búsquedas futuras
const visibilityScore = calculateVisibilityScore({
  totalXP: user.totalXP,
  credibilityAverage: avgCredibility,
  profileCompletion: completion,
  githubConnected: !!user.githubUsername,
  badges: user.badges.length,
})

// Mostrar en dashboard:
"Your portfolio is in top 15% of React developers 📈"
```

---

## 🚀 Quick Wins (Prioridad de Implementación)

### Sprint 1: Stats Reales (1-2 días)
- [ ] Reemplazar mock stats con queries reales
  ```typescript
  const totalXP = await prisma.userSkill.aggregate({
    where: { userId },
    _sum: { totalXP: true }
  })

  const skillsCount = await prisma.userSkill.count({
    where: { userId }
  })

  const experiencesCount = await prisma.experience.count({
    where: { userId }
  })
  ```
- [ ] Activity feed con acciones reales del usuario
- [ ] Progress bar de profile completion

### Sprint 2: GitHub Integration (3-4 días)
- [ ] GitHub OAuth (ya existe Better Auth con GitHub provider)
- [ ] Guardar `githubUsername` en User model
- [ ] Service para llamar GitHub API
- [ ] Validación automática de skills (cron job semanal)
- [ ] Badge "GitHub Verified" en skills validados

### Sprint 3: Dynamic Goals (2-3 días)
- [ ] Service para generar goals dinámicos
- [ ] Reemplazar goals hardcoded con generados
- [ ] Sistema de rewards (badges, feature unlocks)
- [ ] Notificación cuando se completa un goal

### Sprint 4: Credibility System (2-3 días)
- [ ] Agregar campos a UserSkill schema
- [ ] Calcular credibilityScore
- [ ] UI indicators (badges, tooltips)
- [ ] Portfolio Credibility score general

---

## 📊 Métricas de Éxito

**Engagement:**
- % de usuarios que conectan GitHub: Target >60%
- % de skills validados vs auto-declarados: Target >40%
- Daily active users revisando dashboard: Target +30%

**Retention:**
- Weekly return rate: Target >50%
- Average session time on dashboard: Target >3 min
- Goals completed per user: Target >2/mes

**Quality:**
- Average credibility score: Target >1.3
- Average profile completion: Target >80%

---

## 🔄 Mejoras Futuras (Post-MVP)

1. **Leaderboards** - Top users por skill/industry
2. **Skill endorsements** - Otros usuarios validan tus skills
3. **Integración con LinkedIn** - Import data automático
4. **Certificaciones verificables** - Blockchain/NFT badges
5. **Portfolio analytics** - Views, clicks, time spent
6. **AI skill suggestions** - Basado en GitHub repos + job market trends

---

## 💡 Notas Adicionales

- El sistema debe sentirse como progreso natural, no como grind forzado
- GitHub validation es el diferenciador clave vs otros portfolio builders
- Los puntos deben ser un side-effect del buen trabajo, no el objetivo principal
- Mantener balance entre gamification y profesionalismo (modo gaming vs professional)
