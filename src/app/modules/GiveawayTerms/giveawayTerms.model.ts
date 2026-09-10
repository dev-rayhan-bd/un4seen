import mongoose from 'mongoose';
import { IGiveawayTerms } from './giveawayTerms.interface';

export const giveawayTermsSchema = new mongoose.Schema<IGiveawayTerms>(
  {
    giveawayTerms: {
      type: String,
      required: [true, 'Giveaway Terms & Eligibility content is required'],
      maxlength: [50000, 'Giveaway Terms & Eligibility cannot exceed 50000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

const GiveawayTerms = mongoose.model<IGiveawayTerms>('giveawayTerms', giveawayTermsSchema);
export default GiveawayTerms;
