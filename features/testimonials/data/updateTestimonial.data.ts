/**
 * Update Testimonial
 *
 * Updates an existing testimonial by ID.
 */

import { prisma } from '@/lib/prisma';
import type { TestimonialModel } from '../types/testimonial';

/**
 * Input for updating a testimonial at the data layer
 */
export interface UpdateTestimonialData {
  id: string;
  clientName?: string;
  clientTitle?: string | null;
  content?: string;
  rating?: number;
  imageUrl?: string | null;
  source?: string | null;
  externalId?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Update an existing testimonial
 *
 * @param data - The update data (id is required, other fields optional)
 * @returns The updated testimonial
 */
export async function updateTestimonialData(data: UpdateTestimonialData): Promise<TestimonialModel> {
  const { id, ...updateFields } = data;

  const updateData: Record<string, unknown> = {};

  if (updateFields.clientName !== undefined) updateData.clientName = updateFields.clientName;
  if (updateFields.clientTitle !== undefined) updateData.clientTitle = updateFields.clientTitle;
  if (updateFields.content !== undefined) updateData.content = updateFields.content;
  if (updateFields.rating !== undefined) updateData.rating = updateFields.rating;
  if (updateFields.imageUrl !== undefined) updateData.imageUrl = updateFields.imageUrl;
  if (updateFields.source !== undefined) updateData.source = updateFields.source;
  if (updateFields.externalId !== undefined) updateData.externalId = updateFields.externalId;
  if (updateFields.order !== undefined) updateData.order = updateFields.order;
  if (updateFields.published !== undefined) updateData.published = updateFields.published;

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: updateData,
  });

  return testimonial;
}
