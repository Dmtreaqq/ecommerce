import type { Category, Product } from '../entities/product.entity.js';

const centsToDecimal = (cents: number): number => cents / 100;

export class ProductResponseDto {
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
  createdAt: string;
  updatedAt: string;

  static fromEntity(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: centsToDecimal(product.priceCents),
      ...(product.originalPriceCents !== null && {
        originalPrice: centsToDecimal(product.originalPriceCents),
      }),
      image: product.image,
      description: product.description,
      features: product.features,
      stock: product.stock,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  static fromEntities(products: Product[]): ProductResponseDto[] {
    return products.map((product) => ProductResponseDto.fromEntity(product));
  }
}
