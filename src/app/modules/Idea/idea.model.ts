import { Schema, model } from 'mongoose';
import { TIdea } from './idea.interface';


const ideaSchema = new Schema<TIdea>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Product Ideas', 'Design Styles', 'General Feedback', 'Random Idea'], 
      required: true 
    },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Idea = model<TIdea>('Idea', ideaSchema);