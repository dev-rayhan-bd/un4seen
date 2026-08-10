import { Schema, model } from 'mongoose';
import { TMotivationalQuote } from './motivationalQuote.interface';

const motivationalQuoteSchema = new Schema<TMotivationalQuote>(
  {
    day: { 
      type: Number, 
      required: true,
      unique: true,
      min: 1,
      max: 31
    },
    text: { 
      type: String, 
      required: true 
    }
  }, 
  { timestamps: true }
);

export const MotivationalQuote = model<TMotivationalQuote>('MotivationalQuote', motivationalQuoteSchema);
