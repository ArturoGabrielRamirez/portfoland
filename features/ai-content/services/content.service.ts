/**
 * Improve Content Service
 *
 * Business logic for improving user content using AI.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { consumeLifeService } from '@/features/ai-quota';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import type { ImproveContentResult } from '../types/content';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Calculate total years of experience from user's work history
 */
export async function calculateExperienceYears(userId: string): Promise<number> {
  const experiences = await prisma.experience.findMany({
    where: {
      userId,
      type: 'WORK',
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  if (experiences.length > 0) {
    let totalYears = 0;

    for (const exp of experiences) {
      const start = exp.startDate;
      const end = exp.endDate || new Date();
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += years;
    }

    return Math.floor(totalYears);
  }

  const oldestSkill = await prisma.userSkill.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });

  if (oldestSkill) {
    const years = (new Date().getTime() - oldestSkill.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(years);
  }

  return 0;
}

/**
 * Build prompt for tech mode bio improvement
 */
function buildTechPrompt(bio: string, skills: string[], years: number, locale: string, notes?: string): string {
  const skillsList = skills.length > 0 ? skills.slice(0, 8).join(', ') : 'web development';
  const experienceText = years > 0 ? (locale === 'es' ? `${years}+ años de experiencia` : `${years}+ years of experience`) : '';
  const notesSection = notes ? (locale === 'es' ? `\n\nDetalles adicionales del usuario:\n"${notes}"` : `\n\nAdditional user details:\n"${notes}"`) : '';

  if (locale === 'es') {
    return `Eres un experto en optimización de portfolios para desarrolladores/creadores tech.

Mejora esta bio para que sea más impactante y atractiva:

"${bio}"${notesSection}

Guías:
- Usa voz activa y verbos de acción fuertes
- Destaca logros y propuesta de valor única
- Mantenlo entre 100-150 palabras (máximo 1000 caracteres)
- Usa lenguaje tech-friendly
- Hazlo memorable y auténtico
- Enfócate en lo que hace destacar a esta persona
- IMPORTANTE: Menciona estas tecnologías específicas del usuario: ${skillsList}
${experienceText ? `- IMPORTANTE: Menciona que tiene ${experienceText} verificados en su historial laboral` : ''}
${notes ? `- CRÍTICO: Incorpora estos detalles personales del usuario de forma natural en el bio` : ''}
- Usa Markdown para énfasis: **negrita** para términos clave, *cursiva* si necesario
- CRÍTICO: Responde SOLO en español

Devuelve SOLO la bio mejorada en texto plano, sin explicaciones ni formato adicional.`;
  }

  return `You are a portfolio optimization expert specializing in developer/creator profiles.

Improve this bio to be more impactful and engaging for a tech/creative professional:

"${bio}"${notesSection}

Guidelines:
- Use active voice and strong action verbs
- Highlight achievements and unique value proposition
- Keep it between 100-150 words (maximum 1000 characters)
- Use tech-friendly language
- Make it memorable and authentic
- Focus on what makes this person stand out
- IMPORTANT: Mention these specific user technologies: ${skillsList}
${experienceText ? `- IMPORTANT: Mention that they have ${experienceText} verified in their work history` : ''}
${notes ? `- CRITICAL: Naturally incorporate these personal details from the user into the bio` : ''}
- Use Markdown for emphasis: **bold** for key terms, *italic* if needed
- CRITICAL: Respond ONLY in English

Return ONLY the improved bio in plain text, no explanation or formatting.`;
}

/**
 * Build prompt for classic mode bio improvement
 */
function buildClassicPrompt(bio: string, skills: string[], years: number, locale: string, notes?: string): string {
  const skillsList = skills.length > 0 ? skills.slice(0, 8).join(', ') : 'professional skills';
  const experienceText = years > 0 ? (locale === 'es' ? `${years}+ años de experiencia` : `${years}+ years of experience`) : '';
  const notesSection = notes ? (locale === 'es' ? `\n\nDetalles adicionales del usuario:\n"${notes}"` : `\n\nAdditional user details:\n"${notes}"`) : '';

  if (locale === 'es') {
    return `Eres un escritor profesional de CVs y coach de carrera.

Mejora esta bio profesional para que sea más impactante y pulida:

"${bio}"${notesSection}

Guías:
- Usa lenguaje profesional y claro
- Enfatiza logros y expertise
- Mantenlo entre 100-150 palabras (máximo 1000 caracteres)
- Hazlo ATS-friendly
- Enfócate en valor y resultados
- Mantén tono formal pero accesible
- IMPORTANTE: Menciona estas habilidades específicas: ${skillsList}
${experienceText ? `- IMPORTANTE: Menciona que cuenta con ${experienceText} demostrados` : ''}
${notes ? `- CRÍTICO: Incorpora estos detalles personales del usuario de forma natural y profesional` : ''}
- Usa Markdown para énfasis: **negrita** para habilidades clave, *cursiva* si necesario
- CRÍTICO: Responde SOLO en español

Devuelve SOLO la bio mejorada en texto plano, sin explicaciones ni formato adicional.`;
  }

  return `You are a professional resume writer and career coach.

Improve this professional bio to be more impactful and polished:

"${bio}"${notesSection}

Guidelines:
- Use professional, clear language
- Emphasize accomplishments and expertise
- Keep it between 100-150 words (maximum 1000 characters)
- Make it ATS-friendly
- Focus on value and results
- Maintain formal but approachable tone
- IMPORTANT: Mention these specific skills: ${skillsList}
${experienceText ? `- IMPORTANT: Mention that they have ${experienceText} of proven experience` : ''}
${notes ? `- CRITICAL: Naturally incorporate these personal details from the user in a professional manner` : ''}
- Use Markdown for emphasis: **bold** for key skills, *italic* if needed
- CRITICAL: Respond ONLY in English

Return ONLY the improved bio in plain text, no explanation or formatting.`;
}

/**
 * Build prompt for project description improvement
 */
function buildProjectPrompt(description: string, skills: string[], locale: string, notes?: string): string {
  const skillsList = skills.length > 0 ? skills.slice(0, 5).join(', ') : 'relevant technologies';
  const notesSection = notes ? (locale === 'es' ? `\n\nDetalles adicionales:\n"${notes}"` : `\n\nAdditional details:\n"${notes}"`) : '';

  if (locale === 'es') {
    return `Eres un experto en redacción de portfolios técnicos y casos de estudio.

Mejora esta descripción de proyecto para que sea más impactante y profesional:

"${description}"${notesSection}

Guías:
- Enfócate en el **impacto** y **resultados** del proyecto
- Menciona desafíos superados y soluciones implementadas
- Destaca tecnologías usadas: ${skillsList}
- Usa voz activa y verbos de acción
- Mantenlo entre 80-120 palabras (máximo 800 caracteres)
${notes ? `- IMPORTANTE: Incorpora los detalles adicionales de forma natural` : ''}
- Usa Markdown: **negrita** para tecnologías/logros clave
- CRÍTICO: Responde SOLO en español

Devuelve SOLO la descripción mejorada, sin explicaciones.`;
  }

  return `You are an expert in technical portfolio writing and case studies.

Improve this project description to be more impactful and professional:

"${description}"${notesSection}

Guidelines:
- Focus on **impact** and **results** of the project
- Mention challenges overcome and solutions implemented
- Highlight technologies used: ${skillsList}
- Use active voice and action verbs
- Keep it between 80-120 words (maximum 800 characters)
${notes ? `- IMPORTANT: Naturally incorporate the additional details` : ''}
- Use Markdown: **bold** for key technologies/achievements
- CRITICAL: Respond ONLY in English

Return ONLY the improved description, no explanation.`;
}

/**
 * Build prompt for experience description improvement
 */
function buildExperiencePrompt(description: string, skills: string[], locale: string, notes?: string): string {
  const skillsList = skills.length > 0 ? skills.slice(0, 5).join(', ') : 'relevant skills';
  const notesSection = notes ? (locale === 'es' ? `\n\nDetalles adicionales:\n"${notes}"` : `\n\nAdditional details:\n"${notes}"`) : '';

  if (locale === 'es') {
    return `Eres un experto en redacción de CVs y experiencia profesional.

Mejora esta descripción de experiencia laboral:

"${description}"${notesSection}

Guías:
- Enfócate en **responsabilidades** y **logros cuantificables**
- Usa formato de bullets mentales (sin viñetas literales)
- Menciona habilidades aplicadas: ${skillsList}
- Mantén tono profesional y ATS-friendly
- Mantenlo entre 60-100 palabras (máximo 600 caracteres)
${notes ? `- IMPORTANTE: Incorpora los detalles adicionales de forma profesional` : ''}
- Usa Markdown: **negrita** para métricas/logros clave
- CRÍTICO: Responde SOLO en español

Devuelve SOLO la descripción mejorada.`;
  }

  return `You are an expert in resume writing and professional experience.

Improve this work experience description:

"${description}"${notesSection}

Guidelines:
- Focus on **responsibilities** and **quantifiable achievements**
- Use mental bullet format (no literal bullets)
- Mention skills applied: ${skillsList}
- Maintain professional, ATS-friendly tone
- Keep it between 60-100 words (maximum 600 characters)
${notes ? `- IMPORTANT: Professionally incorporate the additional details` : ''}
- Use Markdown: **bold** for key metrics/achievements
- CRITICAL: Respond ONLY in English

Return ONLY the improved description.`;
}

/**
 * Improve user bio
 */
export async function improveBio(
  userId: string,
  bio: string,
  mode: string = 'tech',
  locale: string = 'en',
  additionalNotes?: string
): Promise<ImproveContentResult> {
  const { hasLives, remainingLives, error } = await consumeLifeService(userId, locale);

  if (!hasLives) {
    throw new Error(error || 'No AI energy remaining');
  }

  const userSkills = await getUserSkillsData(userId);
  const skillNames = userSkills.map(us => us.skill.name);
  const experienceYears = await calculateExperienceYears(userId);

  const prompt = mode === 'tech'
    ? buildTechPrompt(bio, skillNames, experienceYears, locale, additionalNotes)
    : buildClassicPrompt(bio, skillNames, experienceYears, locale, additionalNotes);

  const result = await generateText({
    model: google('gemini-2.0-flash'),
    prompt,
    maxTokens: 500,
  });

  return {
    improvedText: result.text.trim(),
    remainingLives,
  };
}

/**
 * Improve project or experience description
 */
export async function improveDescription(
  userId: string,
  description: string,
  context: 'experience' | 'project',
  locale: string = 'en',
  additionalNotes?: string
): Promise<ImproveContentResult> {
  const { hasLives, remainingLives, error } = await consumeLifeService(userId, locale);

  if (!hasLives) {
    throw new Error(error || 'No AI energy remaining');
  }

  const userSkills = await getUserSkillsData(userId);
  const skillNames = userSkills.map(us => us.skill.name);

  const prompt = context === 'experience'
    ? buildExperiencePrompt(description, skillNames, locale, additionalNotes)
    : buildProjectPrompt(description, skillNames, locale, additionalNotes);

  const result = await generateText({
    model: google('gemini-2.0-flash'),
    prompt,
    maxTokens: 600,
  });

  return {
    improvedText: result.text.trim(),
    remainingLives,
  };
}
