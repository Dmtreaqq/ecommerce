import type {
  Paginated,
  Rating,
  Review,
  ReviewDraft,
  ReviewQuery,
  ReviewStats,
} from '../types'
import { ApiError, request } from './client'
import { db } from './db'

const DEFAULT_PER_PAGE = 5
const RATINGS: Rating[] = [5, 4, 3, 2, 1]

const byProduct = (productId: string) =>
  db.getReviews().filter((review) => review.productId === productId)

const newId = () =>
  `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/**
 * A review counts as a verified purchase when its author is signed in AND the
 * product appears in their purchase history. Anonymous reviews never qualify.
 *
 * Resolved from the stored user rather than trusting anything the client sends,
 * and frozen onto the review at creation time — which is how the real API will
 * behave.
 */
function resolveVerifiedPurchase(
  authorId: string | null,
  productId: string,
): boolean {
  if (!authorId) return false
  const user = db.findUserById(authorId)
  return user?.purchasedProductIds.includes(productId) ?? false
}

function validateDraft(draft: ReviewDraft, authorId: string | null): void {
  const title = draft.title.trim()
  const body = draft.body.trim()

  if (draft.rating < 1 || draft.rating > 5) {
    throw new ApiError('Please choose a star rating.', 422)
  }
  if (title.length < 3 || title.length > 100) {
    throw new ApiError('Title must be between 3 and 100 characters.', 422)
  }
  if (body.length < 10 || body.length > 2000) {
    throw new ApiError('Review must be between 10 and 2000 characters.', 422)
  }
  if (!authorId && !draft.guestName?.trim()) {
    throw new ApiError('Please enter your name.', 422)
  }
}

/** Mirrors `GET /products/:id/reviews?sort=&rating=&page=&perPage=`. */
export function listReviews(
  productId: string,
  query: ReviewQuery = {},
  signal?: AbortSignal,
): Promise<Paginated<Review>> {
  return request(() => {
    const {
      sort = 'recent',
      rating = null,
      page = 1,
      perPage = DEFAULT_PER_PAGE,
    } = query

    let items = byProduct(productId)

    if (rating) {
      items = items.filter((review) => review.rating === rating)
    }

    const sorted = [...items].sort((a, b) => {
      switch (sort) {
        case 'helpful':
          return b.helpfulCount - a.helpfulCount
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'recent':
        default:
          return Date.parse(b.createdAt) - Date.parse(a.createdAt)
      }
    })

    const total = sorted.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * perPage

    return {
      items: sorted.slice(start, start + perPage),
      page: safePage,
      perPage,
      total,
      totalPages,
    }
  }, signal)
}

/**
 * Mirrors `GET /products/:id/reviews/stats`. Always computed over every review
 * for the product, never the current page or filter.
 */
export function getReviewStats(
  productId: string,
  signal?: AbortSignal,
): Promise<ReviewStats> {
  return request(() => {
    const items = byProduct(productId)
    const total = items.length
    const sum = items.reduce((acc, review) => acc + review.rating, 0)

    const buckets = RATINGS.map((value) => {
      const count = items.filter((review) => review.rating === value).length
      return {
        rating: value,
        count,
        percentage: total === 0 ? 0 : Math.round((count / total) * 100),
      }
    })

    return {
      average: total === 0 ? 0 : Math.round((sum / total) * 10) / 10,
      total,
      buckets,
    }
  }, signal)
}

/** Mirrors `POST /reviews`. `authorId` stands in for the bearer token. */
export function createReview(
  draft: ReviewDraft,
  authorId: string | null,
  signal?: AbortSignal,
): Promise<Review> {
  return request(() => {
    validateDraft(draft, authorId)

    const author = authorId ? db.findUserById(authorId) : undefined
    if (authorId && !author) {
      throw new ApiError('Your session has expired. Please sign in again.', 401)
    }

    // One review per product per account; guests are not restricted.
    if (
      authorId &&
      db
        .getReviews()
        .some((r) => r.productId === draft.productId && r.authorId === authorId)
    ) {
      throw new ApiError('You have already reviewed this product.', 409)
    }

    const review: Review = {
      id: newId(),
      productId: draft.productId,
      authorId,
      authorName: author?.name ?? draft.guestName!.trim(),
      rating: draft.rating,
      title: draft.title.trim(),
      body: draft.body.trim(),
      createdAt: new Date().toISOString(),
      verifiedPurchase: resolveVerifiedPurchase(authorId, draft.productId),
      helpfulCount: 0,
    }

    db.setReviews([review, ...db.getReviews()])
    return review
  }, signal)
}

/** Mirrors `PATCH /reviews/:id`. Only the author may edit. */
export function updateReview(
  reviewId: string,
  draft: Pick<ReviewDraft, 'rating' | 'title' | 'body'>,
  authorId: string | null,
  signal?: AbortSignal,
): Promise<Review> {
  return request(() => {
    const all = db.getReviews()
    const existing = all.find((review) => review.id === reviewId)

    if (!existing) {
      throw new ApiError('Review not found.', 404)
    }
    if (!authorId || existing.authorId !== authorId) {
      throw new ApiError('You can only edit your own review.', 403)
    }

    validateDraft({ ...draft, productId: existing.productId }, authorId)

    const updated: Review = {
      ...existing,
      rating: draft.rating,
      title: draft.title.trim(),
      body: draft.body.trim(),
    }

    db.setReviews(all.map((r) => (r.id === reviewId ? updated : r)))
    return updated
  }, signal)
}

/** Mirrors `DELETE /reviews/:id`. Only the author may delete. */
export function deleteReview(
  reviewId: string,
  authorId: string | null,
  signal?: AbortSignal,
): Promise<void> {
  return request(() => {
    const all = db.getReviews()
    const existing = all.find((review) => review.id === reviewId)

    if (!existing) {
      throw new ApiError('Review not found.', 404)
    }
    if (!authorId || existing.authorId !== authorId) {
      throw new ApiError('You can only delete your own review.', 403)
    }

    db.setReviews(all.filter((review) => review.id !== reviewId))
  }, signal)
}

/** Mirrors `POST /reviews/:id/helpful`. */
export function voteHelpful(
  reviewId: string,
  helpful: boolean,
  signal?: AbortSignal,
): Promise<Review> {
  return request(() => {
    const all = db.getReviews()
    const existing = all.find((review) => review.id === reviewId)

    if (!existing) {
      throw new ApiError('Review not found.', 404)
    }

    const updated: Review = {
      ...existing,
      helpfulCount: Math.max(0, existing.helpfulCount + (helpful ? 1 : -1)),
    }

    db.setReviews(all.map((r) => (r.id === reviewId ? updated : r)))
    return updated
  }, signal)
}

/** Mirrors `GET /products/:id/reviews/mine`. */
export function getMyReview(
  productId: string,
  authorId: string | null,
  signal?: AbortSignal,
): Promise<Review | null> {
  return request(() => {
    if (!authorId) return null
    return (
      db
        .getReviews()
        .find((r) => r.productId === productId && r.authorId === authorId) ??
      null
    )
  }, signal)
}
