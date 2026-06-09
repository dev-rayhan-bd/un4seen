import { Schema, model } from 'mongoose';
import { TRide } from './ride.interface';

const rideSchema = new Schema<TRide>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bikeModel: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    votes: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 0, max: 10 }
      }
    ],
    flameCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    isBikeOfTheWeek: { type: Boolean, default: false },
    rideType: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Ride = model<TRide>('Ride', rideSchema);