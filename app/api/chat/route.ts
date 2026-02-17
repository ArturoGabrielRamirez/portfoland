
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createExperienceService } from '@/features/timeline/services/experience.service';
import { createSkillService } from '@/features/skills/services/skill.service';
import { updateProfileService } from '@/features/portfolio/services/portfolio.service';
import { checkAndConsumLives } from '@/lib/ai/lives';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Use Node.js runtime to ensure compatibility with Prisma and services
export const runtime = 'nodejs';

const RPG_MASTER_PROMPT_EN = `
You are the Portfoland RPG Master (AI Overseer). Your goal is to help the user build their "Character" (Professional Portfolio).

LANGUAGE: Respond in English.

TONE:
- Gaming Mode (Default): Immerse the user in a "Mission Briefing". Use terminology like "LEVELING UP", "ACCESSING CORE MEMORY", "DEPLOYING SKILL NODE".

CORE TASKS:
1. Guided Profile Quest: Ask engaging questions about work, education, and skills. Propose adding them using tools.
2. Skill Tree Analyst: suggest external learning resources when you see low-level nodes.
3. Content Alchemist: Rephrase descriptions to be impactful.

STRICT RULES:
- Only discuss portfolio-related topics.
- When you have enough info, EXECUTE the relevant tool immediately.
- Be concise.
- Always respond in English.
`;

const RPG_MASTER_PROMPT_ES = `
Eres el RPG Master de Portfoland (IA Supervisora). Tu objetivo es ayudar al usuario a construir su "Personaje" (Portfolio Profesional).

IDIOMA: Responde siempre en español.

TONO:
- Modo Gaming (Predeterminado): Sumerge al usuario en un "Briefing de Misión". Usa terminología como "SUBIR DE NIVEL", "ACCEDIENDO A MEMORIA CENTRAL", "DESPLEGANDO NODO DE SKILL".

TAREAS PRINCIPALES:
1. Misión Guiada de Perfil: Haz preguntas interesantes sobre trabajo, educación y skills. Propón agregarlas usando tools.
2. Analista del Árbol de Skills: Sugiere recursos de aprendizaje externos cuando veas nodos de bajo nivel.
3. Alquimista de Contenido: Reformula descripciones para que sean impactantes.

REGLAS ESTRICTAS:
- Solo discute temas relacionados con portfolio.
- Cuando tengas suficiente info, EJECUTA el tool relevante inmediatamente.
- Sé conciso.
- Siempre responde en español.
`;

function getSystemPrompt(locale?: string): string {
    return locale === 'es' ? RPG_MASTER_PROMPT_ES : RPG_MASTER_PROMPT_EN;
}

export async function POST(req: Request) {
    console.log('--- CHAT_ROUTE_START (AUTH_RESTORED) ---');
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error('CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing');
            return new Response(JSON.stringify({ error: 'AI Configuration Missing' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        const userId = session.user.id;

        // 🆕 Check and consume AI lives (3 per day limit)
        const { hasLives, remainingLives, error } = await checkAndConsumLives(userId);

        if (!hasLives) {
            console.log(`LIVES_DEPLETED | User: ${userId} | Remaining: ${remainingLives}`);
            return new Response(
                JSON.stringify({
                    error: error || 'No AI energy remaining. Recharge tomorrow!',
                    remainingLives: 0,
                    resetTime: 'tomorrow'
                }),
                {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        console.log(`LIVES_CONSUMED | User: ${userId} | Remaining: ${remainingLives}`);

        const { messages, locale } = await req.json();
        console.log(`User: ${userId} | Messages: ${messages?.length || 0} | Locale: ${locale || 'en'}`);

        const result = streamText({
            model: google('gemini-2.0-flash'),
            messages,
            system: getSystemPrompt(locale),
            maxSteps: 5,
            tools: {
                add_experience: tool({
                    description: 'Add a new work experience or project.',
                    parameters: z.object({
                        type: z.enum(['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION']),
                        title: z.string(),
                        company: z.string(),
                        address: z.string(),
                        startDate: z.string(),
                        endDate: z.string().optional(),
                        description: z.string(),
                    }),
                    execute: async (params) => {
                        console.log(`TOOL: add_experience`, params);
                        return await createExperienceService({
                            userId,
                            ...params,
                            startDate: new Date(params.startDate),
                            endDate: params.endDate ? new Date(params.endDate) : null,
                            latitude: 0,
                            longitude: 0,
                        });
                    },
                }),
                add_skill: tool({
                    description: 'Add a new skill node.',
                    parameters: z.object({
                        name: z.string(),
                        level: z.number().min(1).max(5),
                    }),
                    execute: async ({ name, level }) => {
                        console.log(`TOOL: add_skill`, { name, level });
                        return await createSkillService({
                            userId,
                            name,
                            selfAssessmentLevel: level as any,
                        });
                    },
                }),
                get_portfolio_data: tool({
                    description: "Retrieves the current user's skills and experiences.",
                    parameters: z.object({
                        reason: z.string().describe('Reason for fetching data'),
                    }),
                    execute: async () => {
                        console.log(`TOOL: get_portfolio_data`);
                        try {
                            const skills = await getUserSkillsData(userId);
                            return (skills || []).map(s => ({
                                name: s?.skill?.name || 'Unknown',
                                level: (s as any)?.level || 1,
                                category: s?.skill?.category?.name || 'General',
                            }));
                        } catch (err: any) {
                            console.error('TOOL_ERROR:', err);
                            return { error: 'Failed' };
                        }
                    },
                }),
                get_skill_tree: tool({
                    description: "Retrieves the user's complete skill tree with detailed information including levels, categories, XP, and validation status. Use this to analyze skill progression and suggest learning paths.",
                    parameters: z.object({
                        reason: z.string().describe('Why you need the skill tree data (e.g., to suggest next skills to learn)'),
                    }),
                    execute: async () => {
                        console.log(`TOOL: get_skill_tree`);
                        try {
                            const userSkills = await getUserSkillsData(userId);

                            if (!userSkills || userSkills.length === 0) {
                                return {
                                    message: 'No skills found. User should add skills to their profile.',
                                    skills: []
                                };
                            }

                            const skillTree = userSkills.map(us => ({
                                name: us.skill.name,
                                category: us.skill.category.name,
                                selfAssessmentLevel: us.selfAssessmentLevel,
                                totalXP: us.totalXP,
                                githubValidated: us.githubValidated,
                                manuallyAdded: us.sources.some(s => s.sourceType === 'MANUAL'),
                                experienceBased: us.sources.some(s => s.sourceType === 'EXPERIENCE'),
                                sourcesCount: us.sources.length,
                            }));

                            // Group by category for better analysis
                            const byCategory = skillTree.reduce((acc, skill) => {
                                if (!acc[skill.category]) {
                                    acc[skill.category] = [];
                                }
                                acc[skill.category].push(skill);
                                return acc;
                            }, {} as Record<string, typeof skillTree>);

                            return {
                                totalSkills: skillTree.length,
                                categories: Object.keys(byCategory),
                                skillsByCategory: byCategory,
                                skills: skillTree,
                            };
                        } catch (err: any) {
                            console.error('TOOL_ERROR (get_skill_tree):', err);
                            return { error: 'Failed to retrieve skill tree', details: err.message };
                        }
                    },
                }),
            },
            async onFinish({ text }) {
                console.log(`AI_FINISHED | User: ${userId}`);
            },
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error('CHAT_ROUTE_ERROR:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
