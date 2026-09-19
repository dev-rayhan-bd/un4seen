import { Types } from 'mongoose';

export type TSupportSession = {
  user: Types.ObjectId;
  assignedAdmin?: Types.ObjectId;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCountUser: number;
  unreadCountAdmin: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TSupportMessage = {
  supportSession: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: 'user' | 'admin' | 'superAdmin';
  text?: string;
  file?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};
