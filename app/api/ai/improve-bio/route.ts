/**
 * AI Bio Improvement API Route
 *
 * POST endpoint to improve user bio using AI.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkAndConsumLives } from '@/lib/ai/lives';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import { prisma } from '@/lib/prisma';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const runtime = 'nodejs';

/**
 * Calculate total years of experience from user's work history OR first skill
 */
async function calculateExperienceYears(userId: string): Promise<number> {
    // First, try to calculate from WORK experiences
    const experiences = await prisma.experience.findMany({
        where: {
            userId,
            type: 'WORK' // Only count work experience, not education/certifications
        },
        select: {
            startDate: true,
            endDate: true
        }
    });

    if (experiences.length > 0) {
        let totalYears = 0;

        for (const exp of experiences) {
            const start = exp.startDate;
            const end = exp.endDate || new Date(); // If no end date, assume current
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            totalYears += years;
        }

        return Math.floor(totalYears);
    }

    // Fallback: If no work experience, calculate from first skill added
    const oldestSkill = await prisma.userSkill.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' }, // Oldest first
        select: { createdAt: true }
    });

    if (oldestSkill) {
        const years = (new Date().getTime() - oldestSkill.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return Math.floor(years);
    }

    return 0; // No work experience and no skills
}

function getGamingPrompt(bio: string, skills: string[], years: number, locale: string, notes?: string): string {
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

function getProfessionalPrompt(bio: string, skills: string[], years: number, locale: string, notes?: string): string {
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

        const { bio, mode, locale, additionalNotes } = await req.json();

        if (!bio || typeof bio !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Bio text is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get user's skills
        const userSkills = await getUserSkillsData(userId);
        const skillNames = userSkills.map(us => us.skill.name);

        // Calculate years of experience from work history
        const experienceYears = await calculateExperienceYears(userId);

        console.log(`IMPROVE_BIO | User: ${userId} | Mode: ${mode} | Locale: ${locale} | Skills: ${skillNames.length} | Experience: ${experienceYears}y | BioLength: ${bio.length} | Notes: ${additionalNotes ? 'Yes' : 'No'}`);

        // Generate prompt with user's actual skills, experience, notes, and locale
        const prompt = mode === 'gaming'
            ? getGamingPrompt(bio, skillNames, experienceYears, locale || 'en', additionalNotes)
            : getProfessionalPrompt(bio, skillNames, experienceYears, locale || 'en', additionalNotes);

        // Generate improved bio
        const result = await generateText({
            model: google('gemini-2.0-flash'),
            prompt,
            maxTokens: 500,
        });

        const improvedBio = result.text.trim();

        console.log(`BIO_IMPROVED | ImprovedLength: ${improvedBio.length}`);

        return new Response(
            JSON.stringify({
                improvedBio,
                remainingLives: remainingLives - 1
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error: any) {
        console.error('IMPROVE_BIO_ERROR:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to improve bio',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
