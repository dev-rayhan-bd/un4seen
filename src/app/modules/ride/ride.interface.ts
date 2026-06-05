import { Types } from 'mongoose';

export type TRide = {
  user: Types.ObjectId;
  bikeModel: string;
  description: string;
  image: string;
  hearts: Types.ObjectId[];
  heartCount: number;
  isBikeOfTheWeek: boolean;
  rideType: string;
  isDeleted: boolean;
};