import { z } from 'zod';

const createGroupSchema = z.object({

    name: z.string( "Channel name is required"),
    description: z.string().optional(),
    members: z.array(z.string()).optional(),
    isPrivate: z.boolean().default(false),

});

const startPrivateChatSchema = z.object({
  body: z.object({
    targetId: z.string( "Target user ID is required" ),
  }),
});

const reportMessageSchema = z.object({

    message: z.string( "Message ID is required" ),
    reason: z.string( "Reason is required" ),
    details: z.string().optional(),

});

export const ChannelValidations = { 
  createGroupSchema, 
  startPrivateChatSchema,
  reportMessageSchema 
};