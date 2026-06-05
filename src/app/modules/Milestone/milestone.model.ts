import { Schema, model } from 'mongoose';
import { TMilestone } from './milestone.interface';

const milestoneSchema = new Schema<TMilestone>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  rewardType: { type: String, enum: ['physical', 'digital'], default: 'physical' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export const Milestone = model<TMilestone>('Milestone', milestoneSchema);