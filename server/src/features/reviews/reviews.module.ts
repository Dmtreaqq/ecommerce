import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity.js';
import { Review } from './entities/review.entity.js';
import {
  ProductReviewsController,
  ReviewsController,
} from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product])],
  controllers: [ProductReviewsController, ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
