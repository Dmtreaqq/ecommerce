import type { Review } from '../entities/review.entity.js';

export class ReviewResponseDto {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;

  /** Null for the guest reviews written before authentication existed. */
  authorId: string | null;

  /**
   * Still placeholders: there is no purchase history to verify against and no
   * store of helpful votes.
   */
  verifiedPurchase: false;
  helpfulCount: number;

  static fromEntity(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      authorName: review.authorName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      authorId: review.authorId,
      verifiedPurchase: false,
      helpfulCount: 0,
    };
  }

  static fromEntities(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((review) => ReviewResponseDto.fromEntity(review));
  }
}
