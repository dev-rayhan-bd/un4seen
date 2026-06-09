import { Schema, model, Types } from 'mongoose';

const savedBikeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    bike: { type: Schema.Types.ObjectId, ref: 'Bike', required: true },
  },
  { timestamps: true }
);


savedBikeSchema.index({ user: 1, bike: 1 }, { unique: true });

export const SavedBike = model('SavedBike', savedBikeSchema);