import { Types } from 'mongoose';

export type TStory = {
  user: Types.ObjectId;
  content: string; 
  contentType: 'image' | 'video';
  music?: Types.ObjectId; 
  caption?: string;
  category: 'Bikes' | 'Orders' | 'Installs' | 'Winners' | 'Behind Scenes';
  hearts: Types.ObjectId[];
  heartCount: number;
  isPremium: boolean; 
  expiresAt: Date; 
  isDeleted: boolean;
  createdAt: Date;
};