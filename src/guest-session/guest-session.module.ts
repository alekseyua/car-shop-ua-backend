import { Module } from '@nestjs/common';
import { GuestSessionService } from './guest-session.service';
import { GuestSessionController } from './guest-session.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { GuestSessionMiddleware } from './middleware/guest-session.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [GuestSessionController],
  providers: [GuestSessionService, GuestSessionMiddleware],
  exports: [GuestSessionService],
})
export class GuestSessionModule {}
