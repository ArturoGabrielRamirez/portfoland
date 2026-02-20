/**
 * Get Public Testimonials by Username
 *
 * Resolves a username to a userId then delegates to the Testimonials feature
 * data layer. Returns an empty array if the user does not exist.
 */

import { prisma } from '@/lib/prisma';
import { getPublicTestimonialsData } from '@/features/testimonials/data';
import type { TestimonialModel } from '@/features/testimonials/types/testimonial';

/**
 * Get published testimonials for a user identified by username
 *
 * @param username - The user's public username
 * @returns Array of published testimonials ordered by order asc, or [] if user not found
 */
export async function getPublicTestimonialsByUsername(
  username: string
): Promise<TestimonialModel[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  return getPublicTestimonialsData(user.id);
}
