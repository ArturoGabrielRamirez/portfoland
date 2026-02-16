# AI Use Cases for Portfoland

**Fecha:** 2026-02-15
**Estado:** Propuesta - Ideas para implementación gradual
**Contexto:** Claude API integration opportunities

---

## 🎯 Overview

Portfoland puede usar IA (Claude API) para mejorar la UX sin reemplazar la autenticidad del contenido. El principio es: **IA asiste, el usuario decide.**

---

## 🎮 FEATURE DESTACADA: AI Skill Assessment Game

**Ver documento completo:** [AI_SKILL_ASSESSMENT_GAME.md](./AI_SKILL_ASSESSMENT_GAME.md)

**Concepto:** Juego de rol con IA donde users demuestran sus skills respondiendo preguntas/ejercicios adaptativos.

**Mecánica:**
- 5 preguntas adaptativas por skill
- Sistema de 3 vidas (🟢🟢🟢)
- Tipos: Multiple choice, code challenges, short answers, scenarios
- Pass = 4/5 correctas
- Rewards: Badge verificado, +150 XP, credibility boost (1.5x-2.0x)

**Costos:** ~$0.035 por assessment con Claude Sonnet (~$350/mes para 10k users)

**Diferenciador:** Ningún competidor tiene skill validation gamificada con IA

---

## ✅ Use Cases Recomendados (Ordenados por Prioridad)

### 1. **Auto-Suggest Skills** ⭐⭐⭐

**Para quién:** Gaming + Professional Mode
**Cuándo:** Onboarding, al agregar GitHub, al agregar experiencias

#### Gaming Mode (desde GitHub)
```typescript
// Analizar repos del usuario
GET /users/{username}/repos

// Detectar lenguajes más usados
repos.forEach(repo => {
  languages = GET /repos/{owner}/{repo}/languages
})

// Llamar a Claude API
const prompt = `
Given these GitHub repos and languages used:
${JSON.stringify(repoStats)}

Suggest top 10 technical skills this developer should add to their portfolio.
Return JSON: [{ name, category, confidence }]
`

// Output ejemplo:
[
  { name: "React", category: "Frameworks", confidence: 0.95 },
  { name: "TypeScript", category: "Languages", confidence: 0.92 },
  { name: "Node.js", category: "Runtime", confidence: 0.88 }
]

// UI: "We detected these skills from your GitHub:"
// [✓ React] [✓ TypeScript] [✓ Node.js] [Add selected]
```

#### Professional Mode (desde texto libre)
```typescript
// User escribe bio o agrega experiencia
const bio = "I'm a wedding photographer specializing in candid moments..."

const prompt = `
Based on this bio, suggest 5-8 relevant professional skills:
"${bio}"

Categories might include: Photography Genres, Equipment, Software, Business Skills
Return JSON: [{ name, category }]
`

// Output:
[
  { name: "Wedding Photography", category: "Genres" },
  { name: "Portrait Photography", category: "Genres" },
  { name: "Adobe Lightroom", category: "Software" },
  { name: "Photo Editing", category: "Skills" }
]
```

**Effort:** 2-3 días
**Impact:** 🟢 Alto - reduce fricción inicial

---

### 2. **Auto-Generate Bio/About** ⭐⭐⭐

**Para quién:** Professional Mode mainly (Gaming puede tenerlo también)
**Cuándo:** Onboarding, settings page

```typescript
// User input mínimo
const userInput = {
  role: "Photographer",
  specialization: "Weddings",
  experience: "5 years",
  location: "Buenos Aires",
  style: "candid, editorial",
  additionalInfo: "I love capturing love stories"
}

const prompt = `
Write a professional bio (2-3 sentences) for a portfolio "About" section.

Role: ${userInput.role}
Specialization: ${userInput.specialization}
Experience: ${userInput.experience}
Location: ${userInput.location}
Style: ${userInput.style}
Additional: ${userInput.additionalInfo}

Tone: Professional but warm, authentic, first-person.
Length: 50-80 words.
`

// Output:
"I'm a wedding photographer based in Buenos Aires with 5 years of
experience capturing love stories. My style blends candid moments
with editorial elegance, creating timeless images that reflect the
authentic emotions of your special day."

// UI:
// [Generated Bio] [✏️ Edit] [Regenerate] [Use this]
```

**Variantes:**
- Gaming Mode: "I'm a Full Stack Developer with 3 years building web apps..."
- Permite edición manual post-generación
- Botón "Make it more [casual/professional/creative]"

**Effort:** 1-2 días
**Impact:** 🟢 Alto - muchos users struggle con escribir sobre sí mismos

---

### 3. **Project Description Generator** ⭐⭐

**Para quién:** Ambos modos
**Cuándo:** Al agregar proyecto nuevo

#### Gaming Mode (desde repo GitHub)
```typescript
// User conecta GitHub repo
const repoUrl = "github.com/user/my-saas-app"

// Fetch repo data
const repoData = {
  name: "my-saas-app",
  description: "A task management SaaS",
  readme: "...", // first 500 chars
  languages: { TypeScript: 75%, CSS: 15%, JavaScript: 10% },
  topics: ["react", "nextjs", "tailwind"]
}

const prompt = `
Write a compelling project description (2-3 sentences) for a developer portfolio.

Project: ${repoData.name}
GitHub description: ${repoData.description}
README preview: ${repoData.readme}
Tech stack: ${Object.keys(repoData.languages).join(', ')}
Topics: ${repoData.topics.join(', ')}

Tone: Professional, highlight technical achievements and impact.
`

// Output:
"A modern task management SaaS built with Next.js, TypeScript, and
Tailwind CSS. Features include real-time collaboration, custom
workflows, and team analytics. Designed for scalability with a
focus on developer experience."
```

#### Professional Mode (desde datos básicos)
```typescript
// User input
const projectInput = {
  type: "Wedding Photography",
  client: "Maria & John",
  date: "June 2025",
  location: "Mendoza vineyards",
  highlights: "outdoor ceremony, golden hour portraits",
  images: 45 // uploaded
}

const prompt = `
Write a project description (2-3 sentences) for a photographer's portfolio.

Project type: ${projectInput.type}
Client: ${projectInput.client}
Date: ${projectInput.date}
Location: ${projectInput.location}
Highlights: ${projectInput.highlights}

Tone: Warm, storytelling, emphasize atmosphere and moments.
`

// Output:
"A romantic vineyard wedding in Mendoza capturing Maria and John's
special day. Golden hour portraits among the grapevines created a
magical atmosphere, while candid moments during the outdoor ceremony
told their authentic love story."
```

**Effort:** 2-3 días
**Impact:** 🟡 Medio - nice to have, no crítico

---

### 4. **Portfolio Review / Health Check** ⭐⭐⭐

**Para quién:** Ambos modos
**Cuándo:** Dashboard widget, weekly email

```typescript
// Analizar portfolio completo del user
const portfolioData = {
  hasProfileImage: true,
  hasBio: false, // ❌
  skills: 3, // ⚠️ under 5
  projects: 1, // ⚠️ under 3
  experiences: 2,
  githubConnected: true, // Gaming Mode
  portfolioPublished: false,
  sections: { about: true, skills: true, projects: true }
}

const prompt = `
Analyze this portfolio and provide 3-5 actionable suggestions to improve it.

Data: ${JSON.stringify(portfolioData)}

Return JSON with suggestions, each with:
- issue: brief description
- priority: "high" | "medium" | "low"
- action: what to do
- impact: why it matters
`

// Output:
[
  {
    issue: "Missing bio/about section",
    priority: "high",
    action: "Write a 2-3 sentence bio about yourself",
    impact: "Visitors want to know who you are. A bio increases engagement by 40%."
  },
  {
    issue: "Only 1 project listed",
    priority: "high",
    action: "Add at least 2 more projects to showcase your range",
    impact: "Portfolios with 3+ projects get 3x more profile views."
  },
  {
    issue: "Only 3 skills added",
    priority: "medium",
    action: "Add 2-5 more skills to highlight your expertise",
    impact: "More skills improve discoverability in searches."
  }
]

// UI en Dashboard:
┌────────────────────────────────────┐
│ 🔍 Portfolio Health: 65%          │
├────────────────────────────────────┤
│ Top suggestions:                   │
│ 🔴 Add a bio (2 min)               │
│ 🔴 Add 2 more projects (10 min)    │
│ 🟡 Add more skills (5 min)         │
│                                    │
│ [Improve Now]                      │
└────────────────────────────────────┘
```

**Effort:** 3-4 días
**Impact:** 🟢 Alto - motivates users to complete portfolio

---

### 5. **Career Path Matcher** (Onboarding) ⭐⭐

**Para quién:** Onboarding (ayuda a elegir Gaming vs Professional)
**Cuándo:** Paso 1 del onboarding

```typescript
// User describe lo que hace
const userInput = {
  freeform: "I build websites and mobile apps using React and Node",
  interests: ["coding", "design", "open source"],
  socialLinks: ["github.com/johndoe"]
}

const prompt = `
Based on this information, determine if this user should use:
1. Gaming Mode (for developers with GitHub activity)
2. Professional Mode (for other professionals)

User input:
Description: ${userInput.freeform}
Interests: ${userInput.interests.join(', ')}
Social links: ${userInput.socialLinks.join(', ')}

Return JSON: {
  recommendedMode: "gaming" | "professional",
  confidence: 0-1,
  reasoning: "brief explanation"
}
`

// Output:
{
  recommendedMode: "gaming",
  confidence: 0.95,
  reasoning: "User builds apps with React/Node and has a GitHub profile. Gaming Mode will showcase their code contributions and tech stack."
}

// UI:
┌────────────────────────────────────┐
│ Based on your info, we recommend:  │
│                                    │
│     🎮 GAMING MODE                 │
│                                    │
│ Why: You're a developer with       │
│ GitHub activity. Gaming Mode will  │
│ showcase your code and skills.     │
│                                    │
│ [Use Gaming Mode] [Choose Manual]  │
└────────────────────────────────────┘
```

**Effort:** 2 días
**Impact:** 🟡 Medio - nice onboarding UX

---

### 6. **Smart Skill Level Assessment** (Gaming Mode) ⭐⭐

**Para quién:** Gaming Mode
**Cuándo:** Al validar skill con GitHub

```typescript
// User agrega skill "React"
// Analizamos GitHub activity

const githubData = {
  reactRepos: 12,
  totalCommitsInReact: 847,
  yearsUsingReact: 3.2,
  starsOnReactProjects: 234,
  contributionsToReactEcosystem: 5 // open source
}

const prompt = `
Based on GitHub activity, suggest a skill level for React:

Data:
- Repos using React: ${githubData.reactRepos}
- Total commits: ${githubData.totalCommitsInReact}
- Years of use: ${githubData.yearsUsingReact}
- Stars received: ${githubData.starsOnReactProjects}
- Contributions to ecosystem: ${githubData.contributionsToReactEcosystem}

Return JSON: {
  suggestedLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  confidence: 0-1,
  reasoning: "brief explanation"
}
`

// Output:
{
  suggestedLevel: "ADVANCED",
  confidence: 0.88,
  reasoning: "850+ commits across 12 repos over 3 years, plus contributions to the React ecosystem, indicates advanced proficiency."
}

// UI:
"Based on your GitHub activity, we suggest: Advanced
(850+ commits in React over 3 years)"
[✓ Use this] [Change to Intermediate] [Change to Beginner]
```

**Effort:** 3 días (requiere GitHub analysis)
**Impact:** 🟡 Medio - mejora credibilidad vs solo self-assessment

---

### 7. **Achievement/Badge Copy Generator** ⭐

**Para quién:** Gaming Mode
**Cuándo:** Al desbloquear achievement

```typescript
// User desbloqueó un achievement
const achievement = {
  type: "first_5_skills",
  context: { skills: ["React", "TypeScript", "Node.js", "Docker", "Git"] }
}

const prompt = `
Write a fun, encouraging achievement notification (1 sentence) for:

Achievement: Added first 5 skills
Skills: ${achievement.context.skills.join(', ')}

Tone: Playful, gaming-inspired, motivational
`

// Output:
"🎉 Skill Collector unlocked! Your tech stack is taking shape with React, TypeScript, and more!"

// vs genérico:
"Achievement unlocked: First 5 Skills"
```

**Effort:** 1 día
**Impact:** 🔴 Bajo - polish, no crítico

---

### 8. **SEO Meta Description Generator** ⭐⭐

**Para quién:** Ambos modos
**Cuándo:** Al publicar portfolio

```typescript
// Auto-generate meta description para SEO
const userData = {
  name: "John Doe",
  role: "Full Stack Developer",
  skills: ["React", "Node.js", "TypeScript"],
  location: "Buenos Aires",
  projects: 5
}

const prompt = `
Write an SEO-optimized meta description (150-160 characters) for a portfolio.

Name: ${userData.name}
Role: ${userData.role}
Top skills: ${userData.skills.slice(0, 3).join(', ')}
Location: ${userData.location}

Include role, skills, and location naturally.
`

// Output:
"John Doe - Full Stack Developer specializing in React, Node.js, and TypeScript. Based in Buenos Aires. View projects and get in touch."

// Se usa en:
<meta name="description" content="..." />
```

**Effort:** 1 día
**Impact:** 🟡 Medio - SEO improvement

---

## ❌ Use Cases NO Recomendados

### 1. **Auto-generate entire portfolios**
- ❌ Pierde autenticidad
- ❌ Los portfolios se ven todos iguales
- ❌ No refleja la personalidad del user

### 2. **Auto-generate skill ratings sin validación**
- ❌ Puede ser inexacto
- ❌ User pierde control

### 3. **Contenido creativo automatizado (fotos, diseños)**
- ❌ No aplica para portfolio (es trabajo del user)

### 4. **Chat support bot**
- ❌ Over-engineering para MVP
- ❌ Mejor tener good documentation

---

## 🏗️ Implementation Strategy

### Phase 1: Quick Wins (Sprint 1-2)
- ✅ Auto-suggest skills (GitHub + text analysis)
- ✅ Bio generator
- ✅ Portfolio health check

### Phase 2: Enhanced (Sprint 3-4)
- ✅ Project description generator
- ✅ Skill level assessment (GitHub)
- ✅ Career path matcher

### Phase 3: Polish (Post-MVP)
- ✅ SEO meta generator
- ✅ Achievement copy generator

---

## 🔧 Technical Implementation

### Claude API Setup

```typescript
// lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateContent(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return message.content[0].text
}

// Para JSON output
export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  const response = await generateContent(
    prompt + '\n\nReturn valid JSON only, no markdown.',
    systemPrompt
  )

  return JSON.parse(response)
}
```

### Service Layer Examples

```typescript
// features/ai/services/bio-generator.service.ts
export async function generateBio(input: {
  role: string
  specialization?: string
  experience?: string
  location?: string
  style?: string
  additionalInfo?: string
}): Promise<string> {
  const prompt = `
Write a professional bio (2-3 sentences) for a portfolio "About" section.

Role: ${input.role}
${input.specialization ? `Specialization: ${input.specialization}` : ''}
${input.experience ? `Experience: ${input.experience}` : ''}
${input.location ? `Location: ${input.location}` : ''}
${input.style ? `Style: ${input.style}` : ''}
${input.additionalInfo ? `Additional: ${input.additionalInfo}` : ''}

Tone: Professional but warm, authentic, first-person.
Length: 50-80 words.
`

  return generateContent(prompt)
}

// features/ai/services/skill-suggester.service.ts
export async function suggestSkillsFromGitHub(
  githubUsername: string
): Promise<Array<{ name: string; category: string; confidence: number }>> {
  // 1. Fetch GitHub data
  const repos = await fetchGitHubRepos(githubUsername)
  const languages = await analyzeLanguages(repos)

  // 2. Call AI
  const prompt = `
Given these GitHub repos and languages used:
${JSON.stringify({ repos: repos.length, languages })}

Suggest top 10 technical skills this developer should add to their portfolio.
Return JSON: [{ name, category, confidence }]
`

  return generateJSON(prompt)
}

// features/ai/services/portfolio-reviewer.service.ts
export async function reviewPortfolio(
  userId: string
): Promise<Array<PortfolioSuggestion>> {
  const portfolioData = await getPortfolioData(userId)

  const prompt = `
Analyze this portfolio and provide 3-5 actionable suggestions to improve it.

Data: ${JSON.stringify(portfolioData)}

Return JSON array with suggestions, each with:
- issue: brief description
- priority: "high" | "medium" | "low"
- action: what to do
- impact: why it matters
`

  return generateJSON(prompt)
}
```

### Rate Limiting & Caching

```typescript
// lib/ai/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour per user
})

export async function checkRateLimit(userId: string): Promise<boolean> {
  const { success } = await ratelimit.limit(userId)
  return success
}

// Cache results para evitar llamadas repetidas
// features/ai/utils/cache.ts
const AI_CACHE_TTL = 60 * 60 * 24 // 24 hours

export async function getCachedOrGenerate<T>(
  key: string,
  generator: () => Promise<T>
): Promise<T> {
  // Check cache
  const cached = await redis.get(key)
  if (cached) return cached as T

  // Generate
  const result = await generator()

  // Cache
  await redis.set(key, result, { ex: AI_CACHE_TTL })

  return result
}
```

---

## 💰 Cost Estimation

### Claude API Pricing (as of 2026)
- Sonnet 4.5: ~$3 per 1M input tokens, ~$15 per 1M output tokens

### Usage Estimation
```typescript
// Promedio por user por mes:
- Bio generation: 1-2 calls (500 tokens) = $0.02
- Skill suggestions: 2-3 calls (800 tokens) = $0.03
- Portfolio review: 1 call/week (600 tokens) = $0.04/month
- Project descriptions: 3 calls (1000 tokens) = $0.05

Total per user/month: ~$0.14

For 1000 users: ~$140/month
For 10,000 users: ~$1,400/month
```

**Muy razonable.** AI costs no serán un blocker.

---

## 🎯 Success Metrics

### Engagement
- % de users que usan AI bio generator: Target >60%
- % de skills agregados via AI suggestions: Target >40%
- Avg time to complete profile (con AI vs sin AI): Target -30%

### Quality
- User satisfaction con AI-generated content: Target >4/5 stars
- % de contenido AI editado por user: Esperado ~70% (está bien, AI asiste)
- Portfolio completion rate (con AI features): Target +25%

---

## 📚 References & Inspiration

### Productos que usan AI well:
- **Notion AI** - Content generation, summarization
- **Grammarly** - Writing assistance
- **GitHub Copilot** - Code suggestions
- **Jasper** - Marketing copy generation

### Best Practices:
1. **Siempre mostrar que es AI-generated** (transparencia)
2. **Permitir edición fácil** (AI sugiere, user decide)
3. **Regenerate button** (si no gusta, probar otra vez)
4. **Keep it optional** (no forzar uso de AI)

---

## 🚀 Next Steps

1. **Validar que estas features agregan valor** (user interviews?)
2. **Priorizar top 3 para MVP** (mi sugerencia: bio, skills, portfolio review)
3. **Setup Claude API en proyecto**
4. **Implementar rate limiting desde día 1**
5. **A/B test con/sin AI features** (medir impact real)

---

**Nota final:** IA debe sentirse como un **asistente útil**, no un generador automático que reemplaza al usuario. El portfolio final debe reflejar la autenticidad de la persona.
