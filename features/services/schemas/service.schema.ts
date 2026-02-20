/**
 * Service Validation Schemas
 *
 * Yup schemas for validating service data in server actions.
 * Includes conditional price validation based on priceType.
 */

import * as yup from 'yup';

/**
 * Valid price type values matching the Prisma PriceType enum
 */
const priceTypes = ['FIXED', 'RANGE', 'STARTING_FROM', 'CONTACT'] as const;

/**
 * Schema for creating a new service.
 *
 * priceMin is required when priceType is FIXED, RANGE, or STARTING_FROM.
 * priceMax is required and must be greater than priceMin when priceType is RANGE.
 */
export const createServiceSchema = yup.object({
  title: yup
    .string()
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: yup
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .required('Description is required'),
  priceType: yup
    .string()
    .oneOf([...priceTypes], 'Invalid price type')
    .required('Price type is required'),
  priceMin: yup
    .number()
    .min(0, 'Minimum price must be at least 0')
    .when('priceType', {
      is: (val: string) => val !== 'CONTACT',
      then: (schema) => schema.required('Minimum price is required for this price type'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  priceMax: yup
    .number()
    .when('priceType', {
      is: 'RANGE',
      then: (schema) =>
        schema
          .required('Maximum price is required for RANGE price type')
          .when('priceMin', ([priceMin], schema) =>
            schema.min(
              typeof priceMin === 'number' ? priceMin + 0.01 : 0,
              'Maximum price must be greater than minimum price'
            )
          ),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  currency: yup
    .string()
    .length(3, 'Currency must be a 3-character ISO 4217 code')
    .matches(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .required('Currency is required'),
  durationMinutes: yup
    .number()
    .integer('Duration must be a whole number of minutes')
    .min(1, 'Duration must be greater than 0')
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
 * Schema for updating an existing service.
 * All fields are optional except id.
 */
export const updateServiceSchema = yup.object({
  id: yup.string().required('Service ID is required'),
  title: yup
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  description: yup
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  priceType: yup
    .string()
    .oneOf([...priceTypes], 'Invalid price type')
    .optional(),
  priceMin: yup
    .number()
    .min(0, 'Minimum price must be at least 0')
    .optional()
    .nullable(),
  priceMax: yup
    .number()
    .optional()
    .nullable(),
  currency: yup
    .string()
    .length(3, 'Currency must be a 3-character ISO 4217 code')
    .matches(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
    .optional(),
  durationMinutes: yup
    .number()
    .integer('Duration must be a whole number of minutes')
    .min(1, 'Duration must be greater than 0')
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
 * Schema for deleting a service
 */
export const deleteServiceSchema = yup.object({
  id: yup.string().required('Service ID is required'),
});

/**
 * Inferred types from schemas
 */
export type CreateServiceSchemaInput = yup.InferType<typeof createServiceSchema>;
export type UpdateServiceSchemaInput = yup.InferType<typeof updateServiceSchema>;
export type DeleteServiceSchemaInput = yup.InferType<typeof deleteServiceSchema>;
