/**
 * Get CVs by User ID
 *
 * Retrieves all CV documents for a user ordered by updatedAt desc.
 */

import { prisma } from '@/lib/prisma';
import type { CVDocumentModel } from '../types/cv';

/**
 * Get all CV documents for a user
 *
 * @param userId - The user's ID
 * @returns Array of CV documents ordered by most recently updated
 */
export async function getCVsByUserId(userId: string): Promise<CVDocumentModel[]> {
  const cvDocuments = await prisma.cVDocument.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return cvDocuments as unknown as CVDocumentModel[];
}
