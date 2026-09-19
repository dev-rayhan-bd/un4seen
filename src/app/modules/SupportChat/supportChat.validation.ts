import { z } from 'zod';

export const sendSupportMessageSchema = z.object({
  text: z.string().optional(),
  file: z.string().optional(),
  sessionId: z.string().optional(),
});

export const updateSupportSessionStatusSchema = z.object({
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
});

export const SupportChatValidations = {
  sendSupportMessageSchema,
  updateSupportSessionStatusSchema,
};
