import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { configUtilityHelper } from './utils/config-utility.helper.js';

export enum Environments {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

@Injectable()
export class CommonConfig {
  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configUtilityHelper.getEnumValues(Environments).join(', '),
  })
  env: string;

  @IsNumber({}, { message: 'Set env variable PORT, example: 3000' })
  port: number;

  @IsOptional()
  @IsString({ message: 'CORS_ORIGIN should be a string' })
  corsOrigin?: string;

  @IsNotEmpty({ message: 'DB_HOST should not be empty' })
  @IsString({ message: 'DB_HOST should be a string' })
  dbHost: string;

  @IsNumber({}, { message: 'Set env variable DB_PORT, example: 5432' })
  dbPort: number;

  @IsNotEmpty({ message: 'DB_USER should not be empty' })
  @IsString({ message: 'DB_USER should be a string' })
  dbUser: string;

  @IsNotEmpty({ message: 'DB_PASSWORD should not be empty' })
  @IsString({ message: 'DB_PASSWORD should be a string' })
  dbPassword: string;

  @IsNotEmpty({ message: 'DB_NAME should not be empty' })
  @IsString({ message: 'DB_NAME should be a string' })
  dbName: string;

  @IsBoolean({ message: 'IS_DB_SSL should be either true or false' })
  isDbSsl: boolean;

  @IsBoolean({ message: 'IS_DB_LOGGING should be either true or false' })
  isDbLogging: boolean;

  @IsNotEmpty({ message: 'JWT_ACCESS_SECRET should not be empty' })
  @IsString({ message: 'JWT_ACCESS_SECRET should be a string' })
  @MinLength(32, {
    message: 'JWT_ACCESS_SECRET should be at least 32 characters',
  })
  jwtAccessSecret: string;

  @IsNotEmpty({ message: 'JWT_REFRESH_SECRET should not be empty' })
  @IsString({ message: 'JWT_REFRESH_SECRET should be a string' })
  @MinLength(32, {
    message: 'JWT_REFRESH_SECRET should be at least 32 characters',
  })
  jwtRefreshSecret: string;

  @IsNumber(
    {},
    { message: 'Set env variable JWT_ACCESS_TTL_SECONDS, example: 900' },
  )
  jwtAccessTtlSeconds: number;

  @IsNumber(
    {},
    { message: 'Set env variable JWT_REFRESH_TTL_SECONDS, example: 1209600' },
  )
  jwtRefreshTtlSeconds: number;

  @IsBoolean({ message: 'IS_COOKIE_SECURE should be either true or false' })
  isCookieSecure: boolean;

  constructor(configService: ConfigService) {
    const read = (key: string) => {
      const value = configService.get<string>(key)?.trim();

      return value === '' ? undefined : value;
    };

    this.env = read('NODE_ENV') ?? Environments.Development;
    this.port = configUtilityHelper.convertToNumber(read('PORT'));
    this.corsOrigin = read('CORS_ORIGIN');

    this.dbHost = read('DB_HOST') as string;
    this.dbPort = configUtilityHelper.convertToNumber(read('DB_PORT'));
    this.dbUser = read('DB_USER') as string;
    this.dbPassword = read('DB_PASSWORD') as string;
    this.dbName = read('DB_NAME') as string;

    this.isDbSsl = configUtilityHelper.convertToBoolean(
      read('IS_DB_SSL'),
    ) as boolean;
    this.isDbLogging = configUtilityHelper.convertToBoolean(
      read('IS_DB_LOGGING'),
    ) as boolean;

    this.jwtAccessSecret = read('JWT_ACCESS_SECRET') as string;
    this.jwtRefreshSecret = read('JWT_REFRESH_SECRET') as string;
    this.jwtAccessTtlSeconds = configUtilityHelper.convertToNumber(
      read('JWT_ACCESS_TTL_SECONDS'),
    );
    this.jwtRefreshTtlSeconds = configUtilityHelper.convertToNumber(
      read('JWT_REFRESH_TTL_SECONDS'),
    );

    this.isCookieSecure = configUtilityHelper.convertToBoolean(
      read('IS_COOKIE_SECURE'),
    ) as boolean;

    configUtilityHelper.validateConfig(this);
  }
}
