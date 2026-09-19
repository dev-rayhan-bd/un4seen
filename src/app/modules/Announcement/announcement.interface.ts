import { Types } from 'mongoose';

export type TAnnouncement = {
  user: Types.ObjectId;
  content: string;
  contentType: 'image' | 'video';
  music?: Types.ObjectId;
  title?: string;
  caption?: string;
  category?: string;
  hearts: Types.ObjectId[];
  heartCount: number;
  isPremium: boolean;
  expiresAt: Date;
  isDeleted: boolean;
  createdAt: Date;
};
