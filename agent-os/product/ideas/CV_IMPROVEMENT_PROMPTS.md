# CV Improvement Prompts - AI-Powered Resume Optimization

**Fecha:** 2026-02-17
**Estado:** Prompts currados para implementación futura
**Feature relacionado:** CV Dinámico (Phase 4, Prioridad #1)

---

## 🎯 Por Qué Estos Prompts Son Valiosos

Estos prompts están **ultra-específicos** y cubren los aspectos críticos que diferencian un CV mediocre de uno que genera entrevistas:

1. **ATS Optimization** - Pasar filtros automáticos (crítico, ~75% de empresas usan ATS)
2. **Impact vs Responsibilities** - Mostrar valor, no solo tareas
3. **Keyword Gap Analysis** - Match con job description
4. **Weakness Detection** - Eliminar red flags antes de enviar
5. **Competitive Differentiation** - Destacar ventaja única
6. **Recruiter Reality Check** - Ver CV con ojos de reclutador

**Diferencia clave:** No son genéricos ("mejora mi CV"), sino **tácticos y accionables**.

---

## 📋 Prompts de CV Improvement

### 1️⃣ **Reality Check del Reclutador** (Evaluación Honesta)

**Propósito:** Análisis brutal de por qué el CV no está funcionando

**Prompt:**
```
Actúa como un reclutador senior evaluando CVs para mi puesto objetivo. Analiza mi currículum y dime exactamente por qué no está generando entrevistas. Señala secciones débiles, posicionamiento poco claro, señales faltantes y cualquier elemento que reduzca credibilidad.

CV: [pega aquí].
Puesto objetivo: [cargo].
```

**Output esperado:**
- Lista de 5-8 problemas específicos
- Por qué cada uno es un red flag
- Priorización (crítico/medio/menor)
- Sugerencias de fix concretas

**Uso en Portfoland:**
- Dashboard widget: "🔍 CV Health Check"
- Botón: "Why am I not getting interviews?"
- Modal con feedback estructurado

---

### 2️⃣ **Optimización para ATS** (Keyword + Format)

**Propósito:** Pasar sistemas de tracking automáticos (ATS = Applicant Tracking System)

**Prompt:**
```
Reescribe mi CV para que pase los sistemas de seguimiento de candidatos (ATS) para el puesto [cargo]. Integra palabras clave relevantes de forma natural, mejora la claridad del formato y asegúrate de que cumpla con los filtros comunes sin hacer keyword stuffing.

CV: [pega aquí].
Descripción del puesto: [pega aquí].
```

**Output esperado:**
- CV reescrito con keywords integradas
- % de match con job description
- Lista de keywords agregadas
- Formato ATS-friendly (sin tablas, sin columnas)

**Uso en Portfoland:**
- Feature: "Optimize for ATS"
- Input: Job description URL o texto
- Output: CV optimizado + score de match

**Contexto técnico:**
- ~75% de empresas usan ATS (Taleo, Greenhouse, Lever, Workday)
- Filtran por keywords antes de que humano vea CV
- **Critical feature** para Professional Mode

---

### 3️⃣ **Mejora de Impacto y Resultados** (Logros > Responsabilidades)

**Propósito:** Convertir bullets débiles en logros medibles

**Prompt:**
```
Reescribe los bullets de mi CV para enfocarlos en logros medibles en lugar de responsabilidades. Sustituye frases vagas por impacto claro, resultados y valor generado, manteniendo todo verídico.

CV: [pega aquí].
```

**Ejemplos de transformación:**
```
❌ Antes: "Responsable de gestionar equipo de desarrollo"
✅ Después: "Lideré equipo de 5 devs, reduciendo bugs en producción 40% en 6 meses"

❌ Antes: "Trabajé en optimización de performance"
✅ Después: "Optimicé queries SQL, reduciendo tiempo de carga de 8s a 1.2s (+600% velocidad)"

❌ Antes: "Implementé nuevas features"
✅ Después: "Lancé 3 features clave que aumentaron conversión 23% y generaron $50k MRR"
```

**Formula mágica:** `[Acción] + [Contexto] + [Resultado medible] + [Impacto]`

**Uso en Portfoland:**
- Botón: "Make my bullets impactful"
- IA analiza cada bullet, sugiere rewrite
- User acepta/rechaza/edita

---

### 4️⃣ **Detector de Brechas de Palabras Clave** (Gap Analysis)

**Propósito:** Identificar skills/keywords faltantes vs job description

**Prompt:**
```
Compara mi CV con esta descripción de puesto e identifica palabras clave o competencias faltantes importantes para el rol. Reescribe secciones para cerrar esas brechas de forma natural.

CV: [pega aquí].
Descripción del puesto: [pega aquí].
```

**Output esperado:**
```json
{
  "matchScore": 72,
  "missingKeywords": [
    { "keyword": "Kubernetes", "priority": "high", "reason": "Required skill, appears 3x in JD" },
    { "keyword": "CI/CD pipelines", "priority": "medium", "reason": "Nice-to-have, appears 1x" }
  ],
  "suggestions": [
    {
      "section": "Experience > Senior Dev",
      "original": "Deployed applications to cloud",
      "improved": "Deployed applications to AWS using Kubernetes and CI/CD pipelines (Jenkins)",
      "addedKeywords": ["Kubernetes", "CI/CD"]
    }
  ]
}
```

**Uso en Portfoland:**
- Input: Job description (URL o paste)
- Visual: Heatmap de keywords (verde = match, rojo = falta)
- Sugerencias de dónde agregar cada keyword

---

### 5️⃣ **Detector de Debilidades del CV** (Red Flags)

**Propósito:** Identificar vacíos, inconsistencias, señales de alerta

**Prompt:**
```
Identifica vacíos, inconsistencias, transiciones profesionales poco claras o posibles señales de alerta en mi CV. Sugiere mejoras precisas para eliminar dudas y aumentar la confianza del reclutador.

CV: [pega aquí].
```

**Red flags comunes:**
- **Employment gaps:** Períodos sin trabajar (>6 meses)
- **Job hopping:** Muchos cambios en poco tiempo (<1 año)
- **Inconsistent dates:** Formato irregular (2020-2021 vs Jan 2020 - Mar 2021)
- **Vague job titles:** "Developer" vs "Senior Frontend React Developer"
- **No progression:** Mismo nivel por años
- **Typos/grammar:** Errores ortográficos
- **Generic objectives:** "Seeking challenging position"
- **Outdated skills:** Flash, IE6, PHP 5
- **Contact info missing:** Email, LinkedIn

**Output:**
```json
{
  "critical": [
    {
      "issue": "Employment gap: Mar 2022 - Nov 2022 (8 months)",
      "impact": "Reclutadores asumirán desempleo o problema",
      "fix": "Agregar explicación: freelance, sabático, upskilling, etc."
    }
  ],
  "warnings": [
    {
      "issue": "Job hopping: 3 trabajos en 2 años",
      "impact": "Señal de inestabilidad",
      "fix": "Explicar razones de cambio (growth, layoffs, etc.)"
    }
  ]
}
```

**Uso en Portfoland:**
- Auto-run cuando user genera CV
- Badge: "🔴 3 critical issues" / "🟢 No red flags"
- Click para ver detalles + fixes

---

### 6️⃣ **Diferenciación Competitiva** (Ventaja Única)

**Propósito:** Destacar qué te hace único vs otros candidatos

**Prompt:**
```
Ayúdame a identificar qué me diferencia de otros candidatos para este puesto [cargo]. Reformula mi perfil profesional para destacar esa ventaja competitiva de manera clara y convincente.

CV: [pega aquí].
Puesto objetivo: [cargo].
```

**Ejemplos de ventajas competitivas:**
- **Technical + Design:** "Full-stack dev con background en UX design"
- **Domain expertise:** "React dev con 5 años en fintech (compliance, security)"
- **Rare combo:** "ML Engineer + Product Manager"
- **Scale experience:** "Built systems serving 10M+ users"
- **Open source:** "Core contributor to React ecosystem (15k+ stars)"
- **Teaching:** "Developer advocate con 50k+ YouTube subscribers"

**Output:**
```
Original:
"Soy un desarrollador Full Stack con experiencia en React y Node.js."

Mejorado:
"Full Stack Developer especializado en fintech, con 5 años construyendo sistemas de pagos que procesan $10M+ diarios. Combino expertise técnico (React, Node.js, Kubernetes) con profundo conocimiento de compliance bancario (PCI-DSS, SOC2), una combinación rara que acelera desarrollo seguro."
```

**Uso en Portfoland:**
- Widget: "What makes you unique?"
- IA analiza: skills + experiences + projects
- Genera unique value proposition (UVP)
- User puede refinar + agregar a CV header

---

## 🔧 **Implementación Técnica**

### Architecture Pattern

```typescript
// features/cv/services/cv-improvement.service.ts

export async function analyzeCV(
  cvText: string,
  jobDescription?: string,
  analysisType: CVAnalysisType
): Promise<CVAnalysisResult> {

  const prompts = {
    reality_check: REALITY_CHECK_PROMPT,
    ats_optimization: ATS_OPTIMIZATION_PROMPT,
    impact_improvement: IMPACT_IMPROVEMENT_PROMPT,
    keyword_gap: KEYWORD_GAP_PROMPT,
    weakness_detection: WEAKNESS_DETECTION_PROMPT,
    differentiation: DIFFERENTIATION_PROMPT
  }

  const prompt = prompts[analysisType]
  const systemPrompt = `You are an expert recruiter and CV consultant...`

  // Call Gemini 2.0 Flash
  const result = await generateJSON<CVAnalysisResult>(
    prompt.replace('[CV]', cvText).replace('[JD]', jobDescription || ''),
    systemPrompt
  )

  return result
}
```

### Cost Estimation

```typescript
// Promedio por análisis:
- CV length: ~500-800 palabras
- Job description: ~200-400 palabras
- Input tokens: ~1500
- Output tokens: ~800

Cost per analysis:
(1500 * $0.000003) + (800 * $0.000015) = ~$0.016

// User flow typical:
1. Reality Check: $0.016
2. ATS Optimization: $0.016
3. Impact Improvement: $0.016
Total per CV optimization: ~$0.05

// Para 1000 users optimizando 2 CVs/mes:
1000 * 2 * $0.05 = $100/mes

Muy razonable ✅
```

### Freemium Model

```typescript
const CV_FEATURES = {
  free: {
    analysisPerMonth: 1, // 1 CV analysis gratis
    features: ['reality_check', 'weakness_detection']
  },
  pro: {
    analysisPerMonth: 5,
    features: ['all'],
    price: '$9/month'
  },
  premium: {
    analysisPerMonth: 'unlimited',
    features: ['all', 'custom_templates', 'priority_support'],
    price: '$29/month'
  }
}
```

---

## 📊 **Priorización de Features**

| Feature | Complejidad | Impact | Timing | Costo/uso |
|---------|-------------|--------|--------|-----------|
| **Reality Check** | S | Alto | v1.5 | $0.016 |
| **Weakness Detection** | S | Alto | v1.5 | $0.016 |
| **Impact Improvement** | M | Muy Alto | v1.5 | $0.016 |
| **ATS Optimization** | M | Crítico | v1.6 | $0.016 |
| **Keyword Gap** | M | Alto | v1.6 | $0.016 |
| **Differentiation** | S | Medio | v1.7 | $0.016 |

**Fase 1 (v1.5):** Reality Check + Weakness Detection + Impact Improvement
**Fase 2 (v1.6):** ATS Optimization + Keyword Gap Analysis
**Fase 3 (v1.7):** Differentiation + Custom Templates

---

## 🎯 **UI/UX Flow**

### Dashboard Widget: CV Optimizer

```tsx
<CVOptimizerWidget>
  <Header>📄 CV Optimizer</Header>

  {!hasCV ? (
    <EmptyState>
      <Icon>📤</Icon>
      <Text>Upload your CV to get AI-powered feedback</Text>
      <UploadButton>Upload CV</UploadButton>
    </EmptyState>
  ) : (
    <CVAnalysis>
      <HealthScore score={78}>
        🟡 78/100 - Needs improvement
      </HealthScore>

      <QuickActions>
        <ActionCard
          icon="🔍"
          title="Reality Check"
          description="Why am I not getting interviews?"
          cost="1 credit"
          onClick={() => runAnalysis('reality_check')}
        />

        <ActionCard
          icon="🤖"
          title="ATS Optimization"
          description="Pass applicant tracking systems"
          cost="1 credit"
          onClick={() => runAnalysis('ats_optimization')}
        />

        <ActionCard
          icon="💪"
          title="Impact Improvement"
          description="Turn tasks into achievements"
          cost="1 credit"
          onClick={() => runAnalysis('impact_improvement')}
        />

        <ActionCard
          icon="🎯"
          title="Keyword Gap"
          description="Match job description"
          requiresJobDescription
          cost="1 credit"
          onClick={() => runAnalysis('keyword_gap')}
        />
      </QuickActions>

      <PreviousAnalyses>
        ✅ Weakness Detection - 2 days ago
        ✅ ATS Optimization - 1 week ago
      </PreviousAnalyses>
    </CVAnalysis>
  )}
</CVOptimizerWidget>
```

---

## 🔗 **Integración con Features Existentes**

### 1. Portfolio → CV Export

```typescript
// User puede generar CV desde su portfolio
const cv = await generateCVFromPortfolio(userId, {
  mode: 'professional', // vs 'gaming'
  sections: ['experience', 'education', 'skills', 'projects'],
  format: 'pdf' // vs 'docx', 'markdown'
})

// Luego puede optimizarlo con estos prompts
const analysis = await analyzeCV(cv.text, jobDescription, 'ats_optimization')
```

### 2. AI Narrator → CV Summary

```typescript
// El AI Narrator ya genera executive summary
// Puede reutilizarse como CV header/objective
const narrative = await getNarrative(username, locale)
// → "Full Stack Developer especializado en..."

// Agregar al CV como Professional Summary
```

### 3. Skills → CV Skills Section

```typescript
// Skills ya validadas (GitHub, assessments)
// Auto-populate CV con credibility scores
const skills = await getUserSkills(userId)
const cvSkills = skills
  .filter(s => s.credibilityScore > 1.2) // Solo validadas
  .sort((a, b) => b.level - a.level)
  .slice(0, 12) // Top 12 skills
```

---

## 💡 **Ventaja Competitiva**

**Nadie más tiene esto:**
- **LinkedIn:** No optimiza CVs, solo muestra perfil
- **Resume.io / Zety:** Templates bonitos, pero IA básica/genérica
- **ChatGPT:** User debe copiar/pegar manualmente, no integrado
- **Jobscan:** Solo ATS optimization, $50+/mes, no tiene portfolio integration

**Portfoland = Portfolio + CV + Validation + AI Optimization**

Todo en un lugar. 🎯

---

## 📝 **Next Steps**

1. ✅ Guardar estos prompts (este doc)
2. ⏳ Implementar CV generation desde portfolio (v1.5)
3. ⏳ Integrar prompts de analysis (v1.5-1.6)
4. ⏳ Setup freemium model con credits
5. ⏳ UI para CV upload + analysis
6. ⏳ PDF export con templates

---

**Conclusión:** Estos prompts son **fundamentales** para el feature "CV Dinámico". No son genéricos, están curados para maximizar probabilidad de entrevistas. Implementación estimada: 2-3 semanas para MVP.
