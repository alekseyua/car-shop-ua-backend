import { Module } from '@nestjs/common';
import { GarageCarService } from './garage-car.service';
import { GarageCarController } from './garage-car.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GarageCarController],
  providers: [GarageCarService],
})
export class GarageCarModule {}
