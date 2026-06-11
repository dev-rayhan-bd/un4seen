import { Schema, model } from 'mongoose';
import { TProduct } from './product.interface';

const productSchema = new Schema<TProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    image: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Gear', 'Apparel', 'Parts', 'Accessories'], 
      required: true 
    },
    brand: { type: String, required: true },
    shopifyUrl: { type: String, required: true },
    isExclusive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = model<TProduct>('Product', productSchema);