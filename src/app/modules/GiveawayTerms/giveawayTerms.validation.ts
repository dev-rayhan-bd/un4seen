import { z } from 'zod';

const createOrUpdateGiveawayTermsValidationSchema = z.object({
  giveawayTerms: z
    .string()
    .min(1, { message: 'Giveaway Terms is required' })
    .max(50000, { message: 'Giveaway Terms cannot exceed 50000 characters' }),
});

export const GiveawayTermsValidations = {
  createOrUpdateGiveawayTermsValidationSchema,
};
