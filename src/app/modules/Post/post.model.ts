import { Schema, model } from 'mongoose';
import { TPost, TComment } from './post.interface';

const postSchema = new Schema<TPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    text: { type: String, required: true },
    image: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const commentSchema = new Schema<TComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Post = model<TPost>('Post', postSchema);
export const Comment = model<TComment>('Comment', commentSchema);