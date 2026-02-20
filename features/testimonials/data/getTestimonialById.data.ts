/**
 * Get Testimonial by ID
 *
 * Retrieves a single testimonial by its ID.
 */

import { prisma } from '@/lib/prisma';
import type { TestimonialModel } from '../types/testimonial';

/**
 * Get a single testimonial by ID
 *
 * @param id - The testimonial ID
 * @returns The testimonial or null if not found
 */
export async function getTestimonialByIdData(id: string): Promise<TestimonialModel | null> {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });

  return testimonial;
}
