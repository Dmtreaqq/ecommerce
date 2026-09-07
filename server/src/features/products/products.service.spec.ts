import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { Product } from './entities/product.entity.js';
import { ProductsService } from './products.service.js';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  name: 'Controller',
  brand: 'Acme',
  category: 'Peripherals',
  priceCents: 5999,
  originalPriceCents: null,
  image: '/images/products/controller.svg',
  description: 'A controller.',
  features: [],
  stock: 3,
  ratingAverage: 4.5,
  ratingCount: 10,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  version: 1,
  ...overrides,
});

const buildCreateDto = (
  overrides: Partial<CreateProductDto> = {},
): CreateProductDto => ({
  name: 'Controller',
  brand: 'Acme',
  category: 'Peripherals',
  price: 59.99,
  image: '/images/products/controller.svg',
  description: 'A controller.',
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: {
    createQueryBuilder: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let queryBuilder: {
    andWhere: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    addOrderBy: ReturnType<typeof vi.fn>;
    getMany: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: vi.fn(),
      orderBy: vi.fn(),
      addOrderBy: vi.fn(),
      getMany: vi.fn().mockResolvedValue([]),
    };
    queryBuilder.andWhere.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.addOrderBy.mockReturnValue(queryBuilder);

    repository = {
      createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: repository as unknown as Repository<Product>,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('returns the products the builder produces', async () => {
      const products = [buildProduct()];
      queryBuilder.getMany.mockResolvedValue(products);

      await expect(service.findAll()).resolves.toBe(products);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('applies no filters when the query is empty', async () => {
      await service.findAll();

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('filters by category', async () => {
      await service.findAll({ category: 'Games' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.category = :category',
        { category: 'Games' },
      );
    });

    it('searches across name, brand and description', async () => {
      await service.findAll({ search: 'pad' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('product.name ILIKE :pattern'),
        { pattern: '%pad%' },
      );
    });

    it('trims the search term', async () => {
      await service.findAll({ search: '  pad  ' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(String), {
        pattern: '%pad%',
      });
    });

    it('ignores a whitespace-only search term', async () => {
      await service.findAll({ search: '   ' });

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    // Unescaped, a search for "%" would match the whole catalogue.
    it('escapes LIKE wildcards in the search term', async () => {
      await service.findAll({ search: '50%_off\\x' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(String), {
        pattern: '%50\\%\\_off\\\\x%',
      });
    });

    it('sorts by ascending price', async () => {
      await service.findAll({ sort: 'price-asc' });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'product.priceCents',
        'ASC',
      );
    });

    it('sorts by descending price', async () => {
      await service.findAll({ sort: 'price-desc' });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'product.priceCents',
        'DESC',
      );
    });

    it('sorts by descending rating', async () => {
      await service.findAll({ sort: 'rating' });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'product.ratingAverage',
        'DESC',
      );
    });

    it('leaves the order to the database for the featured sort', async () => {
      await service.findAll({ sort: 'featured' });

      expect(queryBuilder.orderBy).not.toHaveBeenCalled();
    });

    it('defaults to the featured sort', async () => {
      await service.findAll();

      expect(queryBuilder.orderBy).not.toHaveBeenCalled();
    });

    it('always breaks ties on id so paging stays stable', async () => {
      await service.findAll({ sort: 'rating' });

      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
        'product.id',
        'ASC',
      );
    });
  });

  describe('findOne', () => {
    it('returns the product matching the id', async () => {
      const product = buildProduct();
      repository.findOne.mockResolvedValue(product);

      await expect(service.findOne(product.id)).resolves.toBe(product);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: product.id },
      });
    });

    it('throws NotFoundException when no product matches', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('missing-id')).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      repository.create.mockImplementation((value: unknown) => value);
      repository.save.mockImplementation((value: unknown) =>
        Promise.resolve(value),
      );
    });

    it('stores the price in cents', async () => {
      await service.create(buildCreateDto({ price: 19.99 }));

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ priceCents: 1999 }),
      );
    });

    it('stores no original price when none is given', async () => {
      await service.create(buildCreateDto());

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ originalPriceCents: null }),
      );
    });

    it('converts an original price to cents', async () => {
      await service.create(buildCreateDto({ originalPrice: 79.5 }));

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ originalPriceCents: 7950 }),
      );
    });

    // Zero is a real discount baseline, not an absent value.
    it('keeps a zero original price instead of dropping it', async () => {
      await service.create(buildCreateDto({ originalPrice: 0 }));

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ originalPriceCents: 0 }),
      );
    });

    it('defaults the optional catalogue fields', async () => {
      await service.create(buildCreateDto());

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          features: [],
          stock: 0,
          ratingAverage: 0,
          ratingCount: 0,
        }),
      );
    });

    it('keeps the optional fields it is given', async () => {
      await service.create(
        buildCreateDto({
          features: ['wireless'],
          stock: 7,
          ratingAverage: 4.5,
          ratingCount: 12,
        }),
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          features: ['wireless'],
          stock: 7,
          ratingAverage: 4.5,
          ratingCount: 12,
        }),
      );
    });

    it('returns the saved product', async () => {
      const saved = buildProduct();
      repository.create.mockReturnValue(saved);
      repository.save.mockResolvedValue(saved);

      await expect(service.create(buildCreateDto())).resolves.toBe(saved);
      expect(repository.save).toHaveBeenCalledWith(saved);
    });
  });
});
