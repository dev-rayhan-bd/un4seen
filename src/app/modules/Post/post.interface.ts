import { Types } from 'mongoose';

export type TPost = {
  user: Types.ObjectId;
  channel: Types.ObjectId;
  text: string;
  image?: string;
  likes: Types.ObjectId[];
  likeCount: number;
  isDeleted: boolean;
  createdAt:Date;
};

export type TComment = {
  post: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  isDeleted: boolean;
};