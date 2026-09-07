import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CommonConfig } from '../../../common/common.config.js';
import { UsersService } from '../../users/users.service.js';
import { ACCESS_TOKEN_COOKIE } from '../auth.cookies.js';
import type { AuthenticatedUser } from '../types/authenticated-user.js';

interface AccessTokenPayload {
  sub: string;
  email: string;
}

const fromAccessCookie = (request: Request): string | null =>
  (request.cookies as Record<string, string> | undefined)?.[
    ACCESS_TOKEN_COOKIE
  ] ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    commonConfig: CommonConfig,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromAccessCookie]),
      ignoreExpiration: false,
      secretOrKey: commonConfig.jwtAccessSecret,
    });
  }

  /**
   * Loads the user per request rather than trusting the payload, so a deleted
   * account stops working immediately instead of lasting out the access TTL.
   * It also supplies the current name for the review-author snapshot.
   */
  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, email: user.email, name: user.name };
  }
}
