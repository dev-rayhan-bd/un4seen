import { Types } from 'mongoose';

export type TTestRiderApplication = {
  user: Types.ObjectId;
  applicationText: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedDate: Date;
};