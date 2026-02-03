/**
 * Experience Validation Schemas
 *
 * Yup schemas for validating experience data in server actions.
 */

import * as yup from 'yup';
import { COORDINATE_LIMITS } from '../constants/xp';

/**
 * Valid experience types
 */
const experienceTypes = ['WORK', 'EDUCATION', 'PROJECT', 'CERTIFICATION'] as const;

/**
 * Schema for creating a new experience
 */
export const createExperienceSchema = yup.object({
  type: yup
    .string()
    .oneOf(experienceTypes, 'Invalid experience type')
    .required('Type is required'),
  title: yup
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  company: yup
    .string()
    .min(2, 'Company must be at least 2 characters')
    .max(100, 'Company must be less than 100 characters')
    .required('Company is required'),
  latitude: yup
    .number()
    .min(COORDINATE_LIMITS.latitude.min, 'Latitude must be between -90 and 90')
    .max(COORDINATE_LIMITS.latitude.max, 'Latitude must be between -90 and 90')
    .required('Latitude is required'),
  longitude: yup
    .number()
    .min(COORDINATE_LIMITS.longitude.min, 'Longitude must be between -180 and 180')
    .max(COORDINATE_LIMITS.longitude.max, 'Longitude must be between -180 and 180')
    .required('Longitude is required'),
  address: yup
    .string()
    .min(2, 'Address must be at least 2 characters')
    .max(200, 'Address must be less than 200 characters')
    .required('Address is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().nullable().optional(),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .required('Description is required'),
  skills: yup.array().of(yup.string().required()).optional().default([]),
});

/**
 * Schema for updating an existing experience
 * All fields are optional except id
 */
export const updateExperienceSchema = yup.object({
  id: yup.string().required('Experience ID is required'),
  type: yup.string().oneOf(experienceTypes, 'Invalid experience type').optional(),
  title: yup
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  company: yup
    .string()
    .min(2, 'Company must be at least 2 characters')
    .max(100, 'Company must be less than 100 characters')
    .optional(),
  latitude: yup
    .number()
    .min(COORDINATE_LIMITS.latitude.min, 'Latitude must be between -90 and 90')
    .max(COORDINATE_LIMITS.latitude.max, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: yup
    .number()
    .min(COORDINATE_LIMITS.longitude.min, 'Longitude must be between -180 and 180')
    .max(COORDINATE_LIMITS.longitude.max, 'Longitude must be between -180 and 180')
    .optional(),
  address: yup
    .string()
    .min(2, 'Address must be at least 2 characters')
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().nullable().optional(),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  skills: yup.array().of(yup.string().required()).optional(),
});

/**
 * Schema for deleting an experience
 */
export const deleteExperienceSchema = yup.object({
  id: yup.string().required('Experience ID is required'),
});

/**
 * Inferred types from schemas
 */
export type CreateExperienceSchemaInput = yup.InferType<typeof createExperienceSchema>;
export type UpdateExperienceSchemaInput = yup.InferType<typeof updateExperienceSchema>;
export type DeleteExperienceSchemaInput = yup.InferType<typeof deleteExperienceSchema>;
