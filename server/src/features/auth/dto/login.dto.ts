import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Lowercased } from '../../../common/decorators/lowercased.decorator.js';
import { Trimmed } from '../../../common/decorators/trimmed.decorator.js';

export class LoginDto {
  @Trimmed()
  @Lowercased()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
