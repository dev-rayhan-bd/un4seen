import { z } from 'zod';

const createOrUpdateTermsValidationSchema = z.object({
  termsCondition: z
    .string()
    .min(1, { message: 'Terms & Conditions is required' })
    .max(50000, { message: 'Terms & Conditions cannot exceed 50000 characters' }),
});

export const TermsValidations = {
  createOrUpdateTermsValidationSchema,
};
