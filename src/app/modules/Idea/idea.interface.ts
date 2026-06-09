import { Types } from 'mongoose';

export type TIdea = {
  user: Types.ObjectId;
  title: string;
  description: string;
  category: 'Product Ideas' | 'Design Styles' | 'General Feedback' | 'Random Idea';
  upvotes: Types.ObjectId[]; 
  upvoteCount: number;
  status: 'pending' | 'active' | 'rejected'; 
  isDeleted: boolean;
};