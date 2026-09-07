import type { Response } from 'express';
import type { CommonConfig } from '../../common/common.config.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from './auth.cookies.js';

const buildConfig = (overrides: Partial<CommonConfig> = {}): CommonConfig =>
  ({
    isCookieSecure: true,
    jwtAccessTtlSeconds: 900,
    jwtRefreshTtlSeconds: 1209600,
    ...overrides,
  }) as CommonConfig;

const buildResponse = () => ({
  cookie: vi.fn(),
  clearCookie: vi.fn(),
});

describe('setAuthCookies', () => {
  it('writes both tokens with their own cookie names', () => {
    const response = buildResponse();

    setAuthCookies(response as unknown as Response, buildConfig(), {
      accessToken: 'access-value',
      refreshToken: 'refresh-value',
    });

    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(response.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      'access-value',
      expect.objectContaining({ maxAge: 900 * 1000 }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      'refresh-value',
      expect.objectContaining({ maxAge: 1209600 * 1000 }),
    );
  });

  it('keeps the cookies unreadable from script and scoped to the whole site', () => {
    const response = buildResponse();

    setAuthCookies(response as unknown as Response, buildConfig(), {
      accessToken: 'a',
      refreshToken: 'r',
    });

    for (const call of response.cookie.mock.calls) {
      expect(call[2]).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  });

  it('follows the configured secure flag', () => {
    const secure = buildResponse();
    setAuthCookies(secure as unknown as Response, buildConfig(), {
      accessToken: 'a',
      refreshToken: 'r',
    });
    for (const call of secure.cookie.mock.calls) {
      expect(call[2]).toMatchObject({ secure: true });
    }

    const insecure = buildResponse();
    setAuthCookies(
      insecure as unknown as Response,
      buildConfig({ isCookieSecure: false }),
      { accessToken: 'a', refreshToken: 'r' },
    );
    for (const call of insecure.cookie.mock.calls) {
      expect(call[2]).toMatchObject({ secure: false });
    }
  });
});

describe('clearAuthCookies', () => {
  it('clears both cookies', () => {
    const response = buildResponse();

    clearAuthCookies(response as unknown as Response, buildConfig());

    expect(response.clearCookie).toHaveBeenCalledTimes(2);
    expect(response.clearCookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.anything(),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      expect.anything(),
    );
  });

  /**
   * A browser only drops a cookie when the clear repeats the attributes it was
   * set with, so a drift between the two calls would silently leave the session
   * cookie in place.
   */
  it('repeats the attributes the cookies were set with, minus maxAge', () => {
    const setResponse = buildResponse();
    const config = buildConfig();

    setAuthCookies(setResponse as unknown as Response, config, {
      accessToken: 'a',
      refreshToken: 'r',
    });

    const clearResponse = buildResponse();
    clearAuthCookies(clearResponse as unknown as Response, config);

    const setOptions = setResponse.cookie.mock.calls.map(
      (call) => call[2] as Record<string, unknown>,
    );
    const clearOptions = clearResponse.clearCookie.mock.calls.map(
      (call) => call[1] as Record<string, unknown>,
    );

    clearOptions.forEach((options, index) => {
      const { maxAge: _maxAge, ...attributesUsedToSet } = setOptions[index];
      expect(options).toEqual(attributesUsedToSet);
    });
  });
});
