export type TSyndicateProduct = {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  discountPercentage: string | null;
  image: string;
  category: string; // e.g., 'Gear', 'Apparel'
  productUrl: string; 
};