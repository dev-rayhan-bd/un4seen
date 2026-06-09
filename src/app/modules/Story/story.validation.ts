import { z } from 'zod';

export const createStorySchema = z.object({
  contentType: z.enum(['image', 'video']),
  category: z.enum(['Bikes', 'Orders', 'Installs', 'Winners', 'Behind Scenes']),
  caption: z.string().optional(),
  music: z.string().optional(), 
  isPremium: z.boolean().optional(),
});

export const StoryValidations = { createStorySchema };