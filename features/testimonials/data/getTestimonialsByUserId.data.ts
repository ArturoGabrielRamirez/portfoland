/**
 * Get Testimonials by User ID
 *
 * Retrieves all testimonials for a user ordered by order asc.
 * Used for the dashboard view (includes unpublished items).
 */

import { prisma } from '@/lib/prisma';
import type { TestimonialModel } from '../types/testimonial';

/**
 * Get all testimonials for a user (dashboard view, includes unpublished)
 *
 * @param userId - The user's ID
 * @returns Array of testimonials ordered by order asc
 */
export async function getTestimonialsByUserIdData(userId: string): Promise<TestimonialModel[]> {
  const testimonials = await prisma.testimonial.findMany({
    where: { userId },
    orderBy: [{ order: 'asc' }],
  });

  return testimonials;
}
