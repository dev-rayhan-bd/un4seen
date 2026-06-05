import { Schema, model } from 'mongoose';

const shopifyTokenSchema = new Schema({
  accessToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export const ShopifyToken = model('ShopifyToken', shopifyTokenSchema);