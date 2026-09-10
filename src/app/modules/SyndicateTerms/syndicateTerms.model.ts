import mongoose from 'mongoose';
import { ISyndicateTerms } from './syndicateTerms.interface';

export const syndicateTermsSchema = new mongoose.Schema<ISyndicateTerms>(
  {
    syndicateTerms: {
      type: String,
      required: [true, 'Syndicate Terms & Conditions content is required'],
      maxlength: [50000, 'Syndicate Terms & Conditions cannot exceed 50000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

const SyndicateTerms = mongoose.model<ISyndicateTerms>('syndicateTerms', syndicateTermsSchema);
export default SyndicateTerms;
