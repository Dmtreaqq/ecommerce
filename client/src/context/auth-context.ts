import { createContext } from 'react'
import type { User } from '../types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  signUp: (name: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

/**
 * Kept in its own module so `AuthContext.tsx` exports only the provider
 * component — a requirement for React Fast Refresh.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
