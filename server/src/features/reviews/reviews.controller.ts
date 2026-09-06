import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { FindReviewsDto } from './dto/find-reviews.dto.js';
import { ReviewResponseDto } from './dto/review-response.dto.js';
import type { ReviewStatsResponseDto } from './dto/review-stats-response.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ReviewsService } from './reviews.service.js';

@Controller('products/:productId/reviews')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: FindReviewsDto,
  ): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const result = await this.reviewsService.findAllByProduct(productId, query);
    return { ...result, items: ReviewResponseDto.fromEntities(result.items) };
  }

  @Get('stats')
  async getStats(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ReviewStatsResponseDto> {
    return this.reviewsService.getStats(productId);
  }
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.create(dto);
    return ReviewResponseDto.fromEntity(review);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.update(id, dto);
    return ReviewResponseDto.fromEntity(review);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.reviewsService.remove(id);
  }
}
