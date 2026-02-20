/**
 * Gallery Feature
 *
 * Public API for the gallery feature.
 * Exports types, server actions, public data functions, service layer,
 * constants, and schema types.
 */

// Types
export type {
  GalleryItemModel,
  CreateGalleryItemInput,
  UpdateGalleryItemInput,
  PublicGalleryData,
} from './types/galleryItem';

// Actions (server actions -- must be called from server components or client components using useTransition)
export {
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from './actions/galleryItemActions';

// Public data functions (for portfolio aggregation in server components)
export { getPublicGalleryData } from './data/getPublicGallery.data';
export { getGalleryItemsByUserIdData } from './data/getGalleryItemsByUserId.data';

// Service layer (for use by other server-side features)
export {
  createGalleryItemService,
  updateGalleryItemService,
  deleteGalleryItemService,
  getGalleryItemsService,
} from './services/galleryItem.service';

// Constants
export { GALLERY_MESSAGES } from './constants/messages';
export { MAX_GALLERY_ITEMS_PER_USER } from './constants/limits';

// Schemas
export {
  createGalleryItemSchema,
  updateGalleryItemSchema,
  deleteGalleryItemSchema,
} from './schemas/galleryItem.schema';
export type {
  CreateGalleryItemSchemaInput,
  UpdateGalleryItemSchemaInput,
  DeleteGalleryItemSchemaInput,
} from './schemas/galleryItem.schema';
