/**
 * CV Import API Route
 *
 * POST /api/cv/import — accepts a PDF or DOCX file, extracts plain text,
 * calls Gemini AI to return structured career data, and saves as a CVDocument
 * so the user can analyze or edit it later alongside AI-generated CVs.
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { CVImportSchema } from '@/features/cv/schemas/cvImport.schema';
import { createCVDocument } from '@/features/cv/data/createCV.data';
import type { CVContent } from '@/features/cv/types/cv';
import type { CVImportSchemaOutput } from '@/features/cv/schemas/cvImport.schema';

export const runtime = 'nodejs';

// Accepted MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 15000;

// =============================================================================
// Preview → CVContent mapper
// =============================================================================

/**
 * Maps the flat AI-extracted preview to the structured CVContent format
 * expected by the CV Generator (analysis tools, PDF export, etc.).
 */
function mapPreviewToCVContent(preview: CVImportSchemaOutput, filename: string): CVContent {
  // Group flat skills list into categories for CVSkillSection
  const categoryMap = new Map<string, Array<{ name: string; level: number; validated: boolean }>>();
  for (const skill of preview.skills) {
    const cat = skill.category || 'Other';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push({ name: skill.name, level: skill.level, validated: false });
  }
  const skillCategories = Array.from(categoryMap.entries()).map(([name, skills]) => ({
    name,
    skills,
  }));

  const toExpEntry = (e: CVImportSchemaOutput['experiences'][number]) => ({
    title: e.title,
    company: e.company,
    startDate: e.startDate,
    endDate: e.endDate ?? null,
    description: e.description || '',
    type: e.type,
  });

  return {
    professionalSummary: preview.summary || '',
    skills: { categories: skillCategories },
    workExperience: preview.experiences.filter((e) => e.type === 'WORK').map(toExpEntry),
    education: preview.experiences.filter((e) => e.type === 'EDUCATION').map(toExpEntry),
    certifications: preview.experiences.filter((e) => e.type === 'CERTIFICATION').map(toExpEntry),
    projects: preview.projects.map((p) => ({
      title: p.title,
      description: p.description,
      technologies: p.technologies,
      links: [],
      status: 'completed',
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      targetJob: undefined,
      locale: 'es',
      portfolioMode: 'classic',
    },
  };
}

/** Strip extension from filename for use as CV title */
function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '') || 'Imported CV';
}

// =============================================================================
// Route handler
// =============================================================================

export async function POST(request: Request) {
  try {
    // Auth guard
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a PDF or DOCX.' },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract plain text based on MIME type
    let text: string;

    if (file.type === 'application/pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    // Truncate text to keep AI token cost predictable
    const truncatedText = text.slice(0, MAX_TEXT_LENGTH);

    // Set up the Google AI provider
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Build the extraction prompt
    const prompt = `You are an expert at parsing resumes and CVs. Extract structured career data from the following CV text.

INSTRUCTIONS:
- Extract up to 30 skills with a level 1–5 (where 1 = beginner, 5 = expert based on years/context and prominence in the CV); infer category from skill type (e.g., Frontend, Backend, DevOps, Database, Mobile, Design, Other)
- Extract up to 20 experience entries; use type WORK for jobs, EDUCATION for degrees/courses, CERTIFICATION for certifications; format dates as ISO strings (YYYY-MM-DD); use "2000-01-01" as a fallback if only a year is given; keep description under 1000 characters
- Extract up to 10 projects; list technologies as individual strings (e.g. ["React", "Node.js"]); keep description under 400 characters
- Extract a summary only if the CV has an explicit objective or summary section — use the exact text if short, or a concise paraphrase
- If a field is not clearly present in the CV, return an empty array or omit optional fields

CV TEXT:
${truncatedText}`;

    // Call generateObject with the CV import schema
    const { object: preview } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: CVImportSchema,
      prompt,
    });

    // Save as CVDocument so it appears in the CV library for analysis/editing
    let savedCvId: string | null = null;
    try {
      const cvContent = mapPreviewToCVContent(preview, file.name);
      const cvDoc = await createCVDocument({
        userId,
        title: titleFromFilename(file.name),
        content: cvContent,
      });
      savedCvId = cvDoc.id;
      logger.debug(`CV_IMPORT_SAVED | cvId: ${savedCvId} | userId: ${userId}`);
    } catch (saveErr) {
      // Saving is non-critical — the user still gets the extraction preview
      logger.error('CV_IMPORT_SAVE_FAILED', saveErr);
    }

    return NextResponse.json({ ...preview, savedCvId });
  } catch (error) {
    logger.error('CV_IMPORT_FAILED', error);
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 });
  }
}
