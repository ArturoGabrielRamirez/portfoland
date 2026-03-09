/**
 * CV Improvement Prompts
 *
 * The 6 curated AI prompts for CV analysis, adapted from CV_IMPROVEMENT_PROMPTS.md.
 * Each prompt is bilingual (es/en) and instructs the AI to return structured JSON
 * matching the CVAnalysisResult interface.
 */

import type { CVAnalysisType } from '../types/cv';

// =============================================================================
// Analysis Labels (bilingual display metadata)
// =============================================================================

interface AnalysisLabel {
  name: { en: string; es: string };
  description: { en: string; es: string };
  requiresJobDescription: boolean;
}

export const CV_ANALYSIS_LABELS: Record<CVAnalysisType, AnalysisLabel> = {
  reality_check: {
    name: { en: 'Reality Check', es: 'Reality Check del Reclutador' },
    description: {
      en: 'Honest recruiter-perspective analysis of why your CV may not be generating interviews.',
      es: 'Analisis honesto desde la perspectiva del reclutador sobre por que tu CV no genera entrevistas.',
    },
    requiresJobDescription: false,
  },
  ats_optimization: {
    name: { en: 'ATS Optimization', es: 'Optimizacion ATS' },
    description: {
      en: 'Rewrite CV to pass applicant tracking systems with natural keyword integration.',
      es: 'Reescribe el CV para pasar los sistemas de seguimiento con integracion natural de palabras clave.',
    },
    requiresJobDescription: true,
  },
  impact_improvement: {
    name: { en: 'Impact Improvement', es: 'Mejora de Impacto' },
    description: {
      en: 'Convert responsibility bullets into measurable achievements and results.',
      es: 'Convierte bullets de responsabilidades en logros medibles y resultados.',
    },
    requiresJobDescription: false,
  },
  keyword_gap: {
    name: { en: 'Keyword Gap Analysis', es: 'Analisis de Brechas de Keywords' },
    description: {
      en: 'Identify missing keywords and competencies compared to the job description.',
      es: 'Identifica palabras clave y competencias faltantes comparadas con la descripcion del puesto.',
    },
    requiresJobDescription: true,
  },
  weakness_detection: {
    name: { en: 'Weakness Detection', es: 'Deteccion de Debilidades' },
    description: {
      en: 'Identify employment gaps, red flags, inconsistencies, and areas of concern.',
      es: 'Identifica vacios laborales, red flags, inconsistencias y areas de preocupacion.',
    },
    requiresJobDescription: false,
  },
  differentiation: {
    name: { en: 'Competitive Differentiation', es: 'Diferenciacion Competitiva' },
    description: {
      en: 'Identify your unique competitive advantage and rewrite your professional profile.',
      es: 'Identifica tu ventaja competitiva unica y reescribe tu perfil profesional.',
    },
    requiresJobDescription: false,
  },
};

// =============================================================================
// JSON Output Instructions (shared across all prompts)
// =============================================================================

function jsonOutputInstructions(type: CVAnalysisType, locale: string): string {
  const lang = locale === 'es' ? 'es' : 'en';

  if (lang === 'es') {
    return `
IMPORTANTE: Responde UNICAMENTE con un objeto JSON valido con esta estructura exacta:
{
  "type": "${type}",
  "score": <numero 0-100 si aplica, o null>,
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "issue": "<descripcion del problema>",
      "impact": "<por que es un problema>",
      "fix": "<solucion concreta>"
    }
  ],
  "keywords": [
    {
      "keyword": "<palabra clave>",
      "found": <true|false>,
      "priority": "high" | "medium" | "low"
    }
  ]
}
No incluyas texto fuera del JSON. No uses markdown. Solo JSON puro.`;
  }

  return `
IMPORTANT: Respond ONLY with a valid JSON object with this exact structure:
{
  "type": "${type}",
  "score": <number 0-100 if applicable, or null>,
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "issue": "<description of the issue>",
      "impact": "<why this is a problem>",
      "fix": "<concrete solution>"
    }
  ],
  "keywords": [
    {
      "keyword": "<keyword>",
      "found": <true|false>,
      "priority": "high" | "medium" | "low"
    }
  ]
}
Do not include text outside of the JSON. Do not use markdown. Only pure JSON.`;
}

// =============================================================================
// Prompt Functions
// =============================================================================

/**
 * Reality Check: Honest recruiter-perspective CV analysis
 */
export function realityCheckPrompt(
  cvText: string,
  locale: string,
  _jobDescription?: string,
  targetJob?: string
): string {
  if (locale === 'es') {
    return `Actua como un reclutador senior evaluando CVs${targetJob ? ` para el puesto de ${targetJob}` : ''}. Analiza este curriculum y dime exactamente por que no esta generando entrevistas. Senala secciones debiles, posicionamiento poco claro, senales faltantes y cualquier elemento que reduzca credibilidad.

Identifica 5-8 problemas especificos. Para cada uno explica por que es un red flag, asigna prioridad (critical/warning/info) y sugiere un fix concreto.

CV:
${cvText}

${jsonOutputInstructions('reality_check', locale)}`;
  }

  return `Act as a senior recruiter evaluating CVs${targetJob ? ` for the position of ${targetJob}` : ''}. Analyze this resume and tell me exactly why it is not generating interviews. Point out weak sections, unclear positioning, missing signals, and anything that reduces credibility.

Identify 5-8 specific problems. For each one, explain why it is a red flag, assign priority (critical/warning/info), and suggest a concrete fix.

CV:
${cvText}

${jsonOutputInstructions('reality_check', locale)}`;
}

/**
 * ATS Optimization: Keyword integration and format optimization
 * Requires jobDescription.
 */
export function atsOptimizationPrompt(
  cvText: string,
  locale: string,
  jobDescription?: string,
  targetJob?: string
): string {
  if (!jobDescription) {
    throw new Error('ATS Optimization requires a job description');
  }

  if (locale === 'es') {
    return `Reescribe este CV para que pase los sistemas de seguimiento de candidatos (ATS)${targetJob ? ` para el puesto de ${targetJob}` : ''}. Integra palabras clave relevantes de la descripcion del puesto de forma natural, mejora la claridad del formato y asegurate de que cumpla con los filtros comunes sin hacer keyword stuffing.

Calcula un porcentaje de match con la descripcion del puesto. Lista las keywords agregadas.

CV:
${cvText}

Descripcion del puesto:
${jobDescription}

${jsonOutputInstructions('ats_optimization', locale)}`;
  }

  return `Rewrite this CV to pass applicant tracking systems (ATS)${targetJob ? ` for the position of ${targetJob}` : ''}. Integrate relevant keywords from the job description naturally, improve format clarity, and ensure it passes common filters without keyword stuffing.

Calculate a match percentage with the job description. List the added keywords.

CV:
${cvText}

Job Description:
${jobDescription}

${jsonOutputInstructions('ats_optimization', locale)}`;
}

/**
 * Impact Improvement: Convert responsibilities to measurable achievements
 */
export function impactImprovementPrompt(
  cvText: string,
  locale: string,
  _jobDescription?: string,
  _targetJob?: string
): string {
  if (locale === 'es') {
    return `Reescribe los bullets de este CV para enfocarlos en logros medibles en lugar de responsabilidades. Sustituye frases vagas por impacto claro, resultados y valor generado, manteniendo todo veridico.

Usa la formula: [Accion] + [Contexto] + [Resultado medible] + [Impacto]

Para cada bullet debil que encuentres, crea un issue con severity, el texto original como "issue", por que es debil como "impact", y la version mejorada como "fix".

CV:
${cvText}

${jsonOutputInstructions('impact_improvement', locale)}`;
  }

  return `Rewrite the bullets in this CV to focus on measurable achievements instead of responsibilities. Replace vague phrases with clear impact, results, and generated value, keeping everything truthful.

Use the formula: [Action] + [Context] + [Measurable Result] + [Impact]

For each weak bullet you find, create an issue with severity, the original text as "issue", why it is weak as "impact", and the improved version as "fix".

CV:
${cvText}

${jsonOutputInstructions('impact_improvement', locale)}`;
}

/**
 * Keyword Gap Analysis: Compare CV vs job description
 * Requires jobDescription.
 */
export function keywordGapPrompt(
  cvText: string,
  locale: string,
  jobDescription?: string,
  _targetJob?: string
): string {
  if (!jobDescription) {
    throw new Error('Keyword Gap Analysis requires a job description');
  }

  if (locale === 'es') {
    return `Compara este CV con la descripcion del puesto e identifica palabras clave o competencias faltantes importantes para el rol. Para cada keyword faltante, sugiere donde y como integrarla de forma natural.

Calcula un score de match (0-100). Incluye la lista de keywords con su prioridad y si fueron encontradas o no.

CV:
${cvText}

Descripcion del puesto:
${jobDescription}

${jsonOutputInstructions('keyword_gap', locale)}`;
  }

  return `Compare this CV with the job description and identify missing keywords or competencies important for the role. For each missing keyword, suggest where and how to integrate it naturally.

Calculate a match score (0-100). Include the keyword list with priority and whether each was found or not.

CV:
${cvText}

Job Description:
${jobDescription}

${jsonOutputInstructions('keyword_gap', locale)}`;
}

/**
 * Weakness Detection: Employment gaps, red flags, inconsistencies
 */
export function weaknessDetectionPrompt(
  cvText: string,
  locale: string,
  _jobDescription?: string,
  _targetJob?: string
): string {
  if (locale === 'es') {
    return `Identifica vacios laborales, inconsistencias, transiciones profesionales poco claras o posibles senales de alerta en este CV. Busca especificamente:

- Vacios de empleo (>6 meses)
- Job hopping (muchos cambios en poco tiempo)
- Fechas inconsistentes
- Titulos vagos
- Falta de progresion profesional
- Habilidades obsoletas
- Informacion de contacto faltante
- Objetivos genericos

Para cada problema, explica el impacto y sugiere un fix concreto.

CV:
${cvText}

${jsonOutputInstructions('weakness_detection', locale)}`;
  }

  return `Identify employment gaps, inconsistencies, unclear career transitions, or potential red flags in this CV. Specifically look for:

- Employment gaps (>6 months)
- Job hopping (many changes in short time)
- Inconsistent dates
- Vague job titles
- Lack of career progression
- Outdated skills
- Missing contact information
- Generic objectives

For each issue, explain the impact and suggest a concrete fix.

CV:
${cvText}

${jsonOutputInstructions('weakness_detection', locale)}`;
}

/**
 * Competitive Differentiation: Unique value proposition
 */
export function differentiationPrompt(
  cvText: string,
  locale: string,
  _jobDescription?: string,
  targetJob?: string
): string {
  if (locale === 'es') {
    return `Ayudame a identificar que diferencia a este candidato de otros${targetJob ? ` para el puesto de ${targetJob}` : ''}. Analiza la combinacion unica de habilidades, experiencias y proyectos. Reformula el perfil profesional para destacar esa ventaja competitiva de manera clara y convincente.

Busca combinaciones raras de habilidades, experiencia de dominio especifica, logros de escala, contribuciones open source, o cualquier elemento diferenciador.

Para cada oportunidad de diferenciacion, crea un issue con el texto actual como "issue", por que no destaca como "impact", y la version mejorada como "fix".

CV:
${cvText}

${jsonOutputInstructions('differentiation', locale)}`;
  }

  return `Help me identify what differentiates this candidate from others${targetJob ? ` for the position of ${targetJob}` : ''}. Analyze the unique combination of skills, experiences, and projects. Rewrite the professional profile to highlight that competitive advantage clearly and convincingly.

Look for rare skill combinations, specific domain expertise, scale achievements, open source contributions, or any differentiating element.

For each differentiation opportunity, create an issue with the current text as "issue", why it doesn't stand out as "impact", and the improved version as "fix".

CV:
${cvText}

${jsonOutputInstructions('differentiation', locale)}`;
}

// =============================================================================
// Prompt Registry & Helper
// =============================================================================

const PROMPT_REGISTRY: Record<
  CVAnalysisType,
  (cvText: string, locale: string, jobDescription?: string, targetJob?: string) => string
> = {
  reality_check: realityCheckPrompt,
  ats_optimization: atsOptimizationPrompt,
  impact_improvement: impactImprovementPrompt,
  keyword_gap: keywordGapPrompt,
  weakness_detection: weaknessDetectionPrompt,
  differentiation: differentiationPrompt,
};

/**
 * Get the analysis prompt for a given type
 *
 * @param type - The analysis type
 * @param cvText - The CV text to analyze
 * @param locale - The locale (en/es)
 * @param jobDescription - Optional job description (required for ats_optimization and keyword_gap)
 * @param targetJob - Optional target job title
 * @returns The formatted prompt string
 * @throws Error if jobDescription is required but not provided
 */
export function getAnalysisPrompt(
  type: CVAnalysisType,
  cvText: string,
  locale: string,
  jobDescription?: string,
  targetJob?: string
): string {
  const promptFn = PROMPT_REGISTRY[type];

  return promptFn(cvText, locale, jobDescription, targetJob);
}
