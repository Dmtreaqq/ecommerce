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

  /**
   * Placeholders until authentication lands: reviews are guest-only, so there
   * is no author to attribute, no purchase history to verify against, and no
   * identity to attach a helpful vote to.
   */
  authorId: null;
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
      authorId: null,
      verifiedPurchase: false,
      helpfulCount: 0,
    };
  }

  static fromEntities(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((review) => ReviewResponseDto.fromEntity(review));
  }
}
