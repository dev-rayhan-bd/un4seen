import { Schema, model } from 'mongoose';
import { TPopupVideo } from './popupVideo.interface';

const popupVideoSchema = new Schema<TPopupVideo>(
  {
    videoUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    title: { type: String },
  },
  { timestamps: true }
);

export const PopupVideo = model<TPopupVideo>('PopupVideo', popupVideoSchema);