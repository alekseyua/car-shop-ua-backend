import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LiqPayService } from './liqpay.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, LiqPayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
