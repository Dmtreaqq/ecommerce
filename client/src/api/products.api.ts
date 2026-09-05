import type { Product, ProductQuery } from '../types'
import { ApiError, request } from './client'
import { db } from './db'

/**
 * Mirrors `GET /products` — filtering, search and sort are server-side
 * concerns, so they are expressed as query params rather than done in the UI.
 */
export function getProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<Product[]> {
  return request(() => {
    const { category = null, search = '', sort = 'featured' } = query
    const term = search.trim().toLowerCase()

    let items = db.getProducts()

    if (category) {
      items = items.filter((product) => product.category === category)
    }

    if (term) {
      items = items.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term),
      )
    }

    switch (sort) {
      case 'price-asc':
        items = [...items].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        items = [...items].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        items = [...items].sort((a, b) => b.ratingAverage - a.ratingAverage)
        break
      case 'featured':
      default:
        break
    }

    return items
  }, signal)
}

/** Mirrors `GET /products/:slug`. */
export function getProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Product> {
  return request(() => {
    const product = db.getProducts().find((item) => item.slug === slug)
    if (!product) {
      throw new ApiError('Product not found', 404)
    }
    return product
  }, signal)
}
