import type { StoredUser } from '../types'

/**
 * Demo credentials, surfaced on the sign-in page:
 *   gamer@example.com / password123
 *
 * `purchasedProductIds` drives the "Verified Purchase" cart badge. It covers
 * roughly half the catalogue on purpose, so the badge is visibly present on
 * some products and visibly absent on others.
 */
export const MOCK_USERS: StoredUser[] = [
  {
    id: 'u1',
    email: 'gamer@example.com',
    password: 'password123',
    name: 'Alex Rivera',
    purchasedProductIds: ['p1', 'p3', 'p5', 'p7', 'p9', 'p11'],
  },
  {
    id: 'u2',
    email: 'sam@example.com',
    password: 'password123',
    name: 'Sam Okafor',
    purchasedProductIds: ['p2', 'p4', 'p6', 'p10'],
  },
]

export const DEMO_CREDENTIALS = {
  email: 'gamer@example.com',
  password: 'password123',
} as const
