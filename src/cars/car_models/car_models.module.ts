import { Module } from '@nestjs/common';
import { CarModelsService } from './car_models.service';
import { CarModelsController } from './car_models.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [
      PrismaModule
  ],
  controllers: [CarModelsController],
  providers: [CarModelsService],
})
export class CarModelsModule {}
