/**
 * Interview Simulator API Route
 *
 * POST /api/ai/interview
 *
 * Two actions:
 * - action: 'generate' — returns array of interview questions
 * - action: 'evaluate' — returns feedback for a single answer
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// =============================================================================
// Helpers
// =============================================================================

async function getUserPortfolioData(userId: string) {
  const [user, skills, experiences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, bio: true, portfolioMode: true },
    }),
    prisma.userSkill.findMany({
      where: { userId },
      select: { level: true, skill: { select: { name: true, category: { select: { name: true } } } } },
      orderBy: { level: 'desc' },
      take: 10,
    }),
    prisma.experience.findMany({
      where: { userId },
      select: { title: true, type: true, description: true, startDate: true, endDate: true },
      orderBy: { startDate: 'desc' },
      take: 5,
    }),
  ]);

  return { user, skills, experiences };
}

function buildPortfolioContext(
  user: { name: string | null; bio: string | null },
  skills: Array<{ level: number | null; skill: { name: string; category: { name: string } | null } | null }>,
  experiences: Array<{ title: string; type: string; description: string | null; startDate: Date | null; endDate: Date | null }>
): string {
  const skillList = skills.map(s => `${s.skill?.name ?? 'Unknown'} (Lv.${s.level ?? 1})`).join(', ');
  const expList = experiences
    .map(e => `[${e.type}] ${e.title}${e.description ? `: ${e.description.slice(0, 120)}` : ''}`)
    .join('\n');

  return `
Candidate: ${user.name ?? 'Candidate'}
Bio: ${user.bio ?? 'Not provided'}
Top Skills: ${skillList || 'None listed'}
Experience:
${expList || 'None listed'}
  `.trim();
}

// =============================================================================
// Route Handler
// =============================================================================

export async function POST(req: Request) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { action, targetJob, question, answer } = body;

    if (!action || !['generate', 'evaluate'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "generate" or "evaluate".' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { user, skills, experiences } = await getUserPortfolioData(userId);
    const portfolioContext = buildPortfolioContext(user ?? { name: null, bio: null }, skills, experiences);

    // -------------------------------------------------------------------------
    // Action: generate — returns array of questions
    // -------------------------------------------------------------------------
    if (action === 'generate') {
      const jobContext = targetJob ? `Target role: ${targetJob}` : 'General software/tech professional role';

      const prompt = `
You are an experienced technical recruiter conducting a job interview.
${jobContext}

Based on this candidate's portfolio, generate exactly 5 interview questions:
- 2 behavioral questions using the STAR method format (Situation, Task, Action, Result)
- 2 technical questions based on their top skills
- 1 situational / problem-solving question

Candidate Portfolio:
${portfolioContext}

Return ONLY a JSON array of exactly 5 objects, no markdown, no explanation:
[
  { "id": 1, "type": "behavioral", "question": "...", "hint": "Use the STAR format: Situation, Task, Action, Result" },
  { "id": 2, "type": "behavioral", "question": "...", "hint": "Use the STAR format: Situation, Task, Action, Result" },
  { "id": 3, "type": "technical", "question": "...", "hint": "Be specific about your experience and approach" },
  { "id": 4, "type": "technical", "question": "...", "hint": "Walk through your thought process" },
  { "id": 5, "type": "situational", "question": "...", "hint": "Consider the context, your options, and the outcome" }
]
      `.trim();

      const { text } = await generateText({
        model: google('gemini-2.0-flash-exp'),
        prompt,
        maxTokens: 800,
      });

      // Parse the JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse questions from AI response');
      }
      const questions = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({ questions }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // -------------------------------------------------------------------------
    // Action: evaluate — returns feedback for a single answer
    // -------------------------------------------------------------------------
    if (action === 'evaluate') {
      if (!question || !answer) {
        return new Response(
          JSON.stringify({ error: 'question and answer are required for evaluate action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const prompt = `
You are an experienced technical recruiter evaluating an interview answer.

Candidate Portfolio Context:
${portfolioContext}

Interview Question: ${question}
Candidate's Answer: ${answer}

Evaluate the answer on three dimensions and provide actionable feedback.
Return ONLY a JSON object, no markdown, no explanation:
{
  "score": <number 1-10>,
  "strengths": ["<point 1>", "<point 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "idealElements": "<1-2 sentences on what a strong answer would include>",
  "verdict": "strong" | "good" | "needs_work"
}
      `.trim();

      const { text } = await generateText({
        model: google('gemini-2.0-flash-exp'),
        prompt,
        maxTokens: 400,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse evaluation from AI response');
      }
      const evaluation = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({ evaluation }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('INTERVIEW_API_ERROR:', errorMessage);

    return new Response(
      JSON.stringify({ error: 'Interview API failed', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
