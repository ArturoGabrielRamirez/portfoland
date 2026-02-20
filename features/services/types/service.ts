/**
 * Service Types
 *
 * Re-exports Prisma types and defines derived types for the Services feature.
 */

// =============================================================================
// Re-export Prisma Types
// =============================================================================

export { PriceType } from '@/app/generated/prisma/enums';
export type { ServiceModel } from '@/app/generated/prisma/models/Service';

import type { PriceType } from '@/app/generated/prisma/enums';
import type { ServiceModel } from '@/app/generated/prisma/models/Service';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a new service
 * Excludes auto-generated fields (id, userId, createdAt, updatedAt)
 */
export interface CreateServiceInput {
  title: string;
  description: string;
  priceType: PriceType;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  durationMinutes?: number | null;
  order?: number;
  published?: boolean;
  imageUrl?: string | null;
}

/**
 * Input for updating an existing service
 * All fields are optional except id
 */
export interface UpdateServiceInput {
  id: string;
  title?: string;
  description?: string;
  priceType?: PriceType;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  durationMinutes?: number | null;
  order?: number;
  published?: boolean;
  imageUrl?: string | null;
}

// Ensure ServiceModel is used for re-export purposes
export type { ServiceModel as Service };
