import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAbortError, toErrorMessage } from '../api/client'
import * as reviewsApi from '../api/reviews.api'
import type {
  Paginated,
  Rating,
  Review,
  ReviewDraft,
  ReviewSort,
  ReviewStats,
} from '../types'

const EMPTY_STATS: ReviewStats = {
  average: 0,
  total: 0,
  buckets: [5, 4, 3, 2, 1].map((rating) => ({
    rating: rating as Rating,
    count: 0,
    percentage: 0,
  })),
}

const PER_PAGE = 5

/** One settled fetch, tagged with the query key it answers. */
interface SettledReviews {
  key: string
  reviews: Review[]
  stats: ReviewStats
  myReview: Review | null
  totalPages: number
  total: number
  error: string | null
}

export interface UseReviewsResult {
  reviews: Review[]
  stats: ReviewStats
  myReview: Review | null
  page: number
  totalPages: number
  total: number
  loading: boolean
  error: string | null
  sort: ReviewSort
  ratingFilter: Rating | null
  /** Review ids this visitor has marked helpful in the current session. */
  votedIds: ReadonlySet<string>
  setSort: (sort: ReviewSort) => void
  setRatingFilter: (rating: Rating | null) => void
  setPage: (page: number) => void
  createReview: (draft: Omit<ReviewDraft, 'productId'>) => Promise<void>
  updateReview: (
    reviewId: string,
    draft: Pick<ReviewDraft, 'rating' | 'title' | 'body'>,
  ) => Promise<void>
  deleteReview: (reviewId: string) => Promise<void>
  toggleHelpful: (reviewId: string) => Promise<void>
}

/**
 * Owns everything the review section needs: the paginated list, the aggregate
 * stats, the current user's own review, and the write operations.
 *
 * Sorting, filtering and pagination are passed through to the api layer rather
 * than applied here, so real server-side pagination drops in unchanged.
 */
export function useReviews(
  productId: string | undefined,
  userId: string | null,
): UseReviewsResult {
  const [page, setPage] = useState(1)
  const [sort, setSortState] = useState<ReviewSort>('recent')
  const [ratingFilter, setRatingFilterState] = useState<Rating | null>(null)

  /** Bumped after any write to force a refetch of list + stats. */
  const [revision, setRevision] = useState(0)

  /** Which votes this visitor has cast, so the button can toggle. */
  const [votedIds, setVotedIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  )

  /**
   * Optimistic helpful votes live in an overlay rather than being written back
   * into `settled`, so a refetch never has to reconcile them.
   */
  const [helpfulDeltas, setHelpfulDeltas] = useState<Record<string, number>>({})

  /**
   * The settled fetch, tagged with the query it answers. Deriving `loading`
   * from a key mismatch avoids a synchronous setState in the effect body,
   * which would cause a cascading render.
   */
  const key = JSON.stringify({ productId, sort, ratingFilter, page, userId, revision })
  const [settled, setSettled] = useState<SettledReviews>({
    key: '',
    reviews: [],
    stats: EMPTY_STATS,
    myReview: null,
    totalPages: 1,
    total: 0,
    error: null,
  })

  useEffect(() => {
    if (!productId) return

    const controller = new AbortController()

    Promise.all([
      reviewsApi.listReviews(
        productId,
        { sort, rating: ratingFilter, page, perPage: PER_PAGE },
        controller.signal,
      ),
      reviewsApi.getReviewStats(productId, controller.signal),
      reviewsApi.getMyReview(productId, userId, controller.signal),
    ])
      .then(
        ([list, nextStats, mine]: [
          Paginated<Review>,
          ReviewStats,
          Review | null,
        ]) => {
          setSettled({
            key,
            reviews: list.items,
            stats: nextStats,
            myReview: mine,
            totalPages: list.totalPages,
            total: list.total,
            error: null,
          })
          // Fresh counts already include any votes cast, so drop the overlay.
          setHelpfulDeltas({})
          // The api clamps out-of-range pages; mirror that back into state.
          if (list.page !== page) setPage(list.page)
        },
      )
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setSettled({
          key,
          reviews: [],
          stats: EMPTY_STATS,
          myReview: null,
          totalPages: 1,
          total: 0,
          error: toErrorMessage(error),
        })
      })

    return () => controller.abort()
  }, [key, productId, sort, ratingFilter, page, userId])

  const isCurrent = settled.key === key
  const loading = !isCurrent
  const error = isCurrent ? settled.error : null

  const reviews = useMemo(
    () =>
      settled.reviews.map((review) =>
        helpfulDeltas[review.id]
          ? {
              ...review,
              helpfulCount: Math.max(
                0,
                review.helpfulCount + helpfulDeltas[review.id]!,
              ),
            }
          : review,
      ),
    [settled.reviews, helpfulDeltas],
  )

  const { stats, myReview, totalPages, total } = settled

  const refresh = useCallback(() => setRevision((value) => value + 1), [])

  const setSort = useCallback((next: ReviewSort) => {
    setSortState(next)
    setPage(1)
  }, [])

  const setRatingFilter = useCallback((next: Rating | null) => {
    setRatingFilterState(next)
    setPage(1)
  }, [])

  const createReview = useCallback(
    async (draft: Omit<ReviewDraft, 'productId'>) => {
      if (!productId) return
      await reviewsApi.createReview({ ...draft, productId }, userId)
      // Jump back to the newest page so the author sees their own review.
      setSortState('recent')
      setRatingFilterState(null)
      setPage(1)
      refresh()
    },
    [productId, userId, refresh],
  )

  const updateReview = useCallback(
    async (
      reviewId: string,
      draft: Pick<ReviewDraft, 'rating' | 'title' | 'body'>,
    ) => {
      await reviewsApi.updateReview(reviewId, draft, userId)
      refresh()
    },
    [userId, refresh],
  )

  const deleteReview = useCallback(
    async (reviewId: string) => {
      await reviewsApi.deleteReview(reviewId, userId)
      refresh()
    },
    [userId, refresh],
  )

  /**
   * Optimistic: the count moves immediately and rolls back if the call fails.
   * Stats are untouched, so no refetch is needed.
   */
  const toggleHelpful = useCallback(
    async (reviewId: string) => {
      const isVoted = votedIds.has(reviewId)
      const delta = isVoted ? -1 : 1

      const applyDelta = (amount: number) =>
        setHelpfulDeltas((current) => ({
          ...current,
          [reviewId]: (current[reviewId] ?? 0) + amount,
        }))

      const toggleVoted = (voted: boolean) =>
        setVotedIds((current) => {
          const next = new Set(current)
          if (voted) next.add(reviewId)
          else next.delete(reviewId)
          return next
        })

      applyDelta(delta)
      toggleVoted(!isVoted)

      try {
        await reviewsApi.voteHelpful(reviewId, !isVoted)
      } catch {
        applyDelta(-delta)
        toggleVoted(isVoted)
      }
    },
    [votedIds],
  )

  return {
    reviews,
    stats,
    myReview,
    page,
    totalPages,
    total,
    loading,
    error,
    sort,
    ratingFilter,
    votedIds,
    setSort,
    setRatingFilter,
    setPage,
    createReview,
    updateReview,
    deleteReview,
    toggleHelpful,
  }
}

/** Exposed so the card can render the voted state. */
export { PER_PAGE as REVIEWS_PER_PAGE }
