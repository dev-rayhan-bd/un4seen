import { Types } from 'mongoose';

export type TChannel = {
  name?: string;
   description?: string;
  type: 'group' | 'private';
  image?: string;
  creator?: Types.ObjectId;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  isDeleted: boolean;
    isPrivate: boolean;
  createdAt:Date;
  updatedAt:Date;
};
export type TJoinRequest = {
  user: Types.ObjectId;
  channel: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
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
  // reportType: 'message' | 'profile' | 'story';
  message: Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved';
};