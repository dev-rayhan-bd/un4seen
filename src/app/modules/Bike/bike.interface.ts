import { Types } from 'mongoose';

export type TBikeUpgrade = {
  _id?: Types.ObjectId; 
  title: string;    
  items: string[];     // ["2026 YZF Front Fender", "Shrouds Cycra"]
};

export type TBike = {
  user: Types.ObjectId;
  image: string;
  year: string;
  make: string;
  model: string;
  bikeType: string;
   gallery: string[];
  color: string;
  upgrades: TBikeUpgrade[]; 
  estimatedCost?: string;
  bikeHours?: string;
  isRetired: boolean;
};