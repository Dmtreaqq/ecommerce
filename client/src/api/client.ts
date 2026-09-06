/**
 * The transport layer.
 *
 * Products and reviews come from the real REST API via `http`. Auth is still
 * served from the localStorage store via `request`, which fakes a round trip —
 * when those endpoints land, delete `request` and this file is done.
 */

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Trailing slash trimmed so `${BASE_URL}${path}` never double-slashes. */
const BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')

/** Absolute URL for a server-relative asset path such as `/images/products/x.svg`. */
export const assetUrl = (path: string): string =>
  /^https?:\/\//.test(path) ? path : `${BASE_URL}${path}`

/**
 * Nest's error shape is `{ statusCode, message, error }`, where ValidationPipe
 * reports `message` as an array of failures rather than a single string.
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message: unknown }
      if (typeof message === 'string') return message
      if (Array.isArray(message)) return message.join(', ')
    }
  } catch {
    // Non-JSON error body (proxy HTML, empty 502) — fall through.
  }
  return response.statusText || 'Request failed.'
}

/**
 * Calls the REST API. A non-2xx response becomes an `ApiError` carrying the
 * status; a dropped connection becomes one too, so callers only ever have to
 * tell "aborted" apart from "failed".
 *
 * Empty query values are dropped rather than sent: the server validates with
 * `forbidNonWhitelisted`, so a cleared filter must omit the param entirely.
 */
export async function http<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    signal?: AbortSignal
    params?: Record<string, string | null | undefined>
  } = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value) url.searchParams.set(key, value)
  }

  const hasBody = options.body !== undefined

  let response: Response
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        ...(hasBody && { 'Content-Type': 'application/json' }),
      },
      ...(hasBody && { body: JSON.stringify(options.body) }),
    })
  } catch (error) {
    // Cancellation propagates untouched; everything else is a network fault.
    if (isAbortError(error)) throw error
    throw new ApiError('Could not reach the server. Please try again.', 0)
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  // 204 carries no body — DELETE resolves with nothing to parse.
  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

const MIN_LATENCY_MS = 180
const MAX_LATENCY_MS = 420

const randomLatency = (): number =>
  MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS)

/**
 * Simulates a network round trip. Resolves with the producer's value, or
 * rejects with whatever it throws — mirroring how a real client surfaces
 * non-2xx responses as `ApiError`.
 *
 * Pass an `AbortSignal` to make an in-flight call reject with an `AbortError`,
 * exactly as `fetch` would, so callers can cancel on unmount.
 */
export function request<T>(
  producer: () => T | Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      try {
        Promise.resolve(producer()).then(resolve, reject)
      } catch (error) {
        reject(error)
      }
    }, randomLatency())

    function onAbort() {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** True when a rejection came from cancelling the request, not from a failure. */
export const isAbortError = (error: unknown): boolean =>
  (error instanceof DOMException && error.name === 'AbortError') ||
  (error instanceof Error && error.name === 'AbortError')

/** Best-effort human-readable message for any thrown value. */
export const toErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
