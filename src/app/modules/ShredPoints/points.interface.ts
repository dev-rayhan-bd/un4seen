import { Types } from 'mongoose';
import { TPointSource } from './points.constant';

export type TPointTransaction = {
  user: Types.ObjectId;
  points: number;
  source: TPointSource;
  description: string;
  shopifyDiscountCode?: string;
};