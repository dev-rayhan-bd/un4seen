import { z } from 'zod';

const createPollSchema = z.object({
 
    title: z.string("Title is required"),
    description: z.string("Description is required"),
    category: z.enum(['giveaway', 'product_drop', 'meetup_location']),
    iconStyle: z.enum(['flame', 'drop']),
    endDate: z.string().datetime(),
    options: z.array(
      z.object({
        label: z.string("Option label is required")
      })
    ).min(2, "At least 2 options are required")

});

const voteSchema = z.object({

    pollId: z.string(),
    optionIndex: z.number().min(0)

});

export const CrewChoiceValidations = { createPollSchema, voteSchema };