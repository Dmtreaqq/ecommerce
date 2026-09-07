import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

type QueryBuilderMock = {
  addSelect: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  getOne: ReturnType<typeof vi.fn>;
};

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: '3f1a9c7e-5b2d-4a91-8c33-0e6f7a1b2c4d',
  email: 'ada@example.com',
  name: 'Ada',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  version: 1,
  ...overrides,
});

const buildQueryFailedError = (code?: string): QueryFailedError => {
  const error = new QueryFailedError(
    'INSERT INTO "users" ...',
    [],
    new Error('driver failure'),
  );

  if (code !== undefined) {
    Object.assign(error, { code });
  }

  return error;
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let queryBuilder: QueryBuilderMock;

  beforeEach(async () => {
    queryBuilder = {
      addSelect: vi.fn(),
      where: vi.fn(),
      getOne: vi.fn(),
    };
    queryBuilder.addSelect.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);

    repository = {
      findOne: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
      create: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository as unknown as Repository<User>,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('returns the user matching the id', async () => {
      const user = buildUser();
      repository.findOne.mockResolvedValue(user);

      await expect(service.findById(user.id)).resolves.toBe(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('returns null when no user matches', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing-id')).resolves.toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns the user matching the email', async () => {
      const user = buildUser();
      repository.findOne.mockResolvedValue(user);

      await expect(service.findByEmail(user.email)).resolves.toBe(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });

    it('returns null when no user matches', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('nobody@example.com')).resolves.toBeNull();
    });

    // Normalization is the caller's job (auth.service.ts); the lookup must stay verbatim.
    it('queries the email exactly as given, without trimming or lowercasing', async () => {
      repository.findOne.mockResolvedValue(null);

      await service.findByEmail('  Ada@Example.COM  ');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: '  Ada@Example.COM  ' },
      });
    });
  });

  describe('findByEmailWithPassword', () => {
    it('selects the password hash for the matching email', async () => {
      const user = buildUser();
      queryBuilder.getOne.mockResolvedValue(user);

      await expect(
        service.findByEmailWithPassword(user.email),
      ).resolves.toBe(user);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', {
        email: user.email,
      });
    });

    it('returns null when no user matches', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.findByEmailWithPassword('nobody@example.com'),
      ).resolves.toBeNull();
    });
  });

  describe('getByIdOrFail', () => {
    it('returns the user when one is found', async () => {
      const user = buildUser();
      repository.findOne.mockResolvedValue(user);

      await expect(service.getByIdOrFail(user.id)).resolves.toBe(user);
    });

    it('throws NotFoundException when no user is found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getByIdOrFail('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getByIdOrFail('missing-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('create', () => {
    const input = {
      email: 'ada@example.com',
      name: 'Ada',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
    };

    it('persists the built entity and returns the saved user', async () => {
      const built = buildUser({ id: undefined as unknown as string });
      const saved = buildUser();
      repository.create.mockReturnValue(built);
      repository.save.mockResolvedValue(saved);

      await expect(service.create(input)).resolves.toBe(saved);
      expect(repository.create).toHaveBeenCalledWith(input);
      expect(repository.save).toHaveBeenCalledWith(built);
    });

    it('translates a unique violation into ConflictException', async () => {
      repository.create.mockReturnValue(buildUser());
      repository.save.mockRejectedValue(buildQueryFailedError('23505'));

      await expect(service.create(input)).rejects.toThrow(ConflictException);
      await expect(service.create(input)).rejects.toThrow(
        'Email is already registered',
      );
    });

    it('rethrows a QueryFailedError carrying a different code', async () => {
      const error = buildQueryFailedError('23503');
      repository.create.mockReturnValue(buildUser());
      repository.save.mockRejectedValue(error);

      await expect(service.create(input)).rejects.toBe(error);
    });

    it('rethrows a QueryFailedError with no code', async () => {
      const error = buildQueryFailedError();
      repository.create.mockReturnValue(buildUser());
      repository.save.mockRejectedValue(error);

      await expect(service.create(input)).rejects.toBe(error);
    });

    it('rethrows errors that are not QueryFailedError', async () => {
      const error = new Error('connection lost');
      repository.create.mockReturnValue(buildUser());
      repository.save.mockRejectedValue(error);

      await expect(service.create(input)).rejects.toBe(error);
    });
  });
});
