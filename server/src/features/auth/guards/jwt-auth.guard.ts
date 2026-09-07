import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * The strategy itself is resolved from Passport's registry at request time, so
 * a module can use this guard without importing AuthModule — but the AuthGuard
 * mixin injects AuthModuleOptions, so that module must import PassportModule.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
