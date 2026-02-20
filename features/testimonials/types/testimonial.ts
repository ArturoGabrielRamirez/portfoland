/**
 * Testimonial Types
 *
 * Re-exports Prisma types and defines derived types for the Testimonials feature.
 */

// =============================================================================
// Re-export Prisma Types
// =============================================================================

export type { TestimonialModel } from '@/app/generated/prisma/models/Testimonial';

import type { TestimonialModel } from '@/app/generated/prisma/models/Testimonial';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a new testimonial
 * Excludes auto-generated fields (id, userId, createdAt, updatedAt)
 */
export interface CreateTestimonialInput {
  clientName: string;
  clientTitle?: string | null;
  content: string;
  rating: number;
  imageUrl?: string | null;
  source?: string | null;
  externalId?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Input for updating an existing testimonial
 * All fields are optional except id
 */
export interface UpdateTestimonialInput {
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

// Ensure TestimonialModel is used for re-export purposes
export type { TestimonialModel as Testimonial };
