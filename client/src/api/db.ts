import { MOCK_REVIEWS } from '../mocks/reviews'
import { MOCK_USERS } from '../mocks/users'
import type { Product, Review, Session, StoredUser } from '../types'

/**
 * A tiny localStorage-backed store standing in for the server database.
 * Seeded from `mocks/` on first load; every write persists, so reviews and the
 * signed-in session survive a refresh.
 *
 * Bump `VERSION` to invalidate stored data after a shape change.
 */
const VERSION = 'v1'
const key = (name: string) => `gg:${VERSION}:${name}`

const KEYS = {
  reviews: key('reviews'),
  session: key('session'),
} as const

/** localStorage throws in private-mode Safari and when storage is disabled. */
function readJson<T>(storageKey: string): T | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

function writeJson(storageKey: string, value: unknown): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    // Storage unavailable or full — the in-memory copy still works for this session.
  }
}

function clearKey(storageKey: string): void {
  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    // Ignore.
  }
}

/**
 * In-memory working copy. Reads hit this; writes update it and flush to
 * localStorage, so a storage failure degrades to session-only rather than
 * breaking the app.
 */
let reviews: Review[] = readJson<Review[]>(KEYS.reviews) ?? [...MOCK_REVIEWS]

// Users are read-only in the mock — there is no registration flow.
const users: StoredUser[] = MOCK_USERS

export const db = {
  /**
   * Overlays review-derived `ratingAverage` / `ratingCount` onto products
   * fetched from the API. Reviews are still client-side, so the server's seed
   * rating values are replaced outright rather than merged.
   */
  withLiveRatings(products: Product[]): Product[] {
    return products.map((product) => {
      const productReviews = reviews.filter((r) => r.productId === product.id)
      const total = productReviews.length
      const average =
        total === 0
          ? 0
          : productReviews.reduce((sum, r) => sum + r.rating, 0) / total

      return {
        ...product,
        ratingCount: total,
        ratingAverage: Math.round(average * 10) / 10,
      }
    })
  },

  getReviews(): Review[] {
    return reviews
  },

  setReviews(next: Review[]): void {
    reviews = next
    writeJson(KEYS.reviews, reviews)
  },

  findUserByEmail(email: string): StoredUser | undefined {
    const normalised = email.trim().toLowerCase()
    return users.find((user) => user.email.toLowerCase() === normalised)
  },

  findUserById(id: string): StoredUser | undefined {
    return users.find((user) => user.id === id)
  },

  getSession(): Session | null {
    return readJson<Session>(KEYS.session)
  },

  setSession(session: Session): void {
    writeJson(KEYS.session, session)
  },

  clearSession(): void {
    clearKey(KEYS.session)
  },
}
