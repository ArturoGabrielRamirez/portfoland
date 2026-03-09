/**
 * Delete CV Document
 *
 * Deletes a CV document by ID with ownership verification.
 */

import { prisma } from '@/lib/prisma';

/**
 * Delete a CV document with ownership check
 *
 * @param id - The CV document ID to delete
 * @param userId - The user's ID (for ownership verification)
 * @throws Error if the document does not exist or does not belong to the user
 */
export async function deleteCVDocument(id: string, userId: string): Promise<void> {
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

  await prisma.cVDocument.delete({
    where: { id },
  });
}
