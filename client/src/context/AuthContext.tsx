import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth.api'
import { isAbortError } from '../api/client'
import type { User } from '../types'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Restore any persisted session before rendering auth-dependent UI. State is
  // only touched from the async callbacks, never synchronously in the body.
  useEffect(() => {
    const controller = new AbortController()

    authApi
      .getSession(controller.signal)
      .then((session) => {
        setUser(session?.user ?? null)
        setStatus(session ? 'authenticated' : 'anonymous')
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setUser(null)
        setStatus('anonymous')
      })

    return () => controller.abort()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    // Let the caller surface the error; only commit state on success.
    const session = await authApi.signIn(email, password)
    setUser(session.user)
    setStatus('authenticated')
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
