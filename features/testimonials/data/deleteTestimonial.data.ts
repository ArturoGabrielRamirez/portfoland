/**
 * Delete Testimonial
 *
 * Deletes a testimonial by ID.
 */

import { prisma } from '@/lib/prisma';
import type { TestimonialModel } from '../types/testimonial';

/**
 * Delete a testimonial by ID
 *
 * @param id - The testimonial ID to delete
 * @returns The deleted testimonial
 */
export async function deleteTestimonialData(id: string): Promise<TestimonialModel> {
  const testimonial = await prisma.testimonial.delete({
    where: { id },
  });

  return testimonial;
}
