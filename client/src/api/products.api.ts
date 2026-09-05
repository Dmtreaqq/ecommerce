import type { Product, ProductQuery } from '../types'
import { assetUrl, http } from './client'
import { db } from './db'

/**
 * The API returns image paths relative to the server root
 * (`/images/products/gpu.svg`). Resolving here keeps every component's
 * `<img src={product.image}>` working unchanged.
 */
const withImageUrl = (product: Product): Product => ({
  ...product,
  image: assetUrl(product.image),
})

/** `GET /products?category=&search=&sort=` — filtering happens server-side. */
export async function getProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<Product[]> {
  const { category = null, search = '', sort = 'featured' } = query

  const products = await http<Product[]>('/products', {
    signal,
    params: { category, search: search.trim(), sort },
  })

  const rated = db.withLiveRatings(products.map(withImageUrl))

  // The server sorted by its seed ratings, but the stars we render come from
  // local reviews — re-sort so the order matches what the user actually sees.
  return sort === 'rating'
    ? [...rated].sort((a, b) => b.ratingAverage - a.ratingAverage)
    : rated
}

/** `GET /products/:id` — a miss surfaces as an `ApiError` with status 404. */
export async function getProductById(
  id: string,
  signal?: AbortSignal,
): Promise<Product> {
  const product = await http<Product>(`/products/${encodeURIComponent(id)}`, {
    signal,
  })
  return db.withLiveRatings([withImageUrl(product)])[0]
}
