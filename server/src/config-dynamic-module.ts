import { ConfigModule } from '@nestjs/config';

export const configDynamicModule = ConfigModule.forRoot({
  envFilePath: ['.env'],
  isGlobal: true,
  cache: true,
});
