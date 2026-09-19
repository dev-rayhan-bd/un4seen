import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  contentType: z.enum(['image', 'video']),
  title: z.string().optional(),
  category: z.string().optional(),
  caption: z.string().optional(),
  music: z.string().optional(),
  isPremium: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

export const AnnouncementValidations = {
  createAnnouncementSchema,
};
