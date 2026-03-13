/**
 * Delete CV Server Action
 *
 * Deletes a CV document for the authenticated user.
 */

'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { actionWrapper } from '@/features/core';
import { deleteCVSchema } from '../schemas/cv.schema';
import { deleteCVDocument } from '../data/deleteCV.data';

/**
 * Delete a CV document
 *
 * @param input - Object with cvId
 * @returns ActionResponse confirming deletion
 */
export async function deleteCVAction(
  input: Record<string, unknown>
) {
  return actionWrapper<null>(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error('You must be logged in to delete a CV');
    }

    const data = await deleteCVSchema.validate(input);

    await deleteCVDocument(data.cvId, session.user.id);

    revalidatePath('/dashboard/cv');

    return {
      payload: null,
      message: 'CV deleted successfully',
    };
  });
}
