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
      .then((currentUser) => {
        setUser(currentUser)
        setStatus(currentUser ? 'authenticated' : 'anonymous')
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setUser(null)
        setStatus('anonymous')
      })

    return () => controller.abort()
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const signedUp = await authApi.signUp(name, email, password)
      setUser(signedUp)
      setStatus('authenticated')
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    // Let the caller surface the error; only commit state on success.
    const signedIn = await authApi.signIn(email, password)
    setUser(signedIn)
    setStatus('authenticated')
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signUp, signIn, signOut }),
    [user, status, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
