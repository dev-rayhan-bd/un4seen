import { Types } from 'mongoose';

export type TCompetition = {
  title: string;
  description: string;
  image: string;
  grandPrize: string;
  rules: string[];
  startDate: Date;
  endDate: Date;
   entryEndDate: Date;
  status: 'upcoming' | 'active' | 'ended';
};

export type TCompetitionEntry = {
  competition: Types.ObjectId;
  user: Types.ObjectId;
  designName: string;
  image: string;

  hearts: Types.ObjectId[];
  heartCount: number;
  isWinner: boolean;
};

