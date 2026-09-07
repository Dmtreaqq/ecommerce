import type {
  Paginated,
  Review,
  ReviewDraft,
  ReviewQuery,
  ReviewStats,
} from '../types'
import { http } from './client'

const DEFAULT_PER_PAGE = 5

const productPath = (productId: string) =>
  `/products/${encodeURIComponent(productId)}/reviews`

/** `GET /products/:id/reviews?sort=&rating=&page=&perPage=` */
export function listReviews(
  productId: string,
  query: ReviewQuery = {},
  signal?: AbortSignal,
): Promise<Paginated<Review>> {
  const {
    sort = 'recent',
    rating = null,
    page = 1,
    perPage = DEFAULT_PER_PAGE,
  } = query

  return http<Paginated<Review>>(productPath(productId), {
    signal,
    params: {
      sort,
      rating: rating === null ? null : String(rating),
      page: String(page),
      perPage: String(perPage),
    },
  })
}

/**
 * `GET /products/:id/reviews/stats` — always computed over every review for the
 * product, never the current page or filter.
 */
export function getReviewStats(
  productId: string,
  signal?: AbortSignal,
): Promise<ReviewStats> {
  return http<ReviewStats>(`${productPath(productId)}/stats`, { signal })
}

/** `POST /reviews` — the author comes from the session cookie, not the body. */
export function createReview(
  draft: ReviewDraft,
  signal?: AbortSignal,
): Promise<Review> {
  return http<Review>('/reviews', {
    method: 'POST',
    signal,
    body: {
      productId: draft.productId,
      rating: draft.rating,
      title: draft.title,
      body: draft.body,
    },
  })
}

/** `PUT /reviews/:id` — a full replace of the editable fields. */
export function updateReview(
  reviewId: string,
  draft: Pick<ReviewDraft, 'rating' | 'title' | 'body'>,
  signal?: AbortSignal,
): Promise<Review> {
  return http<Review>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PUT',
    signal,
    body: { rating: draft.rating, title: draft.title, body: draft.body },
  })
}

/** `DELETE /reviews/:id` */
export function deleteReview(
  reviewId: string,
  signal?: AbortSignal,
): Promise<void> {
  return http<void>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
    signal,
  })
}
