import { z } from 'zod';

const createOrUpdatePrivacyPolicyValidationSchema = z.object({
  privacyPolicy: z
    .string()
    .min(1, { message: 'Privacy Policy is required' })
    .max(50000, { message: 'Privacy Policy cannot exceed 50000 characters' }),
});

export const PrivacyPolicyValidations = {
  createOrUpdatePrivacyPolicyValidationSchema,
};
