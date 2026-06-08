import { Types } from 'mongoose';

export type TSocialSubmission = {
  user: Types.ObjectId;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'google_review';
  proofImage: string; // Screenshot URL
  postLink?: string;  // Link to the post
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  pointsToAward: number;
};