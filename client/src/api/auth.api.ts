import type { Session, StoredUser, User } from '../types'
import { ApiError, request } from './client'
import { db } from './db'

/** Never let the stored password escape the api layer. */
function toPublicUser(stored: StoredUser): User {
  const { password, ...user } = stored
  void password
  return user
}

/** Mirrors `POST /auth/login`. */
export function signIn(
  email: string,
  password: string,
  signal?: AbortSignal,
): Promise<Session> {
  return request(() => {
    const user = db.findUserByEmail(email)

    // Deliberately vague: never reveal whether the email exists.
    if (!user || user.password !== password) {
      throw new ApiError('Incorrect email or password.', 401)
    }

    const session: Session = {
      user: toPublicUser(user),
      token: `mock-token-${user.id}-${Date.now()}`,
    }

    db.setSession(session)
    return session
  }, signal)
}

/** Mirrors `POST /auth/logout`. */
export function signOut(signal?: AbortSignal): Promise<void> {
  return request(() => {
    db.clearSession()
  }, signal)
}

/**
 * Mirrors `GET /auth/me`. Resolves the persisted session against the current
 * user list so a stale session for a removed user is discarded.
 */
export function getSession(signal?: AbortSignal): Promise<Session | null> {
  return request(() => {
    const session = db.getSession()
    if (!session) return null

    const user = db.findUserById(session.user.id)
    if (!user) {
      db.clearSession()
      return null
    }

    return { ...session, user: toPublicUser(user) }
  }, signal)
}
