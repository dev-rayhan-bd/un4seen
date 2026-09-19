import { Schema, model } from 'mongoose';
import { TSupportMessage, TSupportSession } from './supportChat.interface';

const supportSessionSchema = new Schema<TSupportSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountUser: { type: Number, default: 0 },
    unreadCountAdmin: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const supportMessageSchema = new Schema<TSupportMessage>(
  {
    supportSession: { type: Schema.Types.ObjectId, ref: 'SupportSession', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'admin', 'superAdmin'], required: true },
    text: { type: String },
    file: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SupportSession = model<TSupportSession>('SupportSession', supportSessionSchema);
export const SupportMessage = model<TSupportMessage>('SupportMessage', supportMessageSchema);
