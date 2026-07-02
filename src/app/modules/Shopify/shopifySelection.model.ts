import { Schema, model } from 'mongoose';

const shopifySelectionSchema = new Schema({

  selectedProductIds: [{ type: String, required: true }], 
}, { timestamps: true });

export const ShopifySelection = model('ShopifySelection', shopifySelectionSchema);