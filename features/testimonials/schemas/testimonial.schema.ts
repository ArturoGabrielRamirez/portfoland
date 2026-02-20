/**
 * Testimonial Validation Schemas
 *
 * Yup schemas for validating testimonial data in server actions.
 * Includes rating validation enforcing integer 1-5 range.
 */

import * as yup from 'yup';

/**
 * Valid source values for testimonial origin
 */
const testimonialSources = ['manual', 'google_maps'] as const;

/**
 * Schema for creating a new testimonial.
 *
 * rating must be an integer between 1 and 5.
 * source must be one of ["manual", "google_maps"] if provided.
 */
export const createTestimonialSchema = yup.object({
  clientName: yup
    .string()
    .max(100, 'Client name must be less than 100 characters')
    .required('Client name is required'),
  clientTitle: yup
    .string()
    .max(100, 'Client title must be less than 100 characters')
    .optional()
    .nullable(),
  content: yup
    .string()
    .max(1000, 'Content must be less than 1000 characters')
    .required('Content is required'),
  rating: yup
    .number()
    .integer('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .required('Rating is required'),
  source: yup
    .string()
    .oneOf([...testimonialSources], 'Source must be "manual" or "google_maps"')
    .optional()
    .nullable(),
  externalId: yup
    .string()
    .max(255, 'External ID must be less than 255 characters')
    .optional()
    .nullable(),
  order: yup
    .number()
    .integer('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .optional()
    .default(0),
  published: yup.boolean().optional().default(true),
  imageUrl: yup.string().optional().nullable(),
});

/**
 * Schema for updating an existing testimonial.
 * All fields are optional except id.
 */
export const updateTestimonialSchema = yup.object({
  id: yup.string().required('Testimonial ID is required'),
  clientName: yup
    .string()
    .max(100, 'Client name must be less than 100 characters')
    .optional(),
  clientTitle: yup
    .string()
    .max(100, 'Client title must be less than 100 characters')
    .optional()
    .nullable(),
  content: yup
    .string()
    .max(1000, 'Content must be less than 1000 characters')
    .optional(),
  rating: yup
    .number()
    .integer('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  source: yup
    .string()
    .oneOf([...testimonialSources], 'Source must be "manual" or "google_maps"')
    .optional()
    .nullable(),
  externalId: yup
    .string()
    .max(255, 'External ID must be less than 255 characters')
    .optional()
    .nullable(),
  order: yup
    .number()
    .integer('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .optional(),
  published: yup.boolean().optional(),
  imageUrl: yup.string().optional().nullable(),
});

/**
 * Schema for deleting a testimonial
 */
export const deleteTestimonialSchema = yup.object({
  id: yup.string().required('Testimonial ID is required'),
});

/**
 * Inferred types from schemas
 */
export type CreateTestimonialSchemaInput = yup.InferType<typeof createTestimonialSchema>;
export type UpdateTestimonialSchemaInput = yup.InferType<typeof updateTestimonialSchema>;
export type DeleteTestimonialSchemaInput = yup.InferType<typeof deleteTestimonialSchema>;
