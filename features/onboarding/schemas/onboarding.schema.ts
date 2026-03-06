import * as yup from 'yup';

export const completeOnboardingSchema = yup.object({
  mode: yup.string().oneOf(['tech', 'classic']).required(),
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .matches(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      'Lowercase letters, numbers, and hyphens only (cannot start or end with hyphen)',
    )
    .required('Username is required'),
});
