import {
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Trimmed } from '../../../common/decorators/trimmed.decorator.js';

export class CreateReviewDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Trimmed()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @Trimmed()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body: string;
}
