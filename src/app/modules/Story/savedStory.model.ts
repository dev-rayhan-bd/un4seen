import { Schema, model, Types } from 'mongoose';

const savedStorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    story: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  },
  { timestamps: true }
);


savedStorySchema.index({ user: 1, story: 1 }, { unique: true });

export const SavedStory = model('SavedStory', savedStorySchema);