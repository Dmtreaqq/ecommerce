import type { User } from '../types'
import { ApiError, http } from './client'

/** `POST /auth/register` — creates the account and opens a session, like login. */
export function signUp(
  name: string,
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<User> {
  return http<User>('/auth/register', {
    method: 'POST',
    signal,
    body: { email, name, password },
  })
}

/** `POST /auth/login` — the server replies with httpOnly session cookies. */
export function signIn(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<User> {
  return http<User>('/auth/login', {
    method: 'POST',
    signal,
    body: { email, password },
  })
}

/** `POST /auth/logout` — clears the session cookies. */
export function signOut(signal?: AbortSignal): Promise<void> {
  return http<void>('/auth/logout', { method: 'POST', signal })
}

/**
 * `GET /auth/me`. Only a 401 becomes `null`: a network failure must keep
 * propagating so "signed out" stays distinguishable from "server unreachable".
 */
export async function getSession(signal?: AbortSignal): Promise<User | null> {
  try {
    return await http<User>('/auth/me', { signal })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
