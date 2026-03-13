/**
 * CV PDF Download API Route
 *
 * GET /api/cv/[id]/pdf — generates and returns a PDF for the given CV document.
 * Requires authentication; validates ownership.
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { exportCVtoPDF } from '@/features/cv/services/exportCV.service';
import { logger } from '@/lib/logger';
import type { CVContent } from '@/features/cv/types/cv';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = await params;

    // Fetch CV document with ownership check
    const cvDocument = await prisma.cVDocument.findUnique({
      where: { id },
    });

    if (!cvDocument) {
      return new Response(JSON.stringify({ error: 'CV not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (cvDocument.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch user profile for PDF header
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        contactLinks: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cvContent = cvDocument.content as unknown as CVContent;
    const contactLinks = (user.contactLinks as Record<string, string>) ?? undefined;

    const pdfBuffer = await exportCVtoPDF(
      cvContent,
      user.name || 'User',
      user.email,
      contactLinks,
    );

    // Build a safe filename from the CV title
    const safeTitle = cvDocument.title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50);

    // Convert Buffer to Uint8Array for Response constructor compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
      },
    });
  } catch (error) {
    logger.error('CV_PDF_ROUTE_ERROR:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'PDF generation failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
