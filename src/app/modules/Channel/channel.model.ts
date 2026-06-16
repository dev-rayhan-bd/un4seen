import { Schema, model } from 'mongoose';
import { TChannel, TMessage, TMessageReport } from './channel.interface';

const channelSchema = new Schema<TChannel>({
  name: { type: String, trim: true },
  type: { type: String, enum: ['group', 'private'], required: true },
  image: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const messageSchema = new Schema<TMessage>({
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  file: { type: String },
  isRead: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
}, { timestamps: true });

const reportSchema = new Schema<TMessageReport>(
  {
    reporter: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    message: { 
      type: Schema.Types.ObjectId, 
      ref: 'Message', 
      required: true 
    },
    reason: { 
      type: String, 
      required: true,
   
      enum: ['Spam', 'Scam/Phishing', 'Harassment', 'Inappropriate Content', 'Other'] 
    },
    details: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'resolved'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);
export const Channel = model<TChannel>('Channel', channelSchema);
export const Message = model<TMessage>('Message', messageSchema);
export const MessageReport = model<TMessageReport>('MessageReport', reportSchema);