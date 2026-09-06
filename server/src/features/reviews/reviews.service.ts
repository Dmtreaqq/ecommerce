import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  clampPage,
  totalPagesFor,
  type PaginatedResponseDto,
} from '../../common/dto/paginated-response.dto.js';
import { Product } from '../products/entities/product.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { DEFAULT_PER_PAGE, FindReviewsDto } from './dto/find-reviews.dto.js';
import {
  RATING_VALUES,
  type ReviewStatsResponseDto,
} from './dto/review-stats-response.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { Review } from './entities/review.entity.js';

const roundToTenth = (value: number): number => Math.round(value * 10) / 10;

interface RatingTally {
  rating: number;
  count: number;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllByProduct(
    productId: string,
    query: FindReviewsDto = {},
  ): Promise<PaginatedResponseDto<Review>> {
    await this.assertProductExists(productId);

    const { sort = 'recent', rating } = query;
    const perPage = query.perPage ?? DEFAULT_PER_PAGE;

    const qb = this.reviewsRepository
      .createQueryBuilder('review')
      .where('review.productId = :productId', { productId });

    if (rating) {
      qb.andWhere('review.rating = :rating', { rating });
    }

    switch (sort) {
      case 'highest':
        qb.orderBy('review.rating', 'DESC').addOrderBy(
          'review.createdAt',
          'DESC',
        );
        break;
      case 'lowest':
        qb.orderBy('review.rating', 'ASC').addOrderBy(
          'review.createdAt',
          'DESC',
        );
        break;
      default:
        qb.orderBy('review.createdAt', 'DESC');
        break;
    }

    qb.addOrderBy('review.id', 'ASC');

    // Count first so an out-of-range page can be clamped before we fetch a
    // window that would otherwise come back empty.
    const total = await qb.getCount();
    const totalPages = totalPagesFor(total, perPage);
    const page = clampPage(query.page ?? 1, totalPages);

    const items = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getMany();

    return { items, page, perPage, total, totalPages };
  }

  async getStats(productId: string): Promise<ReviewStatsResponseDto> {
    await this.assertProductExists(productId);

    const rows = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .getRawMany<{ rating: number; count: string }>();

    const tallies: RatingTally[] = rows.map((row) => ({
      rating: Number(row.rating),
      count: Number(row.count),
    }));

    const total = tallies.reduce((sum, tally) => sum + tally.count, 0);
    const weighted = tallies.reduce(
      (sum, tally) => sum + tally.rating * tally.count,
      0,
    );

    const buckets = RATING_VALUES.map((value) => {
      const count = tallies.find((tally) => tally.rating === value)?.count ?? 0;
      return {
        rating: value as number,
        count,
        percentage: total === 0 ? 0 : Math.round((count / total) * 100),
      };
    });

    return {
      average: total === 0 ? 0 : roundToTenth(weighted / total),
      total,
      buckets,
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async create(dto: CreateReviewDto): Promise<Review> {
    return this.dataSource.transaction(async (manager) => {
      const exists = await manager.exists(Product, {
        where: { id: dto.productId },
      });
      if (!exists) {
        throw new NotFoundException('Product not found');
      }

      const review = manager.create(Review, {
        productId: dto.productId,
        authorName: dto.authorName,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
      });
      const saved = await manager.save(review);

      await this.recalculateProductRating(manager, dto.productId);

      return saved;
    });
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, { where: { id } });
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      review.rating = dto.rating;
      review.title = dto.title;
      review.body = dto.body;
      const saved = await manager.save(review);

      await this.recalculateProductRating(manager, review.productId);

      return saved;
    });
  }

  async remove(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, { where: { id } });
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      await manager.softRemove(review);

      await this.recalculateProductRating(manager, review.productId);
    });
  }

  private async assertProductExists(productId: string): Promise<void> {
    const exists = await this.productsRepository.exists({
      where: { id: productId },
    });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }
  }

  /**
   * Products carry denormalized rating columns so the catalogue can be listed
   * and sorted without joining reviews. They are rewritten from the reviews
   * table inside the same transaction as the write that invalidated them.
   */
  private async recalculateProductRating(
    manager: EntityManager,
    productId: string,
  ): Promise<void> {
    const row = await manager
      .createQueryBuilder(Review, 'review')
      .select('COALESCE(AVG(review.rating), 0)', 'average')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
      .getRawOne<{ average: string; count: string }>();

    await manager.update(Product, productId, {
      ratingAverage: roundToTenth(Number(row?.average ?? 0)),
      ratingCount: Number(row?.count ?? 0),
    });
  }
}
