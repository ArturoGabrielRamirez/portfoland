/**
 * CV Import API Route
 *
 * POST /api/cv/import — accepts a PDF or DOCX file, extracts plain text,
 * and calls Gemini AI to return structured career data (skills, experiences, projects).
 * No DB writes occur here — this route only extracts and returns a preview.
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { CVImportSchema } from '@/features/cv/schemas/cvImport.schema';

export const runtime = 'nodejs';

// Accepted MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 15000;

export async function POST(request: Request) {
  try {
    // Auth guard
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      // pdf-parse v2 uses a class-based API
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
- Extract up to 20 experience entries; use type WORK for jobs, EDUCATION for degrees/courses, CERTIFICATION for certifications; format dates as ISO strings (YYYY-MM-DD); use "2000-01-01" as a fallback if only a year is given
- Extract up to 10 projects; list technologies as individual strings (e.g. ["React", "Node.js"])
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

    return NextResponse.json(preview);
  } catch (error) {
    logger.error('CV_IMPORT_FAILED', error);
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 });
  }
}
