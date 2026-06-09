import { Schema, model } from 'mongoose';
import { TFavoriteMusic, TMusic } from './music.interface';

const musicSchema = new Schema<TMusic>(
  {
    title: { type: String, required: true, trim: true },
    audioUrl: { type: String, required: true },
    category: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const favoriteMusicSchema = new Schema<TFavoriteMusic>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    music: { type: Schema.Types.ObjectId, ref: 'Music', required: true },
  },
  { timestamps: true }
);


favoriteMusicSchema.index({ user: 1, music: 1 }, { unique: true });

export const Music = model<TMusic>('Music', musicSchema);
export const FavoriteMusic = model<TFavoriteMusic>('FavoriteMusic', favoriteMusicSchema);