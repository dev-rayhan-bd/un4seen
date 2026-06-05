import { Schema, model } from 'mongoose';
import { TCommunityMilestone } from './communityMilestone.interface';

const communityMilestoneSchema = new Schema<TCommunityMilestone>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  targetMemberCount: { type: Number, required: true },
  rewardType: { type: String, enum: ['physical', 'info'], default: 'info' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export const CommunityMilestone = model<TCommunityMilestone>('CommunityMilestone', communityMilestoneSchema);