import { Schema, model } from 'mongoose';
import { TGiveaway } from './giveaway.interface';

const giveawaySchema = new Schema<TGiveaway>({
  weekNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  prizeDescription: { type: String, required: true },
  image: { type: String, required: true },
  valueInNzd: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isMajorGiveaway: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Giveaway = model<TGiveaway>('Giveaway', giveawaySchema);