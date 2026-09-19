import { Schema, model } from 'mongoose';

const savedAnnouncementSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    announcement: { type: Schema.Types.ObjectId, ref: 'Announcement', required: true },
  },
  { timestamps: true }
);

savedAnnouncementSchema.index({ user: 1, announcement: 1 }, { unique: true });

export const SavedAnnouncement = model('SavedAnnouncement', savedAnnouncementSchema);
