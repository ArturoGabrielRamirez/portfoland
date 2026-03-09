/**
 * Suggest Enhancements Service
 *
 * AI service that generates personalized skill improvement suggestions:
 * next level focus, related technologies, and curated learning resources.
 */

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { consumeLifeService } from '@/features/ai-quota';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import { getGitHubConnectionStatus } from '@/features/github/data/getGitHubConnectionStatus.data';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { SkillEnhancement } from '../types/enhancement';

// =============================================================================
// AI Provider
// =============================================================================

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// =============================================================================
// Zod Schema
// =============================================================================

const enhancementSchema = z.object({
  nextLevelFocus: z.string().describe('Specific areas to focus on to reach the next skill level'),
  relatedSkills: z.array(z.object({
    name: z.string().describe('Technology or skill name'),
    category: z.string().describe('Category (e.g., Frontend, Backend, DevOps)'),
    reason: z.string().describe('Why this skill complements the current one'),
    priority: z.enum(['high', 'medium', 'low']).describe('How important is this related skill'),
  })).max(5).describe('Related technologies or skills the user should consider'),
  resources: z.array(z.object({
    title: z.string().describe('Title of the resource'),
    type: z.enum(['video', 'article', 'course', 'documentation', 'practice'])
      .describe('Type of learning resource'),
    url: z.string().describe('URL to the resource (use well-known real URLs)'),
    duration: z.string().describe('Estimated time (e.g., "45 min", "2 hours", "self-paced")'),
    cost: z.enum(['free', 'paid']).describe('Whether the resource is free or paid'),
    why: z.string().describe('One sentence explaining why this resource is relevant'),
  })).max(5).describe('Curated learning resources to level up the skill'),
});

// =============================================================================
// Prompt Builder
// =============================================================================

function buildEnhancementPrompt(
  skillName: string,
  skillLevel: number,
  category: string,
  existingSkills: string[],
  locale: string
): string {
  const levelDescriptions: Record<number, string> = {
    1: 'Novice (just starting)',
    2: 'Apprentice (basic understanding)',
    3: 'Journeyman (intermediate practitioner)',
    4: 'Expert (advanced)',
    5: 'Master (expert level)',
  };

  const levelDesc = levelDescriptions[skillLevel] ?? 'Intermediate';
  const existingList = existingSkills.slice(0, 20).join(', ');

  if (locale === 'es') {
    return `Eres un experto en desarrollo de habilidades técnicas y aprendizaje continuo.

Un desarrollador tiene la habilidad "${skillName}" (categoría: ${category}) en nivel ${skillLevel}/5 (${levelDesc}).

Sus habilidades actuales: ${existingList}

Genera sugerencias personalizadas:

1. nextLevelFocus: ¿Qué áreas específicas debe practicar para llegar al nivel ${Math.min(skillLevel + 1, 5)}/5? (2-3 oraciones concretas)

2. relatedSkills: 3-5 tecnologías relacionadas que debería considerar aprender. IMPORTANTE: No sugieras habilidades que ya tiene. Enfócate en tecnologías que complementen "${skillName}".

3. resources: 3-5 recursos de aprendizaje reales. Prioriza recursos gratuitos. Para nivel ${skillLevel}:
   - Niveles 1-2: recursos para principiantes, tutoriales básicos
   - Nivel 3: recursos intermedios, documentación oficial
   - Niveles 4-5: recursos avanzados, artículos de ingeniería, talks de conferencias

   Usa URLs reales y conocidas: documentación oficial (reactjs.org, vuejs.org, docs.python.org, etc.), YouTube (canales como Fireship, Traversy Media, The Primeagen, Theo), plataformas (freecodecamp.org, web.dev, kentcdodds.com, Josh Comeau, etc.).

RESPONDE EN ESPAÑOL para los campos de texto (reason, why, nextLevelFocus), pero los nombres de habilidades y títulos de recursos pueden estar en inglés si es más apropiado.`;
  }

  return `You are an expert in technical skill development and continuous learning.

A developer has the skill "${skillName}" (category: ${category}) at level ${skillLevel}/5 (${levelDesc}).

Their current skills: ${existingList}

Generate personalized suggestions:

1. nextLevelFocus: What specific areas should they practice to reach level ${Math.min(skillLevel + 1, 5)}/5? (2-3 concrete sentences)

2. relatedSkills: 3-5 related technologies they should consider learning. IMPORTANT: Do NOT suggest skills they already have. Focus on technologies that complement "${skillName}".

3. resources: 3-5 real learning resources. Prioritize free resources. For level ${skillLevel}:
   - Levels 1-2: beginner-friendly tutorials, getting started guides
   - Level 3: intermediate resources, official documentation deep dives
   - Levels 4-5: advanced content, engineering blog posts, conference talks

   Use real, well-known URLs: official docs (reactjs.org, vuejs.org, docs.python.org, etc.), YouTube channels (Fireship, Traversy Media, The Primeagen, Theo, Kevin Powell), platforms (freecodecamp.org, web.dev, kentcdodds.com, joshwcomeau.com, etc.).

Respond in English.`;
}

// =============================================================================
// Core Logic (exported for reuse without life consumption)
// =============================================================================

/**
 * Generate enhancement suggestions without consuming a life.
 * Used by the CRT tool which already charges the user via chat.
 */
export async function getEnhancementSuggestions(
  userId: string,
  skillName: string,
  skillLevel: number,
  category: string,
  locale: string = 'en'
): Promise<Omit<SkillEnhancement, 'validationStatus'> & { userSkillNames: string[] }> {
  const userSkills = await getUserSkillsData(userId);
  const userSkillNames = userSkills.map(us => us.skill.name);

  const prompt = buildEnhancementPrompt(skillName, skillLevel, category, userSkillNames, locale);

  const result = await generateObject({
    model: google('gemini-2.0-flash'),
    prompt,
    schema: enhancementSchema,
  });

  const relatedSkillsWithFlag = result.object.relatedSkills.map(rs => ({
    ...rs,
    alreadyAdded: userSkillNames.some(
      name => name.toLowerCase() === rs.name.toLowerCase()
    ),
  }));

  return {
    skillName,
    currentLevel: skillLevel,
    nextLevelFocus: result.object.nextLevelFocus,
    relatedSkills: relatedSkillsWithFlag,
    resources: result.object.resources,
    userSkillNames,
  };
}

// =============================================================================
// Main Service
// =============================================================================

/**
 * Suggest skill enhancement data for a given user skill.
 *
 * Consumes 1 life. Returns related skills, learning resources, and
 * next-level guidance tailored to the user's current skill tree.
 */
export async function suggestEnhancementsService(
  userId: string,
  skillName: string,
  skillLevel: number,
  category: string,
  locale: string = 'en'
): Promise<SkillEnhancement> {
  logger.debug('suggestEnhancementsService', { userId, skillName, skillLevel, category });

  const { hasLives, error } = await consumeLifeService(userId, locale);
  if (!hasLives) {
    throw new Error(error ?? 'No AI energy remaining');
  }

  const [enhancementData, githubStatus, assessmentRecord] = await Promise.all([
    getEnhancementSuggestions(userId, skillName, skillLevel, category, locale),
    getGitHubConnectionStatus(userId),
    prisma.skillAssessment.findFirst({
      where: {
        userId,
        skillSlug: skillName.toLowerCase().replace(/\s+/g, '-'),
      },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    }),
  ]);

  const assessmentAvailable = assessmentRecord !== null;
  const assessmentPassed = assessmentRecord?.status === 'PASSED';

  return {
    skillName: enhancementData.skillName,
    currentLevel: enhancementData.currentLevel,
    nextLevelFocus: enhancementData.nextLevelFocus,
    relatedSkills: enhancementData.relatedSkills,
    resources: enhancementData.resources,
    validationStatus: {
      githubConnected: githubStatus.isConnected,
      assessmentAvailable,
      assessmentPassed,
    },
  };
}
