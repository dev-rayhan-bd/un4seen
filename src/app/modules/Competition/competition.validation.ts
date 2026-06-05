import { z } from 'zod';

const createCompetitionSchema = z.object({

    title: z.string(),
    description: z.string(),
    grandPrize: z.string(),
    rules: z.array(z.string()).optional(),
    startDate: z.string(),
    endDate: z.string(),
        entryEndDate: z.string(),

});

const submitEntrySchema = z.object({
  designName: z.string().min(3, "Design name is required"),
  competition: z.string(),
});

export const CompetitionValidations = {
  createCompetitionSchema,
  submitEntrySchema,
};