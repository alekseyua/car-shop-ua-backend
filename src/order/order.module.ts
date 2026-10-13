import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { OrdersController } from './order.controller';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [PrismaModule, TelegramModule],
  controllers: [OrdersController],
  providers: [OrderService],
})
export class OrderModule {}
