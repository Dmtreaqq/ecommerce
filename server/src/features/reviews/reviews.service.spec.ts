import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { Product } from '../products/entities/product.entity.js';
import { Review } from './entities/review.entity.js';
import { ReviewsService } from './reviews.service.js';

const AUTHOR: AuthenticatedUser = {
  id: 'a1111111-1111-4111-8111-111111111111',
  email: 'ada@example.com',
  name: 'Ada',
};

const PRODUCT_ID = 'p1111111-1111-4111-8111-111111111111';

const buildReview = (overrides: Partial<Review> = {}): Review =>
  ({
    id: 'r1111111-1111-4111-8111-111111111111',
    productId: PRODUCT_ID,
    authorId: AUTHOR.id,
    authorName: AUTHOR.name,
    rating: 4,
    title: 'Solid',
    body: 'Works exactly as described.',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    version: 1,
    ...overrides,
  }) as Review;

const buildQueryFailedError = (code?: string): QueryFailedError => {
  const error = new QueryFailedError(
    'INSERT INTO "reviews" ...',
    [],
    new Error('driver failure'),
  );

  if (code !== undefined) {
    Object.assign(error, { code });
  }

  return error;
};

const buildChainableBuilder = () => {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    groupBy: vi.fn(),
    orderBy: vi.fn(),
    addOrderBy: vi.fn(),
    skip: vi.fn(),
    take: vi.fn(),
    getCount: vi.fn().mockResolvedValue(0),
    getMany: vi.fn().mockResolvedValue([]),
    getRawMany: vi.fn().mockResolvedValue([]),
    getRawOne: vi.fn().mockResolvedValue({ average: '0', count: '0' }),
  };

  for (const key of [
    'select',
    'addSelect',
    'where',
    'andWhere',
    'groupBy',
    'orderBy',
    'addOrderBy',
    'skip',
    'take',
  ]) {
    builder[key].mockReturnValue(builder);
  }

  return builder;
};

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: {
    createQueryBuilder: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };
  let productsRepository: { exists: ReturnType<typeof vi.fn> };
  let dataSource: { transaction: ReturnType<typeof vi.fn> };
  let manager: {
    exists: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    softRemove: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let reviewsBuilder: ReturnType<typeof buildChainableBuilder>;
  let managerBuilder: ReturnType<typeof buildChainableBuilder>;

  beforeEach(async () => {
    reviewsBuilder = buildChainableBuilder();
    managerBuilder = buildChainableBuilder();

    reviewsRepository = {
      createQueryBuilder: vi.fn().mockReturnValue(reviewsBuilder),
      findOne: vi.fn(),
    };

    productsRepository = { exists: vi.fn().mockResolvedValue(true) };

    manager = {
      exists: vi.fn().mockResolvedValue(true),
      create: vi.fn().mockImplementation((_entity, value: unknown) => value),
      save: vi.fn().mockImplementation((value: unknown) => value),
      findOne: vi.fn(),
      softRemove: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(managerBuilder),
    };

    dataSource = {
      transaction: vi.fn(async (callback: (m: typeof manager) => unknown) =>
        callback(manager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: reviewsRepository as unknown as Repository<Review>,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productsRepository as unknown as Repository<Product>,
        },
        { provide: DataSource, useValue: dataSource as unknown as DataSource },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('findAllByProduct', () => {
    it('rejects an unknown product before querying reviews', async () => {
      productsRepository.exists.mockResolvedValue(false);

      await expect(service.findAllByProduct(PRODUCT_ID)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findAllByProduct(PRODUCT_ID)).rejects.toThrow(
        'Product not found',
      );
      expect(reviewsRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('scopes the query to the product', async () => {
      await service.findAllByProduct(PRODUCT_ID);

      expect(reviewsBuilder.where).toHaveBeenCalledWith(
        'review.productId = :productId',
        { productId: PRODUCT_ID },
      );
    });

    it('filters by rating when one is given', async () => {
      await service.findAllByProduct(PRODUCT_ID, { rating: 5 });

      expect(reviewsBuilder.andWhere).toHaveBeenCalledWith(
        'review.rating = :rating',
        { rating: 5 },
      );
    });

    it('applies no rating filter by default', async () => {
      await service.findAllByProduct(PRODUCT_ID);

      expect(reviewsBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('sorts newest first by default', async () => {
      await service.findAllByProduct(PRODUCT_ID);

      expect(reviewsBuilder.orderBy).toHaveBeenCalledWith(
        'review.createdAt',
        'DESC',
      );
    });

    it('sorts highest rated first, newest breaking ties', async () => {
      await service.findAllByProduct(PRODUCT_ID, { sort: 'highest' });

      expect(reviewsBuilder.orderBy).toHaveBeenCalledWith(
        'review.rating',
        'DESC',
      );
      expect(reviewsBuilder.addOrderBy).toHaveBeenCalledWith(
        'review.createdAt',
        'DESC',
      );
    });

    it('sorts lowest rated first, newest breaking ties', async () => {
      await service.findAllByProduct(PRODUCT_ID, { sort: 'lowest' });

      expect(reviewsBuilder.orderBy).toHaveBeenCalledWith(
        'review.rating',
        'ASC',
      );
      expect(reviewsBuilder.addOrderBy).toHaveBeenCalledWith(
        'review.createdAt',
        'DESC',
      );
    });

    it('always breaks remaining ties on id', async () => {
      await service.findAllByProduct(PRODUCT_ID);

      expect(reviewsBuilder.addOrderBy).toHaveBeenCalledWith(
        'review.id',
        'ASC',
      );
    });

    it('defaults to five reviews a page', async () => {
      reviewsBuilder.getCount.mockResolvedValue(20);

      const result = await service.findAllByProduct(PRODUCT_ID);

      expect(result.perPage).toBe(5);
      expect(reviewsBuilder.take).toHaveBeenCalledWith(5);
    });

    it('honours a requested page size', async () => {
      reviewsBuilder.getCount.mockResolvedValue(20);

      await service.findAllByProduct(PRODUCT_ID, { perPage: 10 });

      expect(reviewsBuilder.take).toHaveBeenCalledWith(10);
    });

    it('offsets by whole pages', async () => {
      reviewsBuilder.getCount.mockResolvedValue(20);

      await service.findAllByProduct(PRODUCT_ID, { page: 3, perPage: 5 });

      expect(reviewsBuilder.skip).toHaveBeenCalledWith(10);
    });

    it('returns the page contents alongside the totals', async () => {
      const items = [buildReview()];
      reviewsBuilder.getCount.mockResolvedValue(7);
      reviewsBuilder.getMany.mockResolvedValue(items);

      await expect(
        service.findAllByProduct(PRODUCT_ID, { page: 2, perPage: 5 }),
      ).resolves.toEqual({
        items,
        page: 2,
        perPage: 5,
        total: 7,
        totalPages: 2,
      });
    });

    // Counting first lets an over-large page land on the last real one rather
    // than fetching an empty window.
    it('clamps a page beyond the last one', async () => {
      reviewsBuilder.getCount.mockResolvedValue(7);

      const result = await service.findAllByProduct(PRODUCT_ID, {
        page: 99,
        perPage: 5,
      });

      expect(result.page).toBe(2);
      expect(reviewsBuilder.skip).toHaveBeenCalledWith(5);
    });

    it('reports a single empty page when the product has no reviews', async () => {
      reviewsBuilder.getCount.mockResolvedValue(0);

      const result = await service.findAllByProduct(PRODUCT_ID, { page: 99 });

      expect(result).toEqual({
        items: [],
        page: 1,
        perPage: 5,
        total: 0,
        totalPages: 1,
      });
      expect(reviewsBuilder.skip).toHaveBeenCalledWith(0);
    });
  });

  describe('getStats', () => {
    it('rejects an unknown product', async () => {
      productsRepository.exists.mockResolvedValue(false);

      await expect(service.getStats(PRODUCT_ID)).rejects.toThrow(
        'Product not found',
      );
    });

    it('groups the ratings for the product', async () => {
      await service.getStats(PRODUCT_ID);

      expect(reviewsBuilder.groupBy).toHaveBeenCalledWith('review.rating');
      expect(reviewsBuilder.where).toHaveBeenCalledWith(
        'review.productId = :productId',
        { productId: PRODUCT_ID },
      );
    });

    it('reports zeroes and every bucket when there are no reviews', async () => {
      reviewsBuilder.getRawMany.mockResolvedValue([]);

      const stats = await service.getStats(PRODUCT_ID);

      expect(stats.average).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.buckets).toEqual([
        { rating: 5, count: 0, percentage: 0 },
        { rating: 4, count: 0, percentage: 0 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 0, percentage: 0 },
      ]);
    });

    // Postgres returns aggregate counts as strings.
    it('averages the ratings from string counts, rounded to a tenth', async () => {
      reviewsBuilder.getRawMany.mockResolvedValue([
        { rating: 5, count: '2' },
        { rating: 4, count: '1' },
      ]);

      const stats = await service.getStats(PRODUCT_ID);

      expect(stats.total).toBe(3);
      expect(stats.average).toBe(4.7);
    });

    it('reports each rating share as a percentage', async () => {
      reviewsBuilder.getRawMany.mockResolvedValue([
        { rating: 5, count: '3' },
        { rating: 1, count: '1' },
      ]);

      const stats = await service.getStats(PRODUCT_ID);

      expect(stats.buckets).toEqual([
        { rating: 5, count: 3, percentage: 75 },
        { rating: 4, count: 0, percentage: 0 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 1, count: 1, percentage: 25 },
      ]);
    });
  });

  describe('findOne', () => {
    it('returns the review matching the id', async () => {
      const review = buildReview();
      reviewsRepository.findOne.mockResolvedValue(review);

      await expect(service.findOne(review.id)).resolves.toBe(review);
    });

    it('throws NotFoundException when no review matches', async () => {
      reviewsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        'Review not found',
      );
    });
  });

  describe('create', () => {
    const dto = {
      productId: PRODUCT_ID,
      rating: 5,
      title: 'Great',
      body: 'Exceeded expectations entirely.',
    };

    it('rejects a review for an unknown product', async () => {
      manager.exists.mockResolvedValue(false);

      await expect(service.create(dto, AUTHOR)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(dto, AUTHOR)).rejects.toThrow(
        'Product not found',
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('stores the review against its author', async () => {
      await service.create(dto, AUTHOR);

      expect(manager.create).toHaveBeenCalledWith(Review, {
        productId: PRODUCT_ID,
        authorId: AUTHOR.id,
        authorName: AUTHOR.name,
        rating: 5,
        title: 'Great',
        body: 'Exceeded expectations entirely.',
      });
      expect(manager.save).toHaveBeenCalled();
    });

    it('returns the saved review', async () => {
      const saved = buildReview();
      manager.save.mockResolvedValue(saved);

      await expect(service.create(dto, AUTHOR)).resolves.toBe(saved);
    });

    it('refreshes the product rating in the same transaction', async () => {
      await service.create(dto, AUTHOR);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.update).toHaveBeenCalledWith(
        Product,
        PRODUCT_ID,
        expect.any(Object),
      );
    });

    it('reports a second review from the same author as a conflict', async () => {
      manager.save.mockRejectedValue(buildQueryFailedError('23505'));

      await expect(service.create(dto, AUTHOR)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(dto, AUTHOR)).rejects.toThrow(
        'You have already reviewed this product',
      );
    });

    it('rethrows a query failure with a different code', async () => {
      const error = buildQueryFailedError('23503');
      manager.save.mockRejectedValue(error);

      await expect(service.create(dto, AUTHOR)).rejects.toBe(error);
    });

    it('rethrows a query failure with no code', async () => {
      const error = buildQueryFailedError();
      manager.save.mockRejectedValue(error);

      await expect(service.create(dto, AUTHOR)).rejects.toBe(error);
    });

    it('rethrows errors that are not query failures', async () => {
      const error = new Error('connection lost');
      manager.save.mockRejectedValue(error);

      await expect(service.create(dto, AUTHOR)).rejects.toBe(error);
    });
  });

  describe('update', () => {
    const dto = {
      rating: 2,
      title: 'Changed my mind',
      body: 'It broke after a fortnight of light use.',
    };

    it('throws NotFoundException when the review is gone', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.update('missing-id', dto, AUTHOR)).rejects.toThrow(
        'Review not found',
      );
    });

    it('refuses to edit another author’s review', async () => {
      manager.findOne.mockResolvedValue(
        buildReview({ authorId: 'someone-else' }),
      );

      await expect(service.update('r1', dto, AUTHOR)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update('r1', dto, AUTHOR)).rejects.toThrow(
        'You can only modify your own review',
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    // Guest reviews predate authentication and belong to nobody.
    it('refuses to edit a review with no author', async () => {
      manager.findOne.mockResolvedValue(buildReview({ authorId: null }));

      await expect(service.update('r1', dto, AUTHOR)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('overwrites the editable fields', async () => {
      const review = buildReview();
      manager.findOne.mockResolvedValue(review);

      await service.update(review.id, dto, AUTHOR);

      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 2,
          title: 'Changed my mind',
          body: 'It broke after a fortnight of light use.',
        }),
      );
    });

    it('refreshes the product rating', async () => {
      manager.findOne.mockResolvedValue(buildReview());

      await service.update('r1', dto, AUTHOR);

      expect(manager.update).toHaveBeenCalledWith(
        Product,
        PRODUCT_ID,
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the review is gone', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-id', AUTHOR)).rejects.toThrow(
        'Review not found',
      );
    });

    it('refuses to delete another author’s review', async () => {
      manager.findOne.mockResolvedValue(
        buildReview({ authorId: 'someone-else' }),
      );

      await expect(service.remove('r1', AUTHOR)).rejects.toThrow(
        ForbiddenException,
      );
      expect(manager.softRemove).not.toHaveBeenCalled();
    });

    // Keeps the row for the partial unique index, which ignores deleted rows.
    it('soft removes the review rather than deleting it', async () => {
      const review = buildReview();
      manager.findOne.mockResolvedValue(review);

      await service.remove(review.id, AUTHOR);

      expect(manager.softRemove).toHaveBeenCalledWith(review);
    });

    it('refreshes the product rating', async () => {
      manager.findOne.mockResolvedValue(buildReview());

      await service.remove('r1', AUTHOR);

      expect(manager.update).toHaveBeenCalledWith(
        Product,
        PRODUCT_ID,
        expect.any(Object),
      );
    });
  });

  describe('product rating recalculation', () => {
    const dto = {
      productId: PRODUCT_ID,
      rating: 5,
      title: 'Great',
      body: 'Exceeded expectations entirely.',
    };

    it('writes the average rounded to a tenth and the count', async () => {
      managerBuilder.getRawOne.mockResolvedValue({
        average: '4.3333',
        count: '3',
      });

      await service.create(dto, AUTHOR);

      expect(manager.update).toHaveBeenCalledWith(Product, PRODUCT_ID, {
        ratingAverage: 4.3,
        ratingCount: 3,
      });
    });

    it('falls back to zero when the product has no reviews left', async () => {
      managerBuilder.getRawOne.mockResolvedValue(undefined);
      manager.findOne.mockResolvedValue(buildReview());

      await service.remove('r1', AUTHOR);

      expect(manager.update).toHaveBeenCalledWith(Product, PRODUCT_ID, {
        ratingAverage: 0,
        ratingCount: 0,
      });
    });
  });
});
