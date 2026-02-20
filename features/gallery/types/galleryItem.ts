/**
 * Gallery Item Types
 *
 * Re-exports Prisma types and defines derived types for the Gallery feature.
 */

// =============================================================================
// Re-export Prisma Types
// =============================================================================

export type { GalleryItemModel } from '@/app/generated/prisma/models/GalleryItem';

import type { GalleryItemModel } from '@/app/generated/prisma/models/GalleryItem';

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for creating a new gallery item
 * Excludes auto-generated fields (id, userId, createdAt, updatedAt)
 * imageUrl is required -- a gallery item must have an image
 */
export interface CreateGalleryItemInput {
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  category?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Input for updating an existing gallery item
 * All fields are optional except id
 */
export interface UpdateGalleryItemInput {
  id: string;
  imageUrl?: string;
  caption?: string | null;
  altText?: string | null;
  category?: string | null;
  order?: number;
  published?: boolean;
}

/**
 * Public gallery data returned for the portfolio view.
 * Includes both the items array and the distinct list of categories.
 */
export type PublicGalleryData = {
  items: GalleryItemModel[];
  categories: string[];
};

// Ensure GalleryItemModel is re-exported for convenience
export type { GalleryItemModel as GalleryItem };
