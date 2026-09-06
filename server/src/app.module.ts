import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonConfig } from './common/common.config.js';
import { CommonModule } from './common/common.module.js';
import { configDynamicModule } from './config-dynamic-module.js';
import { UsersModule } from './features/users/users.module.js';
import { ProductsModule } from './features/products/products.module.js';
import { ReviewsModule } from './features/reviews/reviews.module.js';

@Module({
  imports: [
    configDynamicModule,
    CommonModule,
    TypeOrmModule.forRootAsync({
      inject: [CommonConfig],
      useFactory: (commonConfig: CommonConfig) => ({
        type: 'postgres',
        host: commonConfig.dbHost,
        port: commonConfig.dbPort,
        username: commonConfig.dbUser,
        password: commonConfig.dbPassword,
        database: commonConfig.dbName,
        uuidExtension: 'pgcrypto',
        autoLoadEntities: true,
        synchronize: false,
        ssl: commonConfig.isDbSsl,
        logging: commonConfig.isDbLogging,
      }),
    }),
    UsersModule,
    ProductsModule,
    ReviewsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
