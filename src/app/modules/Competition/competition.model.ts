import { Schema, model } from 'mongoose';
import { TCompetition, TCompetitionEntry } from './competition.interface';

const competitionSchema = new Schema<TCompetition>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  grandPrize: { type: String, required: true },
  rules: [String],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
    entryEndDate: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'ended'], default: 'active' },
}, { timestamps: true });

const competitionEntrySchema = new Schema<TCompetitionEntry>({
  competition: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  designName: { type: String, required: true },
  image: { type: String, required: true },
  
  hearts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  heartCount: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false },
}, { timestamps: true });

export const Competition = model<TCompetition>('Competition', competitionSchema);
export const CompetitionEntry = model<TCompetitionEntry>('CompetitionEntry', competitionEntrySchema);