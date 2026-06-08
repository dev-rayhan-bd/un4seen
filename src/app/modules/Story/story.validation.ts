import { z } from 'zod';

const contentTypes = ['image', 'video'] as const;

const categories = [
  'Bikes',
  'Orders',
  'Installs',
  'Winners',
  'Behind Scenes',
] as const;

export const createStorySchema = z.object({
  contentType: z.enum(contentTypes),
  category: z.enum(categories),
  caption: z.string().optional(),
  mood: z.string().optional(),
  isPremium: z.boolean().optional(),
});

export const StoryValidations = { createStorySchema };