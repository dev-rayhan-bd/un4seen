import { Schema, model } from 'mongoose';
import { TAnnouncement } from './announcement.interface';

const announcementSchema = new Schema<TAnnouncement>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ['image', 'video'], required: true },
    music: { type: Schema.Types.ObjectId, ref: 'Music' },
    title: { type: String },
    caption: { type: String },
    category: { type: String },
    hearts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    heartCount: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Announcement = model<TAnnouncement>('Announcement', announcementSchema);
