import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Lowercased } from '../../../common/decorators/lowercased.decorator.js';
import { Trimmed } from '../../../common/decorators/trimmed.decorator.js';

export class RegisterDto {
  @Trimmed()
  @Lowercased()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Trimmed()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  // bcrypt silently ignores bytes past 72, so anything longer is a lie.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
