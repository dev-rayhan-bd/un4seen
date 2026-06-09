import { Types } from 'mongoose';

export type TStory = {
  user: Types.ObjectId;
  content: string; // Cloudinary URL
  contentType: 'image' | 'video';
  musicUrl?: string; // AI generated music link
  mood?: string;     // Mood used for AI music (e.g. Aggressive)
   prompt?: string; 
  caption?: string;
  category: 'Bikes' | 'Orders' | 'Installs' | 'Winners' | 'Behind Scenes';
  hearts: Types.ObjectId[];
  heartCount: number;
  isPremium: boolean; 
  expiresAt: Date; // Auto delete after 24h
  isDeleted: boolean;
  createdAt: Date;
};