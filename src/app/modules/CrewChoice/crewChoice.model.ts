import { Schema, model } from 'mongoose';
import { TCrewChoice } from './crewChoice.interface';

const crewChoiceSchema = new Schema<TCrewChoice>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['giveaway', 'product_drop', 'meetup_location'], 
      required: true 
    },
    iconStyle: { type: String, enum: ['flame', 'drop'], default: 'flame' },
   options: [
      {
        label: { type: String, required: true },
        voteCount: { type: Number, default: 0 },
        voters: [{ type: Schema.Types.ObjectId, ref: 'User' }] 
      }
    ],
    totalVotes: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    votedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CrewChoice = model<TCrewChoice>('CrewChoice', crewChoiceSchema);