import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { FindProductsDto } from './dto/find-products.dto.js';
import { Product } from './entities/product.entity.js';

const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, (char) => `\\${char}`);

const toCents = (amount: number): number => Math.round(amount * 100);

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(query: FindProductsDto = {}): Promise<Product[]> {
    const { category, sort = 'featured' } = query;
    const term = query.search?.trim();

    const qb = this.productsRepository.createQueryBuilder('product');

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }

    if (term) {
      const pattern = `%${escapeLike(term)}%`;
      qb.andWhere(
        '(product.name ILIKE :pattern OR product.brand ILIKE :pattern OR product.description ILIKE :pattern)',
        { pattern },
      );
    }

    switch (sort) {
      case 'price-asc':
        qb.orderBy('product.priceCents', 'ASC');
        break;
      case 'price-desc':
        qb.orderBy('product.priceCents', 'DESC');
        break;
      case 'rating':
        qb.orderBy('product.ratingAverage', 'DESC');
        break;
      default:
        break;
    }

    qb.addOrderBy('product.id', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      name: dto.name,
      brand: dto.brand,
      category: dto.category,
      priceCents: toCents(dto.price),
      originalPriceCents:
        dto.originalPrice === undefined ? null : toCents(dto.originalPrice),
      image: dto.image,
      description: dto.description,
      features: dto.features ?? [],
      stock: dto.stock ?? 0,
      ratingAverage: dto.ratingAverage ?? 0,
      ratingCount: dto.ratingCount ?? 0,
    });

    return this.productsRepository.save(product);
  }
}
