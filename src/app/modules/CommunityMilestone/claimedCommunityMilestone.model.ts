import { Schema, model } from 'mongoose';

const claimedCommunityMilestoneSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  milestone: { type: Schema.Types.ObjectId, ref: 'CommunityMilestone', required: true },
  claimedAt: { type: Date, default: Date.now },
  shippingStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' }
}, { timestamps: true });


claimedCommunityMilestoneSchema.index({ user: 1, milestone: 1 }, { unique: true });

export const ClaimedCommunityMilestone = model('ClaimedCommunityMilestone', claimedCommunityMilestoneSchema);