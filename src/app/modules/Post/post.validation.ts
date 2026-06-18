import { z } from 'zod';

const createPostSchema = z.object({
  text: z.string("Post text is required" ),
  channel: z.string( "Channel ID is required" ),
});

const createCommentSchema = z.object({

    post: z.string("Post ID is required" ),
    text: z.string("Comment text is required"),

});

export const PostValidations = { createPostSchema, createCommentSchema };