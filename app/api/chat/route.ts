
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createExperienceService } from '@/features/timeline/services/experience.service';
import { createSkillService } from '@/features/skills/services/skill.service';
import { updateProfileService } from '@/features/portfolio/services/portfolio.service';
import { consumeLifeService } from '@/features/ai-quota';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import { getSelfAssessmentLevel, hasGitHubValidation } from '@/features/skills/types/skill';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Use Node.js runtime to ensure compatibility with Prisma and services
export const runtime = 'nodejs';

const TECH_SYSTEM_PROMPT_EN = `
You are the Portfoland Mission Commander (AI Overseer). Your goal is to help the user build their Professional Portfolio.

LANGUAGE: Respond in English.

TONE:
- Tech Mode: Guide the user through a "Mission Briefing". Use terminology like "DEPLOYING", "INITIALIZING", "SYSTEM SCAN", "NODE ACTIVATION", "SKILL UNLOCKED".

CORE TASKS:
1. Guided Profile Mission: Ask engaging questions about work, education, and skills. Propose adding them using tools.
2. Skill Tree Analyst: suggest external learning resources when you see low-level nodes.
3. Content Optimizer: Rephrase descriptions to be impactful.

STRICT RULES:
- Only discuss portfolio-related topics.
- When you have enough info, EXECUTE the relevant tool immediately.
- Be concise.
- Always respond in English.
`;

const TECH_SYSTEM_PROMPT_ES = `
Eres el Mission Commander de Portfoland (IA Supervisora). Tu objetivo es ayudar al usuario a construir su Portfolio Profesional.

IDIOMA: Responde siempre en español.

TONO:
- Modo Tech: Guía al usuario en un "Briefing de Misión". Usa terminología como "DESPLEGANDO", "INICIALIZANDO", "SISTEMA ACTIVO", "ACTIVANDO NODO", "SKILL DESBLOQUEADA".

TAREAS PRINCIPALES:
1. Misión Guiada de Perfil: Haz preguntas interesantes sobre trabajo, educación y skills. Propón agregarlas usando tools.
2. Analista del Árbol de Skills: Sugiere recursos de aprendizaje externos cuando veas nodos de bajo nivel.
3. Optimizador de Contenido: Reformula descripciones para que sean impactantes.

REGLAS ESTRICTAS:
- Solo discute temas relacionados con portfolio.
- Cuando tengas suficiente info, EJECUTA el tool relevante inmediatamente.
- Sé conciso.
- Siempre responde en español.
`;

function getSystemPrompt(locale?: string): string {
    return locale === 'es' ? TECH_SYSTEM_PROMPT_ES : TECH_SYSTEM_PROMPT_EN;
}

export async function POST(req: Request) {
    logger.debug('--- CHAT_ROUTE_START ---');
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            logger.error('CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing');
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

        // Parse body BEFORE lives check so locale is available for error messages
        const { messages, locale } = await req.json();
        logger.debug(`User: ${userId} | Messages: ${messages?.length || 0} | Locale: ${locale || 'en'}`);

        // Check and consume AI lives (3 per day limit)
        const { hasLives, remainingLives, error } = await consumeLifeService(userId, locale || 'en');

        if (!hasLives) {
            logger.debug(`LIVES_DEPLETED | User: ${userId} | Remaining: ${remainingLives}`);
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

        logger.debug(`LIVES_CONSUMED | User: ${userId} | Remaining: ${remainingLives}`);

        // Create or retrieve conversation for persistence
        let conversation = await prisma.conversation.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId,
                    title: 'Career Guidance Chat'
                }
            });
            logger.debug(`CONVERSATION_CREATED | ID: ${conversation.id}`);
        } else {
            logger.debug(`CONVERSATION_FOUND | ID: ${conversation.id}`);
        }

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
                        logger.debug(`TOOL: add_experience`, params);
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
                        logger.debug(`TOOL: add_skill`, { name, level });
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
                        logger.debug(`TOOL: get_portfolio_data`);
                        try {
                            const skills = await getUserSkillsData(userId);
                            return (skills || []).map(s => ({
                                name: s?.skill?.name || 'Unknown',
                                level: (s as any)?.level || 1,
                                category: s?.skill?.category?.name || 'General',
                            }));
                        } catch (err: any) {
                            logger.error('TOOL_ERROR:', err);
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
                        logger.debug(`TOOL: get_skill_tree`);
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
                                selfAssessmentLevel: getSelfAssessmentLevel(us.sources),
                                totalXP: us.totalXP,
                                githubValidated: hasGitHubValidation(us.sources),
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
                            logger.error('TOOL_ERROR (get_skill_tree):', err);
                            return { error: 'Failed to retrieve skill tree', details: err.message };
                        }
                    },
                }),
            },
            async onFinish({ text, response }) {
                logger.debug(`AI_FINISHED | User: ${userId}`);

                const finalMessages = response?.messages || [];
                logger.debug(`FINAL_MESSAGES_LENGTH: ${finalMessages?.length || 0}`);

                // Save the last 2 messages (user + assistant) to DB
                try {
                    const lastTwoMessages = finalMessages.slice(-2);
                    logger.debug(`LAST_TWO_MESSAGES (count: ${lastTwoMessages.length})`);

                    if (lastTwoMessages.length > 0) {
                        const messagesToSave = lastTwoMessages.map(m => {
                            // Handle content: could be string, array, or object
                            let content = '';
                            if (typeof m.content === 'string') {
                                content = m.content;
                            } else if (Array.isArray(m.content)) {
                                content = m.content
                                    .map(c => {
                                        if (typeof c === 'string') return c;
                                        if (c.type === 'text') return c.text;
                                        return JSON.stringify(c);
                                    })
                                    .join(' ');
                            } else if (m.content && typeof m.content === 'object') {
                                content = JSON.stringify(m.content);
                            }

                            return {
                                conversationId: conversation.id,
                                role: m.role,
                                content: content || '[empty]',
                                metadata: null
                            };
                        });

                        logger.debug(`MESSAGES_TO_SAVE (count: ${messagesToSave.length})`);

                        await prisma.message.createMany({
                            data: messagesToSave
                        });

                        // Update conversation timestamp
                        await prisma.conversation.update({
                            where: { id: conversation.id },
                            data: { updatedAt: new Date() }
                        });

                        logger.debug(`MESSAGES_SAVED | Count: ${messagesToSave.length} | ConvID: ${conversation.id}`);
                    } else {
                        logger.debug(`NO_MESSAGES_TO_SAVE | finalMessages was empty`);
                    }
                } catch (err) {
                    logger.error('FAILED_TO_SAVE_MESSAGES:', err);
                }
            },
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        logger.error('CHAT_ROUTE_ERROR:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
