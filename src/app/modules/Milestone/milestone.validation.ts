import { z } from 'zod';

const createMilestoneSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string(),
    pointsRequired: z.string().transform((val) => Number(val)), 
    rewardType: z.enum(['physical', 'digital']).optional(),
  }),
});

export const MilestoneValidations = { createMilestoneSchema };