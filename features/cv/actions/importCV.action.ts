/**
 * Import CV Server Action
 *
 * Validates confirmed CV import items and orchestrates bulk creation
 * of skills, experiences, and projects via bulkCreateFromCVService.
 */

'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { confirmCVImportSchema } from '../schemas/cvImport.schema';
import { bulkCreateFromCVService } from '../services/bulkCreateFromCV.service';
import type { BulkCreateResult } from '../types/cvImport';

/**
 * Import confirmed CV items into the user's portfolio
 *
 * @param input - Object containing skills, experiences, and projects arrays (confirmed subset only)
 * @returns ActionResponse with aggregate import counts
 */
export async function importCVAction(input: Record<string, unknown>) {
  return actionWrapper<BulkCreateResult>(async () => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      throw new Error('You must be logged in to import a CV');
    }

    const data = await confirmCVImportSchema.validate(input);

    const result = await bulkCreateFromCVService(
      session.user.id,
      data.skills ?? [],
      data.experiences ?? [],
      data.projects ?? []
    );

    return {
      payload: result,
      message: `Imported: ${result.skillsAdded} skills, ${result.experiencesAdded} experiences, ${result.projectsAdded} projects`,
    };
  });
}
