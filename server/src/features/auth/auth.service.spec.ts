import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import { DataSource, IsNull } from 'typeorm';
import { CommonConfig } from '../../common/common.config.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { RefreshSession } from './entities/refresh-session.entity.js';
import type { RefreshContext } from './types/authenticated-user.js';

/**
 * The real module hashes a dummy password at import time with a cost-12 round,
 * which would otherwise be paid by every test file that touches this service.
 */
vi.mock('bcrypt', () => ({
  hash: vi.fn(async () => 'hashed-password'),
  hashSync: vi.fn(() => 'dummy-hash'),
  compare: vi.fn(async () => true),
}));

const bcrypt = await import('bcrypt');

const ACCESS_SECRET = 'a'.repeat(32);
const REFRESH_SECRET = 'r'.repeat(32);
const ACCESS_TTL = 900;
const REFRESH_TTL = 1209600;

const USER_ID = 'u1111111-1111-4111-8111-111111111111';
const SESSION_ID = 's1111111-1111-4111-8111-111111111111';

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: USER_ID,
  email: 'ada@example.com',
  name: 'Ada',
  passwordHash: 'stored-hash',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  version: 1,
  ...overrides,
});

const buildSession = (
  overrides: Partial<RefreshSession> = {},
): RefreshSession =>
  ({
    id: SESSION_ID,
    userId: USER_ID,
    tokenHash: sha256('valid-refresh-token'),
    expiresAt: new Date('2026-12-31T00:00:00.000Z'),
    revokedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }) as RefreshSession;

const buildRefreshContext = (
  overrides: Partial<RefreshContext> = {},
): RefreshContext => ({
  id: USER_ID,
  email: 'ada@example.com',
  name: 'Ada',
  sessionId: SESSION_ID,
  refreshToken: 'valid-refresh-token',
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findByEmailWithPassword: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let dataSource: { transaction: ReturnType<typeof vi.fn> };
  let manager: {
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    usersService = {
      create: vi.fn(),
      findByEmailWithPassword: vi.fn(),
    };

    jwtService = {
      signAsync: vi
        .fn()
        .mockImplementation(async (payload: Record<string, unknown>) =>
          'sid' in payload ? 'refresh-jwt' : 'access-jwt',
        ),
    };

    manager = {
      findOne: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
    };

    dataSource = {
      transaction: vi.fn(async (callback: (m: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: CommonConfig,
          useValue: {
            jwtAccessSecret: ACCESS_SECRET,
            jwtRefreshSecret: REFRESH_SECRET,
            jwtAccessTtlSeconds: ACCESS_TTL,
            jwtRefreshTtlSeconds: REFRESH_TTL,
          } as CommonConfig,
        },
        { provide: DataSource, useValue: dataSource as unknown as DataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('register', () => {
    const dto = {
      email: 'ada@example.com',
      name: 'Ada',
      password: 'correct horse battery',
    };

    it('stores a hash rather than the password itself', async () => {
      usersService.create.mockResolvedValue(buildUser());

      await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        passwordHash: 'hashed-password',
      });
    });

    it('returns the new user with a fresh token pair', async () => {
      const user = buildUser();
      usersService.create.mockResolvedValue(user);

      await expect(service.register(dto)).resolves.toEqual({
        user,
        tokens: { accessToken: 'access-jwt', refreshToken: 'refresh-jwt' },
      });
    });

    it('lets a duplicate email surface as a conflict', async () => {
      const conflict = new ConflictException('Email is already registered');
      usersService.create.mockRejectedValue(conflict);

      await expect(service.register(dto)).rejects.toBe(conflict);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('validateCredentials', () => {
    it('normalises the email before looking it up', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(buildUser());

      await service.validateCredentials('  Ada@Example.COM ', 'password');

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(
        'ada@example.com',
      );
    });

    it('returns the user when the password matches', async () => {
      const user = buildUser();
      usersService.findByEmailWithPassword.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        service.validateCredentials('ada@example.com', 'password'),
      ).resolves.toBe(user);
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(buildUser());
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.validateCredentials('ada@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an unknown email with the same message as a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.validateCredentials('nobody@example.com', 'password'),
      ).rejects.toThrow('Incorrect email or password.');
    });

    /**
     * Skipping the comparison for an unknown email would make the failure
     * measurably faster than a wrong password and turn login into an account
     * enumeration oracle.
     */
    it('still spends a comparison when no user matches', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.validateCredentials('nobody@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'dummy-hash');
    });
  });

  describe('login', () => {
    it('issues a token pair inside a transaction', async () => {
      await expect(
        service.login({ id: USER_ID, email: 'ada@example.com' }),
      ).resolves.toEqual({
        accessToken: 'access-jwt',
        refreshToken: 'refresh-jwt',
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('token issuing', () => {
    it('signs the refresh token with the refresh secret and lifetime', async () => {
      await service.login({ id: USER_ID, email: 'ada@example.com' });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: USER_ID, sid: expect.any(String) },
        { secret: REFRESH_SECRET, expiresIn: REFRESH_TTL },
      );
    });

    it('signs the access token with the access secret and lifetime', async () => {
      await service.login({ id: USER_ID, email: 'ada@example.com' });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: USER_ID, email: 'ada@example.com' },
        { secret: ACCESS_SECRET, expiresIn: ACCESS_TTL },
      );
    });

    it('stores only a hash of the refresh token', async () => {
      await service.login({ id: USER_ID, email: 'ada@example.com' });

      const [, values] = manager.insert.mock.calls[0] as [
        unknown,
        { tokenHash: string },
      ];

      expect(values.tokenHash).toBe(sha256('refresh-jwt'));
      expect(values.tokenHash).not.toBe('refresh-jwt');
    });

    it('ties the stored session to the id carried in the refresh token', async () => {
      await service.login({ id: USER_ID, email: 'ada@example.com' });

      const [signedPayload] = jwtService.signAsync.mock.calls[0] as [
        { sid: string },
      ];
      const [, values] = manager.insert.mock.calls[0] as [
        unknown,
        { id: string },
      ];

      expect(values.id).toBe(signedPayload.sid);
    });

    it('expires the stored session after the refresh lifetime', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));

      await service.login({ id: USER_ID, email: 'ada@example.com' });

      expect(manager.insert).toHaveBeenCalledWith(
        RefreshSession,
        expect.objectContaining({
          userId: USER_ID,
          revokedAt: null,
          expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
        }),
      );
    });
  });

  describe('refresh', () => {
    it('rotates the session and returns a new pair', async () => {
      manager.findOne.mockResolvedValue(buildSession());

      await expect(service.refresh(buildRefreshContext())).resolves.toEqual({
        accessToken: 'access-jwt',
        refreshToken: 'refresh-jwt',
      });

      expect(manager.update).toHaveBeenCalledWith(
        RefreshSession,
        SESSION_ID,
        { revokedAt: expect.any(Date) },
      );
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it('rejects a token naming a session that does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.refresh(buildRefreshContext())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.update).not.toHaveBeenCalled();
    });

    /**
     * The rejection and the revocation cannot share a transaction: rolling back
     * the rejection would roll back the revocation and leave the stolen token
     * usable.
     */
    it('revokes every session for the user when a superseded token is replayed', async () => {
      manager.findOne.mockResolvedValue(
        buildSession({ tokenHash: sha256('an-older-token') }),
      );

      await expect(service.refresh(buildRefreshContext())).rejects.toThrow(
        UnauthorizedException,
      );

      expect(dataSource.transaction).toHaveBeenCalledTimes(2);
      expect(manager.update).toHaveBeenCalledWith(
        RefreshSession,
        { userId: USER_ID, revokedAt: IsNull() },
        { revokedAt: expect.any(Date) },
      );
    });

    it('revokes every session for the user when an already revoked token is replayed', async () => {
      manager.findOne.mockResolvedValue(
        buildSession({ revokedAt: new Date('2026-05-01T00:00:00.000Z') }),
      );

      await expect(service.refresh(buildRefreshContext())).rejects.toThrow(
        UnauthorizedException,
      );

      expect(dataSource.transaction).toHaveBeenCalledTimes(2);
      expect(manager.update).toHaveBeenCalledWith(
        RefreshSession,
        { userId: USER_ID, revokedAt: IsNull() },
        { revokedAt: expect.any(Date) },
      );
    });

    // Expiry is ordinary rather than an attack, so the rest of the family lives.
    it('retires only the expired session, leaving the family alone', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
      manager.findOne.mockResolvedValue(
        buildSession({ expiresAt: new Date('2026-05-01T00:00:00.000Z') }),
      );

      await expect(service.refresh(buildRefreshContext())).rejects.toThrow(
        UnauthorizedException,
      );

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.update).toHaveBeenCalledWith(
        RefreshSession,
        SESSION_ID,
        { revokedAt: expect.any(Date) },
      );
      expect(manager.insert).not.toHaveBeenCalled();
    });

    it('treats a session expiring exactly now as expired', async () => {
      const now = new Date('2026-06-01T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);
      manager.findOne.mockResolvedValue(buildSession({ expiresAt: now }));

      await expect(service.refresh(buildRefreshContext())).rejects.toThrow(
        UnauthorizedException,
      );
      expect(manager.insert).not.toHaveBeenCalled();
    });

    it('accepts a session expiring a moment from now', async () => {
      const now = new Date('2026-06-01T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);
      manager.findOne.mockResolvedValue(
        buildSession({ expiresAt: new Date(now.getTime() + 1) }),
      );

      await expect(service.refresh(buildRefreshContext())).resolves.toEqual({
        accessToken: 'access-jwt',
        refreshToken: 'refresh-jwt',
      });
    });
  });

  describe('logout', () => {
    it('revokes the session the caller presents', async () => {
      await service.logout(buildRefreshContext());

      expect(manager.update).toHaveBeenCalledWith(
        RefreshSession,
        { id: SESSION_ID, revokedAt: IsNull() },
        { revokedAt: expect.any(Date) },
      );
    });

    // Scoped to live sessions, so a repeat logout updates nothing.
    it('does not fail when the session is already revoked', async () => {
      manager.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.logout(buildRefreshContext()),
      ).resolves.toBeUndefined();
    });
  });
});
