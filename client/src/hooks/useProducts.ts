import { useEffect, useState } from 'react'
import { isAbortError, toErrorMessage } from '../api/client'
import { getProductBySlug, getProducts } from '../api/products.api'
import type { Category, Product, ProductSort } from '../types'

/**
 * One settled result, tagged with the query it belongs to. Comparing that tag
 * against the current query yields `loading` without a synchronous setState in
 * the effect body — which would trigger a cascading render.
 */
interface Settled<T> {
  key: string
  data: T | null
  error: string | null
}

const EMPTY: Settled<never> = { key: '', data: null, error: null }

interface ListState {
  products: Product[]
  loading: boolean
  error: string | null
}

/**
 * Fetches the catalogue for the given filters. Filtering happens in the api
 * layer so the same call shape works against the real REST endpoint later.
 */
export function useProducts(
  category: Category | null,
  search: string,
  sort: ProductSort,
): ListState {
  const key = JSON.stringify({ category, search, sort })
  const [settled, setSettled] = useState<Settled<Product[]>>(EMPTY)

  useEffect(() => {
    const controller = new AbortController()

    getProducts({ category, search, sort }, controller.signal)
      .then((products) =>
        setSettled({ key, data: products, error: null }),
      )
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setSettled({ key, data: null, error: toErrorMessage(error) })
      })

    return () => controller.abort()
  }, [key, category, search, sort])

  const isCurrent = settled.key === key

  return {
    products: isCurrent ? (settled.data ?? []) : [],
    loading: !isCurrent,
    error: isCurrent ? settled.error : null,
  }
}

interface DetailState {
  product: Product | null
  loading: boolean
  error: string | null
}

export function useProduct(slug: string | undefined): DetailState {
  const key = slug ?? ''
  const [settled, setSettled] = useState<Settled<Product>>(EMPTY)

  useEffect(() => {
    if (!slug) return

    const controller = new AbortController()

    getProductBySlug(slug, controller.signal)
      .then((product) => setSettled({ key: slug, data: product, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setSettled({ key: slug, data: null, error: toErrorMessage(error) })
      })

    return () => controller.abort()
  }, [slug])

  if (!slug) {
    return { product: null, loading: false, error: 'Product not found' }
  }

  const isCurrent = settled.key === key

  return {
    product: isCurrent ? settled.data : null,
    loading: !isCurrent,
    error: isCurrent ? settled.error : null,
  }
}
