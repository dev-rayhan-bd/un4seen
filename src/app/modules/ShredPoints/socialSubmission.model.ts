import { Schema, model } from 'mongoose';
import { TSocialSubmission } from './socialSubmission.Interface';


const socialSubmissionSchema = new Schema<TSocialSubmission>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { 
      type: String, 
      enum: ['facebook', 'instagram', 'tiktok', 'google_review'], 
      required: true 
    },
    proofImage: { type: String, required: true },
    postLink: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    adminComment: { type: String },
    pointsToAward: { type: Number, required: true }
  },
  { timestamps: true }
);

export const SocialSubmission = model<TSocialSubmission>('SocialSubmission', socialSubmissionSchema);