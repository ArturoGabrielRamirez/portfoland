/**
 * Suggest Enhancements Service
 *
 * AI service that generates personalized skill improvement suggestions:
 * next level focus, related technologies, and curated learning resources.
 *
 * Results are cached in SkillEnhancementCache (shared across users).
 * Cache key: skillName + skillLevel + locale. TTL: 30 days.
 * Cache hit = no life consumed. Cache miss = 1 life consumed + result saved.
 */

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { consumeLifeService } from '@/features/ai-quota';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import { getGitHubConnectionStatus } from '@/features/github/data/getGitHubConnectionStatus.data';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { SkillEnhancement, RelatedSkill, LearningResource } from '../types/enhancement';

// =============================================================================
// AI Provider
// =============================================================================

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Cache TTL: 30 days
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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

3. resources: 3-5 recursos de aprendizaje reales. Prioriza recursos gratuitos.
   Usa URLs reales y conocidas: documentación oficial (reactjs.org, vuejs.org, etc.), YouTube (Fireship, Traversy Media, The Primeagen, Theo), plataformas (freecodecamp.org, web.dev, kentcdodds.com, etc.).

RESPONDE EN ESPAÑOL para los campos de texto (reason, why, nextLevelFocus).`;
  }

  return `You are an expert in technical skill development and continuous learning.

A developer has the skill "${skillName}" (category: ${category}) at level ${skillLevel}/5 (${levelDesc}).

Their current skills: ${existingList}

Generate personalized suggestions:

1. nextLevelFocus: What specific areas should they practice to reach level ${Math.min(skillLevel + 1, 5)}/5? (2-3 concrete sentences)

2. relatedSkills: 3-5 related technologies they should consider learning. IMPORTANT: Do NOT suggest skills they already have. Focus on technologies that complement "${skillName}".

3. resources: 3-5 real learning resources. Prioritize free resources.
   Use real, well-known URLs: official docs (reactjs.org, vuejs.org, docs.python.org, etc.), YouTube channels (Fireship, Traversy Media, The Primeagen, Theo, Kevin Powell), platforms (freecodecamp.org, web.dev, kentcdodds.com, joshwcomeau.com, etc.).

Respond in English.`;
}

// =============================================================================
// Cache Helpers
// =============================================================================

type CachedRelatedSkill = Omit<RelatedSkill, 'alreadyAdded'>;
type CachedResource = LearningResource & { broken?: boolean };

interface CacheShape {
  nextLevelFocus: string;
  relatedSkills: CachedRelatedSkill[];
  resources: CachedResource[];
}

/** Check if a cache entry is still valid (within TTL) */
function isCacheValid(updatedAt: Date): boolean {
  return Date.now() - updatedAt.getTime() < CACHE_TTL_MS;
}

/** Upsert a cache entry, handling Prisma's Json field types */
async function upsertCache(data: {
  skillName: string;
  skillLevel: number;
  locale: string;
  nextLevelFocus: string;
  relatedSkills: CachedRelatedSkill[];
  resources: CachedResource[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relatedSkillsJson = data.relatedSkills as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resourcesJson = data.resources as any;

  await prisma.skillEnhancementCache.upsert({
    where: { skillName_skillLevel_locale: { skillName: data.skillName, skillLevel: data.skillLevel, locale: data.locale } },
    create: {
      skillName: data.skillName,
      skillLevel: data.skillLevel,
      locale: data.locale,
      nextLevelFocus: data.nextLevelFocus,
      relatedSkills: relatedSkillsJson,
      resources: resourcesJson,
    },
    update: {
      nextLevelFocus: data.nextLevelFocus,
      relatedSkills: relatedSkillsJson,
      resources: resourcesJson,
      updatedAt: new Date(),
    },
  });
}

/** Post-process cached data: mark alreadyAdded, filter broken resources */
function hydrateFromCache(
  cached: CacheShape,
  skillName: string,
  skillLevel: number,
  userSkillNames: string[]
): Omit<SkillEnhancement, 'validationStatus'> {
  const relatedSkills: RelatedSkill[] = (cached.relatedSkills as CachedRelatedSkill[]).map(rs => ({
    ...rs,
    alreadyAdded: userSkillNames.some(n => n.toLowerCase() === rs.name.toLowerCase()),
  }));

  const resources: LearningResource[] = (cached.resources as CachedResource[])
    .filter(r => !r.broken)
    .map(({ broken: _broken, ...r }) => r as LearningResource);

  return {
    skillName,
    currentLevel: skillLevel,
    nextLevelFocus: cached.nextLevelFocus,
    relatedSkills,
    resources,
  };
}

// =============================================================================
// Core AI Call (no life check, no cache — raw generation)
// =============================================================================

async function callAIForEnhancements(
  skillName: string,
  skillLevel: number,
  category: string,
  userSkillNames: string[],
  locale: string
): Promise<CacheShape> {
  const prompt = buildEnhancementPrompt(skillName, skillLevel, category, userSkillNames, locale);
  const result = await generateObject({
    model: google('gemini-2.0-flash'),
    prompt,
    schema: enhancementSchema,
  });
  return {
    nextLevelFocus: result.object.nextLevelFocus,
    relatedSkills: result.object.relatedSkills,
    resources: result.object.resources,
  };
}

// =============================================================================
// Core Logic (exported for reuse without life consumption — used by CRT tool)
// =============================================================================

/**
 * Generate or retrieve enhancement suggestions without consuming a life.
 * Uses shared cache. Used by the CRT tool which already charges via chat.
 */
export async function getEnhancementSuggestions(
  userId: string,
  skillName: string,
  skillLevel: number,
  category: string,
  locale: string = 'en'
): Promise<Omit<SkillEnhancement, 'validationStatus'>> {
  const userSkills = await getUserSkillsData(userId);
  const userSkillNames = userSkills.map(us => us.skill.name);

  // Check shared cache first
  const cached = await prisma.skillEnhancementCache.findUnique({
    where: { skillName_skillLevel_locale: { skillName, skillLevel, locale } },
  });

  if (cached && isCacheValid(cached.updatedAt)) {
    logger.debug('getEnhancementSuggestions: cache hit', { skillName, skillLevel, locale });
    return hydrateFromCache(
      {
        nextLevelFocus: cached.nextLevelFocus,
        relatedSkills: cached.relatedSkills as unknown as CachedRelatedSkill[],
        resources: cached.resources as unknown as CachedResource[],
      },
      skillName,
      skillLevel,
      userSkillNames
    );
  }

  // Cache miss — call AI
  logger.debug('getEnhancementSuggestions: cache miss, calling AI', { skillName, skillLevel, locale });
  const aiResult = await callAIForEnhancements(skillName, skillLevel, category, userSkillNames, locale);

  // Save to cache (upsert handles both insert and refresh after TTL expiry)
  await upsertCache({ skillName, skillLevel, locale, ...aiResult });

  return hydrateFromCache(aiResult, skillName, skillLevel, userSkillNames);
}

// =============================================================================
// Main Service (with life check)
// =============================================================================

/**
 * Suggest skill enhancement data for a given user skill.
 *
 * Cache hit: no life consumed, instant response.
 * Cache miss: 1 life consumed, AI called, result cached for 30 days.
 */
export async function suggestEnhancementsService(
  userId: string,
  skillName: string,
  skillLevel: number,
  category: string,
  locale: string = 'en'
): Promise<SkillEnhancement> {
  logger.debug('suggestEnhancementsService', { userId, skillName, skillLevel, category });

  // Check cache before consuming a life
  const userSkills = await getUserSkillsData(userId);
  const userSkillNames = userSkills.map(us => us.skill.name);

  const cached = await prisma.skillEnhancementCache.findUnique({
    where: { skillName_skillLevel_locale: { skillName, skillLevel, locale } },
  });

  const isCacheHit = cached !== null && isCacheValid(cached.updatedAt);

  if (!isCacheHit) {
    // Only consume a life on cache miss (actual AI call needed)
    const { hasLives, error } = await consumeLifeService(userId, locale);
    if (!hasLives) {
      throw new Error(error ?? 'No AI energy remaining');
    }
  }

  const [enhancementData, githubStatus, assessmentRecord] = await Promise.all([
    isCacheHit
      ? Promise.resolve(hydrateFromCache(
          {
            nextLevelFocus: cached!.nextLevelFocus,
            relatedSkills: cached!.relatedSkills as unknown as CachedRelatedSkill[],
            resources: cached!.resources as unknown as CachedResource[],
          },
          skillName,
          skillLevel,
          userSkillNames
        ))
      : callAIForEnhancements(skillName, skillLevel, category, userSkillNames, locale).then(async aiResult => {
          await upsertCache({ skillName, skillLevel, locale, ...aiResult });
          return hydrateFromCache(aiResult, skillName, skillLevel, userSkillNames);
        }),
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

  return {
    ...enhancementData,
    validationStatus: {
      githubConnected: githubStatus.isConnected,
      assessmentAvailable: assessmentRecord !== null,
      assessmentPassed: assessmentRecord?.status === 'PASSED',
    },
  };
}
