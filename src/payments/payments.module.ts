import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LiqPayService } from './liqpay.service';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [PrismaModule, ConfigModule, TelegramModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, LiqPayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
