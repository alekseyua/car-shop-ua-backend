import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConfigModule } from '@nestjs/config';
import { IoredisModule } from 'src/core/ioredis/ioredis.module';
import { TelegramController } from './telegram.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [ConfigModule, IoredisModule, PrismaModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
