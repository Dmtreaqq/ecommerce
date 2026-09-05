import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // The browser loads the SPA from Vite's origin, so the API must opt in.
  // Vite picks 5174+ when 5173 is taken, so allow any localhost port in dev
  // rather than failing with an opaque CORS error; set CORS_ORIGIN to pin it.
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? /^http:\/\/localhost:\d+$/,
  });

  // Product images. `import.meta.dirname` is `<root>/dist` at runtime (ESM has
  // no `__dirname`), so step up one level to reach `<root>/public` — which sits
  // outside `dist` and therefore survives `deleteOutDir` on each build.
  app.useStaticAssets(join(import.meta.dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
