import * as yup from 'yup';

export const completeOnboardingSchema = yup.object({
  mode: yup.string().oneOf(['tech', 'classic']).required(),
});
