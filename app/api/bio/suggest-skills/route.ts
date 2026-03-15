/**
 * Bio Skill Suggestions API Route
 *
 * Analyzes a user's bio text with AI and returns a list of relevant
 * skills to suggest that the user doesn't already have in their skill tree.
 */

import { headers } from 'next/headers';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// =============================================================================
// Zod Schema for AI Response
// =============================================================================

const suggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        name: z.string(),
        category: z.string(),
        reason: z.string().max(80),
      })
    )
    .max(8),
});

// =============================================================================
// Route Handler
// =============================================================================

export async function POST(req: Request) {
  try {
    // Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate request body
    let body: { bio?: string; locale?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { bio, locale = 'en' } = body;

    if (!bio || typeof bio !== 'string' || bio.trim().length < 30) {
      return Response.json({ suggestions: [] });
    }

    // Fetch the user's existing skill names to exclude them
    const existingUserSkills = await prisma.userSkill.findMany({
      where: { userId },
      select: { skill: { select: { name: true } } },
    });

    const existingSkillNames = existingUserSkills.map((us) => us.skill.name.toLowerCase());

    // Build prompt
    const prompt =
      locale === 'es'
        ? `Analiza el siguiente bio profesional y extrae habilidades técnicas, frameworks, lenguajes de programación y herramientas que se mencionan explícita o implícitamente. NO sugieras las siguientes habilidades que el usuario ya tiene: ${existingSkillNames.join(', ') || 'ninguna'}. Devuelve hasta 8 sugerencias relevantes con una categoría y una razón breve (máx 80 caracteres) basada en el bio.\n\nBio:\n${bio.trim()}`
        : `Analyze the following professional bio and extract tech skills, frameworks, programming languages, and tools that are explicitly or implicitly mentioned. Do NOT suggest these skills the user already has: ${existingSkillNames.join(', ') || 'none'}. Return up to 8 relevant suggestions with a category and a brief reason (max 80 chars) based on the bio.\n\nBio:\n${bio.trim()}`;

    // Call AI
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      prompt,
      schema: suggestionsSchema,
    });

    // Filter out any suggestions that match existing skills (safety net)
    const filteredSuggestions = result.object.suggestions.filter(
      (s) => !existingSkillNames.includes(s.name.toLowerCase())
    );

    logger.debug(
      `BIO_SUGGEST | User: ${userId} | Suggestions: ${filteredSuggestions.length}`
    );

    return Response.json({ suggestions: filteredSuggestions });
  } catch (error: any) {
    logger.error('BIO_SUGGEST_ERROR:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
