import { Types } from 'mongoose';

export type TVote = {
  user: Types.ObjectId;
  rating: number; // 0 to 10
};

export type TRide = {
  user: Types.ObjectId;
  bikeModel: string;
  description: string;
  image: string;
  votes: TVote[]; 
  flameCount: number;
  averageRating: number; 
  isBikeOfTheWeek: boolean;
  rideType: string;
  isDeleted: boolean;
};