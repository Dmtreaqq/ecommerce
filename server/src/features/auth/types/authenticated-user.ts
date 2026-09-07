export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Only the refresh route sees the raw token; keeping it off AuthenticatedUser
 * means an ordinary controller cannot reach it.
 */
export interface RefreshContext extends AuthenticatedUser {
  sessionId: string;
  refreshToken: string;
}
