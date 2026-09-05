import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { CATEGORIES, type Category } from '../entities/product.entity.js';

export const PRODUCT_SORTS = [
  'featured',
  'price-asc',
  'price-desc',
  'rating',
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

export class FindProductsDto {
  /** Validated against the same tuple the entity exports, so the two can't drift. */
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: Category;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(PRODUCT_SORTS)
  sort?: ProductSort;
}
