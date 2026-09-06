import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const REVIEW_SORTS = ['recent', 'highest', 'lowest'] as const;

export type ReviewSort = (typeof REVIEW_SORTS)[number];

export const DEFAULT_PER_PAGE = 5;
export const MAX_PER_PAGE = 50;

export class FindReviewsDto {
  @IsOptional()
  @IsIn(REVIEW_SORTS)
  sort?: ReviewSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PER_PAGE)
  perPage?: number;
}
