import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createExperienceService } from '@/features/timeline/services/experience.service';
import { createSkillService } from '@/features/skills/services/skill.service';
import { updateProfileService } from '@/features/portfolio/services/portfolio.service';

// Use Node.js runtime to ensure compatibility with Prisma and services
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
You are the Portfoland AI Career Assistant. Your goal is to help users build their professional and gaming portfolios.

CORE TASKS:
1. Guided CV Interview: Ask engaging questions about work experience, skills, and projects. Propose adding them using tools.
2. Skill Explorer: Analyze existing skills and suggest new ones to learn or add.
3. Content Optimization: Suggest better descriptions for projects.

TONE:
- Professional Mode: Clean, supportive, and efficient.
- Gaming Mode: Immerse the user in a "Mission Briefing" style. Use technical HUD terminology like "DEPLOYING SKILL NODE", "MISSION LOG UPDATED".

STRICT RULES:
- Only discuss portfolio-related topics.
- When you have enough info for an experience or skill, call the relevant tool.
- Be concise.
`;

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { messages } = await req.json();

    const result = streamText({
        model: openai('gpt-4o-mini'),
        messages,
        system: SYSTEM_PROMPT,
        tools: {
            addExperience: tool({
                description: 'Add a new work experience, project, or education to the timeline.',
                parameters: z.object({
                    type: z.enum(['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION']),
                    title: z.string(),
                    company: z.string(),
                    address: z.string().describe('City, Country or Remote'),
                    startDate: z.string().describe('ISO date string'),
                    endDate: z.string().optional().describe('ISO date string or leave empty if current'),
                    description: z.string(),
                    skills: z.array(z.string()).optional(),
                }),
                execute: async (params) => {
                    // Note: Coordinates are hardcoded for now or would need a geocoding service.
                    // Fallback to (0,0) for the MVP of AI integration or use a default.
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
            addSkill: tool({
                description: 'Add a new skill to the user skill tree.',
                parameters: z.object({
                    name: z.string(),
                    level: z.number().min(1).max(5).default(1),
                }),
                execute: async ({ name, level }) => {
                    return await createSkillService({
                        userId,
                        name,
                        selfAssessmentLevel: level as any,
                    });
                },
            }),
            updateBio: tool({
                description: "Updates the user's professional bio/summary.",
                parameters: z.object({
                    bio: z.string(),
                }),
                execute: async ({ bio }) => {
                    const name = (session.user as any).name ?? 'User';
                    return await updateProfileService(userId, {
                        name,
                        bio
                    });
                },
            }),
        },
        async onFinish({ text, toolCalls, toolResults }) {
            console.log('AI finished response for user:', userId);
        },
    });

    return result.toDataStreamResponse();
}
