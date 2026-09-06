export const CATEGORIES = [
  'Consoles',
  'PC Hardware',
  'Peripherals',
  'Games',
  'Accessories',
] as const;

export type Category = (typeof CATEGORIES)[number];

export class Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  features: string[];
  stock: number;
  ratingAverage: number;
  ratingCount: number;
}
