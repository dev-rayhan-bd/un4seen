import { Schema, model } from 'mongoose';
import { TTestRiderApplication } from './testRider.interface';

const testRiderApplicationSchema = new Schema<TTestRiderApplication>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    applicationText: { 
      type: String, 
      required: true,
      trim: true 
    },
    number: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    bikeType: {
      type: String,
      required: true,
    },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'accepted', 'rejected'], 
      default: 'pending' 
    },
  },
  { 
    timestamps: true 
  }
);


testRiderApplicationSchema.index({ user: 1 }, { unique: true });

export const TestRiderApplication = model<TTestRiderApplication>(
  'TestRiderApplication', 
  testRiderApplicationSchema
);