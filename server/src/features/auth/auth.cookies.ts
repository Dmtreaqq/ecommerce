import type { CookieOptions, Response } from 'express';
import type { CommonConfig } from '../../common/common.config.js';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * SameSite=Lax is correct here: SameSite compares registrable domains and
 * ignores port, so the Vite dev server calling this API is same-site. Switching
 * to None would also require Secure, which breaks plain-HTTP localhost.
 */
const baseOptions = (config: CommonConfig): CookieOptions => ({
  httpOnly: true,
  secure: config.isCookieSecure,
  sameSite: 'lax',
  path: '/',
});

export const setAuthCookies = (
  response: Response,
  config: CommonConfig,
  tokens: { accessToken: string; refreshToken: string },
): void => {
  response.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions(config),
    maxAge: config.jwtAccessTtlSeconds * 1000,
  });
  response.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions(config),
    maxAge: config.jwtRefreshTtlSeconds * 1000,
  });
};

/**
 * clearCookie must repeat the attributes used to set the cookie, or the browser
 * treats it as a different cookie and the clear silently does nothing.
 */
export const clearAuthCookies = (
  response: Response,
  config: CommonConfig,
): void => {
  response.clearCookie(ACCESS_TOKEN_COOKIE, baseOptions(config));
  response.clearCookie(REFRESH_TOKEN_COOKIE, baseOptions(config));
};
