export type TProduct = {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number; //(e.g. $89.00)
  image: string;
  category: 'Gear' | 'Apparel' | 'Parts' | 'Accessories';
  brand: string; // e.g. Honda, Yamaha, KTM
  shopifyUrl: string; 
  isExclusive: boolean; 
  isDeleted: boolean;
};