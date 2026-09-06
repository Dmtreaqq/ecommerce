import { MOCK_USERS } from '../mocks/users'
import type { Session, StoredUser } from '../types'

/**
 * A tiny localStorage-backed store standing in for the server database.
 * Reviews and products are served by the real API now; only the signed-in
 * session and the mock user list remain here, until auth lands server-side.
 *
 * Bump `VERSION` to invalidate stored data after a shape change.
 */
const VERSION = 'v1'
const key = (name: string) => `gg:${VERSION}:${name}`

const KEYS = {
  session: key('session'),
} as const

/** localStorage throws in private-mode Safari and when storage is disabled. */
function readJson<T>(storageKey: string): T | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

function writeJson(storageKey: string, value: unknown): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    // Storage unavailable or full — the in-memory copy still works for this session.
  }
}

function clearKey(storageKey: string): void {
  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    // Ignore.
  }
}

// Users are read-only in the mock — there is no registration flow.
const users: StoredUser[] = MOCK_USERS

export const db = {
  findUserByEmail(email: string): StoredUser | undefined {
    const normalised = email.trim().toLowerCase()
    return users.find((user) => user.email.toLowerCase() === normalised)
  },

  findUserById(id: string): StoredUser | undefined {
    return users.find((user) => user.id === id)
  },

  getSession(): Session | null {
    return readJson<Session>(KEYS.session)
  },

  setSession(session: Session): void {
    writeJson(KEYS.session, session)
  },

  clearSession(): void {
    clearKey(KEYS.session)
  },
}
