import { useEffect, useState } from 'react'
import { isAbortError, toErrorMessage } from '../api/client'
import { getProductById, getProducts } from '../api/products.api'
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
 * Fetches the catalogue for the given filters. Filtering, search and sort are
 * server-side — the filters are forwarded as query params.
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

export function useProduct(id: string | undefined): DetailState {
  const key = id ?? ''
  const [settled, setSettled] = useState<Settled<Product>>(EMPTY)

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    getProductById(id, controller.signal)
      .then((product) => setSettled({ key: id, data: product, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setSettled({ key: id, data: null, error: toErrorMessage(error) })
      })

    return () => controller.abort()
  }, [id])

  if (!id) {
    return { product: null, loading: false, error: 'Product not found' }
  }

  const isCurrent = settled.key === key

  return {
    product: isCurrent ? settled.data : null,
    loading: !isCurrent,
    error: isCurrent ? settled.error : null,
  }
}
