import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [PrismaModule, HistoryModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
