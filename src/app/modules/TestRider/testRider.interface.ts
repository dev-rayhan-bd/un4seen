import { Types } from 'mongoose';

export type TTestRiderApplication = {
  user: Types.ObjectId;
  applicationText: string;
  number: string;
  age: number;
  bikeType: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedDate: Date;
};