import { Schema, model } from 'mongoose';
import { TBike } from './bike.interface';

const bikeSchema = new Schema<TBike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    year: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    bikeType: { type: String, required: true },
    color: { type: String, required: true },
    gallery: [{ type: String }],

    upgrades: [
      {
        title: { type: String, required: true },
        items: [{ type: String }]
      }
    ],
    
    estimatedCost: { type: String, default: "0" },
    bikeHours: { type: String, default: "0" },
    isRetired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Bike = model<TBike>('Bike', bikeSchema);