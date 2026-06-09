import { Types } from 'mongoose';

export type TMusic = {
  title: string;
  audioUrl: string;
  category: string;
  isDeleted: boolean;
};

export type TFavoriteMusic = {
  user: Types.ObjectId;
  music: Types.ObjectId;
};