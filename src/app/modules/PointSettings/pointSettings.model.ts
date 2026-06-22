import { Schema, model } from 'mongoose';
import { TPointSettings } from './pointSettings.interface';

const pointSettingsSchema = new Schema<TPointSettings>(
  {
    daily_login: { type: Number, default: 10 },
    profile_completion: { type: Number, default: 100 },
    social_share: { type: Number, default: 50 },
    google_review: { type: Number, default: 150 },
    bike_winner: { type: Number, default: 500 },
    birthday_bonus: { type: Number, default: 500 },
    referral_sender: { type: Number, default: 1000 },
    referral_receiver: { type: Number, default: 200 },
    redeem_threshold: { type: Number, default: 1000 },
    redeem_value_nzd: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const PointSettings = model<TPointSettings>('PointSettings', pointSettingsSchema);