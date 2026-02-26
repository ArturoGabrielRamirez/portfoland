/**
 * Narrative Generation Service
 *
 * Business logic for generating AI-powered portfolio narratives.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { NarrativeUserData, NarrativeResult } from '../types/narrative';
import {
  getNarrativeData,
  getUserMetaForCache,
  getCachedNarrative,
  setNarrativeCache,
} from '../data';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Generate a narrative for a user's portfolio
 *
 * Checks cache first, generates new narrative if needed.
 *
 * @param username - The username to generate narrative for
 * @param mode - Narrative mode (default: 'tech')
 * @param locale - Locale code (default: 'en')
 * @returns Narrative result with text and cache status
 */
export async function generateNarrative(
  username: string,
  mode: string = 'tech',
  locale: string = 'en'
): Promise<NarrativeResult> {
  const effectiveMode = mode || 'tech';
  const effectiveLocale = locale || 'en';

  const userMeta = await getUserMetaForCache(username);

  if (!userMeta) {
    throw new Error('User not found');
  }

  const cached = getCachedNarrative(userMeta.meta, effectiveMode, effectiveLocale);

  if (cached) {
    console.log(
      `NARRATIVE_CACHE_HIT | User: ${username} | Mode: ${effectiveMode} | Locale: ${effectiveLocale}`
    );
    return {
      narrative: cached,
      cached: true,
    };
  }

  console.log(
    `NARRATIVE_GENERATE | User: ${username} | Mode: ${effectiveMode} | Locale: ${effectiveLocale}`
  );

  const userData = await getNarrativeData(username);

  if (!userData) {
    throw new Error('User data not found');
  }

  const prompt = buildUnifiedPrompt(userData, effectiveLocale);

  const result = await generateText({
    model: google('gemini-2.0-flash'),
    prompt,
    maxTokens: 600,
  });

  const narrative = result.text.trim();

  await setNarrativeCache(userMeta.id, narrative, effectiveMode, effectiveLocale);

  console.log(`NARRATIVE_CACHED | Length: ${narrative.length}`);

  return {
    narrative,
    cached: false,
  };
}

/**
 * Build the unified prompt for narrative generation
 */
function buildUnifiedPrompt(data: NarrativeUserData, locale: string): string {
  const skillsList = data.skills.slice(0, 8).map((s) => s.name).join(', ');
  const experienceCount = data.experiences.length;
  const projectCount = data.projects.length;

  const experienceDetails = data.experiences.slice(0, 3).map((exp) => {
    const duration = exp.endDate
      ? `${exp.startDate.getFullYear()}-${exp.endDate.getFullYear()}`
      : `${exp.startDate.getFullYear()}-Presente`;
    return `- ${exp.title} en ${exp.company} (${duration})`;
  }).join('\n');

  const projectDetails = data.projects.slice(0, 3).map((p) => {
    const techs = p.technologies.slice(0, 4).join(', ');
    return `- ${p.title}: ${p.description.substring(0, 120)}... (Tech: ${techs})`;
  }).join('\n');

  if (locale === 'es') {
    return `Eres un asistente AI que analiza trayectorias profesionales y redacta resúmenes ejecutivos para reclutadores.

DATOS PROFESIONALES DE ${data.name.toUpperCase()}:
- Bio escrita por el usuario: "${data.bio || 'No disponible'}"
- Competencias clave: ${skillsList}
- Experiencia laboral: ${experienceCount} posiciones
- Proyectos destacados: ${projectCount}

EXPERIENCIAS DETALLADAS:
${experienceDetails || 'Sin experiencias registradas'}

PROYECTOS DESTACADOS:
${projectDetails || 'Sin proyectos registrados'}

TAREA:
Escribe un resumen ejecutivo de 120-150 palabras que:
- CRÍTICO: NO copies ni repitas la bio textualmente. Analiza los DATOS (experiencias, proyectos, skills) y cuenta una historia cohesiva
- Identifica el hilo conductor de su carrera: ¿qué rol cumple? ¿en qué se especializa? ¿qué valor aporta?
- Menciona transiciones clave entre roles/empresas si las hay
- Destaca proyectos concretos y tecnologías que domina
- Enfócate en RESULTADOS y VALOR para empleadores
- Tono profesional, conciso, orientado a reclutadores técnicos
- Usa Markdown: **negrita** para roles, tecnologías y logros clave
- CRÍTICO: Responde SOLO en español

Devuelve SOLO el resumen ejecutivo, sin título ni introducción.`;
  }

  return `You are an AI assistant that analyzes professional trajectories and writes executive summaries for recruiters.

PROFESSIONAL DATA FOR ${data.name.toUpperCase()}:
- User-written bio: "${data.bio || 'Not available'}"
- Key competencies: ${skillsList}
- Work experience: ${experienceCount} positions
- Featured projects: ${projectCount}

DETAILED EXPERIENCES:
${experienceDetails || 'No registered experiences'}

FEATURED PROJECTS:
${projectDetails || 'No registered projects'}

TASK:
Write an executive summary of 120-150 words that:
- CRITICAL: DO NOT copy or repeat the bio verbatim. Analyze the DATA (experiences, projects, skills) and tell a cohesive story
- Identify the thread of their career: what role do they play? what do they specialize in? what value do they bring?
- Mention key transitions between roles/companies if any
- Highlight concrete projects and technologies they master
- Focus on RESULTS and VALUE for employers
- Professional, concise tone, oriented to technical recruiters
- Uses Markdown: **bold** for roles, technologies, and key achievements
- CRITICAL: Respond ONLY in English

Return ONLY the executive summary, no title or introduction.`;
}
