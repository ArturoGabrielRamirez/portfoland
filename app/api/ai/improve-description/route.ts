/**
 * AI Description Improvement API Route
 *
 * POST endpoint to improve project/experience descriptions using AI.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkAndConsumLives } from '@/lib/ai/lives';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const runtime = 'nodejs';

function getProjectPrompt(description: string, skills: string[], locale: string, notes?: string): string {
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

function getExperiencePrompt(description: string, skills: string[], locale: string, notes?: string): string {
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

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const userId = session.user.id;

        // Check and consume AI lives
        const { hasLives, remainingLives, error } = await checkAndConsumLives(userId);

        if (!hasLives) {
            return new Response(
                JSON.stringify({
                    error: error || 'No AI energy remaining. Recharge tomorrow!',
                    remainingLives: 0
                }),
                {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const { description, mode, locale, context, additionalNotes } = await req.json();

        if (!description || typeof description !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Description text is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get user's skills for context
        const userSkills = await getUserSkillsData(userId);
        const skillNames = userSkills.map(us => us.skill.name);

        console.log(`IMPROVE_DESCRIPTION | User: ${userId} | Context: ${context} | Locale: ${locale} | Skills: ${skillNames.length} | DescLength: ${description.length} | Notes: ${additionalNotes ? 'Yes' : 'No'}`);

        // Generate prompt based on context
        const prompt = context === 'experience'
            ? getExperiencePrompt(description, skillNames, locale || 'en', additionalNotes)
            : getProjectPrompt(description, skillNames, locale || 'en', additionalNotes);

        // Generate improved description
        const result = await generateText({
            model: google('gemini-2.0-flash'),
            prompt,
            maxTokens: 600,
        });

        const improvedDescription = result.text.trim();

        console.log(`DESCRIPTION_IMPROVED | ImprovedLength: ${improvedDescription.length}`);

        return new Response(
            JSON.stringify({
                improvedDescription,
                remainingLives: remainingLives - 1
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error: any) {
        console.error('IMPROVE_DESCRIPTION_ERROR:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to improve description',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
