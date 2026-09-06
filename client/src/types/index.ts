export const CATEGORIES = [
  'Consoles',
  'PC Hardware',
  'Peripherals',
  'Games',
  'Accessories',
] as const

export type Category = (typeof CATEGORIES)[number]

export type Rating = 1 | 2 | 3 | 4 | 5

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  originalPrice?: number
  image: string
  description: string
  features: string[]
  stock: number
  ratingAverage: number
  ratingCount: number
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  productId: string
  authorId: string | null
  authorName: string
  rating: Rating
  title: string
  body: string
  createdAt: string
  verifiedPurchase: boolean
  helpfulCount: number
}

export interface StoredUser {
  id: string
  email: string
  password: string
  name: string
  purchasedProductIds: string[]
}

export type User = Omit<StoredUser, 'password'>

export interface Session {
  user: User
  token: string
}

export interface ReviewDraft {
  productId: string
  rating: Rating
  title: string
  body: string
  guestName?: string
}

export type ReviewSort = 'recent' | 'helpful' | 'highest' | 'lowest'

export interface ReviewQuery {
  sort?: ReviewSort
  rating?: Rating | null
  page?: number
  perPage?: number
}

export interface Paginated<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface RatingBucket {
  rating: Rating
  count: number
  percentage: number
}

export interface ReviewStats {
  average: number
  total: number
  buckets: RatingBucket[]
}

export interface ProductQuery {
  category?: Category | null
  search?: string
  sort?: ProductSort
}

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'rating'
