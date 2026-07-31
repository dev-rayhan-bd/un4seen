import { z } from 'zod';

const createGiveawayValidationSchema = z.object({
  body: z.object({
    weekNumber: z.number(),
    title: z.string(),
    prizeDescription: z.string(),
    image: z.string().optional(),
    valueInNzd: z.number(),
    startDate: z.string(),
    endDate: z.string(),
    isMajorGiveaway: z.boolean().optional(),
  }),
});

export const GiveawayValidations = {
  createGiveawayValidationSchema,
};