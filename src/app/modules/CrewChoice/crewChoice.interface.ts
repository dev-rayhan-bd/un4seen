import { Types } from 'mongoose';

export type TPollOption = {
  label: string;
  voteCount: number;
  voters:string[]
};

export type TCrewChoice = {
  title: string;
  description: string;
  category: 'giveaway' | 'product_drop' | 'meetup_location';
  iconStyle: 'flame' | 'drop';
  options: TPollOption[];
  totalVotes: number;
  startDate: Date;
  endDate: Date;
  votedUsers: Types.ObjectId[];
  status: 'active' | 'ended';
  isDeleted: boolean;
};