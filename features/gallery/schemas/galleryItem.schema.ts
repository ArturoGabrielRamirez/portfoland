/**
 * Gallery Item Validation Schemas
 *
 * Yup schemas for validating gallery item data in server actions.
 * imageUrl is required on create -- a gallery item must have an image.
 */

import * as yup from 'yup';

/**
 * Schema for creating a new gallery item.
 *
 * imageUrl is required and must be a valid URL.
 */
export const createGalleryItemSchema = yup.object({
  imageUrl: yup
    .string()
    .url('Image URL must be a valid URL')
    .required('Image URL is required'),
  caption: yup
    .string()
    .max(500, 'Caption must be less than 500 characters')
    .optional()
    .nullable(),
  altText: yup
    .string()
    .max(255, 'Alt text must be less than 255 characters')
    .optional()
    .nullable(),
  category: yup
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
    .nullable(),
  order: yup
    .number()
    .integer('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .optional()
    .default(0),
  published: yup.boolean().optional().default(true),
});

/**
 * Schema for updating an existing gallery item.
 * All fields are optional except id.
 */
export const updateGalleryItemSchema = yup.object({
  id: yup.string().required('Gallery item ID is required'),
  imageUrl: yup
    .string()
    .url('Image URL must be a valid URL')
    .optional(),
  caption: yup
    .string()
    .max(500, 'Caption must be less than 500 characters')
    .optional()
    .nullable(),
  altText: yup
    .string()
    .max(255, 'Alt text must be less than 255 characters')
    .optional()
    .nullable(),
  category: yup
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
    .nullable(),
  order: yup
    .number()
    .integer('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .optional(),
  published: yup.boolean().optional(),
});

/**
 * Schema for deleting a gallery item
 */
export const deleteGalleryItemSchema = yup.object({
  id: yup.string().required('Gallery item ID is required'),
});

/**
 * Inferred types from schemas
 */
export type CreateGalleryItemSchemaInput = yup.InferType<typeof createGalleryItemSchema>;
export type UpdateGalleryItemSchemaInput = yup.InferType<typeof updateGalleryItemSchema>;
export type DeleteGalleryItemSchemaInput = yup.InferType<typeof deleteGalleryItemSchema>;
