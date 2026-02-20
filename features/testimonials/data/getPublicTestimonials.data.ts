/**
 * Get Public Testimonials
 *
 * Retrieves only published testimonials for a user, ordered by order asc.
 * Used for the public portfolio view.
 */

import { prisma } from '@/lib/prisma';
import type { TestimonialModel } from '../types/testimonial';

/**
 * Get published testimonials for a user (public portfolio view)
 *
 * @param userId - The user's ID
 * @returns Array of published testimonials ordered by order asc
 */
export async function getPublicTestimonialsData(userId: string): Promise<TestimonialModel[]> {
  const testimonials = await prisma.testimonial.findMany({
    where: { userId, published: true },
    orderBy: [{ order: 'asc' }],
  });

  return testimonials;
}
