
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { consumeLifeService } from '@/features/ai-quota';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
    getPortfolioSummary,
    formatSummaryForPrompt,
    type PortfolioSummary,
} from '@/features/ai/services/contextLoader.service';
import { getPagePrompt } from '@/features/ai/constants/pagePrompts';
import { buildToolRegistry } from '@/features/ai/tools';

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

TOOLS:
- Usa suggest_skill_path para sugerir rutas de aprendizaje. SIEMPRE especifica un 'targetRole' (ej: "Expert AI Developer") o un 'skillName'. Explica tu razonamiento en el parámetro 'reasoning'.
- Esta herramienta resalta nodos en el Skill Tree visual. Úsala siempre que el usuario pregunte "¿qué aprender?" o "¿cómo mejorar?".
- Always use snake_case for tool names.

STRICT RULES:
- Only discuss portfolio-related topics.
- When you have enough info, EXECUTE the relevant tool immediately.
- EXTREMELY IMPORTANT: After executing any tool, your VERY NEXT step MUST be to generate a conversational TEXT response to the user summarizing the result. YOU ARE FORBIDDEN FROM STOPPING SILENTLY. You MUST ALWAYS speak to the user after a tool executes.
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

TOOLS:
- Usa suggest_skill_path para sugerir rutas de aprendizaje. SIEMPRE especifica un 'targetRole' (ej: "Experto en IA") o un 'skillName'. Explica tu razonamiento en el parámetro 'reasoning'.
- Esta herramienta resalta nodos en el Skill Tree visual de forma inmediata. Úsala siempre que el usuario pregunte "¿qué aprender?" o "¿cómo mejorar?".
- Usa siempre snake_case para los nombres de las herramientas.

REGLAS ESTRICTAS:
- Solo discute temas relacionados con portfolio.
- Cuando tengas suficiente info, EJECUTA el tool relevante inmediatamente.
- EXTREMADAMENTE IMPORTANTE: Después de ejecutar cualquier tool, tu SIGUIENTE paso DEBE SER generar una respuesta de TEXTO conversacional resumiendo el resultado. TIENES PROHIBIDO DETENERTE EN SILENCIO. SIEMPRE DEBES hablarle al usuario después de que un tool se ejecuta.
- Sé conciso.
- Siempre responde en español.
`;

function getSystemPrompt(locale?: string, pageContext?: string, summary?: PortfolioSummary): string {
    const base = locale === 'es' ? TECH_SYSTEM_PROMPT_ES : TECH_SYSTEM_PROMPT_EN;

    let prompt = base;

    // Append portfolio summary context
    if (summary) {
        prompt += '\n' + formatSummaryForPrompt(summary);
    }

    // Append page-specific instructions
    const pagePrompt = getPagePrompt(pageContext, locale || 'en');
    if (pagePrompt) {
        const prefix = locale === 'es' ? 'PAGINA ACTUAL' : 'CURRENT PAGE';
        prompt += `\n${prefix}: ${pagePrompt}`;
    }

    return prompt;
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
        let body: any;
        try {
            body = await req.json();
        } catch (e: any) {
            logger.error(`MALFORMED_JSON | User: ${userId} | Error: ${e.message}`);
            return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { messages, locale, pageContext } = body;
        if (!messages || !Array.isArray(messages)) {
            logger.error(`INVALID_MESSAGES | User: ${userId}`);
            return new Response(JSON.stringify({ error: 'Messages are required and must be an array' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        logger.debug(`User: ${userId} | Messages: ${messages.length} | Locale: ${locale || 'en'}`);

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

        // Load portfolio context and build page-aware tools
        const summary = await getPortfolioSummary(userId);
        const tools = buildToolRegistry(userId, pageContext);

        const result = streamText({
            model: google('gemini-2.0-flash'),
            messages,
            system: getSystemPrompt(locale, pageContext, summary),
            maxSteps: 5,
            toolChoice: 'auto',
            tools,
            async onStepFinish(event) {
                logger.debug(`STEP_FINISH | Reason: ${event.finishReason} | ToolCalls: ${event.toolCalls?.length || 0} | ToolResults: ${event.toolResults?.length || 0}`);
            },
            async onFinish({ text, response }) {
                logger.debug(`AI_FINISHED | User: ${userId}`);

                const finalMessages = response?.messages || [];
                logger.debug(`FINAL_MESSAGES_LENGTH: ${finalMessages?.length || 0}`);

                // Save only assistant text messages to DB (skip tool result messages)
                try {
                    // response.messages contains only assistant/tool messages — filter to assistant with plain text
                    const cleanMessages = finalMessages.filter(m =>
                        m.role === 'assistant' && typeof m.content === 'string' && (m.content as string).trim()
                    );
                    const lastTwoMessages = cleanMessages.slice(-2);
                    logger.debug(`LAST_TWO_MESSAGES (count: ${lastTwoMessages.length})`);

                    if (lastTwoMessages.length > 0) {
                        const messagesToSave = lastTwoMessages.map(m => ({
                            conversationId: conversation.id,
                            role: m.role,
                            content: m.content as string,
                            metadata: null
                        }));

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
