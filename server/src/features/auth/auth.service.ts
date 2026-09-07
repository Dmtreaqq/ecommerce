import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { CommonConfig } from '../../common/common.config.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshSession } from './entities/refresh-session.entity.js';
import type { RefreshContext } from './types/authenticated-user.js';

const BCRYPT_COST = 12;

/**
 * Compared against when no user matches, so a login for an unknown email costs
 * the same time as one for a known email and cannot be used to enumerate
 * accounts.
 */
const DUMMY_HASH = bcrypt.hashSync(randomUUID(), BCRYPT_COST);

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * A rejected refresh reports the revocation it still owes, because that write
 * has to happen outside the transaction that decided to reject.
 */
type RefreshOutcome =
  { tokens: TokenPair } | { revokeFamilyFor: string | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly commonConfig: CommonConfig,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; tokens: TokenPair }> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const tokens = await this.dataSource.transaction((manager) =>
      this.issueTokens(manager, user),
    );

    return { user, tokens };
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(
      email.trim().toLowerCase(),
    );

    const matches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !matches) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    return user;
  }

  async login(user: { id: string; email: string }): Promise<TokenPair> {
    return this.dataSource.transaction((manager) =>
      this.issueTokens(manager, user),
    );
  }

  /**
   * Rotates the refresh token. A token that names a real session but is not
   * that session's current token has been replayed, which revokes every live
   * session for the user: whoever redeems a stolen token second burns the
   * whole family, so theft is contained within one refresh cycle.
   */
  async refresh(context: RefreshContext): Promise<TokenPair> {
    const outcome: RefreshOutcome = await this.dataSource.transaction(
      async (manager): Promise<RefreshOutcome> => {
        const session = await manager.findOne(RefreshSession, {
          where: { id: context.sessionId },
        });

        if (!session) {
          return { revokeFamilyFor: null };
        }

        const tokenHash = this.hashRefreshToken(context.refreshToken);

        if (session.tokenHash !== tokenHash || session.revokedAt !== null) {
          return { revokeFamilyFor: session.userId };
        }

        // Expiry is ordinary, not an attack, so only this session dies.
        if (session.expiresAt.getTime() <= Date.now()) {
          await manager.update(RefreshSession, session.id, {
            revokedAt: new Date(),
          });
          return { revokeFamilyFor: null };
        }

        await manager.update(RefreshSession, session.id, {
          revokedAt: new Date(),
        });

        return {
          tokens: await this.issueTokens(manager, {
            id: context.id,
            email: context.email,
          }),
        };
      },
    );

    if ('tokens' in outcome) {
      return outcome.tokens;
    }

    // Revoked in a second transaction: throwing inside the one above would roll
    // the revocation back along with it, leaving the replayed token usable.
    if (outcome.revokeFamilyFor !== null) {
      const userId = outcome.revokeFamilyFor;
      await this.dataSource.transaction((manager) =>
        this.revokeFamily(manager, userId),
      );
    }

    throw new UnauthorizedException();
  }

  /** Idempotent: logging out twice is not an error. */
  async logout(context: RefreshContext): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        RefreshSession,
        { id: context.sessionId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    });
  }

  private async revokeFamily(
    manager: EntityManager,
    userId: string,
  ): Promise<void> {
    await manager.update(
      RefreshSession,
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /**
   * The refresh JWT carries the id of the row that stores its own hash, so the
   * id is generated up front to break the circularity: generate, sign, insert.
   */
  private async issueTokens(
    manager: EntityManager,
    user: { id: string; email: string },
  ): Promise<TokenPair> {
    const sessionId = randomUUID();

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, sid: sessionId },
      {
        secret: this.commonConfig.jwtRefreshSecret,
        expiresIn: this.commonConfig.jwtRefreshTtlSeconds,
      },
    );

    await manager.insert(RefreshSession, {
      id: sessionId,
      userId: user.id,
      tokenHash: this.hashRefreshToken(refreshToken),
      expiresAt: new Date(
        Date.now() + this.commonConfig.jwtRefreshTtlSeconds * 1000,
      ),
      revokedAt: null,
    });

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.commonConfig.jwtAccessSecret,
        expiresIn: this.commonConfig.jwtAccessTtlSeconds,
      },
    );

    return { accessToken, refreshToken };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
