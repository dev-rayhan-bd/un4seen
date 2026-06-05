import { Schema, model } from 'mongoose';
import { TPointTransaction } from './points.interface';

const pointTransactionSchema = new Schema<TPointTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    source: { type: String, required: true },
    description: { type: String, required: true },
    shopifyDiscountCode: { type: String },
  },
  { timestamps: true }
);

export const PointTransaction = model<TPointTransaction>('PointTransaction', pointTransactionSchema);