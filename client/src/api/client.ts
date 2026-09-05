/**
 * The mock transport layer.
 *
 * This is the ONLY file that knows the backend is fake. When the real REST API
 * lands, replace `request` with a `fetch` wrapper and rewrite the bodies of the
 * `*.api.ts` modules; no hook, context or component needs to change.
 */

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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
  error instanceof DOMException && error.name === 'AbortError'

/** Best-effort human-readable message for any thrown value. */
export const toErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
