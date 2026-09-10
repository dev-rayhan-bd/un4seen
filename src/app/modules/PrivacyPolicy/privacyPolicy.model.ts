import mongoose from 'mongoose';
import { IPrivacyPolicy } from './PrivacyPolicy.interface';


export const privacyPolicySchema = new mongoose.Schema<IPrivacyPolicy>(
  {
    privacyPolicy: {
      type: String,
      required: [true, 'Privacy Policy is required'],
      maxlength: [50000, 'Privacy Policy cannot exceed 50000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

const PrivacyPolicy = mongoose.model<IPrivacyPolicy>('privacyPolicy', privacyPolicySchema);
export default PrivacyPolicy;