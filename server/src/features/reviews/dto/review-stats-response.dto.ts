export const RATING_VALUES = [5, 4, 3, 2, 1] as const;

export class RatingBucketDto {
  rating: number;
  count: number;
  percentage: number;
}

export class ReviewStatsResponseDto {
  average: number;
  total: number;
  buckets: RatingBucketDto[];
}
