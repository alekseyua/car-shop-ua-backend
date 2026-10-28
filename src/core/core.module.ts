import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import paginationConfig from './config/pagination.config';
import redisConfig from './config/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [paginationConfig, redisConfig],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    PaymentsModule,
  ],
  providers: [],
  exports: [],
})
export class CoreModule {}
