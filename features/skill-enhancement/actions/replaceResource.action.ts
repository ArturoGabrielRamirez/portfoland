/**
 * Replace Resource Action
 *
 * Reports a broken learning resource link and returns a replacement.
 * - Saves the broken URL to BrokenResourceUrl (increments count if already reported)
 * - Marks the resource as broken in the shared cache
 * - Calls AI to generate 1 replacement resource of the same type
 * - No life charge (correction, not a new generation)
 */

'use server';

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import * as yup from 'yup';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { actionWrapper } from '@/features/core';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { LearningResource } from '../types/enhancement';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const replaceResourceSchema = yup.object({
  skillName: yup.string().required(),
  skillLevel: yup.number().min(1).max(5).required(),
  locale: yup.string().default('en'),
  brokenUrl: yup.string().url().required(),
  resourceType: yup
    .string()
    .oneOf(['video', 'article', 'course', 'documentation', 'practice'])
    .required(),
});

const replacementSchema = z.object({
  title: z.string(),
  type: z.enum(['video', 'article', 'course', 'documentation', 'practice']),
  url: z.string(),
  duration: z.string(),
  cost: z.enum(['free', 'paid']),
  why: z.string(),
});

export async function replaceResourceAction(input: Record<string, unknown>) {
  return actionWrapper<LearningResource>(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error('You must be logged in to report broken links');
    }

    const data = await replaceResourceSchema.validate(input);
    const { skillName, skillLevel, locale, brokenUrl, resourceType } = data;

    logger.debug('replaceResourceAction', { skillName, skillLevel, brokenUrl });

    // 1. Record the broken URL (upsert — increment count if already reported)
    await prisma.brokenResourceUrl.upsert({
      where: { url: brokenUrl },
      create: { url: brokenUrl, skillName, skillLevel, locale: locale ?? 'en' },
      update: { reportCount: { increment: 1 } },
    });

    // 2. Mark resource as broken in cache
    const cached = await prisma.skillEnhancementCache.findUnique({
      where: { skillName_skillLevel_locale: { skillName, skillLevel, locale: locale ?? 'en' } },
    });

    if (cached) {
      const resources = cached.resources as unknown as Array<LearningResource & { broken?: boolean }>;
      const updated = resources.map(r =>
        r.url === brokenUrl ? { ...r, broken: true } : r
      );
      await prisma.skillEnhancementCache.update({
        where: { skillName_skillLevel_locale: { skillName, skillLevel, locale: locale ?? 'en' } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { resources: updated as any },
      });
    }

    // 3. Generate 1 replacement resource
    const prompt = locale === 'es'
      ? `Sugiere UN recurso de aprendizaje de tipo "${resourceType}" para la habilidad "${skillName}" en nivel ${skillLevel}/5. NO uses esta URL (está rota): ${brokenUrl}. Devuelve: title, type, url (real y conocida), duration, cost (free/paid), why (una oración).`
      : `Suggest ONE learning resource of type "${resourceType}" for the skill "${skillName}" at level ${skillLevel}/5. Do NOT use this URL (it is broken): ${brokenUrl}. Return: title, type, url (real, well-known), duration, cost (free/paid), why (one sentence).`;

    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      prompt,
      schema: replacementSchema,
    });

    const replacement: LearningResource = result.object;

    // 4. Append replacement to cache (if cache exists, add the new resource)
    if (cached) {
      const resources = cached.resources as unknown as Array<LearningResource & { broken?: boolean }>;
      await prisma.skillEnhancementCache.update({
        where: { skillName_skillLevel_locale: { skillName, skillLevel, locale: locale ?? 'en' } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { resources: [...resources, replacement] as any },
      });
    }

    return {
      payload: replacement,
      message: 'Replacement resource found',
    };
  });
}
