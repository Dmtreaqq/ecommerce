import { Global, Module } from '@nestjs/common';
import { CommonConfig } from './common.config.js';

@Global()
@Module({
  providers: [CommonConfig],
  exports: [CommonConfig],
})
export class CommonModule {}
