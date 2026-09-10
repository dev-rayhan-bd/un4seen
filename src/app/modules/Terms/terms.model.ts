import mongoose from 'mongoose';
import { ITerms } from './terms.interface';

export const termsSchema = new mongoose.Schema<ITerms>(
  {
    termsCondition: {
      type: String,
      required: [true, 'Terms & Conditions content is required'],
      maxlength: [50000, 'Terms & Conditions cannot exceed 50000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

const Terms = mongoose.model<ITerms>('terms', termsSchema);
export default Terms;
