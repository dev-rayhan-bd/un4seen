import { z } from 'zod';

const createGroupSchema = z.object({
  body: z.object({
    name: z.string("Group name is required" ),
    members: z.array(z.string()).min(1, "Add at least one member"),
  }),
});

const startPrivateChatSchema = z.object({
  body: z.object({
    targetId: z.string( "Target user ID is required" ),
  }),
});

const reportMessageSchema = z.object({
  body: z.object({
    message: z.string( "Message ID is required" ),
    reason: z.string( "Reason is required" ),
    details: z.string().optional(),
  }),
});

export const ChannelValidations = { 
  createGroupSchema, 
  startPrivateChatSchema,
  reportMessageSchema 
};