import { Schema, model } from 'mongoose';
import { TJoinRequest } from './channel.interface';

const joinRequestSchema = new Schema<TJoinRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });


// joinRequestSchema.index({ user: 1, channel: 1 }, { unique: true });

export const JoinRequest = model<TJoinRequest>('JoinRequest', joinRequestSchema);