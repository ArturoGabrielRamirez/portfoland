/**
 * CV Confirm API Route
 *
 * POST /api/cv/confirm — accepts confirmed CV items as JSON and bulk-creates
 * them in the database via bulkCreateFromCVService.
 * Exists for direct API consumers; the CVImportPanel uses importCVAction instead.
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { bulkCreateFromCVService } from '@/features/cv/services/bulkCreateFromCV.service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Auth guard
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JSON body
    const body = await request.json();
    const { skills = [], experiences = [], projects = [] } = body;

    // Use session userId exclusively — never trust userId from body
    const result = await bulkCreateFromCVService(
      session.user.id,
      skills,
      experiences,
      projects
    );

    return NextResponse.json(result);
  } catch (error) {
    logger.error('CV_CONFIRM_FAILED', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
