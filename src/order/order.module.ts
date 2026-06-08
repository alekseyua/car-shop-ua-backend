import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { OrdersController } from './order.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrderService],
})
export class OrderModule {}
