import { Schema, model } from 'mongoose';
import { TUn4seenWorld } from './un4seenWorld.interface';

const un4seenWorldSchema = new Schema<TUn4seenWorld>(
  {
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
    description: { type: String, required: true },
    discountCode: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String, required: true },
    endDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Un4seenWorld = model<TUn4seenWorld>('Un4seenWorld', un4seenWorldSchema);