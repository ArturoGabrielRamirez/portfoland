/**
 * Classic Mode Content Existence Checks
 *
 * Lightweight boolean helpers that check whether a user has published content
 * for the Classic Mode sections (services, gallery, testimonials).
 * Used to conditionally render sections on the public portfolio page.
 */

import { prisma } from '@/lib/prisma';

/**
 * Returns true when the user has at least one published service.
 *
 * @param userId - The owner's user ID
 */
export async function hasServicesData(userId: string): Promise<boolean> {
  return (await prisma.service.count({ where: { userId, published: true } })) > 0;
}

/**
 * Returns true when the user has at least one published gallery item.
 *
 * @param userId - The owner's user ID
 */
export async function hasGalleryItemsData(userId: string): Promise<boolean> {
  return (await prisma.galleryItem.count({ where: { userId, published: true } })) > 0;
}

/**
 * Returns true when the user has at least one published testimonial.
 *
 * @param userId - The owner's user ID
 */
export async function hasTestimonialsData(userId: string): Promise<boolean> {
  return (await prisma.testimonial.count({ where: { userId, published: true } })) > 0;
}
