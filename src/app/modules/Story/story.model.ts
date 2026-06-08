import { Schema, model } from 'mongoose';
import { TStory } from './story.interface';

const storySchema = new Schema<TStory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ['image', 'video'], required: true },
    musicUrl: { type: String },
    mood: { type: String },
        prompt: { type: String },
    caption: { type: String },
    category: { 
      type: String, 
      enum: ['Bikes', 'Orders', 'Installs', 'Winners', 'Behind Scenes'], 
      required: true 
    },
    hearts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    heartCount: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), 
      index: { expires: 0 } 
    },
  },
  { timestamps: true }
);

export const Story = model<TStory>('Story', storySchema);