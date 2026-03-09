/**
 * Analyze CV Server Action
 *
 * Runs one of the 6 improvement analyses on a saved CV.
 */

'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { analyzeCVSchema } from '../schemas/cv.schema';
import { analyzeCVService } from '../services/analyzeCV.service';
import { prisma } from '@/lib/prisma';
import type { CVAnalysisResult, CVAnalysisType, CVContent } from '../types/cv';

/**
 * Analyze a saved CV using one of the 6 improvement prompts
 *
 * @param input - Object with cvId, analysisType, and optional jobDescription
 * @returns ActionResponse with analysis result
 */
export async function analyzeCVAction(
  input: Record<string, unknown>
) {
  return actionWrapper<CVAnalysisResult>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('You must be logged in to analyze a CV');
    }

    const data = await analyzeCVSchema.validate(input);

    // Fetch CV with ownership check
    const cvDocument = await prisma.cVDocument.findUnique({
      where: { id: data.cvId },
      select: { userId: true, content: true },
    });

    if (!cvDocument) {
      throw new Error('CV document not found');
    }

    if (cvDocument.userId !== session.user.id) {
      throw new Error('Unauthorized: CV document does not belong to you');
    }

    const cvContent = cvDocument.content as unknown as CVContent;

    const result = await analyzeCVService(
      session.user.id,
      cvContent,
      data.analysisType as CVAnalysisType,
      data.jobDescription ?? undefined,
    );

    return {
      payload: result,
      message: 'CV analysis completed',
    };
  });
}
