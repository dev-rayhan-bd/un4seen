import { z } from 'zod';

const createOrUpdateAboutValidationSchema = z.object({
  aboutUs: z
    .string()
    .min(1, { message: 'About Us is required' })
    .max(50000, { message: 'About Us cannot exceed 50000 characters' }),
});

export const AboutValidations = {
  createOrUpdateAboutValidationSchema,
};
