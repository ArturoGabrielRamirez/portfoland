/**
 * PortfolioSettings Validation Schemas
 *
 * Yup schemas for validating portfolio settings data in server actions.
 */

import * as yup from 'yup';

// =============================================================================
// Allowed Values
// =============================================================================

/**
 * Valid layout variant values
 */
const VALID_LAYOUT_VARIANTS = ['bento', 'stacked', 'sidebar'] as const;

/**
 * Valid hero style values
 */
const VALID_HERO_STYLES = ['standard', 'minimal', 'cover'] as const;

/**
 * Valid portfolio view mode values
 */
const VALID_VIEW_MODES = ['sections', 'one_page', 'minimal', 'terminal'] as const;

/**
 * Hex color validation regex
 */
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for updating portfolio settings
 * All fields are optional — only provided fields will be updated
 */
export const updatePortfolioSettingsSchema = yup.object({
  theme: yup
    .string()
    .optional(),
  layoutVariant: yup
    .string()
    .oneOf([...VALID_LAYOUT_VARIANTS], `Layout variant must be one of: ${VALID_LAYOUT_VARIANTS.join(', ')}`)
    .optional(),
  accentColor: yup
    .string()
    .matches(hexColorRegex, 'Accent color must be a valid hex color (e.g. #2563eb)')
    .optional()
    .nullable(),
  fontFamily: yup
    .string()
    .max(100, 'Font family must be less than 100 characters')
    .optional()
    .nullable(),
  heroStyle: yup
    .string()
    .oneOf([...VALID_HERO_STYLES], `Hero style must be one of: ${VALID_HERO_STYLES.join(', ')}`)
    .optional(),
  showBranding: yup
    .boolean()
    .optional(),
  viewMode: yup
    .string()
    .oneOf([...VALID_VIEW_MODES], `View mode must be one of: ${VALID_VIEW_MODES.join(', ')}`)
    .optional(),
  customTheme: yup
    .object({
      backgroundColor: yup.string().matches(hexColorRegex, 'Background color must be a valid hex color').required('Background color is required'),
      textColor: yup.string().matches(hexColorRegex, 'Text color must be a valid hex color').required('Text color is required'),
      accentColor: yup.string().matches(hexColorRegex, 'Accent color must be a valid hex color').required('Accent color is required'),
      borderColor: yup.string().matches(hexColorRegex, 'Border color must be a valid hex color').required('Border color is required'),
      cardBackground: yup.string().matches(hexColorRegex, 'Card background must be a valid hex color').required('Card background is required'),
      fontFamily: yup.string().max(100, 'Font family must be less than 100 characters').required('Font family is required'),
    })
    .nullable()
    .optional(),
});


// =============================================================================
// Inferred Types
// =============================================================================

export type UpdatePortfolioSettingsSchemaInput = yup.InferType<typeof updatePortfolioSettingsSchema>;
