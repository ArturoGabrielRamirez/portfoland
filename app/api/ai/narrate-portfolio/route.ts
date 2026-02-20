/**
 * AI Portfolio Narrator API Route
 *
 * GET endpoint to generate AI narrative of user's professional story.
 * Cached for 24h to reduce costs.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const runtime = 'nodejs';

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

interface UserData {
    name: string;
    bio: string | null;
    skills: Array<{ name: string; level: number; category: string }>;
    experiences: Array<{
        title: string;
        company: string;
        type: string;
        startDate: Date;
        endDate: Date | null;
    }>;
    projects: Array<{
        title: string;
        description: string;
        technologies: string[];
    }>;
}

async function getUserData(username: string): Promise<UserData | null> {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            name: true,
            bio: true,
            userSkills: {
                include: {
                    skill: {
                        include: {
                            category: true
                        }
                    }
                },
                orderBy: { totalXP: 'desc' },
                take: 10
            },
            experiences: {
                orderBy: { startDate: 'desc' },
                take: 5,
                select: {
                    title: true,
                    company: true,
                    type: true,
                    startDate: true,
                    endDate: true
                }
            },
            projects: {
                where: { status: 'COMPLETED' },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: {
                    title: true,
                    description: true,
                    technologies: true
                }
            }
        }
    });

    if (!user) return null;

    return {
        name: user.name,
        bio: user.bio,
        skills: user.userSkills.map(us => ({
            name: us.skill.name,
            level: us.selfAssessmentLevel,
            category: us.skill.category.name
        })),
        experiences: user.experiences,
        projects: user.projects
    };
}

function getUnifiedPrompt(data: UserData, locale: string): string {
    const skillsList = data.skills.slice(0, 8).map(s => s.name).join(', ');
    const experienceCount = data.experiences.length;
    const projectCount = data.projects.length;

    // Build detailed experience context
    const experienceDetails = data.experiences.slice(0, 3).map(exp => {
        const duration = exp.endDate
            ? `${exp.startDate.getFullYear()}-${exp.endDate.getFullYear()}`
            : `${exp.startDate.getFullYear()}-Presente`;
        return `- ${exp.title} en ${exp.company} (${duration})`;
    }).join('\n');

    // Build project context
    const projectDetails = data.projects.slice(0, 3).map(p => {
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


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');
        const mode = searchParams.get('mode') || 'tech';
        const locale = searchParams.get('locale') || 'en';

        if (!username) {
            return new Response(
                JSON.stringify({ error: 'Username is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check cache first
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                meta: true
            }
        });

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const meta = (user.meta as any) || {};
        const cacheKey = `aiNarrative_${mode}_${locale}`;
        const cached = meta[cacheKey];

        // Return cached if fresh (< 24h old)
        if (cached?.narrative && cached?.timestamp) {
            const age = Date.now() - new Date(cached.timestamp).getTime();
            if (age < CACHE_DURATION_MS) {
                console.log(`NARRATIVE_CACHE_HIT | User: ${username} | Mode: ${mode} | Age: ${Math.round(age / 1000 / 60)}min`);
                return new Response(
                    JSON.stringify({
                        narrative: cached.narrative,
                        cached: true
                    }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Generate new narrative
        console.log(`NARRATIVE_GENERATE | User: ${username} | Mode: ${mode} | Locale: ${locale}`);

        const userData = await getUserData(username);

        if (!userData) {
            return new Response(
                JSON.stringify({ error: 'User data not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate narrative with AI (unified prompt for both modes)
        const prompt = getUnifiedPrompt(userData, locale);

        const result = await generateText({
            model: google('gemini-2.0-flash'),
            prompt,
            maxTokens: 600,
        });

        const narrative = result.text.trim();

        // Cache the result
        await prisma.user.update({
            where: { id: user.id },
            data: {
                meta: {
                    ...meta,
                    [cacheKey]: {
                        narrative,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        });

        console.log(`NARRATIVE_CACHED | Length: ${narrative.length}`);

        return new Response(
            JSON.stringify({
                narrative,
                cached: false
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('NARRATE_PORTFOLIO_ERROR:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to generate narrative',
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
