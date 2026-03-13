/**
 * Analyze CV Service
 *
 * Runs the 6 improvement prompts against a generated CV,
 * returning structured analysis results via generateObject.
 */

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { consumeLifeService } from '@/features/ai-quota';
import { getAnalysisPrompt } from '../constants/prompts';
import { logger } from '@/lib/logger';
import type { CVContent, CVAnalysisType, CVAnalysisResult } from '../types/cv';

// =============================================================================
// AI Provider
// =============================================================================

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// =============================================================================
// Zod Schema (mirrors CVAnalysisResult for generateObject)
// =============================================================================

const cvAnalysisResultSchema = z.object({
  type: z.enum([
    'reality_check',
    'ats_optimization',
    'impact_improvement',
    'keyword_gap',
    'weakness_detection',
    'differentiation',
  ]),
  score: z.number().min(0).max(100).nullable().optional()
    .describe('Overall score 0-100 where applicable, null if not'),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'warning', 'info']),
    issue: z.string().describe('Description of the problem or area to improve'),
    impact: z.string().describe('Why this is a problem'),
    fix: z.string().describe('Concrete suggestion to fix the issue'),
  })),
  keywords: z.array(z.object({
    keyword: z.string(),
    found: z.boolean(),
    priority: z.enum(['high', 'medium', 'low']),
  })).optional().describe('Keyword analysis, primarily for ATS and keyword gap analyses'),
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Serialize CVContent to human-readable text for prompt consumption
 *
 * Converts the structured CV JSON into a plain-text representation
 * that an LLM can analyze effectively.
 */
export function serializeCVToText(cv: CVContent): string {
  const sections: string[] = [];

  // Professional Summary
  sections.push('=== PROFESSIONAL SUMMARY ===');
  sections.push(cv.professionalSummary);
  sections.push('');

  // Skills
  sections.push('=== SKILLS ===');
  for (const category of cv.skills.categories) {
    const skillList = category.skills
      .map(s => `${s.name} (Level ${s.level}/5${s.validated ? ', Validated' : ''})`)
      .join(', ');
    sections.push(`${category.name}: ${skillList}`);
  }
  sections.push('');

  // Work Experience
  if (cv.workExperience.length > 0) {
    sections.push('=== WORK EXPERIENCE ===');
    for (const exp of cv.workExperience) {
      sections.push(`${exp.title} at ${exp.company}`);
      sections.push(`${exp.startDate} — ${exp.endDate || 'Present'}`);
      sections.push(exp.description);
      sections.push('');
    }
  }

  // Projects
  if (cv.projects.length > 0) {
    sections.push('=== PROJECTS ===');
    for (const proj of cv.projects) {
      sections.push(`${proj.title} [${proj.status}]`);
      sections.push(proj.description);
      if (proj.technologies.length > 0) {
        sections.push(`Technologies: ${proj.technologies.join(', ')}`);
      }
      if (proj.links.length > 0) {
        sections.push(`Links: ${proj.links.map(l => `${l.label}: ${l.url}`).join(', ')}`);
      }
      sections.push('');
    }
  }

  // Education
  if (cv.education.length > 0) {
    sections.push('=== EDUCATION ===');
    for (const edu of cv.education) {
      sections.push(`${edu.title} at ${edu.company}`);
      sections.push(`${edu.startDate} — ${edu.endDate || 'Present'}`);
      sections.push(edu.description);
      sections.push('');
    }
  }

  // Certifications
  if (cv.certifications.length > 0) {
    sections.push('=== CERTIFICATIONS ===');
    for (const cert of cv.certifications) {
      sections.push(`${cert.title} from ${cert.company}`);
      sections.push(`${cert.startDate}`);
      sections.push(cert.description);
      sections.push('');
    }
  }

  // Languages
  if (cv.languages && cv.languages.length > 0) {
    sections.push('=== LANGUAGES ===');
    sections.push(cv.languages.join(', '));
    sections.push('');
  }

  return sections.join('\n');
}

// =============================================================================
// Analysis types requiring job description
// =============================================================================

const REQUIRES_JOB_DESCRIPTION: CVAnalysisType[] = [
  'ats_optimization',
  'keyword_gap',
];

// =============================================================================
// Service
// =============================================================================

/**
 * Analyze a CV using one of the 6 improvement prompts
 *
 * @param userId - The user's ID (for life consumption)
 * @param cvContent - The structured CV to analyze
 * @param analysisType - Which analysis to run
 * @param jobDescription - Job description (required for ATS and keyword gap)
 * @param locale - Language locale (en/es)
 * @returns Structured analysis result
 */
export async function analyzeCVService(
  userId: string,
  cvContent: CVContent,
  analysisType: CVAnalysisType,
  jobDescription?: string,
  locale: string = 'en',
): Promise<CVAnalysisResult> {
  logger.info(`CV_ANALYZE_START | User: ${userId} | Type: ${analysisType}`);

  // Validate: certain analysis types require a job description
  if (REQUIRES_JOB_DESCRIPTION.includes(analysisType) && !jobDescription) {
    const msg = locale === 'es'
      ? `El analisis "${analysisType}" requiere una descripcion del puesto`
      : `Analysis type "${analysisType}" requires a job description`;
    throw new Error(msg);
  }

  // 1. Check and consume a life
  const { hasLives, error } = await consumeLifeService(userId, locale);

  if (!hasLives) {
    throw new Error(error || 'No AI energy remaining');
  }

  // 2. Serialize CV to text
  const cvText = serializeCVToText(cvContent);

  // 3. Get the analysis prompt
  const prompt = getAnalysisPrompt(
    analysisType,
    cvText,
    locale,
    jobDescription,
    cvContent.metadata.targetJob,
  );

  // 4. Call generateObject for structured output
  const { object: analysisResult } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: cvAnalysisResultSchema,
    prompt,
  });

  logger.info(`CV_ANALYZE_COMPLETE | User: ${userId} | Type: ${analysisType} | Issues: ${analysisResult.issues.length}`);

  // Normalize the result to match CVAnalysisResult
  return {
    type: analysisResult.type as CVAnalysisType,
    score: analysisResult.score ?? undefined,
    issues: analysisResult.issues,
    keywords: analysisResult.keywords,
  };
}
