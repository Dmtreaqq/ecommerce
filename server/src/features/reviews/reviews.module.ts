import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity.js';
import { Review } from './entities/review.entity.js';
import {
  ProductReviewsController,
  ReviewsController,
} from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  // register() is what provides AuthModuleOptions, which the AuthGuard mixin
  // behind JwtAuthGuard injects; the bare PassportModule provides nothing.
  // Importing it here keeps this module off AuthModule.
  imports: [
    PassportModule.register({}),
    TypeOrmModule.forFeature([Review, Product]),
  ],
  controllers: [ProductReviewsController, ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
