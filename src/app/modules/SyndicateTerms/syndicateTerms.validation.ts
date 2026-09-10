import { z } from 'zod';

const createOrUpdateSyndicateTermsValidationSchema = z.object({
  syndicateTerms: z
    .string()
    .min(1, { message: 'Syndicate Terms is required' })
    .max(50000, { message: 'Syndicate Terms cannot exceed 50000 characters' }),
});

export const SyndicateTermsValidations = {
  createOrUpdateSyndicateTermsValidationSchema,
};
