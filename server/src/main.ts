import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
import { CommonConfig } from './common/common.config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const commonConfig = app.get(CommonConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: commonConfig.corsOrigin ?? /^http:\/\/localhost:\d+$/,
  });

  app.useStaticAssets(join(import.meta.dirname, '..', 'public'));

  await app.listen(commonConfig.port);
}
await bootstrap();
