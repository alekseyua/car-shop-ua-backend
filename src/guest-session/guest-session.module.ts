import { Module } from '@nestjs/common';
import { GuestSessionService } from './guest-session.service';
import { GuestSessionController } from './guest-session.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GuestSessionController],
  providers: [GuestSessionService],
})
export class GuestSessionModule {}
