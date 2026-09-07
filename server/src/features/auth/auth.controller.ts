import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CommonConfig } from '../../common/common.config.js';
import { AuthService } from './auth.service.js';
import { clearAuthCookies, setAuthCookies } from './auth.cookies.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { AuthUserResponseDto } from './dto/auth-user-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import type {
  AuthenticatedUser,
  RefreshContext,
} from './types/authenticated-user.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly commonConfig: CommonConfig,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUserResponseDto> {
    const { user, tokens } = await this.authService.register(dto);
    setAuthCookies(response, this.commonConfig, tokens);

    return AuthUserResponseDto.fromEntity(user);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(
    @Body() _dto: LoginDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUserResponseDto> {
    const tokens = await this.authService.login(user);
    setAuthCookies(response, this.commonConfig, tokens);

    return AuthUserResponseDto.fromEntity(user);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(200)
  async refresh(
    @CurrentUser() context: RefreshContext,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUserResponseDto> {
    const tokens = await this.authService.refresh(context);
    setAuthCookies(response, this.commonConfig, tokens);

    return AuthUserResponseDto.fromEntity(context);
  }

  @Post('logout')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(204)
  async logout(
    @CurrentUser() context: RefreshContext,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(context);
    clearAuthCookies(response, this.commonConfig);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): AuthUserResponseDto {
    return AuthUserResponseDto.fromEntity(user);
  }
}
