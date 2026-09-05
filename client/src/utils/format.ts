const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const formatPrice = (value: number): string => priceFormatter.format(value)

const relativeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * "3 days ago" for recent reviews, an absolute date beyond a month — matching
 * how review sites usually present timestamps.
 */
export function formatReviewDate(iso: string): string {
  const timestamp = Date.parse(iso)
  if (Number.isNaN(timestamp)) return ''

  const elapsed = Date.now() - timestamp

  if (elapsed < HOUR) {
    return relativeFormatter.format(-Math.floor(elapsed / MINUTE) || 0, 'minute')
  }
  if (elapsed < DAY) {
    return relativeFormatter.format(-Math.floor(elapsed / HOUR), 'hour')
  }
  if (elapsed < 30 * DAY) {
    return relativeFormatter.format(-Math.floor(elapsed / DAY), 'day')
  }
  return dateFormatter.format(timestamp)
}
