import { Module } from '@nestjs/common';
import { CarModelsService } from './car_models.service';
import { CarModelsController } from './car_models.controller';

@Module({
  controllers: [CarModelsController],
  providers: [CarModelsService],
})
export class CarModelsModule {}
