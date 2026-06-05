import { Types } from 'mongoose';

export type TGiveaway = {
  weekNumber: number;
  title: string;
  prizeDescription: string;
  image: string;
  valueInNzd: number;
   startDate: Date;
  endDate: Date;   
  isMajorGiveaway: boolean;
  status: 'pending' | 'completed';
  winner?: Types.ObjectId;
};