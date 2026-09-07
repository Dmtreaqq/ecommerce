import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CommonConfig } from '../../../common/common.config.js';
import { UsersService } from '../../users/users.service.js';
import { REFRESH_TOKEN_COOKIE } from '../auth.cookies.js';
import type { RefreshContext } from '../types/authenticated-user.js';

interface RefreshTokenPayload {
  sub: string;
  sid: string;
}

const fromRefreshCookie = (request: Request): string | null =>
  (request.cookies as Record<string, string> | undefined)?.[
    REFRESH_TOKEN_COOKIE
  ] ?? null;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    commonConfig: CommonConfig,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromRefreshCookie]),
      ignoreExpiration: false,
      secretOrKey: commonConfig.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  /**
   * Signature and expiry only. Rotation and reuse detection need the raw token
   * (hence passReqToCallback) but belong in the service, where they can run
   * inside one transaction.
   */
  async validate(
    request: Request,
    payload: RefreshTokenPayload,
  ): Promise<RefreshContext> {
    const refreshToken = fromRefreshCookie(request);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      sessionId: payload.sid,
      refreshToken,
    };
  }
}
