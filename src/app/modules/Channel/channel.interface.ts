import { Types } from 'mongoose';

export type TChannel = {
  name?: string;
  type: 'group' | 'private';
  image?: string;
  creator?: Types.ObjectId;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  isDeleted: boolean;
  createdAt:Date;
  updatedAt:Date;
};

export type TMessage = {
  channel: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  file?: string;
  isRead: boolean;
  isReported: boolean;
};
export type TMessageReport = {
  reporter: Types.ObjectId;
  message: Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved';
};