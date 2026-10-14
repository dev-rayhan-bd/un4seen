import { Schema, model } from 'mongoose';

const claimedMilestoneSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  milestone: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true },
  claimedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' }
}, { timestamps: true });

claimedMilestoneSchema.index({ user: 1, milestone: 1 }, { unique: true });

export const ClaimedMilestone = model('ClaimedMilestone', claimedMilestoneSchema);