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
  UseGuards,
} from '@nestjs/common';
import type { PaginatedResponseDto } from '../../common/dto/paginated-response.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
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
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.create(dto, user);
    return ReviewResponseDto.fromEntity(review);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewsService.update(id, dto, user);
    return ReviewResponseDto.fromEntity(review);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.reviewsService.remove(id, user);
  }
}
