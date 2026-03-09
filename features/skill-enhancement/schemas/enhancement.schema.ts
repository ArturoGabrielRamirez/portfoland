/**
 * Skill Enhancement Schemas
 *
 * Yup validation schemas for skill enhancement actions.
 */

import * as yup from 'yup'

export const suggestEnhancementsSchema = yup.object({
  skillName: yup.string().required('Skill name is required'),
  skillLevel: yup.number().min(1).max(5).required('Skill level is required'),
  category: yup.string().required('Category is required'),
  locale: yup.string().default('en'),
})
