/**
 * Generate CV Server Action
 *
 * Generates a structured CV from the user's portfolio data using AI.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { generateCVSchema } from '../schemas/cv.schema';
import { generateCVService } from '../services/generateCV.service';
import { createNotification } from '@/features/notifications/services/notification.service';
import type { CVContent } from '../types/cv';

interface GenerateCVPayload {
  cvId: string;
  cvContent: CVContent;
  title: string;
}

/**
 * Generate a CV from the user's portfolio data
 *
 * @param input - Object with optional targetJob and jobDescription
 * @returns ActionResponse with generated CV content and document ID
 */
export async function generateCVAction(
  input: Record<string, unknown>
) {
  return actionWrapper<GenerateCVPayload>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('You must be logged in to generate a CV');
    }

    const data = await generateCVSchema.validate(input);

    const result = await generateCVService(
      session.user.id,
      data.targetJob ?? undefined,
      data.jobDescription ?? undefined,
    );

    revalidatePath('/dashboard/cv');

    // Fire-and-forget notification (non-blocking)
    createNotification({
      userId: session.user.id,
      type: 'CV_GENERATED',
      title: 'CV ready!',
      message: `"${result.title}" has been generated and saved.`,
      metadata: { cvId: result.cvId, title: result.title },
    }).catch(() => {});

    return {
      payload: {
        cvId: result.cvId,
        cvContent: result.cvContent,
        title: result.title,
      },
      message: 'CV generated successfully',
    };
  });
}
