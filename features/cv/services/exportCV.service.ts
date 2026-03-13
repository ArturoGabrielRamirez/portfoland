/**
 * Export CV Service
 *
 * Server-side PDF generation using @react-pdf/renderer.
 * Renders the CVPdfDocument React component to a PDF buffer.
 */

import React from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { CVPdfDocument } from '../components/CVPdfDocument';
import { logger } from '@/lib/logger';
import type { CVContent } from '../types/cv';

/**
 * Export CV content to a PDF buffer
 *
 * @param cvContent - The structured CV content
 * @param userName - The user's display name
 * @param userEmail - The user's email
 * @param contactLinks - Optional contact links (key-value pairs)
 * @param template - PDF template: "professional" (full) or "minimal" (compact)
 * @returns PDF as a Buffer
 */
export async function exportCVtoPDF(
  cvContent: CVContent,
  userName: string,
  userEmail: string,
  contactLinks?: Record<string, string>,
  template: 'professional' | 'minimal' = 'professional',
): Promise<Buffer> {
  logger.info(`CV_EXPORT_PDF | Template: ${template} | User: ${userName}`);

  const document = React.createElement(CVPdfDocument, {
    cvContent,
    userName,
    userEmail,
    contactLinks,
    template,
  });

  // @react-pdf/renderer expects ReactElement<DocumentProps> — use double assertion
  // since the component returns a <Document> element at runtime
  const buffer = await renderToBuffer(
    document as unknown as React.ReactElement<DocumentProps>,
  );

  logger.info(`CV_EXPORT_PDF_COMPLETE | Size: ${buffer.byteLength} bytes`);

  return Buffer.from(buffer);
}
