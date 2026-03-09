/**
 * Generate CV Service
 *
 * Core service that creates a structured CV from the user's portfolio data
 * using AI (Gemini Flash) via the Vercel AI SDK's generateObject.
 */

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { consumeLifeService } from '@/features/ai-quota';
import { getUserSkillsData } from '@/features/skills/data/getUserSkills.data';
import { getExperiencesByUserId } from '@/features/timeline/data/getExperiences.data';
import { getProjectsByUserIdData } from '@/features/projects/data/getProjectsByUserId.data';
import { getGitHubConnectionStatus } from '@/features/github/data/getGitHubConnectionStatus.data';
import { createCVDocument } from '../data/createCV.data';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { CVContent } from '../types/cv';

// =============================================================================
// AI Provider
// =============================================================================

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// =============================================================================
// Zod Schema (mirrors CVContent interface for generateObject)
// =============================================================================

const cvContentSchema = z.object({
  professionalSummary: z.string().describe('Professional summary paragraph highlighting key strengths, experience, and value proposition'),
  skills: z.object({
    categories: z.array(z.object({
      name: z.string().describe('Category name (e.g., Frontend, Backend, DevOps)'),
      skills: z.array(z.object({
        name: z.string(),
        level: z.number().min(1).max(5).describe('Skill level 1-5'),
        validated: z.boolean().describe('Whether the skill is GitHub or assessment validated'),
      })),
    })),
  }),
  workExperience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.string().describe('ISO date string or formatted date'),
    endDate: z.string().nullable().describe('ISO date string, null if current position'),
    description: z.string().describe('Achievement-focused description with measurable results'),
    type: z.string().default('WORK'),
  })),
  education: z.array(z.object({
    title: z.string(),
    company: z.string().describe('Institution name'),
    startDate: z.string(),
    endDate: z.string().nullable(),
    description: z.string(),
    type: z.string().default('EDUCATION'),
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string().describe('Impact-focused project description'),
    technologies: z.array(z.string()),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })),
    status: z.string(),
  })),
  certifications: z.array(z.object({
    title: z.string(),
    company: z.string().describe('Issuing organization'),
    startDate: z.string(),
    endDate: z.string().nullable(),
    description: z.string(),
    type: z.string().default('CERTIFICATION'),
  })),
  languages: z.array(z.string()).optional().describe('Languages the candidate speaks'),
  metadata: z.object({
    generatedAt: z.string(),
    targetJob: z.string().optional(),
    locale: z.string(),
    portfolioMode: z.string(),
  }),
});

// =============================================================================
// Service
// =============================================================================

interface GenerateCVResult {
  cvContent: CVContent;
  cvId: string;
  title: string;
}

/**
 * Generate a structured CV from the user's portfolio data
 *
 * @param userId - The user's ID
 * @param targetJob - Optional target job title for tailoring
 * @param jobDescription - Optional job description for ATS optimization
 * @param locale - Language locale (en/es)
 * @returns Generated CV content, document ID, and title
 */
export async function generateCVService(
  userId: string,
  targetJob?: string,
  jobDescription?: string,
  locale: string = 'en',
): Promise<GenerateCVResult> {
  logger.info(`CV_GENERATE_START | User: ${userId} | Target: ${targetJob || 'general'}`);

  // 1. Check and consume a life
  const { hasLives, error } = await consumeLifeService(userId, locale);

  if (!hasLives) {
    throw new Error(error || 'No AI energy remaining');
  }

  // 2. Fetch all portfolio data in parallel
  const [userSkills, timelineData, projects, user, githubStatus] = await Promise.all([
    getUserSkillsData(userId),
    getExperiencesByUserId(userId),
    getProjectsByUserIdData(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        bio: true,
        username: true,
        portfolioMode: true,
        githubStats: true,
        contactLinks: true,
      },
    }),
    getGitHubConnectionStatus(userId),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  const { experiences } = timelineData;

  // 3. Sort and filter portfolio data

  // Skills: GitHub-validated first, then by level desc, top 20
  const sortedSkills = [...userSkills].sort((a, b) => {
    const aScore = a.githubValidated ? 1 : 0;
    const bScore = b.githubValidated ? 1 : 0;

    if (bScore !== aScore) return bScore - aScore;
    return b.level - a.level;
  }).slice(0, 20);

  // Projects: featured first, then COMPLETED > IN_PROGRESS, top 5
  const statusOrder: Record<string, number> = { COMPLETED: 0, IN_PROGRESS: 1, PLANNED: 2 };
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  }).slice(0, 5);

  // Experiences: separate by type
  const workExperiences = experiences
    .filter(e => e.type === 'WORK')
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  const educationExperiences = experiences
    .filter(e => e.type === 'EDUCATION')
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  const certificationExperiences = experiences
    .filter(e => e.type === 'CERTIFICATION')
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  // 4. Build skill context grouped by category
  const skillsByCategory = new Map<string, Array<{ name: string; level: number; validated: boolean }>>();

  for (const us of sortedSkills) {
    const categoryName = us.skill.category?.name || 'Other';
    const existing = skillsByCategory.get(categoryName) || [];
    existing.push({
      name: us.skill.name,
      level: us.level,
      validated: us.githubValidated,
    });
    skillsByCategory.set(categoryName, existing);
  }

  const skillsContext = Array.from(skillsByCategory.entries())
    .map(([cat, skills]) => `  ${cat}: ${skills.map(s => `${s.name} (L${s.level}${s.validated ? ', validated' : ''})`).join(', ')}`)
    .join('\n');

  // 5. Build experiences context
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const workContext = workExperiences.map(e =>
    `  - ${e.title} at ${e.company} (${formatDate(e.startDate)} — ${e.endDate ? formatDate(e.endDate) : 'Present'})\n    ${e.description}`,
  ).join('\n');

  const educationContext = educationExperiences.map(e =>
    `  - ${e.title} at ${e.company} (${formatDate(e.startDate)} — ${e.endDate ? formatDate(e.endDate) : 'Present'})\n    ${e.description}`,
  ).join('\n');

  const certContext = certificationExperiences.map(e =>
    `  - ${e.title} from ${e.company} (${formatDate(e.startDate)})\n    ${e.description}`,
  ).join('\n');

  // 6. Build projects context
  const projectLinks = (links: unknown): string => {
    if (!Array.isArray(links)) return '';
    return (links as Array<{ label: string; url: string }>)
      .map(l => `${l.label}: ${l.url}`)
      .join(', ');
  };

  const projectsContext = sortedProjects.map(p =>
    `  - ${p.title} [${p.status}${p.featured ? ', Featured' : ''}]\n    ${p.description}\n    Tech: ${p.technologies.join(', ')}${projectLinks(p.links) ? `\n    Links: ${projectLinks(p.links)}` : ''}`,
  ).join('\n');

  // 7. GitHub context
  const githubContext = githubStatus.isConnected && githubStatus.stats
    ? `GitHub: Connected. Total commits: ${githubStatus.stats.totalCommits || 0}. Stars: ${githubStatus.stats.stars || 0}. Validated skills: ${githubStatus.stats.validatedSkillsCount || 0}. Last synced: ${githubStatus.syncedAt?.toISOString() || 'unknown'}.`
    : 'GitHub: Not connected.';

  // 8. Build the system prompt
  const isSpanish = locale === 'es';

  const systemPrompt = isSpanish
    ? `Eres un experto en redaccion de CVs profesionales. Genera un CV estructurado y optimizado a partir de los datos del portfolio del usuario.

DATOS DEL PORTFOLIO:
Nombre: ${user.name}
Bio: ${user.bio || 'No proporcionada — genera un resumen profesional basado en los datos disponibles'}

SKILLS (por categoria):
${skillsContext || '  No hay skills registradas'}

EXPERIENCIA LABORAL:
${workContext || '  No hay experiencia laboral registrada'}

EDUCACION:
${educationContext || '  No hay educacion registrada'}

CERTIFICACIONES:
${certContext || '  No hay certificaciones registradas'}

PROYECTOS (top 5):
${projectsContext || '  No hay proyectos registrados'}

${githubContext}

INSTRUCCIONES:
- Genera un CV profesional y completo en ESPANOL
- El resumen profesional debe ser impactante, enfocado en valor y resultados
- Mejora las descripciones de experiencia para enfocarse en logros medibles
- Agrupa las skills por categoria y resalta las validadas
- Si no hay bio, genera un resumen profesional basado en las skills y experiencia
${targetJob ? `- IMPORTANTE: Adapta TODO el CV para el puesto de: ${targetJob}` : ''}
${jobDescription ? `- CRITICO: Optimiza para ATS. Integra keywords de esta descripcion del puesto:\n${jobDescription}` : ''}
- Usa formato profesional y conciso
- metadata.generatedAt debe ser: ${new Date().toISOString()}
- metadata.locale debe ser: ${locale}
- metadata.portfolioMode debe ser: ${user.portfolioMode}
${targetJob ? `- metadata.targetJob debe ser: ${targetJob}` : ''}`
    : `You are an expert professional CV writer. Generate a structured, optimized CV from the user's portfolio data.

PORTFOLIO DATA:
Name: ${user.name}
Bio: ${user.bio || 'Not provided — generate a professional summary based on available data'}

SKILLS (by category):
${skillsContext || '  No skills registered'}

WORK EXPERIENCE:
${workContext || '  No work experience registered'}

EDUCATION:
${educationContext || '  No education registered'}

CERTIFICATIONS:
${certContext || '  No certifications registered'}

PROJECTS (top 5):
${projectsContext || '  No projects registered'}

${githubContext}

INSTRUCTIONS:
- Generate a professional, complete CV in ENGLISH
- Professional summary should be impactful, focused on value and results
- Improve experience descriptions to focus on measurable achievements
- Group skills by category, highlight validated ones
- If no bio exists, generate a professional summary from skills and experience
${targetJob ? `- IMPORTANT: Tailor the ENTIRE CV for the position of: ${targetJob}` : ''}
${jobDescription ? `- CRITICAL: Optimize for ATS. Integrate keywords from this job description:\n${jobDescription}` : ''}
- Use professional, concise format
- metadata.generatedAt must be: ${new Date().toISOString()}
- metadata.locale must be: ${locale}
- metadata.portfolioMode must be: ${user.portfolioMode}
${targetJob ? `- metadata.targetJob must be: ${targetJob}` : ''}`;

  // 9. Call generateObject
  const { object: cvContent } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: cvContentSchema,
    prompt: systemPrompt,
  });

  // 10. Save to DB
  const title = targetJob
    ? `CV — ${targetJob}`
    : isSpanish ? 'CV General' : 'General CV';

  const cvDocument = await createCVDocument({
    userId,
    title,
    targetJob: targetJob ?? null,
    jobDescription: jobDescription ?? null,
    content: cvContent as CVContent,
  });

  logger.info(`CV_GENERATE_COMPLETE | User: ${userId} | CV ID: ${cvDocument.id}`);

  return {
    cvContent: cvContent as CVContent,
    cvId: cvDocument.id,
    title,
  };
}
