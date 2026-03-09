/**
 * Create / Update CV Document
 *
 * Data layer functions for creating and updating CV documents.
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import type { CVDocumentModel, CVContent, CVAnalysisResult } from '../types/cv';

// =============================================================================
// Input Types
// =============================================================================

export interface CreateCVDocumentInput {
  userId: string;
  title: string;
  targetJob?: string | null;
  jobDescription?: string | null;
  content: CVContent;
  analysisResults?: Record<string, CVAnalysisResult> | null;
}

export interface UpdateCVDocumentInput {
  title?: string;
  targetJob?: string | null;
  jobDescription?: string | null;
  content?: CVContent;
  analysisResults?: Record<string, CVAnalysisResult> | null;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Safely convert a value to Prisma InputJsonValue via JSON round-trip
 */
function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

// =============================================================================
// Data Functions
// =============================================================================

/**
 * Create a new CV document
 *
 * @param data - The CV document data
 * @returns The created CV document
 */
export async function createCVDocument(data: CreateCVDocumentInput): Promise<CVDocumentModel> {
  const cvDocument = await prisma.cVDocument.create({
    data: {
      userId: data.userId,
      title: data.title,
      targetJob: data.targetJob ?? null,
      jobDescription: data.jobDescription ?? null,
      content: toJsonValue(data.content),
      analysisResults: data.analysisResults ? toJsonValue(data.analysisResults) : undefined,
    },
  });

  return cvDocument as unknown as CVDocumentModel;
}

/**
 * Update an existing CV document with ownership check
 *
 * @param id - The CV document ID
 * @param userId - The user's ID (for ownership verification)
 * @param data - The fields to update
 * @returns The updated CV document
 * @throws Error if the document does not exist or does not belong to the user
 */
export async function updateCVDocument(
  id: string,
  userId: string,
  data: UpdateCVDocumentInput
): Promise<CVDocumentModel> {
  const existing = await prisma.cVDocument.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    throw new Error('CV document not found');
  }

  if (existing.userId !== userId) {
    throw new Error('Unauthorized: CV document does not belong to user');
  }

  const updateData: Prisma.CVDocumentUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.targetJob !== undefined) updateData.targetJob = data.targetJob;
  if (data.jobDescription !== undefined) updateData.jobDescription = data.jobDescription;
  if (data.content !== undefined) updateData.content = toJsonValue(data.content);
  if (data.analysisResults !== undefined) {
    updateData.analysisResults = data.analysisResults ? toJsonValue(data.analysisResults) : null;
  }

  const cvDocument = await prisma.cVDocument.update({
    where: { id },
    data: updateData,
  });

  return cvDocument as unknown as CVDocumentModel;
}
