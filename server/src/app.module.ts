import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CommonConfig } from './common/common.config.js';
import { CommonModule } from './common/common.module.js';
import { configDynamicModule } from './config-dynamic-module.js';
import { UsersModule } from './users/users.module.js';
import { ProductsModule } from './products/products.module.js';

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
        autoLoadEntities: true,
        synchronize: false,
        ssl: commonConfig.isDbSsl,
        logging: commonConfig.isDbLogging,
      }),
    }),
    UsersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
